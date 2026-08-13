import React from 'react';
import { ScrollText, ExternalLink } from 'lucide-react';

/**
 * Plain-language rights card with tappable section reference chips
 */
export default function RightsExplanationCard({
  issue = '',
  summary = '',
  sections = [],
  notes = '',
}) {
  const [expandedSection, setExpandedSection] = React.useState(null);

  const chipLabel = (section) => {
    const actShort = section.act.includes(',')
      ? section.act.split(',')[0]
      : section.act;
    return `${actShort}, ${section.section}`;
  };

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
              Cited Sections
            </h4>

            <div className="flex flex-wrap gap-2 mb-4">
              {sections.map((section, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    setExpandedSection(expandedSection === idx ? null : idx)
                  }
                  className={`px-3 py-2 rounded-lg text-sm font-medium min-h-[44px] transition-colors border ${
                    expandedSection === idx
                      ? 'bg-gold-500 text-white border-gold-600'
                      : 'bg-white text-navy-900 border-gold-500/40 hover:border-gold-500 hover:bg-gold-500/10'
                  }`}
                  aria-expanded={expandedSection === idx}
                >
                  {chipLabel(section)}
                </button>
              ))}
            </div>

            {expandedSection !== null && sections[expandedSection] && (
              <div className="p-4 bg-white rounded-lg border border-gold-500/30">
                <p className="font-semibold text-navy-900 text-sm">
                  {sections[expandedSection].section}
                  {sections[expandedSection].title &&
                    ` — ${sections[expandedSection].title}`}
                </p>
                <p className="text-xs text-navy-700/70 mt-1 mb-3">
                  {sections[expandedSection].act}
                </p>
                {sections[expandedSection].text_summary && (
                  <p className="text-base leading-relaxed text-navy-900">
                    {sections[expandedSection].text_summary}
                  </p>
                )}
                {sections[expandedSection].source_url && (
                  <a
                    href={sections[expandedSection].source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-700 hover:text-gold-800 mt-3 min-h-[44px]"
                  >
                    View full text
                    <ExternalLink size={14} aria-hidden />
                  </a>
                )}
              </div>
            )}
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
