import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  MessageSquare, Languages, Brain, GitBranch, Database, FileSearch,
  Shield, HelpCircle, CheckCircle2, RotateCcw, BookOpen, FileText,
} from 'lucide-react';

/** Map string icon names to lucide components */
const ICON_MAP = {
  MessageSquare, Languages, Brain, GitBranch, Database, FileSearch,
  Shield, HelpCircle, CheckCircle2, RotateCcw, BookOpen, FileText,
};

const getIcon = (name, size = 20, className = '') => {
  const Icon = ICON_MAP[name];
  return Icon ? <Icon size={size} className={className} /> : null;
};

/* ═══════════════════════════════════════════════════════════════
   1. INPUT NODE — User complaint entry point
   ═══════════════════════════════════════════════════════════════ */
export const InputNode = memo(({ data }) => (
  <div className="flowchart-node flowchart-node--input">
    <div className="flowchart-node__icon-wrap flowchart-node__icon-wrap--input">
      {getIcon(data.icon, 22, 'text-navy-900')}
    </div>
    <div className="flowchart-node__content">
      <p className="flowchart-node__label">{data.label}</p>
      {data.subtitle && (
        <p className="flowchart-node__subtitle">{data.subtitle}</p>
      )}
    </div>
    <Handle type="source" position={Position.Bottom} className="flowchart-handle" />
  </div>
));
InputNode.displayName = 'InputNode';

/* ═══════════════════════════════════════════════════════════════
   2. PROCESS NODE — Standard pipeline step
   ═══════════════════════════════════════════════════════════════ */
export const ProcessNode = memo(({ data }) => (
  <div className="flowchart-node flowchart-node--process">
    <Handle type="target" position={Position.Top} className="flowchart-handle" />
    <div className="flowchart-node__icon-wrap flowchart-node__icon-wrap--process">
      {getIcon(data.icon, 18, 'text-gold-500')}
    </div>
    <div className="flowchart-node__content">
      <p className="flowchart-node__label flowchart-node__label--light">{data.label}</p>
      {data.subtitle && (
        <p className="flowchart-node__subtitle flowchart-node__subtitle--light">{data.subtitle}</p>
      )}
    </div>
    <Handle type="source" position={Position.Bottom} className="flowchart-handle" />
  </div>
));
ProcessNode.displayName = 'ProcessNode';

/* ═══════════════════════════════════════════════════════════════
   3. HIGHLIGHT NODE — ⭐ IndicBERT & Deterministic Matcher
   ═══════════════════════════════════════════════════════════════ */
export const HighlightNode = memo(({ data }) => {
  const isIndicbert = data.highlightColor === 'indicbert';
  return (
    <div className={`flowchart-node flowchart-node--highlight flowchart-node--highlight-${data.highlightColor}`}>
      <Handle type="target" position={Position.Top} className="flowchart-handle" />

      {/* Floating badge */}
      <div className={`flowchart-badge ${isIndicbert ? 'flowchart-badge--indicbert' : 'flowchart-badge--deterministic'}`}>
        <span className="flowchart-badge__text">{data.badge}</span>
      </div>

      <div className="flowchart-node__icon-wrap flowchart-node__icon-wrap--highlight">
        {getIcon(data.icon, 24, 'text-gold-500')}
      </div>
      <div className="flowchart-node__content">
        <p className="flowchart-node__label flowchart-node__label--highlight">{data.label}</p>
        {data.subtitle && (
          <p className="flowchart-node__subtitle flowchart-node__subtitle--highlight">{data.subtitle}</p>
        )}
        {data.badgeDescription && (
          <p className="flowchart-node__description">{data.badgeDescription}</p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="flowchart-handle" />
    </div>
  );
});
HighlightNode.displayName = 'HighlightNode';

/* ═══════════════════════════════════════════════════════════════
   4. DOMAIN NODE — Shows the 3 domain outputs
   ═══════════════════════════════════════════════════════════════ */
export const DomainNode = memo(({ data }) => (
  <div className="flowchart-node flowchart-node--domain">
    <Handle type="target" position={Position.Top} className="flowchart-handle" />
    <p className="flowchart-node__label flowchart-node__label--light" style={{ marginBottom: 8 }}>
      {data.label}
    </p>
    <div className="flowchart-domain-pills">
      {data.domains.map((d) => (
        <span key={d} className="flowchart-domain-pill">{d}</span>
      ))}
    </div>
    <Handle type="source" position={Position.Bottom} className="flowchart-handle" />
  </div>
));
DomainNode.displayName = 'DomainNode';

/* ═══════════════════════════════════════════════════════════════
   5. DECISION NODE — Diamond-styled score check
   ═══════════════════════════════════════════════════════════════ */
export const DecisionNode = memo(({ data }) => (
  <div className="flowchart-node flowchart-node--decision">
    <Handle type="target" position={Position.Top} className="flowchart-handle" />
    <div className="flowchart-decision-diamond">
      <span className="flowchart-decision-diamond__text">{data.label}</span>
    </div>
    <Handle type="source" position={Position.Bottom} className="flowchart-handle" />
    <Handle type="source" position={Position.Left} id="left" className="flowchart-handle" />
    <Handle type="source" position={Position.Right} id="right" className="flowchart-handle" />
  </div>
));
DecisionNode.displayName = 'DecisionNode';

/* ═══════════════════════════════════════════════════════════════
   6. LOOP NODE — Loop-back indicator
   ═══════════════════════════════════════════════════════════════ */
export const LoopNode = memo(({ data }) => (
  <div className="flowchart-node flowchart-node--loop">
    <Handle type="target" position={Position.Top} className="flowchart-handle" />
    <div className="flowchart-node__icon-wrap flowchart-node__icon-wrap--loop">
      {getIcon(data.icon, 18, 'text-gold-500')}
    </div>
    <p className="flowchart-node__label flowchart-node__label--loop">{data.label}</p>
    <Handle type="source" position={Position.Right} className="flowchart-handle" />
  </div>
));
LoopNode.displayName = 'LoopNode';

/* ═══════════════════════════════════════════════════════════════
   7. OUTPUT NODE — Final result
   ═══════════════════════════════════════════════════════════════ */
export const OutputNode = memo(({ data }) => (
  <div className="flowchart-node flowchart-node--output">
    <Handle type="target" position={Position.Top} className="flowchart-handle" />
    <div className="flowchart-node__icon-wrap flowchart-node__icon-wrap--output">
      {getIcon(data.icon, 22, 'text-navy-900')}
    </div>
    <div className="flowchart-node__content">
      <p className="flowchart-node__label">{data.label}</p>
      {data.subtitle && (
        <p className="flowchart-node__subtitle">{data.subtitle}</p>
      )}
    </div>
  </div>
));
OutputNode.displayName = 'OutputNode';

/* ═══════════════════════════════════════════════════════════════
   Export nodeTypes map for React Flow
   ═══════════════════════════════════════════════════════════════ */
export const nodeTypes = {
  inputNode: InputNode,
  processNode: ProcessNode,
  highlightNode: HighlightNode,
  domainNode: DomainNode,
  decisionNode: DecisionNode,
  loopNode: LoopNode,
  outputNode: OutputNode,
};
