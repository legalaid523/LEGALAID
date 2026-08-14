"""
Supabase client singleton module.
"""

from typing import Optional
from supabase import Client, create_client
from app.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    """
    Returns a cached instance of the Supabase Client.
    """
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return _supabase_client


__all__ = ["get_supabase_client"]
