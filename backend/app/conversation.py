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


def start_conversation() -> str:
    """Create a fresh session. Returns session_id."""
    return create_session()


def handle_message(
    session_id: str,
    user_message: str,
    language: str = "en",
) -> dict:
    """
    Process one turn of conversation.

    Returns a response dict:
      {
        'session_id': ...,
        'status': 'need_more_facts' | 'matched' | 'no_match',
        'domain_id': ...,
        'extracted_facts': {...},
        'next_question': {...} or None,
        'matched_sections': [...] or None,
        'top_candidate': {section_id, score} or None,
      }
    """
    session = get_session(session_id)
    if not session:
        raise ValueError(f"Session {session_id} not found. Call start_conversation() first.")

    domain_id = session.get("domain_id")
    existing_facts = session.get("extracted_facts") or {}

    # --- Step 1: Classify (only on first message) ---
    classify_confidence = None
    if not domain_id:
        domain_id, classify_confidence = classify(user_message)
        print(f"  🏷️  Classified as: {domain_id} (confidence: {classify_confidence:.2f})")

    # --- Step 2: Extract facts, merged with prior ---
    try:
        updated_facts = extract_facts(user_message, domain_id, existing_facts)
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
    }

    if match.status == "matched":
        matched_ids = [s.section_id for s in match.matched_sections]
        response["matched_sections"] = [
            {
                "section_id": s.section_id,
                "issue": s.section.get("issue"),
                "score": round(s.score, 3),
            }
            for s in match.matched_sections
        ]
        update_session(
            session_id,
            domain_id=domain_id,
            extracted_facts=updated_facts,
            matched_section_ids=matched_ids,
            target_section_id=matched_ids[0] if matched_ids else None,
            status="matched",
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
        )

    else:  # no_match
        update_session(
            session_id,
            domain_id=domain_id,
            extracted_facts=updated_facts,
            status="no_match",
        )

    return response
