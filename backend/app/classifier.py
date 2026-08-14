# app/classifier.py
"""
Domain classifier module.

Classifies incoming legal complaints into one of the core domains:
'consumer', 'labor', 'tenant'.

Uses Groq API (llama-3.3-70b-versatile) with system prompt disambiguation rules and few-shot examples.
"""
import os
import json
from typing import Tuple, Optional
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

DOMAINS = ["consumer", "labor", "tenant"]
_groq_client: Optional[Groq] = None


def _get_groq_client() -> Groq:
    global _groq_client
    if _groq_client is None:
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("Missing GROQ_API_KEY in .env")
        _groq_client = Groq(api_key=api_key)
    return _groq_client


SYSTEM_PROMPT = """You are a legal domain classifier. Classify the user's complaint or inquiry into exactly ONE category: tenant, labor, or consumer.

CATEGORY DEFINITIONS
tenant: Disputes arising from a landlord-tenant / rental relationship. Includes security deposits, lease terms, rent, rent increases, evictions, habitability/repairs, unauthorized entry, lease violations, and any fees or charges tied to a rental agreement or property manager.
labor: Disputes arising from an employer-employee relationship. Includes unpaid wages/overtime, wrongful termination, workplace safety, discrimination/harassment, denied leave or benefits, misclassification, and retaliation.
consumer: Disputes arising from the purchase of a product or service where NO landlord-tenant or employer-employee relationship exists. Includes defective products, billing/refund/warranty issues, deceptive advertising, and service contracts (gyms, subscriptions, repairs, etc.) that are not rental housing.

DISAMBIGUATION RULES (apply in order)
1. If the dispute involves a rental property, lease, apartment, unit, landlord, or property manager → tenant (even if money, fees, or “service” language appears).
2. If the dispute involves an employer, wages, hours, termination, workplace treatment, or benefits → labor (do not default to consumer just because payment is involved).
3. Only classify as consumer when the relationship is clearly a buyer/seller or customer/business transaction with no rental or employment signals.
4. Never decide from a single keyword (“deposit”, “fee”, “refund”) in isolation. Always use the full relationship implied by the sentence.
5. If genuinely ambiguous after applying the rules, set confidence to "low" and fill ambiguous_with instead of guessing.

OUTPUT RULES
- Think first about the core relationship (landlord-tenant, employer-employee, or buyer-seller).
- Return ONLY valid JSON. No markdown, no extra text, no explanation outside the JSON.
- Use this exact schema:

{
  "reasoning": "1-2 sentences that identify the key relationship and why it determines the category",
  "category": "tenant" | "labor" | "consumer",
  "confidence": "high" | "medium" | "low",
  "ambiguous_with": "tenant" | "labor" | "consumer" | null
}

FEW-SHOT EXAMPLES
Input: "My landlord has not returned my security deposit."
Output: {"reasoning": "Security deposit held by a landlord under a rental agreement is a classic landlord-tenant dispute.", "category": "tenant", "confidence": "high", "ambiguous_with": null}

Input: "My employer hasn't paid me for overtime hours."
Output: {"reasoning": "Unpaid overtime owed by an employer is an employment relationship dispute.", "category": "labor", "confidence": "high", "ambiguous_with": null}

Input: "The phone I bought stopped working after a week and the store won't refund me."
Output: {"reasoning": "Defective product and refund dispute with a retailer; no rental or employment relationship.", "category": "consumer", "confidence": "high", "ambiguous_with": null}

Input: "My landlord charged me a cleaning fee that wasn't in my lease."
Output: {"reasoning": "Fee is tied to a lease agreement with a landlord, so this is a rental dispute even though it involves a charge.", "category": "tenant", "confidence": "high", "ambiguous_with": "consumer"}

Input: "I was let go from my job right after I reported a safety issue."
Output: {"reasoning": "Termination following a safety report indicates possible retaliation in an employment context.", "category": "labor", "confidence": "high", "ambiguous_with": null}

Input: "My gym keeps charging my card after I cancelled my membership."
Output: {"reasoning": "Billing dispute with a service business after cancellation; no rental or employment relationship.", "category": "consumer", "confidence": "high", "ambiguous_with": null}

Input: "My property manager won't fix the broken heater in my apartment."
Output: {"reasoning": "Habitability/repair issue raised with a property manager under a rental agreement.", "category": "tenant", "confidence": "high", "ambiguous_with": null}
"""

CONFIDENCE_MAP = {
    "high": 0.95,
    "medium": 0.80,
    "low": 0.60
}


def load_classifier() -> None:
    """Startup initialization for classifier."""
    print("✅ Domain Classifier (Groq API System Prompt Mode) loaded.")


def classify(text: str) -> Tuple[str, float]:
    """
    Classifies complaint text into ('consumer' | 'labor' | 'tenant', confidence_score)
    using Groq API (Llama-3.3-70b-versatile) with system prompt disambiguation rules.
    """
    try:
        client = _get_groq_client()
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Classify the following input:\n\"{text}\""}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.0,
            response_format={"type": "json_object"}
        )

        res_content = response.choices[0].message.content or "{}"
        parsed = json.loads(res_content)

        category = str(parsed.get("category", "")).lower()
        raw_conf = str(parsed.get("confidence", "high")).lower()
        confidence = CONFIDENCE_MAP.get(raw_conf, 0.90)

        if category in DOMAINS:
            return category, confidence
    except Exception as e:
        print(f"⚠️ Groq Classifier warning: {e}")

    # Fallback keyword rules
    text_lower = text.lower()
    if any(k in text_lower for k in ["landlord", "rent", "deposit", "evict", "flat", "makan", "kiraya"]):
        return "tenant", 0.80
    if any(k in text_lower for k in ["salary", "wages", "boss", "employer", "company", "pf", "vetan"]):
        return "labor", 0.80

    return "consumer", 0.70


__all__ = ["load_classifier", "classify"]
