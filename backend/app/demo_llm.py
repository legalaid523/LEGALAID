# app/demo_llm.py
import json
import time
from typing import Optional
from groq import Groq
import os
from pydantic import BaseModel

from app.session_store import get_session, update_session
from app.supabase_client import get_cache

MODEL_NAME = "llama-3.3-70b-versatile"
MAX_RETRIES = 2

_groq_client: Optional[Groq] = None

def get_groq_client() -> Groq:
    global _groq_client
    if _groq_client is None:
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("Missing GROQ_API_KEY in .env")
        _groq_client = Groq(api_key=api_key)
    return _groq_client

SYSTEM_PROMPT = """You are a highly intelligent Indian Legal Aid assistant.
Your job is to orchestrate the entire conversation turn.

You will be provided with the CURRENT CONVERSATION HISTORY and the available DOMAINS, SECTIONS (laws), and FACTS from our database.

CRITICAL RULES:
1. YOU MUST NEVER output status: "matched" on the very first turn. You MUST ALWAYS ask at least one or two clarifying questions (like asking for written proof, exact dates, or formal notices) before matching.
2. If the user's latest response is a direct answer (like "Yes", "No", "Haan", "Nahi") to the "LAST QUESTION ASKED TO USER", you MUST map this answer to the "associated fact key" (e.g., setting it to `true` or `false` or the selected value) in `extracted_facts`. Do not repeat the same question.
3. If a fact key is already present in `extracted_facts` (with a value like `true`, `false`, or any other value), YOU MUST NOT ask any more questions about it. Move on to other missing facts.
4. NEVER ask the user to classify their issue or ask them what domain it belongs to. You must infer the domain yourself from their problem description.
5. To ask about a missing fact, you MUST select a fact from the section's 'required_facts' list that is not yet present in 'extracted_facts'. Use the associated 'question_en' or 'question_hi' (or translate/adapt it to Hinglish if that is the target language) for the 'question_text' in the response, and use the exact 'fact_key'. NEVER make up your own fact keys.
6. If you DO NOT have enough facts to definitively match a law section (which is always true at the start), output status: "need_more_facts" and provide "next_question".
7. If you have asked questions and the user has provided sufficient details to satisfy the required facts of a section, output status: "matched" and provide "matched_sections" and "applicable_laws".
8. ONLY use the domains, sections, and facts provided. Do not hallucinate.
9. If the user's latest message is a COMPLETELY NEW problem statement that is entirely unrelated to the current ongoing issue or previous questions (e.g., switching from a salary issue to buying a defective product), you MUST output status: "new_problem", clear the `extracted_facts` (return `{}`), set the new `domain_id`, and ask the first question for this new problem using `next_question`.
10. Output strictly valid JSON matching the schema below.

JSON SCHEMA EXPECTED:
{
  "status": "need_more_facts" | "matched" | "no_match" | "new_problem",
  "domain_id": "tenant" | "consumer" | "labor" | null,
  "extracted_facts": { "fact_key_1": "value1", "fact_key_2": true },
  "next_question": {
     "question_text": "Ask your question here in the requested language",
     "fact_key": "the_fact_you_are_trying_to_extract",
     "options": ["Yes", "No"] // optional, use for boolean questions
  }, // only if status == "need_more_facts" or "new_problem"
  "matched_sections": [
     {
       "section_id": "the_section_id",
       "issue": "The core issue identified",
       "score": 1.0,
       "notes": "Brief explanation of how their facts match this section"
     }
  ], // only if status == "matched"
  "applicable_laws": [
     {
       "act": "Name of the Act",
       "section_number": "Section X",
       "text_summary": "Summary of what the law says"
     }
  ], // only if status == "matched"
  "confidence_flags": [
     {
       "fact_key": "missing_optional_fact",
       "field": "Documented Evidence",
       "message": "You didn't mention if you have proof. Evidence is highly recommended."
     }
  ] // optional, if matched but some evidence is missing
}

Remember to respond in the language the user is using (e.g. English, Hindi, Hinglish) for the "question_text" and "notes".
"""

def handle_message_demo(session_id: str, user_message: str, language: str = "en") -> dict:
    session = get_session(session_id)
    if not session:
        raise ValueError(f"Session {session_id} not found. Call start_conversation() first.")

    # Auto-reset session if the previous query was already "matched" (so new queries don't get stuck)
    if session.get("status") == "matched":
        session["history"] = []
        session["extracted_facts"] = {}
        session["domain_id"] = None
        session["status"] = "in_progress"
        
    history = list(session.get("history", []))
    
    # Append user message to history
    history.append({"role": "user", "content": user_message})

    # Prepare DB context
    cache = get_cache()
    domains = [d["id"] for d in cache.get("domains", [])]
    sections = cache.get("sections", [])
    facts = cache.get("fact_definitions", [])
    
    # Group section_facts by section_id to prevent the LLM from hallucinating fact keys
    section_facts = cache.get("section_facts", [])
    facts_by_section = {}
    for sf in section_facts:
        sid = sf["section_id"]
        fact_item = {
            "fact_key": sf["fact_key"],
            "required": sf["required"],
            "question_en": sf.get("question_text_en"),
            "question_hi": sf.get("question_text_hi")
        }
        facts_by_section.setdefault(sid, []).append(fact_item)

    current_domain = session.get("domain_id")
    
    simplified_sections = []
    for s in sections:
        # If domain is known, skip sections from other domains to save tokens
        if current_domain and s["domain_id"] != current_domain:
            continue
            
        simplified_sections.append({
            "id": s["id"], 
            "domain": s["domain_id"], 
            "issue": s.get("issue"),
            # Only include required facts if we are narrowing down (domain is known)
            "required_facts": facts_by_section.get(s["id"], []) if current_domain else []
        })
    
    # Applicable laws are stored in applicable_law_sections
    laws = cache.get("applicable_law_sections", [])
    simplified_laws = []
    if current_domain:
        # Only pass laws if domain is known
        valid_section_ids = {s["id"] for s in simplified_sections}
        simplified_laws = [
            {
                "section_id": l.get("section_id"),
                "act": l.get("act"),
                "section_number": l.get("section_number"),
                "text_summary": l.get("text_summary")
            }
            for l in laws if l.get("section_id") in valid_section_ids
        ]

    db_context = {
        "domains": domains,
        "sections": simplified_sections,
        "facts": [f["fact_key"] for f in facts] if current_domain else [],
        "laws": simplified_laws
    }

    last_asked_fact = session.get("last_asked_fact")
    last_question_text = session.get("last_question_text")

    user_prompt = f"DATABASE CONTEXT:\n{json.dumps(db_context, indent=2)}\n\n"
    if last_asked_fact and last_question_text:
        user_prompt += f"LAST QUESTION ASKED TO USER: '{last_question_text}' (associated fact key: '{last_asked_fact}')\n"
        user_prompt += f"Note: The user's latest response below is likely an answer to this last question. Parse it and update '{last_asked_fact}' in extracted_facts accordingly.\n\n"
    
    user_prompt += f"TARGET LANGUAGE: {language}\n\n"
    user_prompt += "CONVERSATION HISTORY:\n"
    for msg in history:
        user_prompt += f"{msg['role'].upper()}: {msg['content']}\n"
    
    user_prompt += "\nBased on the above, generate the JSON response."

    FALLBACK_CONFIGS = [
        {"provider": "groq", "model": "llama-3.3-70b-versatile"},
        {"provider": "groq", "model": "llama3-70b-8192"},
        {"provider": "groq", "model": "mixtral-8x7b-32768"},
        {"provider": "groq", "model": "llama-3.1-8b-instant"},
        {"provider": "groq", "model": "llama3-8b-8192"}
    ]

    result = None

    for config in FALLBACK_CONFIGS:
        provider = config["provider"]
        model_name = config["model"]
        success = False
        
        for attempt in range(MAX_RETRIES):
            try:
                if provider == "groq":
                    print(f"Calling Groq API using model '{model_name}' (Attempt {attempt+1})...")
                    client = get_groq_client()
                    chat_completion = client.chat.completions.create(
                        messages=[
                            {"role": "system", "content": SYSTEM_PROMPT},
                            {"role": "user", "content": user_prompt},
                        ],
                        model=model_name,
                        temperature=0.0,
                        response_format={"type": "json_object"},
                    )
                    response_content = chat_completion.choices[0].message.content or "{}"
                else:  # gemini
                    print(f"Calling Gemini API using model '{model_name}' (Attempt {attempt+1})...")
                    configure_gemini()
                    model = genai.GenerativeModel(
                        model_name=model_name,
                        generation_config={
                            "response_mime_type": "application/json",
                            "temperature": 0.0
                        }
                    )
                    full_prompt = f"{SYSTEM_PROMPT}\n\n{user_prompt}"
                    response = model.generate_content(full_prompt)
                    response_content = response.text or "{}"
                
                # Strip potential Markdown formatting
                clean_content = response_content.strip()
                if clean_content.startswith("```"):
                    lines = clean_content.split("\n")
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines and lines[-1].startswith("```"):
                        lines = lines[:-1]
                    clean_content = "\n".join(lines).strip()
                    
                result = json.loads(clean_content)
                success = True
                break  # Success! Break the retry loop

            except Exception as e:
                msg = str(e)
                with open("error_log.txt", "a") as f:
                    f.write(f"Error for {model_name}: {msg}\n")
                if "429" in msg or "rate_limit" in msg.lower() or "quota" in msg.lower():
                    print(f"⚠️ Rate limit/quota hit for {provider} model '{model_name}'. Switching to next config...")
                    break  # Break retry loop, move to the NEXT config
                
                print(f"❌ {provider.upper()} error on '{model_name}': {e}")
                if attempt < MAX_RETRIES - 1:
                    time.sleep(2)
                else:
                    break  # Move to next config on other persistent errors
                    
        if success:
            break
            
    if not result:
        # Fallback if ALL models fail
        return {
            "session_id": session_id,
            "status": "need_more_facts",
            "extracted_facts": {},
            "next_question": {
                "question_text": "I'm experiencing high traffic across all servers. Please wait a moment and send your message again.",
                "fact_key": "retry"
            },
            "matched_sections": None,
            "applicable_laws": [],
            "confidence_flags": []
        }
        
    # Ensure required fields exist so the frontend doesn't crash
    result.setdefault("session_id", session_id)
    result.setdefault("status", "no_match")
    result.setdefault("extracted_facts", {})
    result.setdefault("next_question", None)
    result.setdefault("matched_sections", None)
    result.setdefault("applicable_laws", [])
    result.setdefault("confidence_flags", [])
    
    # Add bot response to history
    bot_text = ""
    next_q = result.get("next_question")
    last_asked_fact = next_q.get("fact_key") if next_q else None
    last_question_text = next_q.get("question_text") if next_q else None

    if result.get("status") == "new_problem":
        # The user started a new topic. Reset history to just the latest message
        history = [{"role": "user", "content": user_message}]
        result["status"] = "need_more_facts"

    if result.get("status") == "need_more_facts" and next_q:
        bot_text = next_q.get("question_text", "")
    elif result.get("status") == "matched" and result.get("matched_sections"):
        bot_text = f"Matched section: {result['matched_sections'][0].get('issue')}"
        
    history.append({"role": "assistant", "content": bot_text})
    
    update_session(
        session_id,
        domain_id=result.get("domain_id"),
        extracted_facts=result.get("extracted_facts"),
        status=result.get("status"),
        history=history,
        last_asked_fact=last_asked_fact,
        last_question_text=last_question_text
    )

    return result


