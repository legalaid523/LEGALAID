import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Languages, Send, Mic, ChevronDown, RotateCcw } from 'lucide-react';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';
import DomainBadge from './DomainBadge';
import RightsExplanationCard from './RightsExplanationCard';
import ConfidenceFlagsCard from './ConfidenceFlagsCard';
import PdfDownloadButton from './PdfDownloadButton';
import { startSession, sendMessage, generatePdf } from '../api/legalaidApi';
import { t } from '../i18n/translations';

const LANGUAGES = [
  { label: 'English', code: 'en' },
  { label: 'Hindi', code: 'hi' },
  { label: 'Hinglish', code: 'hi-en' },
];

let messageId = 1;
const nextId = () => ++messageId;

/**
 * ChatWindow — Multi-turn conversation interface backed by the LegalAId backend.
 *
 * Flow:
 * 1. On mount → startSession() to get session_id
 * 2. User sends message → sendMessage() → backend classifies + extracts + scores
 * 3. If need_more_facts → display next question (with quick replies if options)
 * 4. If matched → display RightsExplanationCard + ConfidenceFlagsCard + PdfDownloadButton
 * 5. If no_match → generic guidance message
 */
export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [domainInfo, setDomainInfo] = useState(null); // { domain_id, confidence }
  const [matchResult, setMatchResult] = useState(null); // full match data when status=matched
  const [conversationDone, setConversationDone] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const langMenuRef = useRef(null);

  const lang = language.code; // shorthand for translations

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Reset chat to a fresh state — new session, clear messages/results
  const resetChat = useCallback(async () => {
    setMessages([
      {
        id: nextId(),
        textKey: 'welcome',
        text: t('welcome', lang),
        isUser: false,
        timestamp: new Date(),
        showDisclaimer: true,
      },
    ]);
    setInput('');
    setIsLoading(false);
    setDomainInfo(null);
    setMatchResult(null);
    setConversationDone(false);
    setPdfLoading(false);

    try {
      const { session_id } = await startSession();
      setSessionId(session_id);
    } catch {
      console.warn('Could not start new session');
      setSessionId(null);
    }
  }, [lang]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, matchResult, scrollToBottom]);

  // Initialize session on mount
  useEffect(() => {
    const init = async () => {
      try {
        const { session_id } = await startSession();
        setSessionId(session_id);
      } catch {
        // Session start failed — still show the welcome message, will retry on first send
        console.warn('Could not start session — will retry on first message');
      }
    };
    init();

    setMessages([
      {
        id: nextId(),
        textKey: 'welcome',
        text: t('welcome', 'en'),
        isUser: false,
        timestamp: new Date(),
        showDisclaimer: true,
      },
    ]);
  }, []);

  // Re-translate messages when language changes
  useEffect(() => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.textKey) {
          return { ...msg, text: t(msg.textKey, lang) };
        }
        return msg;
      })
    );
  }, [lang]);

  // Close language menu on outside click
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

    // If the previous conversation was completed, start a fresh session
    // but keep all prior messages visible for context
    if (conversationDone) {
      setConversationDone(false);
      setDomainInfo(null);
      setMatchResult(null);

      // Add a visual separator for the new question
      addBotMessage(`---\n\n✨ **${t('newQuestion', lang)}**\n${t('newQuestionHint', lang)}`);

      try {
        const { session_id } = await startSession();
        setSessionId(session_id);
      } catch {
        console.warn('Could not start new session');
        setSessionId(null);
      }
    }

    addUserMessage(trimmed);
    setInput('');
    setIsLoading(true);

    try {
      // Ensure we have a session
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        const { session_id } = await startSession();
        currentSessionId = session_id;
        setSessionId(currentSessionId);
      }

      const result = await sendMessage(currentSessionId, trimmed, language.code);

      // Set domain info on first classification
      if (result.domain_id && !domainInfo) {
        setDomainInfo({
          domain_id: result.domain_id,
          confidence: result.domain_confidence,
        });
      }

      if (result.status === 'need_more_facts' && result.next_question) {
        const q = result.next_question;
        addBotMessage(q.question_text, {
          quickReplies: q.options || null,
        });
      } else if (result.status === 'matched') {
        setMatchResult(result);
        setConversationDone(true);

        // Build summary
        const section = result.matched_sections?.[0];
        const issueLabel = section?.issue?.replace(/_/g, ' ') || 'your case';
        const domainLabel = (result.domain_id || '').charAt(0).toUpperCase() + (result.domain_id || '').slice(1);

        const factSummary = result.extracted_facts
          ? Object.entries(result.extracted_facts)
              .map(([k, v]) => `• **${k.replace(/_/g, ' ')}:** ${v}`)
              .join('\n')
          : '';

        addBotMessage(
          `**${t('caseAnalysisComplete', lang)}** ✅\n\n**${t('domainLabel', lang)}:** ${domainLabel} ${t('disputeLabel', lang)}\n**${t('issueLabel', lang)}:** ${issueLabel}\n**${t('matchScoreLabel', lang)}:** ${((section?.score || 0) * 100).toFixed(0)}%\n\n**${t('extractedFactsLabel', lang)}:**\n${factSummary}\n\n${t('caseResultSuffix', lang)}`
        );
      } else if (result.status === 'no_match') {
        setConversationDone(true);
        addBotMessage(t('noMatchMessage', lang));
      }
    } catch (err) {
      addBotMessage(
        `❌ **${t('errorPrefix', lang)}:** ${err.message || t('connectionError', lang)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => submitMessage(input);

  const handleQuickReply = (replyText) => {
    submitMessage(replyText);
  };

  return (
    <div className="flex flex-col h-full bg-cream-50">
      {/* Top bar: refresh + language selector */}
      <div className="flex justify-between items-center px-4 pt-2 pb-0 flex-shrink-0">
        {/* Refresh / New Chat button */}
        <button
          type="button"
          onClick={resetChat}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-navy-800 hover:text-gold-600 hover:bg-cream-200 transition-colors min-h-[40px] text-sm font-medium border border-navy-900/10"
          aria-label={t('newChat', lang)}
          title={t('newChat', lang)}
        >
          <RotateCcw size={18} aria-hidden />
          <span>{t('newChat', lang)}</span>
        </button>

        {/* Language selector */}
        <div className="relative" ref={langMenuRef}>
          <button
            type="button"
            onClick={() => setLangMenuOpen((o) => !o)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-navy-800 hover:text-gold-600 hover:bg-cream-200 transition-colors min-h-[40px] text-sm font-medium border border-navy-900/10"
            aria-haspopup="listbox"
            aria-expanded={langMenuOpen}
            aria-label={t('changeLanguage', lang)}
          >
            <Languages size={18} aria-hidden />
            <span>{language.label}</span>
            <ChevronDown size={14} aria-hidden />
          </button>

          {langMenuOpen && (
            <ul
              role="listbox"
              className="absolute end-0 top-full mt-1 w-40 bg-cream-100 border border-gold-500/30 rounded-lg shadow-xl overflow-hidden z-20"
            >
              {LANGUAGES.map((lng) => (
                <li key={lng.label}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={language.label === lng.label}
                    onClick={() => {
                      setLanguage(lng);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-start px-4 py-3 text-sm min-h-[44px] transition-colors ${
                      language.label === lng.label
                        ? 'bg-gold-500/15 text-navy-900 font-semibold'
                        : 'text-navy-800 hover:bg-cream-200'
                    }`}
                  >
                    {lng.label}
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
          {/* Domain badge — shown after classification */}
          {domainInfo && (
            <DomainBadge
              domain={domainInfo.domain_id}
              confidence={domainInfo.confidence}
            />
          )}

          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg.text}
              isUser={msg.isUser}
              timestamp={msg.timestamp}
              showDisclaimer={msg.showDisclaimer}
              disclaimerText={t('disclaimer', lang)}
              quickReplies={msg.quickReplies}
              onQuickReply={handleQuickReply}
            />
          ))}

          {isLoading && (
            <LoadingIndicator variant="gavel" message={t('analyzingCase', lang)} />
          )}

          {/* Matched result cards — shown after conversation completes with a match */}
          {matchResult && !isLoading && (
            <>
              {matchResult.applicable_laws?.length > 0 && (
                <RightsExplanationCard
                  issue={
                    matchResult.matched_sections?.[0]?.issue
                      ? `${t('yourRightsPrefix', lang)} — ${matchResult.matched_sections[0].issue.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}`
                      : t('yourLegalRights', lang)
                  }
                  summary={matchResult.matched_sections?.[0]?.notes || ''}
                  sections={matchResult.applicable_laws.map((law) => ({
                    act: law.act,
                    section: law.section_number,
                    title: law.section_number,
                    text_summary: law.text_summary,
                  }))}
                  notes={t('stateSpecificNote', lang)}
                  applicableLawsLabel={t('applicableLaws', lang)}
                />
              )}

              {matchResult.confidence_flags?.length > 0 && (
                <ConfidenceFlagsCard
                  flags={matchResult.confidence_flags}
                  defaultOpen
                  lang={lang}
                />
              )}

              <PdfDownloadButton
                documentTitle={`${t('legalNoticePrefix', lang)} — ${
                  matchResult.matched_sections?.[0]?.issue?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Your Case'
                }`}
                documentType="notice"
                isLoading={pdfLoading}
                onDownload={async () => {
                  try {
                    setPdfLoading(true);
                    await generatePdf(matchResult);
                  } catch (err) {
                    alert(`PDF generation failed: ${err.message}`);
                  } finally {
                    setPdfLoading(false);
                  }
                }}
                onEdit={() => alert('Edit feature coming soon.')}
              />
            </>
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
              placeholder={conversationDone ? t('askAnotherQuestion', lang) : t('inputPlaceholder', lang)}
              className="flex-1 px-4 py-3.5 bg-cream-50 text-navy-900 text-base rounded-xl border-2 border-navy-900/15 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 placeholder-navy-700/50 min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t('sendMessage', lang)}
            />

            <button
              type="button"
              className="p-3 text-navy-700/50 hover:text-navy-800 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
              title={t('voiceInputSoon', lang)}
              aria-label={t('voiceInputSoon', lang)}
              disabled
            >
              <Mic size={22} aria-hidden />
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-gold-500 text-white rounded-xl hover:bg-gold-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
              aria-label={t('sendMessage', lang)}
            >
              <Send size={22} aria-hidden />
            </button>
          </div>

          <p className="text-sm text-navy-700/60 mt-2 leading-relaxed">
            {t('inputHint', lang)}
          </p>
        </div>
      </footer>
    </div>
  );
}
