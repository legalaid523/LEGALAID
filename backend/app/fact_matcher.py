# app/fact_matcher.py
"""
Deterministic Fact-Section Matching Engine.

Given a set of extracted user facts and a classified domain, this module:
  1. Scores every candidate section in that domain by weighted closeness.
  2. Ranks sections by score.
  3. Identifies which required facts are still missing per section.
  4. Detects ambiguity when top candidates are close.

NO LLM involvement — pure Python operating on the cached Supabase data.
This is the core "not a GPT wrapper" component.
"""
from dataclasses import dataclass, field
from typing import Any

from app.supabase_client import get_cache


# --- Config ---
FULL_MATCH_THRESHOLD = 1.0      # score at which a section is fully satisfied
AMBIGUITY_DELTA = 0.15          # if 2 sections are within this, ambiguity flag on
MIN_SCORE_TO_CONSIDER = 0.0     # sections below this are ignored (0 = consider all)


@dataclass
class SectionScore:
    """Score + gap analysis for one candidate section."""
    section_id: str
    section: dict                          # the full sections row
    score: float                           # 0.0 to 1.0
    satisfied_weight: float
    total_weight: float
    missing_required: list[dict] = field(default_factory=list)
    satisfied_facts: list[dict] = field(default_factory=list)
    failed_required: list[dict] = field(default_factory=list)


@dataclass
class MatchResult:
    """Output of the matching engine for one call."""
    status: str                            # 'matched' | 'need_more_facts' | 'no_match'
    ranked_sections: list[SectionScore]    # all sections, sorted by score desc
    matched_sections: list[SectionScore]   # sections whose score >= FULL_MATCH_THRESHOLD
    target_section: SectionScore | None    # the section we're currently focused on
    ambiguous: bool                        # true if top candidates are close
    ambiguous_candidates: list[SectionScore] = field(default_factory=list)


# ---------- Condition evaluation ----------

def _satisfies_condition(user_value: Any, operator: str, condition_value: Any) -> bool:
    """
    Check if a user-provided fact value satisfies a section_facts condition.

    operators: '==', '!=', '>', '>=', '<', '<=', 'exists', 'in'
    """
    if user_value is None:
        return False

    try:
        if operator == "exists":
            return True   # any non-None value counts

        if operator == "==":
            return user_value == condition_value

        if operator == "!=":
            return user_value != condition_value

        if operator == ">":
            return float(user_value) > float(condition_value)

        if operator == ">=":
            return float(user_value) >= float(condition_value)

        if operator == "<":
            return float(user_value) < float(condition_value)

        if operator == "<=":
            return float(user_value) <= float(condition_value)

        if operator == "in":
            # condition_value should be a list
            if isinstance(condition_value, list):
                return user_value in condition_value
            return False

        # Unknown operator → fail closed
        return False

    except (TypeError, ValueError):
        return False


# ---------- Core scoring ----------

def score_section(section: dict, section_facts: list[dict], extracted_facts: dict) -> SectionScore:
    """
    Compute a closeness score for one section.

    score = sum(weights of satisfied required facts) / sum(weights of all required facts)
    """
    total_weight = 0.0
    satisfied_weight = 0.0
    missing_required = []
    satisfied = []
    failed_required = []

    for sf in section_facts:
        if not sf.get("required", True):
            continue   # skip optional facts for scoring

        weight = float(sf.get("weight", 1))
        total_weight += weight

        fact_key = sf["fact_key"]

        # If the fact has not been extracted yet, it belongs in missing_required (to be asked)
        if fact_key not in extracted_facts or extracted_facts.get(fact_key) is None:
            missing_required.append(sf)
        else:
            user_value = extracted_facts.get(fact_key)
            if _satisfies_condition(user_value, sf["condition_operator"], sf.get("condition_value")):
                satisfied_weight += weight
                satisfied.append(sf)
            else:
                # Answered by user, but failed condition -> NEVER ask again
                failed_required.append(sf)

    score = satisfied_weight / total_weight if total_weight > 0 else 0.0

    return SectionScore(
        section_id=section["id"],
        section=section,
        score=score,
        satisfied_weight=satisfied_weight,
        total_weight=total_weight,
        missing_required=missing_required,
        satisfied_facts=satisfied,
        failed_required=failed_required,
    )


def match_sections(domain_id: str, extracted_facts: dict) -> MatchResult:
    """
    Main entry point. Given a domain + extracted facts, return a ranked
    list of candidate sections and identify the current target.
    """
    cache = get_cache()

    # 1. Get all sections in this domain
    domain_sections = [s for s in cache["sections"] if s["domain_id"] == domain_id]

    if not domain_sections:
        return MatchResult(
            status="no_match",
            ranked_sections=[],
            matched_sections=[],
            target_section=None,
            ambiguous=False,
        )

    # 2. Group section_facts by section_id for quick lookup
    facts_by_section: dict[str, list[dict]] = {}
    for sf in cache["section_facts"]:
        facts_by_section.setdefault(sf["section_id"], []).append(sf)

    # 3. Score each section
    scored: list[SectionScore] = []
    for section in domain_sections:
        section_facts = facts_by_section.get(section["id"], [])
        if not section_facts:
            continue   # section has no fact requirements → skip
        scored.append(score_section(section, section_facts, extracted_facts))

    # 4. Sort by score descending (sections without failures preferred)
    scored.sort(key=lambda s: (len(s.failed_required) == 0, s.score), reverse=True)

    # 5. Identify fully-matched sections
    matched = [s for s in scored if s.score >= FULL_MATCH_THRESHOLD and not s.failed_required]

    # 6. Determine status + target
    if matched:
        return MatchResult(
            status="matched",
            ranked_sections=scored,
            matched_sections=matched,
            target_section=matched[0],
            ambiguous=len(matched) > 1,
            ambiguous_candidates=matched if len(matched) > 1 else [],
        )

    # Find viable sections that have unasked questions
    viable = [s for s in scored if s.missing_required and not s.failed_required]
    if not viable:
        viable = [s for s in scored if s.missing_required]

    if not viable:
        return MatchResult(
            status="no_match",
            ranked_sections=scored,
            matched_sections=[],
            target_section=None,
            ambiguous=False,
        )

    # 7. Not fully matched yet → detect ambiguity among top candidates
    top = viable[0]
    close_candidates = [s for s in viable if (top.score - s.score) <= AMBIGUITY_DELTA]

    return MatchResult(
        status="need_more_facts",
        ranked_sections=scored,
        matched_sections=[],
        target_section=top,
        ambiguous=len(close_candidates) > 1,
        ambiguous_candidates=close_candidates if len(close_candidates) > 1 else [],
    )
