import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.environ["GOOGLE_API_KEY"])

# Schema representing consumer domain facts from seed data
schema = {
    "type": "OBJECT",
    "properties": {
        "purchase_for_personal_use": {"type": "BOOLEAN", "description": "Did the user buy this product for personal use?"},
        "seller_refused_refund_or_replacement": {"type": "BOOLEAN", "description": "Did the seller/store refuse refund or replacement?"},
        "days_since_purchase": {"type": "NUMBER", "description": "Number of days since product purchase if mentioned"},
        "has_receipt_or_invoice": {"type": "BOOLEAN", "description": "Does the user mention having a receipt or invoice?"},
        "expired_product_received": {"type": "BOOLEAN", "description": "Did the user receive an expired product?"}
    }
}

user_input = "mera ko expiry product mila hai"

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=f"Analyze this user complaint under Consumer Protection laws and extract all relevant facts as JSON:\n\nUser input: '{user_input}'",
    config=types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=schema,
        temperature=0
    )
)

print("Extracted Facts:")
print(response.text)
