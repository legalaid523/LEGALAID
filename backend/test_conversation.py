# test_conversation.py
"""Simulate multi-turn conversations end-to-end."""
from app.supabase_client import load_cache
from app.classifier import load_classifier
from app.conversation import start_conversation, handle_message


def print_response(turn_num: int, user_msg: str, resp: dict):
    print("\n" + "─" * 70)
    print(f"TURN {turn_num}")
    print(f"USER: {user_msg}")
    print("─" * 70)
    print(f"Status: {resp['status']}")
    print(f"Domain: {resp['domain_id']}"
          + (f" (conf: {resp['domain_confidence']:.2f})" if resp.get('domain_confidence') else ""))
    print(f"Facts: {resp['extracted_facts']}")

    if resp.get("top_candidate"):
        tc = resp["top_candidate"]
        print(f"Top candidate: {tc['section_id']} (score: {tc['score']})")

    if resp.get("next_question"):
        q = resp["next_question"]
        print(f"\n🤖 BOT ASKS: {q['question_text']}")
        print(f"   (targeting: {q['target_section_id']}, ambiguous={q['ambiguous']})")

    if resp.get("matched_sections"):
        print(f"\n✅ MATCHED:")
        for ms in resp["matched_sections"]:
            print(f"   • {ms['section_id']} — {ms['issue']} (score: {ms['score']})")


def run_conversation(title: str, messages: list[str], language: str = "en"):
    print("\n" + "=" * 70)
    print(f"CONVERSATION: {title}")
    print("=" * 70)

    session_id = start_conversation()
    print(f"Session ID: {session_id}")

    for i, msg in enumerate(messages, 1):
        resp = handle_message(session_id, msg, language=language)
        print_response(i, msg, resp)
        if resp["status"] == "matched":
            print("\n(conversation ended — section matched)")
            break


if __name__ == "__main__":
    load_cache()
    load_classifier()

    # --- Conversation 1: Clear deposit case, English ---
    run_conversation(
        "Tenant deposit case (English, multi-turn)",
        [
            "My landlord is refusing to return my Rs 25000 security deposit.",
            "I moved out 3 months ago and I have a written rental agreement.",
            "No, the landlord did not document any damage.",
        ],
    )

    # --- Conversation 2: Hinglish, single detailed message ---
    run_conversation(
        "Tenant deposit (Hinglish, one-shot)",
        [
            "Mera landlord 30000 ka deposit wapas nahi kar raha, 4 mahine ho gaye, "
            "written agreement bhi hai, aur koi damage bhi nahi tha",
        ],
    )

    # --- Conversation 3: Consumer complaint ---
    run_conversation(
        "Consumer defective phone",
        [
            "I bought a phone from Flipkart last month for Rs 15000. "
            "It stopped working after 5 days. They refuse to replace it.",
            "Yes I have the invoice, and I bought it for personal use.",
        ],
    )

    # --- Conversation 4: Labor unpaid wages, Hinglish ---
    run_conversation(
        "Labor unpaid wages (Hinglish)",
        [
            "Meri company ne 3 mahine se salary nahi di. Main factory worker hoon, "
            "12000 rupay per month milta hai.",
        ],
    )
