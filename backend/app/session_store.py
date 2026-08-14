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
    client = _client()
    if client:
        try:
            resp = client.table("session_facts").select("*").eq("session_id", session_id).execute()
            if resp.data:
                return resp.data[0]
        except Exception:
            pass
    return _in_memory_sessions.get(session_id)


def update_session(
    session_id: str,
    domain_id: Optional[str] = None,
    extracted_facts: Optional[dict] = None,
    target_section_id: Optional[str] = None,
    matched_section_ids: Optional[List[str]] = None,
    status: Optional[str] = None,
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

    # Update in-memory fallback store
    sess = _in_memory_sessions.setdefault(session_id, {"session_id": session_id})
    sess.update(updates)

    client = _client()
    if client:
        try:
            updates["updated_at"] = "now()"
            client.table("session_facts").update(updates).eq("session_id", session_id).execute()
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
