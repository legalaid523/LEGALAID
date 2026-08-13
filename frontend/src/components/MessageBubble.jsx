import React from 'react';

/**
 * MessageBubble Component
 * Displays user and bot messages with legal-themed styling
 */
export default function MessageBubble({ message, isUser = false, timestamp = null }) {
  const formatTime = (ts) => {
    if (!ts) return null;
    const date = new Date(ts);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div
      className={`flex gap-3 mb-4 animate-fadeIn ${isUser ? 'flex-row-reverse justify-end' : 'flex-row justify-start'}`}
      style={{
        animation: 'fadeIn 0.3s ease-in',
      }}
    >
      {/* Message bubble */}
      <div
        className={`max-w-xs px-4 py-3 rounded-lg ${
          isUser
            ? 'bg-navy-900 text-white rounded-tr-none'
            : 'bg-white text-navy-900 rounded-tl-none card-border'
        }`}
      >
        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
          {message}
        </p>
        {timestamp && (
          <p
            className={`text-xs mt-2 ${
              isUser ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {formatTime(timestamp)}
          </p>
        )}
      </div>
    </div>
  );
}

/* CSS for fadeIn animation */
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
}
