# app/extraction.py
"""
Fact extraction using Groq (Llama-3.3-70b-versatile) with JSON output + Pydantic validation.
Instructs LLM to omit unknown fields to prevent hallucination.
"""
import os
import json
import time
from typing import Optional
from groq import Groq
from dotenv import load_dotenv
from pydantic import ValidationError

from app.schema_builder import build_pydantic_model_for_domain
from app.supabase_client import get_cache

load_dotenv()

MODEL_NAME = "llama-3.3-70b-versatile"
MAX_RETRIES = 2

_groq_client: Optional[Groq] = None


def get_groq_client() -> Groq:
    """Returns singleton Groq client."""
    global _groq_client
    if _groq_client is None:
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("Missing GROQ_API_KEY in .env")
        _groq_client = Groq(api_key=api_key)
    return _groq_client


SYSTEM_PROMPT = """You are a legal fact extraction assistant for an Indian legal aid platform.

Your ONLY job: extract structured facts from a user's complaint text into a JSON object.

CRITICAL RULES:
1. ONLY include a field in your JSON output if the user has EXPLICITLY stated or CLEARLY implied that fact.
2. If a fact is not mentioned at all, OMIT it from the JSON entirely. DO NOT include it with a default/empty/zero/false value.
3. NEVER guess, infer, or invent values. If unsure, omit the field.
4. DO NOT provide legal advice, opinions, or explanations.
5. Support Hindi, English, and Hinglish (code-mixed) input equally.
6. Normalize amounts to plain numbers:
   - "10 hazaar" / "10 हजार" / "दस हजार" → 10000
   - "1 lakh" / "1 लाख" → 100000
   - "Rs 25,000" / "₹25000" → 25000
7. Normalize durations to the unit implied by the field name (days or months):
   - "do mahine" / "दो महीने" / "two months" → 2
   - "teen hafte" / "तीन हफ्ते" → 21 (if field is in days)
8. Booleans: set true/false ONLY if the user clearly indicates it. Otherwise OMIT.
9. If prior facts are provided, include them UNCHANGED in your output. Add new facts only.
10. For negation phrases (e.g. 'no damage found', 'koi damage nahi tha', 'no notice given', 'landlord gave no receipt'), set the corresponding boolean field to false.

OUTPUT FORMAT: Return ONLY a valid JSON object.
Example of good output (only fields the user actually mentioned):
{"deposit_amount": 25000, "deposit_returned": false}
"""

_model_cache: dict = {}


def _get_pydantic_model(domain_id: str):
    if domain_id not in _model_cache:
        cache = get_cache()
        _model_cache[domain_id] = build_pydantic_model_for_domain(domain_id, cache)
    return _model_cache[domain_id]


def _build_field_hint(pydantic_model) -> str:
    lines = []
    for field_name, field_info in pydantic_model.model_fields.items():
        annotation = field_info.annotation
        type_str = str(annotation).replace("typing.Optional[", "").rstrip("]")
        type_str = type_str.replace("<class '", "").replace("'>", "")
        desc = field_info.description or ""
        lines.append(f'  - "{field_name}" ({type_str}): {desc}')
    return "\n".join(lines)


import re

def _parse_direct_reply(user_message: str, last_asked_fact: Optional[str]) -> dict:
    """Check if the user's message is a direct answer to the last asked fact."""
    if not last_asked_fact:
        return {}

    msg = user_message.strip().lower()
    cleaned = re.sub(r"[^\w\s\u0900-\u097F]", "", msg)

    # Boolean matching
    YES_PHRASES = {
        "yes", "y", "yeah", "yep", "yup", "true", "haan", "ha", "haanji",
        "hanji", "sahi", "bilkul", "yes i do", "yes i have", "yes it is",
        "i do", "i have", "yes there is", "हाँ", "हा", "जी हाँ", "जी", "हां"
    }
    NO_PHRASES = {
        "no", "n", "nope", "nah", "false", "nahi", "na", "nahin", "galat",
        "no i dont", "no i don't", "no i havent", "no i have not", "not really",
        "nahi hai", "no there is not", "नहीं", "ना", "जी नहीं", "न"
    }

    if cleaned in YES_PHRASES or msg in YES_PHRASES:
        return {last_asked_fact: True}
    if cleaned in NO_PHRASES or msg in NO_PHRASES:
        return {last_asked_fact: False}

    # Number / amount matching
    num_match = re.search(r"(\d+(?:\.\d+)?)", msg.replace(",", ""))
    if num_match:
        try:
            val = float(num_match.group(1))
            if "k" in msg and val < 1000:
                val *= 1000
            elif "lakh" in msg or "lac" in msg or "लाख" in msg:
                val *= 100000
            elif "hazaar" in msg or "हजार" in msg:
                val *= 1000
            return {last_asked_fact: int(val) if val.is_integer() else val}
        except (ValueError, TypeError):
            pass

    return {}


def extract_facts(
    user_message: str,
    domain_id: str,
    existing_facts: Optional[dict] = None,
    last_asked_fact: Optional[str] = None,
    last_question_text: Optional[str] = None,
) -> dict:
    """
    Extract structured facts from a user complaint or answer.

    Returns merged dict of {existing_facts + newly_extracted_facts}.
    """
    pydantic_model = _get_pydantic_model(domain_id)
    field_hint = _build_field_hint(pydantic_model)

    # Check for direct quick-reply answers first
    direct_facts = _parse_direct_reply(user_message, last_asked_fact)

    context_block = ""
    if existing_facts:
        context_block = (
            "\n\nFacts already collected from earlier in this conversation:\n"
            f"{json.dumps(existing_facts, indent=2, ensure_ascii=False)}\n\n"
            "Extract any NEW facts from the message below. "
            "Include the previously known facts UNCHANGED in your output."
        )

    followup_context = ""
    if last_asked_fact and last_question_text:
        followup_context = (
            f"\n\nQUESTION CURRENTLY BEING ANSWERED:\n"
            f"The assistant just asked: \"{last_question_text}\"\n"
            f"Target field: \"{last_asked_fact}\"\n"
            f"If the user's message answers this question (e.g. 'Yes', 'No', 'Haan', 'Nahi', a number, or explanation), "
            f"extract the corresponding value for \"{last_asked_fact}\".\n"
        )

    prompt = (
        f"ALLOWED FIELDS (only use these keys, and only include those the user mentioned):\n"
        f"{field_hint}"
        f"{followup_context}"
        f"{context_block}\n\n"
        f"User message:\n\"\"\"\n{user_message}\n\"\"\"\n\n"
        f"JSON output:"
    )

    client = get_groq_client()

    last_error: Optional[Exception] = None
    for attempt in range(MAX_RETRIES + 1):
        try:
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                model=MODEL_NAME,
                temperature=0.0,
                response_format={"type": "json_object"},
            )

            response_content = chat_completion.choices[0].message.content or "{}"
            parsed = json.loads(response_content)

            # Strip empty-ish values
            parsed = _strip_empty_values(parsed)

            # Overlay direct facts if any
            parsed.update(direct_facts)

            # Validate with Pydantic
            validated = pydantic_model(**parsed)
            new_facts = validated.model_dump(exclude_none=True)

            merged = {**(existing_facts or {}), **direct_facts, **new_facts}
            return merged

        except (json.JSONDecodeError, ValidationError) as e:
            last_error = e
            continue

        except Exception as e:
            msg = str(e)
            if "429" in msg or "rate_limit" in msg.lower():
                if attempt < MAX_RETRIES:
                    time.sleep(3)
                    continue
            raise RuntimeError(f"Groq API error: {e}") from e

    # Fallback to direct facts + existing facts if LLM retry fails
    if direct_facts:
        return {**(existing_facts or {}), **direct_facts}

    raise RuntimeError(
        f"Extraction failed after {MAX_RETRIES + 1} attempts: {last_error}"
    )


def _strip_empty_values(d: dict) -> dict:
    return {
        k: v
        for k, v in d.items()
        if v is not None and v != "" and v != -1
    }


def reset_schema_cache():
    _model_cache.clear()