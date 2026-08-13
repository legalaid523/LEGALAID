import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from '../components/FlowchartNodes';
import { initialNodes, initialEdges } from '../data/flowchartData';
import { Brain, Shield, Sparkles, ZoomIn, Move } from 'lucide-react';

/**
 * ArchitecturePage — Interactive flowchart showing LegalAId pipeline
 */
function ArchitectureFlowchart() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowRef = useRef(null);
  const [rfInstance, setRfInstance] = useState(null);
  const [showLegend, setShowLegend] = useState(true);

  /** Center the flowchart once it's loaded */
  const onInit = useCallback((instance) => {
    setRfInstance(instance);
    setTimeout(() => {
      instance.fitView({ padding: 0.12, duration: 800 });
    }, 200);
  }, []);

  /** Scroll to a highlighted node */
  const scrollToNode = useCallback(
    (nodeId) => {
      if (!rfInstance) return;
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      rfInstance.setCenter(node.position.x + 120, node.position.y + 60, {
        zoom: 1.15,
        duration: 800,
      });
    },
    [rfInstance, nodes]
  );

  return (
    <div className="architecture-page">
      {/* Hero Section */}
      <section className="architecture-hero">
        <div className="architecture-hero__content">
          <div className="architecture-hero__badge">
            <Sparkles size={14} />
            <span>System Architecture</span>
          </div>
          <h1 className="architecture-hero__title">How LegalAId Works</h1>
          <p className="architecture-hero__subtitle">
            A non-hallucinating hybrid AI architecture that combines fine-tuned transformer
            classification with deterministic rule matching — no legal decisions are ever made by an LLM.
          </p>

          {/* Quick-jump buttons */}
          <div className="architecture-hero__actions">
            <button
              type="button"
              onClick={() => scrollToNode('indicbert')}
              className="architecture-hero__btn architecture-hero__btn--indicbert"
            >
              <Brain size={18} />
              <span>Fine-Tuned IndicBERT</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToNode('deterministic-matcher')}
              className="architecture-hero__btn architecture-hero__btn--deterministic"
            >
              <Shield size={18} />
              <span>Not a ChatGPT Wrapper</span>
            </button>
          </div>
        </div>
      </section>

      {/* Flowchart Canvas */}
      <section className="architecture-canvas">
        {/* Interaction hint */}
        <div className="architecture-canvas__hint">
          <div className="architecture-canvas__hint-item">
            <Move size={14} />
            <span>Drag to pan</span>
          </div>
          <div className="architecture-canvas__hint-item">
            <ZoomIn size={14} />
            <span>Scroll to zoom</span>
          </div>
        </div>

        <ReactFlow
          ref={reactFlowRef}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onInit={onInit}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.12 }}
          minZoom={0.3}
          maxZoom={2}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
          className="architecture-flow"
        >
          <Background
            color="#C9A22720"
            gap={24}
            size={1.5}
            style={{ backgroundColor: '#FAF7F0' }}
          />
          <Controls
            showInteractive={false}
            className="architecture-controls"
          />
          <MiniMap
            nodeColor={(node) => {
              if (node.type === 'highlightNode') return '#C9A227';
              if (node.type === 'inputNode' || node.type === 'outputNode') return '#EFE9DE';
              if (node.type === 'decisionNode') return '#C9A227';
              return '#1B2A4A';
            }}
            maskColor="rgba(27, 42, 74, 0.15)"
            style={{
              backgroundColor: '#F5F1E8',
              border: '2px solid rgba(201, 162, 39, 0.3)',
              borderRadius: 12,
            }}
          />
        </ReactFlow>

        {/* Floating Legend */}
        {showLegend && (
          <div className="architecture-legend">
            <div className="architecture-legend__header">
              <h4 className="architecture-legend__title">Legend</h4>
              <button
                type="button"
                onClick={() => setShowLegend(false)}
                className="architecture-legend__close"
                aria-label="Close legend"
              >
                ×
              </button>
            </div>
            <div className="architecture-legend__items">
              <div className="architecture-legend__item">
                <span className="architecture-legend__dot architecture-legend__dot--highlight" />
                <span>Key Innovation (highlighted)</span>
              </div>
              <div className="architecture-legend__item">
                <span className="architecture-legend__dot architecture-legend__dot--process" />
                <span>Processing Step</span>
              </div>
              <div className="architecture-legend__item">
                <span className="architecture-legend__dot architecture-legend__dot--input" />
                <span>Input / Output</span>
              </div>
              <div className="architecture-legend__item">
                <span className="architecture-legend__dot architecture-legend__dot--decision" />
                <span>Decision Point</span>
              </div>
              <div className="architecture-legend__item">
                <span className="architecture-legend__line architecture-legend__line--solid" />
                <span>Main flow (animated)</span>
              </div>
              <div className="architecture-legend__item">
                <span className="architecture-legend__line architecture-legend__line--dashed" />
                <span>Loop / fallback path</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Innovation Cards */}
      <section className="architecture-cards">
        <div className="architecture-cards__grid">
          <div className="architecture-card architecture-card--indicbert">
            <div className="architecture-card__icon">
              <Brain size={28} />
            </div>
            <h3 className="architecture-card__title">Fine-Tuned IndicBERT Classifier</h3>
            <p className="architecture-card__text">
              We fine-tuned <strong>ai4bharat/indic-bert</strong> — a multilingual ALBERT model trained
              on 12 Indian languages — on custom Indian legal complaint datasets covering Consumer,
              Labor, and Tenant disputes.
            </p>
            <ul className="architecture-card__list">
              <li>Sub-10ms inference latency</li>
              <li>Works offline in low-connectivity environments</li>
              <li>Handles Hinglish, Hindi, and English code-switching natively</li>
              <li>Keyword heuristic + LLM fallback when confidence &lt; 85%</li>
            </ul>
          </div>

          <div className="architecture-card architecture-card--deterministic">
            <div className="architecture-card__icon">
              <Shield size={28} />
            </div>
            <h3 className="architecture-card__title">Not a ChatGPT Wrapper</h3>
            <p className="architecture-card__text">
              LLMs are used <strong>only</strong> for two narrow tasks: (1) extracting structured facts
              from unstructured text, and (2) rephrasing the final result into plain language. All legal
              matching is <strong>100% deterministic</strong>.
            </p>
            <ul className="architecture-card__list">
              <li>Pure Python & SQL scoring engine — zero LLM overhead</li>
              <li>Weighted closeness scoring formula (0.0–1.0)</li>
              <li>No hallucinated legal advice possible</li>
              <li>Every match decision is auditable and explainable</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Wrapped with ReactFlowProvider
 */
export default function ArchitecturePage() {
  return (
    <ReactFlowProvider>
      <ArchitectureFlowchart />
    </ReactFlowProvider>
  );
}
