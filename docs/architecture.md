{
  "id": "domain_issue_name",
  "domain": "consumer | labor | tenant",
  "issue": "short human-readable issue name",
  "fact_schema": {
    "field_name": "string | number | boolean | date"
  },
  "conditions": {
    "field_name": { "operator": "eq | gt | lt | exists", "value": "..." }
  },
  "applicable_sections": [
    {
      "act": "Act name, year",
      "section": "Section number",
      "text_summary": "1-2 sentence plain summary of what the section says",
      "source_url": "primary source link"
    }
  ],
  "confidence_flags": {
    "field_name": "warning message shown if this fact is missing"
  },
  "notes": "optional caveats (e.g. state-adoption for tenant entries)"
}