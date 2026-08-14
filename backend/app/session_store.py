# app/session_store.py
"""Read/write session state in Supabase's session_facts table (with memory fallback)."""
import os
import uuid
from typing import Dict, Any, Optional, List
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(override=True)

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
        "history": [],
    }
    _in_memory_sessions[session_id] = record

    client = _client()
    if client:
        try:
            client.table("session_facts").insert({
                "session_id": session_id,
                "extracted_facts": {},
                "status": "in_progress",
                # Note: history is not strongly typed in DB unless we added a jsonb column, 
                # but we will just rely on in_memory_sessions for history for the demo.
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


def update_session(session_id: str, **kwargs):
    updates = {}
    db_updates = {"updated_at": "now()"}
    
    # We want to support setting fields to None, so we just iterate over kwargs
    # Allowed fields: domain_id, extracted_facts, target_section_id, matched_section_ids, status, last_asked_fact, last_question_text
    allowed_fields = [
        "domain_id", "extracted_facts", "target_section_id", "matched_section_ids",
        "status", "last_asked_fact", "last_question_text", "history"
    ]
    
    for k, v in kwargs.items():
        if k in allowed_fields:
            updates[k] = v
            db_updates[k] = v
            
    # Update in-memory fallback store
    sess = _in_memory_sessions.setdefault(session_id, {"session_id": session_id})
    sess.update(updates)

    client = _client()
    if client and updates:
        try:
            client.table("session_facts").update(db_updates).eq("session_id", session_id).execute()
        except Exception as e:
            print(f"Error updating session in DB: {e}")


def delete_session(session_id: str):
    _in_memory_sessions.pop(session_id, None)
    client = _client()
    if client:
        try:
            client.table("session_facts").delete().eq("session_id", session_id).execute()
        except Exception:
            pass

