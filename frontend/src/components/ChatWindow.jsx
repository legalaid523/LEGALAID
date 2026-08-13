import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Scale, Languages, Send, Mic, Cpu, CheckCircle2, ChevronDown, Code } from 'lucide-react';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';
import DomainBadge from './DomainBadge';
import { classifyDomain } from '../api/domainClassifier';

const LANGUAGES = ['English', 'Hindi', 'Hinglish'];

let messageId = 1;
const nextId = () => ++messageId;

/**
 * ChatWindow — Model Classification Performance & Accuracy Evaluation Interface
 */
export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [latestClassification, setLatestClassification] = useState(null);
  const [showJson, setShowJson] = useState(false);
  const messagesEndRef = useRef(null);
  const langMenuRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, latestClassification, scrollToBottom]);

  useEffect(() => {
    setMessages([
      {
        id: nextId(),
        text: `Welcome to **LegalAId Domain Classifier Test Bench**.\n\nEnter any legal case query or description to test the live model classification, accuracy, and confidence scores across legal domains (**tenant**, **labor**, **consumer**).`,
        isUser: false,
        timestamp: new Date(),
        showDisclaimer: true,
      },
    ]);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addBotMessage = (text, extra = {}) => {
    setMessages((prev) => [
      ...prev,
      { id: nextId(), text, isUser: false, timestamp: new Date(), ...extra },
    ]);
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      { id: nextId(), text, isUser: true, timestamp: new Date() },
    ]);
  };

  const submitMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    addUserMessage(trimmed);
    setInput('');
    setIsLoading(true);
    setLatestClassification(null);

    const startTime = performance.now();

    try {
      const responseData = await classifyDomain(trimmed, 3);
      const predictions = Array.isArray(responseData) ? responseData : [responseData];
      const latency = (performance.now() - startTime).toFixed(0);

      const topPred = predictions[0] || { domain: 'Unknown', confidence: 0 };
      setLatestClassification({
        predictions,
        topPred,
        latencyMs: latency,
        rawText: trimmed,
      });

      addBotMessage(
        `**Model Classification Result:**\n• **Predicted Domain:** \`${topPred.domain.toUpperCase()}\`\n• **Confidence Score:** \`${(topPred.confidence * 100).toFixed(2)}%\`\n• **Inference Latency:** \`${latency}ms\``
      );
    } catch (err) {
      addBotMessage(
        `❌ **Classification Error:** ${err.message || 'Could not connect to FastAPI server at http://localhost:8000'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => submitMessage(input);

  return (
    <div className="flex flex-col h-full bg-cream-50">
      {/* Language selector (floating) */}
      <div className="flex justify-end px-4 pt-2 pb-0 flex-shrink-0">
        <div className="relative" ref={langMenuRef}>
          <button
            type="button"
            onClick={() => setLangMenuOpen((o) => !o)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-navy-800 hover:text-gold-600 hover:bg-cream-200 transition-colors min-h-[40px] text-sm font-medium border border-navy-900/10"
            aria-haspopup="listbox"
            aria-expanded={langMenuOpen}
            aria-label="Change language"
          >
            <Languages size={18} aria-hidden />
            <span>{language}</span>
            <ChevronDown size={14} aria-hidden />
          </button>

          {langMenuOpen && (
            <ul
              role="listbox"
              className="absolute end-0 top-full mt-1 w-40 bg-cream-100 border border-gold-500/30 rounded-lg shadow-xl overflow-hidden z-20"
            >
              {LANGUAGES.map((lang) => (
                <li key={lang}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={language === lang}
                    onClick={() => {
                      setLanguage(lang);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-start px-4 py-3 text-sm min-h-[44px] transition-colors ${
                      language === lang
                        ? 'bg-gold-500/15 text-navy-900 font-semibold'
                        : 'text-navy-800 hover:bg-cream-200'
                    }`}
                  >
                    {lang}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Chat area */}
      <main className="flex-1 overflow-y-auto px-4 py-5">
        <div className="max-w-2xl mx-auto">
          {latestClassification && (
            <DomainBadge
              domain={latestClassification.topPred.domain}
              confidence={latestClassification.topPred.confidence}
            />
          )}

          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg.text}
              isUser={msg.isUser}
              timestamp={msg.timestamp}
              showDisclaimer={msg.showDisclaimer}
            />
          ))}

          {isLoading && (
            <LoadingIndicator variant="gavel" message="Evaluating Model Classification..." />
          )}

          {latestClassification && Array.isArray(latestClassification.predictions) && !isLoading && (
            <div className="bg-white border-2 border-gold-500/60 rounded-xl shadow-lg p-5 mb-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Cpu size={24} className="text-gold-600" />
                  <h3 className="font-serif text-lg font-bold text-navy-900">
                    Live Model Classification Performance
                  </h3>
                </div>
                <span className="text-xs bg-navy-900 text-gold-500 px-2.5 py-1 rounded-full font-mono">
                  {latestClassification.latencyMs} ms
                </span>
              </div>

              <div className="flex items-center justify-between bg-cream-100 p-3.5 rounded-lg border border-gold-500/30">
                <div>
                  <p className="text-xs text-navy-700 font-medium uppercase tracking-wider">Top Predicted Domain</p>
                  <p className="text-xl font-serif font-bold text-navy-900 capitalize mt-0.5">
                    {latestClassification.topPred.domain}
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-xs text-navy-700 font-medium uppercase tracking-wider">Confidence Score</p>
                  <p className="text-2xl font-bold text-gold-600 font-mono">
                    {(latestClassification.topPred.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-navy-800 uppercase tracking-wider mb-2">
                  Domain Probabilities Breakdown (Top-K)
                </p>
                <div className="space-y-2.5">
                  {latestClassification.predictions.map((pred, i) => {
                    const pct = (pred.confidence * 100).toFixed(1);
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm font-medium text-navy-900">
                          <span className="capitalize">{pred.domain}</span>
                          <span className="font-mono text-gold-700 font-bold">{pct}%</span>
                        </div>
                        <div className="w-full bg-cream-200 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gold-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(pct, 3)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-navy-900/10">
                <button
                  type="button"
                  onClick={() => setShowJson((s) => !s)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-navy-700 hover:text-gold-700 transition-colors"
                >
                  <Code size={14} />
                  <span>{showJson ? 'Hide Raw API JSON Response' : 'Show Raw API JSON Response'}</span>
                </button>

                {showJson && (
                  <pre className="mt-3 p-3 bg-navy-900 text-cream-100 text-xs font-mono rounded-lg overflow-x-auto">
                    {JSON.stringify(latestClassification.predictions, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input bar */}
      <footer className="bg-cream-100 border-t-2 border-gold-500/30 px-4 py-4 shadow-lg flex-shrink-0">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2 items-end">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Describe your situation..."
              className="flex-1 px-4 py-3.5 bg-cream-50 text-navy-900 text-base rounded-xl border-2 border-navy-900/15 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 placeholder-navy-700/50 min-h-[48px]"
              aria-label="Message input"
            />

            <button
              type="button"
              className="p-3 text-navy-700/50 hover:text-navy-800 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
              title="Voice input (coming soon)"
              aria-label="Voice input (coming soon)"
              disabled
            >
              <Mic size={22} aria-hidden />
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-gold-500 text-white rounded-xl hover:bg-gold-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
              aria-label="Send message"
            >
              <Send size={22} aria-hidden />
            </button>
          </div>

          <p className="text-sm text-navy-700/60 mt-2 leading-relaxed">
            Share dates, amounts, and any correspondence you have — the more detail, the better.
          </p>
        </div>
      </footer>
    </div>
  );
}
