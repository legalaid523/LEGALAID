# app/question_engine.py
"""
Question Engine for selecting the most informative next question to ask the user.

Given a MatchResult from the matching engine:
  - If status is 'matched', returns None (no questions needed).
  - If status is 'need_more_facts', identifies the highest-priority missing fact
    and constructs a structured question dict in the specified language.
"""
from typing import Optional, Dict, Any
from app.fact_matcher import MatchResult
from app.supabase_client import get_cache


def select_next_question(match_result: MatchResult, language: str = "en") -> Optional[Dict[str, Any]]:
    """
    Determines the single best question to ask the user next.
    """
    if match_result.status != "need_more_facts" or not match_result.target_section:
        return None

    target = match_result.target_section
    missing_facts = target.missing_required

    if not missing_facts:
        return None

    # Sort missing required facts by ask_order ascending, then weight descending
    sorted_missing = sorted(
        missing_facts,
        key=lambda sf: (sf.get("ask_order", 999), -float(sf.get("weight", 1)))
    )

    chosen_sf = sorted_missing[0]
    fact_key = chosen_sf["fact_key"]

    # Look up fact definition in cache
    cache = get_cache()
    fact_def_map = {fd["fact_key"]: fd for fd in cache.get("fact_definitions", [])}
    fd = fact_def_map.get(fact_key, {})

    label = fd.get("label") or chosen_sf.get("question_text_en") or fact_key
    fact_type = fd.get("fact_type") or "boolean"

    q_en = chosen_sf.get("question_text_en") or fd.get("default_question_en") or f"Please clarify: {label}?"
    q_hi = chosen_sf.get("question_text_hi") or fd.get("default_question_hi") or f"कृपया स्पष्ट करें: {label}?"

    q_text = q_hi if language.lower().startswith("hi") else q_en

    options = None
    if fact_type == "boolean":
        options = ["Yes", "No"] if not language.lower().startswith("hi") else ["हाँ", "नहीं"]

    return {
        "fact_key": fact_key,
        "question_text": q_text,
        "target_section_id": target.section_id,
        "ambiguous": match_result.ambiguous,
        "options": options,
    }


__all__ = ["select_next_question"]
