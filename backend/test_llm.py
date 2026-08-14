import os, json, time
from dotenv import load_dotenv

# load_dotenv without override won't override inherited variables
load_dotenv(override=True)

print("GROQ KEY:", os.environ.get("GROQ_API_KEY")[:10] if os.environ.get("GROQ_API_KEY") else "None")

try:
    from groq import Groq
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    chat_completion = client.chat.completions.create(
        messages=[{"role": "user", "content": "Return valid JSON: {'status': 'ok'}"}],
        model="llama-3.3-70b-versatile",
        temperature=0.0,
        response_format={"type": "json_object"}
    )
    print("Groq Success:", chat_completion.choices[0].message.content)
except Exception as e:
    print("Groq Error:", repr(e))

try:
    import google.generativeai as genai
    genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))
    model = genai.GenerativeModel("gemini-1.5-flash", generation_config={"response_mime_type": "application/json"})
    response = model.generate_content("Return valid JSON: {'status': 'ok'}")
    print("Gemini Success:", response.text)
except Exception as e:
    print("Gemini Error:", repr(e))
