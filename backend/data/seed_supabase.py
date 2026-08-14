"""
Step 3 — Seed script: supabase_seed_data.json -> Supabase

Usage:
    python -m data.seed_supabase

Inserts in FK-safe order:
    domains -> sections -> applicable_law_sections
             -> fact_definitions -> section_facts

Uses upsert so it's safe to re-run after editing section_rules.json /
re-running convert.py (won't create duplicates on primary/unique keys).
"""

import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

# Load .env from backend/ directory
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path)

SEED_FILE = os.path.join(os.path.dirname(__file__), "supabase_seed_data.json")


def get_client():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SECRET_KEY")
    if not url or not key:
        sys.exit("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env")
    return create_client(url, key)


def upsert(client, table, rows, on_conflict=None, batch_size=200):
    if not rows:
        print(f"  {table}: nothing to insert")
        return
    for i in range(0, len(rows), batch_size):
        batch = rows[i : i + batch_size]
        q = client.table(table).upsert(batch, on_conflict=on_conflict) if on_conflict \
            else client.table(table).upsert(batch)
        resp = q.execute()
        if getattr(resp, "data", None) is None:
            sys.exit(f"  {table}: insert failed — {resp}")
    print(f"  {table}: upserted {len(rows)} row(s)")


def main():
    with open(SEED_FILE, encoding="utf-8") as f:
        data = json.load(f)

    client = get_client()

    print("Seeding Supabase...")

    # 1. domains (primary key: id)
    upsert(client, "domains", data["domains"], on_conflict="id")

    # 2. sections (primary key: id, FK -> domains)
    upsert(client, "sections", data["sections"], on_conflict="id")

    # 3. applicable_law_sections (bigserial PK, FK -> sections)
    #    No natural unique key given in the schema, so we clear existing
    #    rows per section first to keep this idempotent, then insert fresh.
    section_ids = {row["id"] for row in data["sections"]}
    if section_ids:
        client.table("applicable_law_sections") \
            .delete().in_("section_id", list(section_ids)).execute()
    if data["applicable_law_sections"]:
        client.table("applicable_law_sections") \
            .insert(data["applicable_law_sections"]).execute()
    print(f"  applicable_law_sections: inserted {len(data['applicable_law_sections'])} row(s)")

    # 4. fact_definitions (primary key: fact_key)
    upsert(client, "fact_definitions", data["fact_definitions"], on_conflict="fact_key")

    # 5. section_facts (unique constraint: section_id + fact_key)
    upsert(client, "section_facts", data["section_facts"], on_conflict="section_id,fact_key")

    print("Done.")


if __name__ == "__main__":
    main()
