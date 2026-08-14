# app/schema_builder.py
"""
Builds a Pydantic model + Gemini-compatible JSON schema for a given domain,
dynamically from the fact_definitions and section_facts loaded in the cache.
"""
from typing import Optional, Any
from pydantic import BaseModel, Field, create_model


# Map fact_type strings (as stored in Supabase) → Python types
FACT_TYPE_MAP = {
    "boolean": bool,
    "number": float,
    "string": str,
    "date": str,   # keep as ISO string; parse downstream if you need datetime
    "enum": str,
}


def build_pydantic_model_for_domain(domain_id: str, cache: dict) -> type[BaseModel]:
    """
    Build a Pydantic model containing every fact_key used by any section
    in the given domain. All fields are Optional so Gemini can leave them null.
    """
    # 1. Find all sections in this domain
    sections_in_domain = [s for s in cache["sections"] if s["domain_id"] == domain_id]
    section_ids = {s["id"] for s in sections_in_domain}

    if not section_ids:
        raise ValueError(f"No sections found for domain_id='{domain_id}'")

    # 2. Collect all fact_keys used by those sections
    fact_keys_in_domain = {
        sf["fact_key"]
        for sf in cache["section_facts"]
        if sf["section_id"] in section_ids
    }

    if not fact_keys_in_domain:
        raise ValueError(f"No section_facts found for domain_id='{domain_id}'")

    # 3. Index fact_definitions by fact_key for quick lookup
    fact_defs_by_key = {fd["fact_key"]: fd for fd in cache["fact_definitions"]}

    # 4. Build Pydantic field definitions
    fields: dict[str, Any] = {}
    for fact_key in sorted(fact_keys_in_domain):   # sorted for deterministic output
        fd = fact_defs_by_key.get(fact_key)
        if not fd:
            # section_facts references a fact_key with no fact_definitions row
            print(f"⚠️  Warning: fact_key '{fact_key}' has no fact_definitions row; skipping.")
            continue

        py_type = FACT_TYPE_MAP.get(fd["fact_type"], str)
        description = fd.get("label") or fact_key
        if fd.get("synonyms"):
            description += f" (also called: {', '.join(fd['synonyms'])})"

        fields[fact_key] = (Optional[py_type], Field(default=None, description=description))

    model_name = f"{domain_id.capitalize()}Facts"
    return create_model(model_name, **fields)


def pydantic_to_gemini_schema(model_class: type[BaseModel]) -> dict:
    """
    Convert a dynamically-built Pydantic model to a Gemini-compatible
    response_schema. Gemini rejects some JSON schema fields, so we strip them.
    """
    schema = model_class.model_json_schema()
    return _clean_schema_for_gemini(schema)


def _clean_schema_for_gemini(schema: Any) -> Any:
    """
    Strip JSON schema keys Gemini doesn't accept, and flatten Optional[X]
    (which Pydantic emits as anyOf: [X, null]) down to plain {"type": X}.
    """
    unsupported_keys = {"title", "$defs", "definitions", "additionalProperties", "default"}

    if isinstance(schema, dict):
        cleaned = {}
        for k, v in schema.items():
            if k in unsupported_keys:
                continue
            cleaned[k] = _clean_schema_for_gemini(v)

        # Handle Optional[X] → flatten anyOf: [X, null] to just X
        if "anyOf" in cleaned:
            non_null_types = [t for t in cleaned["anyOf"] if t.get("type") != "null"]
            if non_null_types:
                base = non_null_types[0]
                # Preserve description if it was on the parent
                if "description" in cleaned:
                    base["description"] = cleaned["description"]
                return base

        return cleaned

    if isinstance(schema, list):
        return [_clean_schema_for_gemini(item) for item in schema]

    return schema