# LegalAId Backend — Supabase-Backed Fact & Section Matching Engine

LegalAId is an intelligent, hybrid AI legal assistant designed for the Indian legal context. It combines **LLM-based structured fact extraction** (supporting English, Hindi, and Hinglish) with a **100% deterministic Python rule matching engine** backed by Supabase and a **fine-tuned IndicBERT classifier**.

---

## ⭐ Key Uniqueness & Innovation ("Not a GPT Wrapper")

Unlike traditional LLM legal tools that ask an AI model to guess legal outcomes or write legal advice directly, LegalAId implements a strict separation of concerns:

1. **Zero Legal Hallucinations (100% Deterministic Engine):**
   - LLMs are **only** used as natural language parsers to convert unstructured complaints into JSON fact key-value pairs.
   - All legal section matching, scoring, condition evaluations (`==`, `>`, `<`, `exists`, `in`), and question selection logic are written in **pure Python & SQL**. The AI never computes legal scores or decides which law applies.

2. **Native Code-Mixed Indic NLP Normalization:**
   - Built specifically for India's linguistic reality: handles Hinglish, Hindi, and English mid-sentence code-switching.
   - Normalizes vernacular amounts and temporal units automatically:
     - `"10 hazaar"` / `"10 हजार"` / `"10k"` $\rightarrow$ `10000`
     - `"2 mahine pehle"` / `"दो महीने"` $\rightarrow$ `2`
     - `"1 lakh"` / `"1 लाख"` $\rightarrow$ `100000`

3. **Dynamic Database-Driven Schema Generation:**
   - Pydantic and LLM extraction schemas are **never hardcoded**. They are dynamically generated at runtime from the live Supabase `fact_definitions` and `section_facts` database metadata. Adding a new legal section or fact requires **zero code changes**.

4. **Proactive Evidence & Confidence Flags:**
   - Beyond simple matching, the engine evaluates missing optional supporting facts and generates actionable **Confidence Warnings** (e.g., *"No proof of purchase makes the claim harder to establish. Bank/UPI statements can substitute."*).

---

## 🤖 Multilingual Domain Classifier Integration

Domain classification (`consumer`, `labor`, `tenant`) is handled by `app/classifier.py`:

```
User Complaint (Indic/Hinglish/EN)
                 │
                 ▼
     ┌───────────────────────────┐
     │  Groq Classifier Engine   │ ──► High-Precision Domain Logits & Confidence
     │ (Llama-3.3-70b-versatile) │
     └───────────────────────────┘
                 │
   ┌─────────────┼─────────────┐
   ▼             ▼             ▼
[Consumer]    [Labor]      [Tenant]
```

### Classification Pipeline (`app/classifier.py`):
- **Current Active Engine:** Groq API (`llama-3.3-70b-versatile`) with structured JSON schema output for sub-second multilingual classification across English, Hindi, and Hinglish.
- **Future Upgrade Path:** Designed as a thin wrapper (`load_classifier()`, `classify()`) so a fine-tuned **IndicBERT** (`ai4bharat/indic-bert`) local model weights can be plugged in without changing downstream orchestrator code.


---

## 🏛️ Architecture Overview

The backend is built around a non-hallucinating hybrid architecture:

```
User Complaint (Hinglish/EN/HI)
           │
           ▼
 ┌───────────────────┐
 │ Domain Classifier │ ──► Fine-Tuned IndicBERT / Fast Heuristic
 └───────────────────┘
           │
           ▼
 ┌───────────────────┐
 │  Fact Extraction  │ ──► Groq (Llama-3.3-70b) + Dynamic Pydantic Schema
 └───────────────────┘
           │
           ▼
 ┌───────────────────┐
 │   Fact Matcher    │ ──► Deterministic Weighted Closeness Scoring (0.0 – 1.0)
 └───────────────────┘
     │           │
     │ (Missing) │ (Matched)
     ▼           ▼
┌──────────┐   ┌─────────────────────────────────────────┐
│ Question │   │  Matched Section + Applicable Laws     │
│ Engine   │   │  + Confidence Warnings/Flags            │
└──────────┘   └─────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
backend/
├── app/
│   ├── __init__.py           # Package marker
│   ├── supabase_client.py    # Supabase client singleton & fast in-memory table caching
│   ├── schema_builder.py     # Converts Supabase fact definitions into dynamic Pydantic & LLM schemas
│   ├── extraction.py        # Schema-enforced fact extraction (Groq Llama-3.3-70b / Gemini)
│   ├── fact_matcher.py      # Pure Python deterministic scoring engine (0 LLM overhead)
│   ├── question_engine.py   # Dynamically selects next question for missing required facts
│   ├── classifier.py        # Fine-tuned IndicBERT & heuristic domain classifier
│   ├── session_store.py     # In-memory session state management & fact accumulation
│   └── conversation.py      # End-to-end multi-turn orchestrator
├── data/
│   ├── __init__.py           # Package marker
│   ├── section_rules.json   # Source seed configuration rules
│   ├── supabase_seed_data.json # Standardized database seed JSON
│   └── seed_supabase.py     # Automated Supabase database seeder
├── scripts/
│   ├── test_connection.py   # Supabase connection test script
│   └── test_gemini.py       # Gemini API verification script
├── .env                     # Local environment secrets (DO NOT COMMIT)
├── .env.example             # Environment variable template
├── requirements.txt         # Core Python dependencies
├── test_extraction.py       # Fact extraction test suite
├── test_matcher.py          # Matcher & Question Engine test suite
├── test_conversation.py     # End-to-end multi-turn conversation test suite
└── README.md                # Project documentation
```

---

## 🗄️ Database Schema (Supabase)

The backend operates on 5 relational tables:

| Table | Description | Primary Key / Unique |
| :--- | :--- | :--- |
| `domains` | Core legal domains (`consumer`, `labor`, `tenant`). | `id` |
| `sections` | Statutory sections / legal issue categories. | `id` (FK `domain_id`) |
| `applicable_law_sections` | Exact Indian Acts, section numbers, summaries, and legal source URLs. | `id` (FK `section_id`) |
| `fact_definitions` | Master dictionary of legal facts, types (`boolean`, `number`, `string`), synonyms, and default questions (EN/HI). | `fact_key` |
| `section_facts` | Mapping of facts required per section, operator (`==`, `>`, `exists`), weight (1–3), and ask order. | `(section_id, fact_key)` |

---

## ⚖️ Matching Engine Logic & Scoring Formula

For any candidate section $S$, the closeness score is calculated deterministically:

$$\text{Score}(S) = \frac{\sum_{f \in \text{Satisfied Required Facts}} \text{Weight}(f)}{\sum_{f \in \text{All Required Facts}} \text{Weight}(f)}$$

- **Full Match:** $\text{Score}(S) = 1.0$ (Status: `matched`).
- **Need More Facts:** $0.0 < \text{Score}(S) < 1.0$ (Status: `need_more_facts`). The Question Engine isolates missing required facts for the highest-scoring section and generates the next question.
- **Ambiguity Flag:** Triggered when the top 2 candidate section scores differ by $\le 0.15$ (`AMBIGUITY_DELTA`).

---

## 🚀 Setup & Installation

### 1. Environment Setup
Create virtual environment and install dependencies:

```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Credentials (`.env`)
Create a `.env` file inside the `backend/` directory:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GOOGLE_API_KEY=your-google-gemini-api-key
GROQ_API_KEY=gsk_your_groq_api_key
```

### 3. Seed Supabase Database
Populate your Supabase project with domain rules, fact definitions, and law sections:

```powershell
python -m data.seed_supabase
```

---

## 🧪 Testing & Verification

Run the dedicated test suites from the `backend/` directory:

### 1. Test Supabase Database Connection
```powershell
python -m scripts.test_connection
```

### 2. Test Fact Extraction Engine
```powershell
python test_extraction.py
```

### 3. Test Deterministic Section Matcher & Question Engine
```powershell
python test_matcher.py
```

### 4. Test Full Multi-Turn Orchestration Pipeline
```powershell
python test_conversation.py
```

---

## 💬 Multi-Turn Orchestrator Example Output

```json
{
  "status": "matched",
  "session_id": "session_123",
  "domain_id": "tenant",
  "matched_section": {
    "id": "tenant_deposit_withheld",
    "issue": "security_deposit_withheld"
  },
  "match_score": 1.0,
  "extracted_facts": {
    "deposit_amount": 25000,
    "days_since_vacate": 45,
    "damage_documented_by_landlord": false
  },
  "applicable_laws": [
    {
      "act": "Model Tenancy Act, 2021",
      "section_number": "Security deposit & refund provisions",
      "text_summary": "Security deposit must be refunded at handover of vacant possession..."
    }
  ],
  "confidence_flags": [
    {
      "fact_key": "state_has_adopted_model_tenancy_act",
      "message": "The Model Tenancy Act is only binding where the state has formally adopted it..."
    }
  ]
}
```
