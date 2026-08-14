"""
Test connection to Supabase database by querying the 'domains' table.
Run from backend/ directory as:
    python -m scripts.test_connection
"""

import sys
from app.db.client import get_supabase_client


def main() -> None:
    try:
        supabase = get_supabase_client()
        response = supabase.table("domains").select("*").execute()
        rows = response.data
        print(f"Successfully connected to Supabase.")
        print(f"Row count in 'domains' table: {len(rows)}")
        print("Rows:")
        print(rows)
    except Exception as e:
        print(f"Error querying 'domains' table from Supabase: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
