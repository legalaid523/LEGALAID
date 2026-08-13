import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Info, ShieldAlert } from 'lucide-react';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';
import DomainBadge from './DomainBadge';
import ConfidenceFlagsCard from './ConfidenceFlagsCard';
import RightsExplanationCard from './RightsExplanationCard';
import PdfDownloadButton from './PdfDownloadButton';

/**
 * ChatWindow Component
 * Main chat interface for the legal aid assistant
 */
export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [domain, setDomain] = useState(null);
  const [domainConfidence, setDomainConfidence] = useState(null);
  const [stage, setStage] = useState('intro'); // intro, classifying, questioning, extracted, reviewing, results
  const [confidenceFlags, setConfidenceFlags] = useState([]);
  const [showRights, setShowRights] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    const greeting = `Namaste! 🙏 Welcome to LegalAid, your trusted guide through legal processes in India.

I'm here to help you understand your rights, gather relevant information about your situation, and prepare formal documents if needed. Whether it's a tenant dispute, labor issue, or consumer problem, we'll work through this together in plain language.

**Important:** This tool provides general legal information, not professional legal advice. Always consult with a qualified lawyer before taking legal action.

Please describe your legal situation in your own words. What brings you here today?`;

    setMessages([
      {
        id: 1,
        text: greeting,
        isUser: false,
        timestamp: new Date(),
      },
    ]);
    setStage('intro');
  }, []);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate API call with loading state
    setIsLoading(true);

    // Simulate delay
    setTimeout(() => {
      simulateResponse(input);
      setIsLoading(false);
    }, 1500);
  };

  // Simulate bot responses based on conversation flow
  const simulateResponse = (userInput) => {
    let botResponse = '';
    let newStage = stage;
    let newDomain = domain;
    let confidence = domainConfidence;
    let flags = confidenceFlags;

    if (stage === 'intro') {
      // Simulate domain classification
      setIsLoading(true);

      setTimeout(() => {
        // Mock domain classification result
        newDomain = 'tenant';
        confidence = 0.76;
        newStage = 'questioning';
        setDomain(newDomain);
        setDomainConfidence(confidence);
        setStage(newStage);

        botResponse = `I understand. This sounds like a **tenant dispute** regarding your security deposit. I've noted this, and now I'll ask some clarifying questions to better understand your situation and gather the information we need.

Let me ask you:

**When did you vacate the premises?**
This helps establish the timeline for deposit return.`;

        const botMessage = {
          id: messages.length + 2,
          text: botResponse,
          isUser: false,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }, 1200);

      return;
    }

    if (stage === 'questioning') {
      // Progress to next stage after sufficient info
      newStage = 'extracted';
      setStage(newStage);

      botResponse = `Thank you for that information. Based on what you've shared, here's what I understand:

📋 **Your Case Summary:**
- Domain: Tenant Dispute
- Issue: Landlord has not refunded security deposit after vacating
- Deposit Amount: Around ₹50,000 (from context)
- Months since vacancy: ~3 weeks
- Deductions: Not itemized or not provided

I've identified what we need to strengthen your case. Let me show you what rights you have under the law.`;

      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);

      // Add confidence flags
      const newFlags = [
        {
          field: 'Written Lease Agreement',
          message: 'Do you have a copy of your lease agreement showing the deposit amount? This is crucial evidence.',
        },
        {
          field: 'Deposit Receipt',
          message: 'A receipt or bank transaction showing you paid the deposit helps establish proof of payment.',
        },
        {
          field: 'Exit Inspection Report',
          message: 'Photos or a documented inspection of the property condition at the time of vacancy strengthen your claim.',
        },
      ];

      setConfidenceFlags(newFlags);
      setShowRights(true);

      return;
    }

    if (stage === 'extracted') {
      newStage = 'results';
      setStage(newStage);

      botResponse = `Perfect! I've prepared a formal **Notice of Demand** that you can send to your landlord. This is a legal document requesting the return of your security deposit.

The notice is based on:
- Tamil Nadu Regulation of Rights and Responsibilities of Landlords and Tenants Act, 2017
- Section 11 (Security Deposit provisions)
- Your situation and the evidence you've gathered

You can download and send this via registered post or email with read receipt to maintain a paper trail.`;

      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      setShowPdf(true);

      return;
    }

    if (stage === 'results') {
      botResponse = `Is there anything else you'd like to know about your case? I can:
- Answer questions about tenant rights
- Help you understand the legal process
- Provide guidance on next steps if the landlord doesn't respond`;

      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      return;
    }
  };

  // Quick reply chips (for specific questions)
  const QuickReplies = ({ options, onSelect }) => (
    <div className="flex flex-wrap gap-2 mb-4">
      {options.map((option, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(option)}
          className="px-4 py-2 bg-cream-100 text-navy-900 border border-gold-500 rounded-full text-sm font-medium hover:bg-gold-500 hover:text-white transition-colors"
        >
          {option}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-cream-50 safe-area-inset">
      {/* Header */}
      <header className="bg-navy-900 border-b-4 border-gold-500 px-4 py-4 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gold-500"
            >
              <path
                d="M12 2L2 8v10c0 8 10 14 10 14s10-6 10-14V8l-10-6z"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M12 12l3-3m0 6l-3-3m0 0l-3-3m6 3l-3 3"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <h1 className="font-serif-display text-2xl text-white">LegalAid</h1>
          </div>

          {/* Language toggle placeholder */}
          <button className="text-white hover:text-gold-500 transition-colors text-sm font-medium">
            EN | हिन्दी
          </button>
        </div>
      </header>

      {/* Disclaimer banner */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
        <div className="max-w-2xl mx-auto flex items-start gap-2">
          <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-900">
            <strong>Disclaimer:</strong> This is not a substitute for professional legal advice. Always consult a qualified lawyer.
          </p>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto">
          {/* Domain badge - show once classified */}
          {domain && (
            <DomainBadge domain={domain} confidence={domainConfidence} />
          )}

          {/* Messages */}
          {messages.map(msg => (
            <MessageBubble
              key={msg.id}
              message={msg.text}
              isUser={msg.isUser}
              timestamp={msg.timestamp}
            />
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <LoadingIndicator
              variant="gavel"
              message={
                stage === 'intro'
                  ? 'Analyzing your case...'
                  : stage === 'questioning'
                    ? 'Processing information...'
                    : 'Preparing your document...'
              }
            />
          )}

          {/* Confidence flags card */}
          {confidenceFlags.length > 0 && (
            <ConfidenceFlagsCard flags={confidenceFlags} isOpen={false} />
          )}

          {/* Rights explanation */}
          {showRights && (
            <RightsExplanationCard
              issue="Security Deposit Withholding"
              summary="Under Tamil Nadu law, landlords must return security deposits within one month of you vacating the premises. If they withhold your deposit, you have clear legal rights to demand its return, even without deductions (unless they follow strict procedures for itemizing deductions)."
              sections={[
                {
                  act: 'Tamil Nadu Regulation of Rights and Responsibilities of Landlords and Tenants Act, 2017',
                  section: 'Section 11',
                  title: 'Security Deposit',
                  text_summary:
                    'The security deposit is to be refunded to the tenant within one month after vacation of the premises, after making due deduction of any liability of the tenant. The landlord must provide an itemized list of any deductions.',
                  source_url: 'https://indiankanoon.org/doc/182653321/',
                },
              ]}
              notes="This rule is specifically based on Tamil Nadu law. For other states, different provisions may apply."
            />
          )}

          {/* PDF download card */}
          {showPdf && (
            <PdfDownloadButton
              documentTitle="Notice of Demand - Security Deposit"
              documentType="notice"
              onDownload={() => alert('PDF would download')}
              onEdit={() => alert('Edit mode would open')}
            />
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2 items-end">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Type your message... (or press Enter)"
              className="flex-1 px-4 py-3 bg-cream-100 text-navy-900 rounded-lg border border-gray-300 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500 focus:ring-opacity-20 placeholder-gray-600"
            />

            <button
              className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
              title="Voice input (coming soon)"
            >
              <Mic size={20} />
            </button>

            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-gold-500 text-white rounded-lg hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Send message"
            >
              <Send size={20} />
            </button>
          </div>

          {/* Helper text */}
          <p className="text-xs text-gray-600 mt-2 leading-relaxed">
            💡 Tip: Be as detailed as possible about your situation. Share dates, amounts, and any correspondence you have.
          </p>
        </div>
      </div>
    </div>
  );
}
