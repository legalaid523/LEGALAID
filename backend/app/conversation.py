# app/conversation.py
"""
Multi-turn conversation orchestrator.

Ties together: classifier → extraction → matcher → question engine → session store.
This is the single entry point the frontend/API talks to per user message.
"""
from app.classifier import classify
from app.extraction import extract_facts
from app.fact_matcher import match_sections
from app.question_engine import select_next_question
from app.session_store import create_session, get_session, update_session
from app.supabase_client import get_cache


def start_conversation() -> str:
    """Create a fresh session. Returns session_id."""
    return create_session()


def _get_applicable_laws(section_id: str) -> list[dict]:
    """Fetch applicable_law_sections for a matched section from the cache."""
    cache = get_cache()
    return [
        {
            "act": law.get("act", ""),
            "section_number": law.get("section_number", ""),
            "text_summary": law.get("text_summary", ""),
        }
        for law in cache.get("applicable_law_sections", [])
        if law.get("section_id") == section_id
    ]


def _get_confidence_flags(section_id: str, extracted_facts: dict) -> list[dict]:
    """
    Check optional facts for a matched section that are still missing.
    These become confidence warnings / evidence recommendations.
    """
    cache = get_cache()
    fact_defs = {fd["fact_key"]: fd for fd in cache.get("fact_definitions", [])}
    flags = []

    for sf in cache.get("section_facts", []):
        if sf.get("section_id") != section_id:
            continue
        if sf.get("required", True):
            continue  # only look at optional facts

        fact_key = sf["fact_key"]
        if fact_key not in extracted_facts:
            fd = fact_defs.get(fact_key, {})
            flag_msg = sf.get("confidence_flag_message") or fd.get("confidence_flag_message")
            if flag_msg:
                flags.append({
                    "fact_key": fact_key,
                    "field": fd.get("label", fact_key),
                    "message": flag_msg,
                })

    return flags


def handle_message(
    session_id: str,
    user_message: str,
    language: str = "en",
) -> dict:
    """
    Process one turn of conversation.

    Returns a response dict with status, extracted facts, next question
    or matched section with applicable laws and confidence flags.
    """
    session = get_session(session_id)
    if not session:
        raise ValueError(f"Session {session_id} not found. Call start_conversation() first.")

    domain_id = session.get("domain_id")
    existing_facts = session.get("extracted_facts") or {}
    last_asked_fact = session.get("last_asked_fact")
    last_question_text = session.get("last_question_text")

    # --- Step 1: Classify (only on first message) ---
    classify_confidence = None
    if not domain_id:
        domain_id, classify_confidence = classify(user_message)
        print(f"  🏷️  Classified as: {domain_id} (confidence: {classify_confidence:.2f})")

    # --- Step 2: Extract facts, merged with prior and question context ---
    try:
        updated_facts = extract_facts(
            user_message=user_message,
            domain_id=domain_id,
            existing_facts=existing_facts,
            last_asked_fact=last_asked_fact,
            last_question_text=last_question_text,
        )
    except Exception as e:
        print(f"  ⚠️  Extraction error: {e}")
        updated_facts = existing_facts   # keep prior facts on failure

    # --- Step 3: Score all sections in the domain ---
    match = match_sections(domain_id, updated_facts)

    # --- Step 4: Build response + persist ---
    response: dict = {
        "session_id": session_id,
        "status": match.status,
        "domain_id": domain_id,
        "domain_confidence": classify_confidence,
        "extracted_facts": updated_facts,
        "next_question": None,
        "matched_sections": None,
        "top_candidate": None,
        "applicable_laws": [],
        "confidence_flags": [],
        "candidates_considered": [
            {"section_id": s.section_id, "score": round(s.score, 3)}
            for s in match.ranked_sections[:5]
        ],
    }

    if match.status == "matched":
        matched_ids = [s.section_id for s in match.matched_sections]
        primary_section = match.matched_sections[0]
        response["matched_sections"] = [
            {
                "section_id": s.section_id,
                "issue": s.section.get("issue"),
                "notes": s.section.get("notes", ""),
                "score": round(s.score, 3),
            }
            for s in match.matched_sections
        ]
        response["applicable_laws"] = _get_applicable_laws(primary_section.section_id)
        response["confidence_flags"] = _get_confidence_flags(
            primary_section.section_id, updated_facts
        )
        update_session(
            session_id,
            domain_id=domain_id,
            extracted_facts=updated_facts,
            matched_section_ids=matched_ids,
            target_section_id=matched_ids[0] if matched_ids else None,
            status="matched",
            last_asked_fact=None,
            last_question_text=None,
        )

    elif match.status == "need_more_facts":
        next_q = select_next_question(match, language=language)
        response["next_question"] = next_q
        response["top_candidate"] = {
            "section_id": match.target_section.section_id,
            "score": round(match.target_section.score, 3),
            "issue": match.target_section.section.get("issue"),
        }
        update_session(
            session_id,
            domain_id=domain_id,
            extracted_facts=updated_facts,
            target_section_id=match.target_section.section_id,
            status="in_progress",
            last_asked_fact=next_q.get("fact_key") if next_q else None,
            last_question_text=next_q.get("question_text") if next_q else None,
        )

    else:  # no_match
        update_session(
            session_id,
            domain_id=domain_id,
            extracted_facts=updated_facts,
            status="no_match",
            last_asked_fact=None,
            last_question_text=None,
        )

    return response
