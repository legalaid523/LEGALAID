# app/session_store.py
"""Read/write session state in Supabase's session_facts table (with memory fallback)."""
import os
import uuid
from typing import Dict, Any, Optional, List
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

_sb = None
_in_memory_sessions: Dict[str, Dict[str, Any]] = {}


def _client():
    global _sb
    if _sb is None:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SECRET_KEY")
        if url and key:
            _sb = create_client(url, key)
    return _sb


def create_session() -> str:
    """Create a new session and return its ID."""
    session_id = str(uuid.uuid4())
    record = {
        "session_id": session_id,
        "domain_id": None,
        "extracted_facts": {},
        "target_section_id": None,
        "matched_section_ids": [],
        "last_asked_fact": None,
        "last_question_text": None,
        "status": "in_progress",
    }
    _in_memory_sessions[session_id] = record

    client = _client()
    if client:
        try:
            client.table("session_facts").insert({
                "session_id": session_id,
                "extracted_facts": {},
                "status": "in_progress",
            }).execute()
        except Exception:
            pass

    return session_id


def get_session(session_id: str) -> Optional[dict]:
    in_mem = _in_memory_sessions.get(session_id, {})
    client = _client()
    if client:
        try:
            resp = client.table("session_facts").select("*").eq("session_id", session_id).execute()
            if resp.data:
                return {**in_mem, **resp.data[0]}
        except Exception:
            pass
    return in_mem if in_mem else None


def update_session(
    session_id: str,
    domain_id: Optional[str] = None,
    extracted_facts: Optional[dict] = None,
    target_section_id: Optional[str] = None,
    matched_section_ids: Optional[List[str]] = None,
    status: Optional[str] = None,
    last_asked_fact: Optional[str] = None,
    last_question_text: Optional[str] = None,
    **kwargs,
):
    updates: dict = {}
    if domain_id is not None:
        updates["domain_id"] = domain_id
    if extracted_facts is not None:
        updates["extracted_facts"] = extracted_facts
    if target_section_id is not None:
        updates["target_section_id"] = target_section_id
    if matched_section_ids is not None:
        updates["matched_section_ids"] = matched_section_ids
    if status is not None:
        updates["status"] = status
    if last_asked_fact is not None:
        updates["last_asked_fact"] = last_asked_fact
    if last_question_text is not None:
        updates["last_question_text"] = last_question_text
    updates.update(kwargs)

    # Update in-memory fallback store
    sess = _in_memory_sessions.setdefault(session_id, {"session_id": session_id})
    sess.update(updates)

    client = _client()
    if client:
        try:
            db_updates = {"updated_at": "now()"}
            if domain_id is not None:
                db_updates["domain_id"] = domain_id
            if extracted_facts is not None:
                db_updates["extracted_facts"] = extracted_facts
            if target_section_id is not None:
                db_updates["target_section_id"] = target_section_id
            if matched_section_ids is not None:
                db_updates["matched_section_ids"] = matched_section_ids
            if status is not None:
                db_updates["status"] = status
            client.table("session_facts").update(db_updates).eq("session_id", session_id).execute()
        except Exception:
            pass


def delete_session(session_id: str):
    _in_memory_sessions.pop(session_id, None)
    client = _client()
    if client:
        try:
            client.table("session_facts").delete().eq("session_id", session_id).execute()
        except Exception:
            pass

