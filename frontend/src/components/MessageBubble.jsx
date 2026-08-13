import React from 'react';
import { ShieldAlert } from 'lucide-react';

/**
 * MessageBubble — user (navy, right) and bot (cream, gold left border) messages
 */
export default function MessageBubble({
  message,
  isUser = false,
  timestamp = null,
  showDisclaimer = false,
}) {
  const formatTime = (ts) => {
    if (!ts) return null;
    return new Date(ts).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div
      className={`flex mb-5 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[75%] px-4 py-3.5 rounded-xl ${
          isUser
            ? 'bg-navy-900 text-white rounded-br-sm'
            : 'bg-cream-100 text-navy-900 rounded-bl-sm border-l-4 border-gold-500 shadow-sm'
        }`}
      >
        <p className="text-base leading-relaxed break-words whitespace-pre-wrap">
          {renderText(message)}
        </p>

        {showDisclaimer && (
          <div className="mt-3 pt-3 border-t border-gold-500/30 flex items-start gap-2">
            <ShieldAlert
              size={16}
              className="text-gold-600 flex-shrink-0 mt-0.5"
              aria-hidden
            />
            <p className="text-sm text-navy-800 leading-snug">
              This is not a substitute for professional legal advice.
            </p>
          </div>
        )}

        {timestamp && (
          <p
            className={`text-xs mt-2 ${
              isUser ? 'text-cream-200/70' : 'text-navy-700/60'
            }`}
          >
            {formatTime(timestamp)}
          </p>
        )}
      </div>
    </div>
  );
}
