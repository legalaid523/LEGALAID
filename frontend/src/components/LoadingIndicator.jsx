import React from 'react';
import { Scale } from 'lucide-react';

/**
 * Custom law-themed loading animation — gavel tap or scale tilt
 */
export default function LoadingIndicator({
  variant = 'gavel',
  message = 'Reviewing applicable law...',
}) {
  const contextualMessages = [
    'Reviewing applicable law...',
    'Checking relevant sections...',
    'Analyzing your case...',
    'Drafting your notice...',
    'Gathering evidence requirements...',
  ];

  const [currentMessage, setCurrentMessage] = React.useState(message);

  React.useEffect(() => {
    setCurrentMessage(message);
  }, [message]);

  React.useEffect(() => {
    if (message !== 'Reviewing applicable law...') return undefined;

    const interval = setInterval(() => {
      setCurrentMessage((prev) => {
        const idx = contextualMessages.indexOf(prev);
        return contextualMessages[(idx + 1) % contextualMessages.length];
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [message]);

  return (
    <div
      className="flex flex-col items-center justify-center py-8 px-4"
      role="status"
      aria-live="polite"
      aria-label={currentMessage}
    >
      {variant === 'gavel' ? (
        <div className="relative w-20 h-20 flex items-center justify-center mb-4">
          <div className="animate-gavel-tap origin-bottom">
            <svg
              width="56"
              height="56"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gold-500"
              aria-hidden
            >
              <rect x="14" y="6" width="20" height="10" rx="2" fill="currentColor" />
              <rect x="21" y="16" width="6" height="26" rx="1" fill="currentColor" />
              <ellipse cx="24" cy="44" rx="10" ry="2" fill="currentColor" opacity="0.25" />
              <path
                d="M8 22 Q6 22 6 24 Q6 26 8 26"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                opacity="0.4"
              />
              <path
                d="M40 22 Q42 22 42 24 Q42 26 40 26"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                opacity="0.4"
              />
            </svg>
          </div>
        </div>
      ) : (
        <div className="animate-scale-tilt mb-4">
          <Scale size={52} className="text-gold-500" strokeWidth={1.5} aria-hidden />
        </div>
      )}

      <p className="text-center text-base font-medium text-navy-900 min-h-[1.5rem]">
        {currentMessage}
      </p>
    </div>
  );
}
