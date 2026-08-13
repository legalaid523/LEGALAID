# LegalAId Backend — Supabase-Backed Fact & Section Matching Engine

LegalAId is an intelligent, hybrid AI legal assistant designed for the Indian legal context. It combines **LLM-based structured fact extraction** (supporting English, Hindi, and Hinglish) with a **100% deterministic Python rule matching engine** backed by Supabase and a **fine-tuned IndicBERT classifier**.

---

## ⭐ Key Uniqueness & Innovation ("Not a GPT Wrapper")

Unlike traditional LLM legal tools that ask an AI model to guess legal outcomes or write legal advice directly, LegalAId implements a strict separation of concerns:

1. **Zero Legal Hallucinations (100% Deterministic Engine):**
   - LLMs are **only** used in two narrow, bounded roles: (a) parsing unstructured complaints into JSON fact key-value pairs, and (b) rephrasing an already-matched, already-computed result into plain language at the very end.
   - All legal section matching, scoring, condition evaluations (`==`, `>`, `<`, `exists`, `in`), target-section selection, and question ordering are written in **pure Python & SQL**. The AI never computes legal scores, never decides which law applies, and never sees candidate sections it wasn't matched to.

2. **Native Code-Mixed Indic NLP Normalization:**
   - Built specifically for India's linguistic reality: handles Hinglish, Hindi, and English mid-sentence code-switching.
   - Normalizes vernacular amounts and temporal units automatically:
     - `"10 hazaar"` / `"10 हजार"` / `"10k"` $\rightarrow$ `10000`
     - `"2 mahine pehle"` / `"दो महीने"` $\rightarrow$ `2`
     - `"1 lakh"` / `"1 लाख"` $\rightarrow$ `100000`

3. **Dynamic Database-Driven Schema Generation:**
   - Pydantic and LLM extraction schemas are **never hardcoded**. They are dynamically generated at runtime from the live Supabase `fact_definitions` and `section_facts` metadata, scoped down to whatever `domain_id` the classifier picked. Adding a new legal section or fact requires **zero code changes** — only new rows in Supabase.

4. **Proactive Evidence & Confidence Flags:**
   - Beyond simple matching, the engine evaluates missing optional supporting facts and generates actionable **Confidence Warnings** (e.g., *"No proof of purchase makes the claim harder to establish. Bank/UPI statements can substitute."*).

5. **Closeness-Driven Question Targeting:**
   - The engine never asks a fixed questionnaire. After each user turn it re-scores every candidate section in the classified domain, locks onto whichever section is currently closest to a full match, and asks only for **that section's** missing required facts next — see [Dynamic Fact Collection & Target Selection](#-dynamic-fact-collection--target-section-selection) below.

---

## 🤖 Fine-Tuned IndicBERT Classifier Integration

To achieve sub-10ms domain classification across Indian languages while remaining resilient to low-connectivity edge environments, LegalAId integrates a fine-tuned **IndicBERT** transformer model in `app/classifier.py`:

```
User Complaint (Indic/Hinglish/EN)
                 │
                 ▼
     ┌───────────────────────────┐
     │ Fine-Tuned IndicBERT Model│ ──► Sub-10ms Domain Logits
     └───────────────────────────┘
                 │
   ┌─────────────┼─────────────┐
   ▼             ▼             ▼
[Consumer]    [Labor]      [Tenant]
```

### IndicBERT Specifications:
- **Base Model:** `ai4bharat/indic-bert` (multilingual ALBERT model trained on 12 major Indian languages).
- **Fine-Tuning Objective:** Sequence classification fine-tuned on custom Indian legal complaint datasets (Consumer disputes, Labor & Wage claims, Tenant/Rent control issues).
- **Inference Pipeline (`app/classifier.py`):**
  1. Local IndicBERT tokenizer & model weights check.
  2. Ultra-fast local tensor inference ($\le 10\text{ms}$).
  3. Keyword heuristic verification & LLM fallback (Groq / Gemini) if confidence logits fall below threshold ($< 0.85$).
- **Why classify before extracting:** the domain output (`consumer` / `labor` / `tenant`) scopes which `sections` (and therefore which `fact_definitions`) the extraction schema and matcher even consider — a tenant complaint never gets asked labor-law questions, and the extraction schema stays small instead of covering all 41 facts on every turn.

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
           │  domain_id (consumer/labor/tenant)
           ▼
 ┌───────────────────┐
 │  Fact Extraction  │ ──► Groq (Llama-3.3-70b) + Dynamic Pydantic Schema
 │                   │     (schema built from cached fact_definitions,
 │                   │      scoped to this domain's sections only)
 └───────────────────┘
           │  extracted_facts (merged into session_facts)
           ▼
 ┌───────────────────┐
 │   Fact Matcher    │ ──► Deterministic Weighted Closeness Scoring (0.0 – 1.0)
 │                   │     scores EVERY section in the domain, every turn
 └───────────────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
 (no section        (a section reaches
  at 1.0 yet)         Score = 1.0)
     │           │
     ▼           ▼
┌──────────┐   ┌─────────────────────────────────────────┐
│ Question │   │  Matched Section + Applicable Laws       │
│ Engine   │   │  + Confidence Warnings/Flags             │
│(targets  │   └───────────────────┬───────────────────────┘
│ closest  │                       │
│ section) │                       ▼
└────┬─────┘         ┌───────────────────────────────┐
     │                │  Rights Explanation Module    │
     │ next question  │  (LLM rephrases the matched   │
     ▼                │   section + facts into plain  │
back to user           │   language — bounded context, │
                       │   no new facts/laws invented)  │
                       └───────────────┬───────────────┘
                                       ▼
                          Plain-language explanation
                          + PDF notice (Step 10)
```

---

## 🔁 Dynamic Fact Collection & Target-Section Selection

This is the core loop that runs on every user turn, and it's the part that makes the engine "smart" without ever letting the LLM make a legal decision.

**1. Scope to the domain.**
Once the classifier returns a `domain_id`, only that domain's `sections` (and their `section_facts`/`fact_definitions`) are pulled from the in-memory cache — everything else is ignored for this session.

**2. Extract facts from the latest message.**
The extraction LLM is given a Pydantic schema built dynamically from the *union* of `fact_key`s across all sections in the domain (using each fact's `fact_type` and `synonyms` from `fact_definitions` to guide matching). Extracted values are type-checked against `fact_type` before being merged into `session_facts.extracted_facts` — a `"boolean"` fact that comes back as a string, for example, is rejected rather than silently stored.

**3. Score every candidate section.**
For each section $S$ in the domain, compute:

$$\text{Score}(S) = \frac{\sum_{f \in \text{Satisfied Required Facts}} \text{Weight}(f)}{\sum_{f \in \text{All Required Facts}} \text{Weight}(f)}$$

using whatever facts are known so far. "Satisfied" means the known value passes that fact's `condition_operator`/`condition_value` check.

**4. Pick the target section.**
- If exactly one section reaches `Score = 1.0` → that's the match, skip to Step 6.
- If the top two scores are within `AMBIGUITY_DELTA` (0.15) of each other → don't commit to a target yet. Instead, ask about a fact that **discriminates** between the tied candidates (a required fact for one but not the other, or one where they'd need opposite values) rather than just the next fact in `ask_order`. This avoids wasting a question on something that doesn't actually narrow things down.
- Otherwise → the single highest-scoring section becomes the current target.

**5. Ask for the target's missing facts.**
The Question Engine filters the target section's `section_facts` to `required = true AND fact_key not in known_facts`, sorted by `ask_order` (which is itself pre-sorted: gating facts → confidence-flag facts → informational facts — see the seed data). It asks the highest-priority missing question, in the user's language, using `question_text_en`/`question_text_hi`. Loop back to Step 2 with the user's answer.

**6. On full match.**
Once a section hits `Score = 1.0`, gather:
- The matched `section` row (`issue`, `notes`)
- Its `applicable_law_sections` rows (act, section number, summary, source URL)
- Any unresolved *optional* facts that have an associated confidence flag → these become `confidence_flags` in the output, not blockers
- The full `extracted_facts` for this session

This bundle — **not raw user text, not the full rule database** — is the only thing passed to the Rights Explanation Module.

**7. Rights Explanation Module (LLM, bounded).**
A second, narrowly-scoped LLM call takes exactly the Step 6 bundle and rewrites it as a plain-language explanation for the user (in their language). The prompt explicitly restricts the model to the facts and law text it was given — it cannot introduce a different law, a different section, or an outcome the deterministic engine didn't already compute. This is the same "LLM as translator, not decision-maker" boundary used in extraction.

**Why re-score every turn instead of committing to one target permanently:** a user's second or third message can reveal a fact that makes a *different* section a better fit than the one you were originally chasing (e.g. they mention `termination_was_disciplinary_action = true`, which kills `labor_wrongful_termination` but their situation actually now scores higher on a different labor section). Re-scoring on every turn — cheap, since it's pure in-memory Python over already-cached rules — keeps the target honest instead of tunnel-visioning on the first guess.

---

## 📁 Repository Structure

```
backend/
├── app/
│   ├── __init__.py           # Package marker
│   ├── supabase_client.py    # Supabase client singleton & fast in-memory table caching
│   ├── schema_builder.py     # Converts Supabase fact definitions into dynamic Pydantic & LLM schemas
│   ├── extraction.py         # Schema-enforced fact extraction (Groq Llama-3.3-70b / Gemini)
│   ├── fact_matcher.py       # Pure Python deterministic scoring engine (0 LLM overhead)
│   ├── question_engine.py    # Target-section selection + next-question logic (closeness + discrimination)
│   ├── explanation.py        # Bounded LLM call: matched section + facts → plain-language output
│   ├── classifier.py         # Fine-tuned IndicBERT & heuristic domain classifier
│   ├── session_store.py      # In-memory session state management & fact accumulation
│   └── conversation.py       # End-to-end multi-turn orchestrator
├── data/
│   ├── __init__.py            # Package marker
│   ├── section_rules.json     # Source seed configuration rules
│   ├── supabase_seed_data.json # Standardized database seed JSON (domains, sections, applicable_law_sections, fact_definitions, section_facts)
│   └── seed_supabase.py       # Automated, idempotent Supabase database seeder
├── scripts/
│   ├── test_connection.py    # Supabase connection test script
│   └── test_gemini.py        # Gemini API verification script
├── .env                      # Local environment secrets (DO NOT COMMIT)
├── .env.example               # Environment variable template
├── requirements.txt          # Core Python dependencies
├── test_extraction.py        # Fact extraction test suite
├── test_matcher.py           # Matcher & Question Engine test suite
├── test_conversation.py      # End-to-end multi-turn conversation test suite
└── README.md                 # Project documentation
```

---

## 🗄️ Database Schema (Supabase)

The backend operates on 5 relational tables — `sections` map to `domains` via `domain_id`, and `section_facts` maps facts to sections via `section_id` + `fact_key`:

| Table | Description | Primary Key / Unique |
| :--- | :--- | :--- |
| `domains` | Core legal domains (`consumer`, `labor`, `tenant`). | `id` |
| `sections` | Statutory sections / legal issue categories, each belonging to one domain. | `id` (FK `domain_id`) |
| `applicable_law_sections` | Exact Indian Acts, section numbers, summaries, and legal source URLs, per section. | `id` (FK `section_id`) |
| `fact_definitions` | Master dictionary of legal facts: `fact_key`, `fact_type` (`boolean`/`number`/`string`/`date`/`enum`), `synonyms[]`, and default questions (EN/HI). Shared across sections that use the same fact. | `fact_key` |
| `section_facts` | Mapping of which facts are required per section, `condition_operator`/`condition_value`, `weight` (1–3), and `ask_order`. | `(section_id, fact_key)` |

**Current seed status:** all 5 tables are populated — 3 domains, 11 sections, 16 law citations, 41 facts (each with weight, bilingual question text, and synonyms filled in), 42 section-fact mappings.

---

## ⚖️ Matching Engine Logic & Scoring Formula

For any candidate section $S$, the closeness score is calculated deterministically:

$$\text{Score}(S) = \frac{\sum_{f \in \text{Satisfied Required Facts}} \text{Weight}(f)}{\sum_{f \in \text{All Required Facts}} \text{Weight}(f)}$$

- **Full Match:** $\text{Score}(S) = 1.0$ (Status: `matched`).
- **Need More Facts:** $0.0 < \text{Score}(S) < 1.0$ (Status: `need_more_facts`). The Question Engine isolates missing required facts for the highest-scoring section and generates the next question (see [Dynamic Fact Collection](#-dynamic-fact-collection--target-section-selection)).
- **Ambiguity Flag:** Triggered when the top 2 candidate section scores differ by $\le 0.15$ (`AMBIGUITY_DELTA`) — the engine asks a discriminating question instead of committing to a target.

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

**Mid-conversation (`need_more_facts`) example**, showing the target-section-locked question:

```json
{
  "status": "need_more_facts",
  "session_id": "session_123",
  "domain_id": "tenant",
  "target_section": {
    "id": "tenant_deposit_withheld",
    "current_score": 0.6
  },
  "next_question": {
    "fact_key": "days_since_vacate",
    "text_en": "How many days has it been since you vacated the property?",
    "text_hi": "संपत्ति खाली किए हुए कितने दिन हो गए हैं?"
  },
  "candidates_considered": [
    {"section_id": "tenant_deposit_withheld", "score": 0.6},
    {"section_id": "tenant_no_rent_receipt", "score": 0.2}
  ]
}
```

---

## 💡 Suggestions & Design Recommendations

A few things worth deciding now, before Step 5 implementation, since they're cheap to build in from the start and expensive to retrofit:

1. **Don't lock the target section permanently.** As described above, re-score all candidates every turn rather than committing once — otherwise a later fact that would've pointed to a better-fitting section gets ignored because the engine already "chose."

2. **Discriminating questions during ambiguity, not just next-in-`ask_order`.** When two sections are within `AMBIGUITY_DELTA`, pick the next question by *information gain* (a fact that's required by one candidate but not the other, or where the two candidates need opposite condition values) rather than blindly following `ask_order`. Otherwise you can burn several turns asking things both candidates already agree on.

3. **Validate extracted values against `fact_type` before merging.** The extraction LLM will occasionally return `"yes"` instead of `true`, or a string where a number was expected. Type-check against `fact_definitions.fact_type` at the merge step, not the scoring step — a bad value should never quietly zero out a real match.

4. **Cap the number of questions per session.** If no section reaches `Score = 1.0` after some threshold (e.g. all required facts across the top candidate are known but the section still doesn't qualify), the conversation should end in a "doesn't clearly match any tracked section — here's general guidance" state rather than looping forever. Worth deciding that threshold now.

5. **Keep the Rights Explanation Module's context minimal and closed.** Pass it only the matched section, its law citations, and the relevant extracted facts — not the full rule database, not the raw conversation history, not other candidate sections. This is what keeps Step 9 from becoming the one place hallucination risk creeps back in.

6. **Log every match decision, not just the final one.** For a legal tool, being able to show *why* a section was (or wasn't) matched — which facts were satisfied, which weights applied, what the scores were for every candidate, not just the winner — matters both for debugging and for user trust ("why did you conclude this?").

7. **Session facts should be additive, not overwritten blindly.** If a user contradicts an earlier answer (e.g. first says `still_employed: true`, later says `still_employed: false`), decide explicitly whether the newer value wins outright or whether the engine should flag the contradiction back to the user — silent overwrite can produce a confidently wrong match.

8. **Cache invalidation for the Step 4 loader.** Since `section_facts`/`fact_definitions` are the source of truth and you'll keep editing weights/questions/synonyms in Supabase as you tune the system, the cache loader needs an explicit refresh path (a manual endpoint or a startup-only load is fine for the hackathon, but note it as a known limitation rather than a silent gap).
