import React from 'react';
import { Scale } from 'lucide-react';

/**
 * LoadingIndicator Component
 * Custom law-themed loading animation with gavel or scale
 * Shows contextual messages that rotate
 */
export default function LoadingIndicator({ variant = 'gavel', message = 'Reviewing applicable law...' }) {
  const messages = [
    'Reviewing applicable law...',
    'Analyzing your case...',
    'Gathering relevant sections...',
    'Drafting your notice...',
    'Checking evidence requirements...',
  ];

  const [currentMessage, setCurrentMessage] = React.useState(message);

  React.useEffect(() => {
    if (message !== 'Reviewing applicable law...') {
      setCurrentMessage(message);
      return;
    }

    const interval = setInterval(() => {
      setCurrentMessage(prev => {
        const currentIndex = messages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [message]);

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      {variant === 'gavel' ? (
        <div className="flex flex-col items-center gap-4">
          {/* Gavel Animation */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute animate-gavel-tap">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gold-500"
              >
                {/* Gavel head */}
                <rect x="16" y="8" width="16" height="8" rx="2" fill="currentColor" />
                {/* Gavel handle */}
                <rect x="22" y="16" width="4" height="24" fill="currentColor" />
                {/* Sound lines */}
                <path
                  d="M10 24 Q8 24 8 26 Q8 28 10 28"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.5"
                />
                <path
                  d="M38 24 Q40 24 40 26 Q40 28 38 28"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.5"
                />
              </svg>
            </div>
          </div>

          {/* Message text */}
          <div className="h-6 flex items-center justify-center">
            <p className="text-center text-sm font-medium text-navy-900 transition-opacity duration-300">
              {currentMessage}
            </p>
          </div>
        </div>
      ) : (
        // Scale variant
        <div className="flex flex-col items-center gap-4">
          <div className="animate-scale-tilt">
            <Scale size={48} className="text-gold-500" strokeWidth={1.5} />
          </div>
          <div className="h-6 flex items-center justify-center">
            <p className="text-center text-sm font-medium text-navy-900 transition-opacity duration-300">
              {currentMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
