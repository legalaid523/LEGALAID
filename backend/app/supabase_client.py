# app/supabase_client.py
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

_cache: dict = {}


def load_cache():
    """Load all knowledge-base tables from Supabase into memory. Call ONCE at startup."""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SECRET_KEY")

    if url and key and "placeholder" not in url and "placeholder" not in key:
        try:
            print("Connecting to Supabase to load cache...")
            sb = create_client(url, key)
            _cache["domains"] = sb.table("domains").select("*").execute().data
            _cache["sections"] = sb.table("sections").select("*").execute().data
            _cache["section_facts"] = sb.table("section_facts").select("*").execute().data
            _cache["fact_definitions"] = sb.table("fact_definitions").select("*").execute().data
            _cache["applicable_law_sections"] = sb.table("applicable_law_sections").select("*").execute().data

            print(
                f"[OK] Cache loaded from Supabase: "
                f"{len(_cache['domains'])} domains, "
                f"{len(_cache['sections'])} sections, "
                f"{len(_cache['fact_definitions'])} fact_definitions, "
                f"{len(_cache['section_facts'])} section_facts"
            )
            return
        except Exception as e:
            print(f"[WARN] Failed to connect to Supabase: {e}. Falling back to local seed data JSON.")
    else:
        print("[INFO] Supabase credentials not set or placeholder. Loading cache from local seed data JSON...")

    # Local JSON fallback
    import json
    from pathlib import Path
    seed_path = Path(__file__).resolve().parent.parent / "data" / "supabase_seed_data.json"
    with open(seed_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    _cache["domains"] = data.get("domains", [])
    _cache["sections"] = data.get("sections", [])
    _cache["section_facts"] = data.get("section_facts", [])
    _cache["fact_definitions"] = data.get("fact_definitions", [])
    _cache["applicable_law_sections"] = data.get("applicable_law_sections", [])

    print(
        f"[OK] Cache loaded from local JSON fallback: "
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