import React from 'react';
import { ScrollText } from 'lucide-react';

/**
 * Plain-language rights card — shows applicable laws without source citations
 */
export default function RightsExplanationCard({
  issue = '',
  summary = '',
  sections = [],
  notes = '',
}) {
  return (
    <div className="bg-cream-100 border-2 border-navy-900/15 rounded-xl overflow-hidden mb-5 shadow-md">
      <div className="px-5 py-4 bg-navy-900 border-b-2 border-gold-500">
        <h3 className="font-serif-display text-xl text-cream-50">
          {issue || 'Your Legal Rights'}
        </h3>
      </div>

      <div className="px-5 py-5 space-y-5">
        {summary && (
          <p className="text-base leading-relaxed text-navy-900">{summary}</p>
        )}

        {sections.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-navy-800 uppercase tracking-wide mb-3 flex items-center gap-2">
              <ScrollText size={16} className="text-gold-600" aria-hidden />
              Applicable Laws
            </h4>

            <div className="space-y-3">
              {sections.map((section, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white rounded-lg border border-gold-500/30"
                >
                  <p className="font-semibold text-navy-900 text-sm">
                    {section.act}
                    {section.section && `, ${section.section}`}
                  </p>
                  {section.text_summary && (
                    <p className="text-sm leading-relaxed text-navy-800/90 mt-2">
                      {section.text_summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {notes && (
          <p className="text-sm text-navy-700/80 italic leading-relaxed pt-3 border-t border-navy-900/10">
            {notes}
          </p>
        )}
      </div>
    </div>
  );
}
