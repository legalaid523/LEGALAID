# test_matcher.py
"""
Test script for the deterministic Fact-Section Matching Engine and Question Engine.
Run from backend root:
    python test_matcher.py
"""

from app.supabase_client import load_cache
from app.fact_matcher import match_sections
from app.question_engine import select_next_question


def main():
    print("Loading Supabase cache...")
    load_cache()

    print("\n" + "=" * 70)
    print("TEST 1: Tenant Security Deposit — Partial Facts")
    print("=" * 70)
    facts_1 = {
        "deposit_amount": 25000,
        "days_since_vacate": 45,
    }
    result_1 = match_sections("tenant", facts_1)
    print(f"Status: {result_1.status}")
    print(f"Ambiguous: {result_1.ambiguous}")
    if result_1.target_section:
        print(f"Top Target: {result_1.target_section.section_id} (Score: {result_1.target_section.score:.2f})")
        print(f"Satisfied Weight: {result_1.target_section.satisfied_weight}/{result_1.target_section.total_weight}")
        print(f"Missing Required Facts: {[f['fact_key'] for f in result_1.target_section.missing_required]}")

    q_1 = select_next_question(result_1)
    if q_1:
        print(f"\n👉 Next Question Picked:")
        print(f"   Fact Key: {q_1.fact_key}")
        print(f"   Question (EN): {q_1.question_en}")
        print(f"   Question (HI): {q_1.question_hi}")
        print(f"   Options: {q_1.options}")

    print("\n" + "=" * 70)
    print("TEST 2: Tenant Security Deposit — Full Match")
    print("=" * 70)
    facts_2 = {
        "deposit_amount": 25000,
        "days_since_vacate": 45,
        "damage_documented_by_landlord": False,
    }
    result_2 = match_sections("tenant", facts_2)
    print(f"Status: {result_2.status}")
    print(f"Matched Sections: {[s.section_id for s in result_2.matched_sections]}")
    if result_2.target_section:
        print(f"Target Section Score: {result_2.target_section.score:.2f}")

    q_2 = select_next_question(result_2)
    print(f"Next Question Picked: {q_2}")

    print("\n" + "=" * 70)
    print("TEST 3: Labor Unpaid Wages — Partial Facts")
    print("=" * 70)
    facts_3 = {
        "days_delayed": 60,
        "wages_owed_amount": 50000,
    }
    result_3 = match_sections("labor", facts_3)
    print(f"Status: {result_3.status}")
    if result_3.target_section:
        print(f"Top Target: {result_3.target_section.section_id} (Score: {result_3.target_section.score:.2f})")
        print(f"Missing Required Facts: {[f['fact_key'] for f in result_3.target_section.missing_required]}")

    q_3 = select_next_question(result_3)
    if q_3:
        print(f"\n👉 Next Question Picked:")
        print(f"   Fact Key: {q_3.fact_key}")
        print(f"   Question (EN): {q_3.question_en}")
        print(f"   Question (HI): {q_3.question_hi}")

    print("\n" + "=" * 70)
    print("All matcher & question engine tests completed successfully.")
    print("=" * 70)


if __name__ == "__main__":
    main()
