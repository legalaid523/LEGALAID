# LegalAId

An AI assistant that lets first-generation litigants in India describe a legal
problem in plain Hindi/English and receive a plain-language rights
explanation, applicable law sections, and a downloadable draft legal
notice/complaint.

Hackathon submission — Problem Statement PS-04 (AI + NLP + Civic Tech).

## Status
Project scaffold only. No functionality implemented yet.
See `docs/architecture.md` and `PROJECT_CONTEXT.md` for full design details.

## Structure
- `backend/` — FastAPI service (classification, extraction, section mapping,
  explanation, document generation)
- `frontend/` — React chat UI
- `docs/` — architecture notes and legal source citations

## Setup
See project setup commands in the accompanying instructions.


## Phase1
Workflow: how it worked
section_rules.json must be valid JSON and structured as a list of rule entries.
The test file uses Python unittest to open and parse that JSON.
The test asserts the rule data matches expected values.

Running:
python -m unittest backend.tests.test_section_mapper
The test passed, which means:
JSON was parseable
the file contained the expected rule entry
field names and values matched the test assertions
Key point
The test checks the data file itself, not application logic.
It ensures section_rules.json is correctly shaped and contains the expected tenant rule.