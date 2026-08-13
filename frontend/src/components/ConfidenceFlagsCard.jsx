import React from 'react';
import { ChevronDown, AlertTriangle } from 'lucide-react';

/**
 * ConfidenceFlagsCard Component
 * Shows missing evidence/confidence flags with a collapsible interface
 * Key differentiator: helps users strengthen their case
 */
export default function ConfidenceFlagsCard({ flags = [], isOpen: initialOpen = false }) {
  const [isOpen, setIsOpen] = React.useState(initialOpen);

  if (!flags || flags.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-l-4 border-gold-500 rounded-lg overflow-hidden mb-4 shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-cream-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle size={20} className="text-gold-500" />
          <div className="text-left">
            <h3 className="font-semibold text-navy-900 text-sm">
              Strengthen your case
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              {flags.length} evidence item{flags.length !== 1 ? 's' : ''} to gather
            </p>
          </div>
        </div>
        <ChevronDown
          size={20}
          className={`text-gold-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Content - Only show if expanded */}
      {isOpen && (
        <div className="border-t border-gray-200 px-4 py-3 bg-cream-50 space-y-3">
          {flags.map((flag, idx) => (
            <div key={idx} className="flex gap-3">
              <AlertTriangle
                size={18}
                className="text-gold-500 flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-navy-900">
                  {flag.field}
                </p>
                <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                  {flag.message}
                </p>
              </div>
            </div>
          ))}

          {/* Helper text */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600 italic">
              💡 Gathering these details will make your case much stronger when seeking legal action.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
