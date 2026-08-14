# test_extraction.py
import time
from app.supabase_client import load_cache
from app.extraction import extract_facts


def run_test(label, msg, domain, existing=None):
    print("\n" + "=" * 70)
    print(f"TEST: {label}")
    print(f"Message: {msg}")
    if existing:
        print(f"Existing: {existing}")
    print("-" * 70)
    try:
        result = extract_facts(msg, domain_id=domain, existing_facts=existing)
        print(f"✅ Extracted: {result}")
    except Exception as e:
        print(f"❌ ERROR: {e}")


if __name__ == "__main__":
    load_cache()

    tests = [
        ("1. English tenant (deposit)",
         "My landlord is refusing to return my security deposit of Rs 25000. "
         "I vacated the flat 3 months ago and there was a written agreement.",
         "tenant", None),

        ("2. Hinglish tenant (deposit)",
         "Mera landlord 15000 ka deposit wapas nahi kar raha, "
         "maine 2 mahine pehle ghar khaali kiya tha",
         "tenant", None),

        ("3. Hindi tenant (rent hike)",
         "मकान मालिक ने बिना नोटिस दिए किराया बढ़ा दिया है और रसीद भी नहीं देता",
         "tenant", None),

        ("4. Multi-turn merge",
         "Yes I have a written rental agreement, and I'm in Maharashtra",
         "tenant", {"deposit_amount": 25000, "deposit_returned": False}),

        ("5. Vague — must return near-empty",
         "I have a problem with my landlord",
         "tenant", None),

        ("6. Consumer",
         "I bought a phone from Flipkart last month for Rs 15000 "
         "and it stopped working after 5 days. They refuse to replace it.",
         "consumer", None),

        ("7. Labor (Hinglish)",
         "Meri company ne 3 mahine se salary nahi di, main factory worker hoon, "
         "12000 rupay per month milta hai",
         "labor", None),
    ]

    for i, (label, msg, domain, existing) in enumerate(tests):
        run_test(label, msg, domain, existing)
        if i < len(tests) - 1:
            time.sleep(0.5)   # Groq is super fast with high rate limits