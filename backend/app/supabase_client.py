# app/supabase_client.py
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

_cache: dict = {}


def load_cache():
    """Load all knowledge-base tables from Supabase into memory. Call ONCE at startup."""
    url = os.environ["SUPABASE_URL"]
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SECRET_KEY")
    if not key:
        raise KeyError("Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY in .env")
    sb = create_client(url, key)

    _cache["domains"] = sb.table("domains").select("*").execute().data
    _cache["sections"] = sb.table("sections").select("*").execute().data
    _cache["section_facts"] = sb.table("section_facts").select("*").execute().data
    _cache["fact_definitions"] = sb.table("fact_definitions").select("*").execute().data
    _cache["applicable_law_sections"] = sb.table("applicable_law_sections").select("*").execute().data

    print(
        f"✅ Cache loaded: "
        f"{len(_cache['domains'])} domains, "
        f"{len(_cache['sections'])} sections, "
        f"{len(_cache['fact_definitions'])} fact_definitions, "
        f"{len(_cache['section_facts'])} section_facts"
    )


def get_cache() -> dict:
    """Access the loaded cache. Raises if load_cache() wasn't called first."""
    if not _cache:
        raise RuntimeError("Cache not loaded. Call load_cache() at startup.")
    return _cache


def reset_cache():
    """Dev helper: clear cache so next get_cache() forces a fresh load."""
    _cache.clear()