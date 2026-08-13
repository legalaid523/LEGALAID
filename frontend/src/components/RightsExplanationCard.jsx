import React from 'react';
import { ChevronRight, ScrollText, ExternalLink } from 'lucide-react';

/**
 * RightsExplanationCard Component
 * Shows plain-language explanation of rights with expandable legal sections
 */
export default function RightsExplanationCard({ 
  issue = '', 
  summary = '', 
  sections = [],
  notes = ''
}) {
  const [expandedSection, setExpandedSection] = React.useState(null);

  return (
    <div className="bg-white border-l-4 border-gold-500 rounded-lg overflow-hidden mb-4 shadow-sm">
      {/* Header */}
      <div className="px-4 py-4 bg-gradient-to-r from-navy-900 to-navy-800">
        <h3 className="font-serif-display text-lg text-white">
          {issue || 'Your Legal Rights'}
        </h3>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Summary */}
        {summary && (
          <p className="text-sm leading-relaxed text-navy-900">
            {summary}
          </p>
        )}

        {/* Applicable Sections */}
        {sections && sections.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-navy-900 mb-3 flex items-center gap-2">
              <ScrollText size={16} className="text-gold-500" />
              Applicable Legal Sections
            </h4>

            <div className="space-y-2">
              {sections.map((section, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Section header */}
                  <button
                    onClick={() =>
                      setExpandedSection(
                        expandedSection === idx ? null : idx
                      )
                    }
                    className="w-full px-3 py-3 flex items-center justify-between hover:bg-cream-100 transition-colors text-left group"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-navy-900 group-hover:text-gold-500">
                        {section.section} • {section.act}
                      </p>
                      {section.title && (
                        <p className="text-xs text-gray-600 mt-1">
                          {section.title}
                        </p>
                      )}
                    </div>
                    <ChevronRight
                      size={18}
                      className={`text-gold-500 transition-transform flex-shrink-0 ml-2 ${
                        expandedSection === idx ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {/* Section content - expandable */}
                  {expandedSection === idx && (
                    <div className="px-3 py-3 bg-cream-50 border-t border-gray-200">
                      {section.text_summary && (
                        <p className="text-sm leading-relaxed text-navy-900 mb-2">
                          {section.text_summary}
                        </p>
                      )}

                      {section.source_url && (
                        <a
                          href={section.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-gold-600 hover:text-gold-700 transition-colors"
                        >
                          View full text
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="pt-3 border-t border-gray-200 mt-4">
            <p className="text-xs text-gray-600 italic leading-relaxed">
              ⚠️ {notes}
            </p>
          </div>
        )}
      </div>

      {/* Disclaimer footer */}
      <div className="px-4 py-3 bg-cream-50 border-t border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          This is general legal information, not professional legal advice.
        </p>
      </div>
    </div>
  );
}
