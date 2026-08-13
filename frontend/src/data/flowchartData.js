/**
 * flowchartData.js
 * Node and edge definitions for the LegalAId architecture flowchart.
 * Built from README (1).md pipeline documentation.
 */

// ─── Node Positions (manually laid out for clean vertical flow) ───
const X_CENTER = 400;
const X_LEFT = 100;
const X_RIGHT = 700;

export const initialNodes = [
  // ── 1. User Input ──
  {
    id: 'user-input',
    type: 'inputNode',
    position: { x: X_CENTER, y: 0 },
    data: {
      label: 'User Complaint',
      subtitle: 'English · Hindi · Hinglish',
      icon: 'MessageSquare',
    },
  },

  // ── 2. Indic NLP Normalization ──
  {
    id: 'nlp-normalize',
    type: 'processNode',
    position: { x: X_CENTER, y: 120 },
    data: {
      label: 'Indic NLP Normalization',
      subtitle: 'Code-mixed parsing · "10 hazaar" → 10000',
      icon: 'Languages',
    },
  },

  // ── 3. IndicBERT Classifier (HIGHLIGHTED) ──
  {
    id: 'indicbert',
    type: 'highlightNode',
    position: { x: X_CENTER, y: 260 },
    data: {
      label: 'Fine-Tuned IndicBERT',
      subtitle: 'Domain Classifier · Sub-10ms · Offline-Capable',
      icon: 'Brain',
      badge: '🔬 Fine-Tuned Model',
      badgeDescription: 'Custom fine-tuned on Indian legal datasets — not a generic pretrained model',
      highlightColor: 'indicbert',
    },
  },

  // ── 4. Domain Output ──
  {
    id: 'domain-output',
    type: 'domainNode',
    position: { x: X_CENTER, y: 420 },
    data: {
      label: 'Domain Classification',
      domains: ['Consumer', 'Labor', 'Tenant'],
      icon: 'GitBranch',
    },
  },

  // ── 5. Dynamic Schema Builder ──
  {
    id: 'schema-builder',
    type: 'processNode',
    position: { x: X_CENTER, y: 560 },
    data: {
      label: 'Dynamic Schema Builder',
      subtitle: 'Pydantic models built from Supabase at runtime — zero hardcoded schemas',
      icon: 'Database',
    },
  },

  // ── 6. Fact Extraction ──
  {
    id: 'fact-extraction',
    type: 'processNode',
    position: { x: X_CENTER, y: 690 },
    data: {
      label: 'LLM Fact Extraction',
      subtitle: 'Groq Llama-3.3-70b · Schema-enforced · Type-checked',
      icon: 'FileSearch',
    },
  },

  // ── 7. Deterministic Matcher (HIGHLIGHTED) ──
  {
    id: 'deterministic-matcher',
    type: 'highlightNode',
    position: { x: X_CENTER, y: 840 },
    data: {
      label: 'Deterministic Fact Matcher',
      subtitle: 'Pure Python & SQL · Weighted Closeness Scoring (0.0–1.0)',
      icon: 'Shield',
      badge: '🛡️ Not a ChatGPT Wrapper',
      badgeDescription: 'Zero LLM involvement — 100% deterministic, zero hallucinations possible',
      highlightColor: 'deterministic',
    },
  },

  // ── 8. Decision: Score Check ──
  {
    id: 'score-check',
    type: 'decisionNode',
    position: { x: X_CENTER, y: 1010 },
    data: {
      label: 'Score = 1.0?',
      icon: 'HelpCircle',
    },
  },

  // ── 9a. Question Engine (left branch) ──
  {
    id: 'question-engine',
    type: 'processNode',
    position: { x: X_LEFT, y: 1170 },
    data: {
      label: 'Question Engine',
      subtitle: 'Targets closest section · Asks discriminating questions',
      icon: 'HelpCircle',
    },
  },

  // ── 9b. Matched Section (right branch) ──
  {
    id: 'matched-section',
    type: 'processNode',
    position: { x: X_RIGHT, y: 1170 },
    data: {
      label: 'Matched Section',
      subtitle: 'Applicable Laws + Confidence Flags',
      icon: 'CheckCircle2',
    },
  },

  // ── 10. Loop back label ──
  {
    id: 'loop-back',
    type: 'loopNode',
    position: { x: X_LEFT, y: 1320 },
    data: {
      label: 'Ask User → Loop Back',
      icon: 'RotateCcw',
    },
  },

  // ── 11. Rights Explanation ──
  {
    id: 'rights-explanation',
    type: 'processNode',
    position: { x: X_RIGHT, y: 1320 },
    data: {
      label: 'Rights Explanation Module',
      subtitle: 'LLM rephrases matched result — bounded context, no new facts invented',
      icon: 'BookOpen',
    },
  },

  // ── 12. Final Output ──
  {
    id: 'final-output',
    type: 'outputNode',
    position: { x: X_RIGHT, y: 1470 },
    data: {
      label: 'Plain-Language Explanation',
      subtitle: '+ Downloadable PDF Legal Notice',
      icon: 'FileText',
    },
  },
];

// ─── Edges ───
export const initialEdges = [
  {
    id: 'e-user-nlp',
    source: 'user-input',
    target: 'nlp-normalize',
    animated: true,
    type: 'smoothstep',
    style: { stroke: '#C9A227', strokeWidth: 2 },
  },
  {
    id: 'e-nlp-indicbert',
    source: 'nlp-normalize',
    target: 'indicbert',
    animated: true,
    type: 'smoothstep',
    style: { stroke: '#C9A227', strokeWidth: 2.5 },
  },
  {
    id: 'e-indicbert-domain',
    source: 'indicbert',
    target: 'domain-output',
    animated: true,
    type: 'smoothstep',
    label: 'domain_id',
    labelStyle: { fill: '#1B2A4A', fontWeight: 600, fontSize: 11, fontFamily: 'Inter' },
    labelBgStyle: { fill: '#F5F1E8', fillOpacity: 0.9 },
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 4,
    style: { stroke: '#C9A227', strokeWidth: 2.5 },
  },
  {
    id: 'e-domain-schema',
    source: 'domain-output',
    target: 'schema-builder',
    animated: true,
    type: 'smoothstep',
    style: { stroke: '#C9A227', strokeWidth: 2 },
  },
  {
    id: 'e-schema-extract',
    source: 'schema-builder',
    target: 'fact-extraction',
    animated: true,
    type: 'smoothstep',
    style: { stroke: '#C9A227', strokeWidth: 2 },
  },
  {
    id: 'e-extract-matcher',
    source: 'fact-extraction',
    target: 'deterministic-matcher',
    animated: true,
    type: 'smoothstep',
    label: 'extracted_facts',
    labelStyle: { fill: '#1B2A4A', fontWeight: 600, fontSize: 11, fontFamily: 'Inter' },
    labelBgStyle: { fill: '#F5F1E8', fillOpacity: 0.9 },
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 4,
    style: { stroke: '#C9A227', strokeWidth: 2.5 },
  },
  {
    id: 'e-matcher-score',
    source: 'deterministic-matcher',
    target: 'score-check',
    animated: true,
    type: 'smoothstep',
    style: { stroke: '#C9A227', strokeWidth: 2 },
  },
  {
    id: 'e-score-question',
    source: 'score-check',
    target: 'question-engine',
    type: 'smoothstep',
    label: 'No — Need More Facts',
    labelStyle: { fill: '#C9A227', fontWeight: 700, fontSize: 11, fontFamily: 'Inter' },
    labelBgStyle: { fill: '#1B2A4A', fillOpacity: 0.95 },
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 6,
    style: { stroke: '#3A4F6E', strokeWidth: 2, strokeDasharray: '6 3' },
  },
  {
    id: 'e-score-matched',
    source: 'score-check',
    target: 'matched-section',
    type: 'smoothstep',
    animated: true,
    label: 'Yes — Full Match',
    labelStyle: { fill: '#1B2A4A', fontWeight: 700, fontSize: 11, fontFamily: 'Inter' },
    labelBgStyle: { fill: '#C9A227', fillOpacity: 0.2 },
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 6,
    style: { stroke: '#C9A227', strokeWidth: 2.5 },
  },
  {
    id: 'e-question-loop',
    source: 'question-engine',
    target: 'loop-back',
    type: 'smoothstep',
    style: { stroke: '#3A4F6E', strokeWidth: 2, strokeDasharray: '6 3' },
  },
  {
    id: 'e-loop-extract',
    source: 'loop-back',
    target: 'fact-extraction',
    type: 'smoothstep',
    label: 'user answers',
    labelStyle: { fill: '#3A4F6E', fontWeight: 500, fontSize: 10, fontFamily: 'Inter' },
    labelBgStyle: { fill: '#FAF7F0', fillOpacity: 0.9 },
    labelBgPadding: [6, 3],
    labelBgBorderRadius: 4,
    style: { stroke: '#3A4F6E', strokeWidth: 1.5, strokeDasharray: '6 3' },
  },
  {
    id: 'e-matched-rights',
    source: 'matched-section',
    target: 'rights-explanation',
    animated: true,
    type: 'smoothstep',
    style: { stroke: '#C9A227', strokeWidth: 2 },
  },
  {
    id: 'e-rights-output',
    source: 'rights-explanation',
    target: 'final-output',
    animated: true,
    type: 'smoothstep',
    style: { stroke: '#C9A227', strokeWidth: 2.5 },
  },
];
