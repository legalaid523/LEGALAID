import json
from pathlib import Path
import unittest


class TestSectionRules(unittest.TestCase):
    def test_tenant_deposit_withheld_rule(self):
        rule_file = Path(__file__).resolve().parents[1] / "app" / "data" / "section_rules.json"
        with rule_file.open("r", encoding="utf-8") as f:
            rules = json.load(f)

        self.assertEqual(len(rules), 1, "Expected exactly one rule in section_rules.json")
        rule = rules[0]

        self.assertEqual(rule["id"], "tenant_tenant_deposit_withheld")
        self.assertEqual(rule["domain"], "tenant")
        self.assertIn("deposit_paid", rule["fact_schema"])
        self.assertIn("premises_vacated", rule["fact_schema"])
        self.assertIn("deposit_returned", rule["fact_schema"])

        self.assertEqual(rule["conditions"]["deposit_paid"]["operator"], "gt")
        self.assertEqual(rule["conditions"]["deposit_paid"]["value"], "0")
        self.assertEqual(rule["conditions"]["premises_vacated"]["operator"], "eq")
        self.assertEqual(rule["conditions"]["premises_vacated"]["value"], "true")
        self.assertEqual(rule["conditions"]["deposit_returned"]["operator"], "eq")
        self.assertEqual(rule["conditions"]["deposit_returned"]["value"], "false")

        section = rule["applicable_sections"][0]
        self.assertEqual(section["section"], "Section 11")
        self.assertIn("indiankanoon.org", section["source_url"])

        self.assertIn("Tamil Nadu", rule["notes"])
        self.assertIn("State tenancy/rent law", rule["notes"])


if __name__ == "__main__":
    unittest.main()
