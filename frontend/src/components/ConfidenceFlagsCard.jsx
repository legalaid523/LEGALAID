import React from 'react';
import { ChevronDown, AlertTriangle } from 'lucide-react';
import { t } from '../i18n/translations';

/**
 * Collapsible "Strengthen your case" panel — missing-evidence flags
 */
export default function ConfidenceFlagsCard({ flags = [], defaultOpen = true, lang = 'en' }) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  if (!flags?.length) return null;

  return (
    <div className="bg-cream-100 border-2 border-gold-500/50 rounded-xl overflow-hidden mb-5 shadow-md">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-cream-200/60 transition-colors min-h-[44px]"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 text-left">
          <div className="p-2 rounded-lg bg-gold-500/15">
            <AlertTriangle size={22} className="text-gold-600" aria-hidden />
          </div>
          <div>
            <h3 className="font-serif-display text-lg text-navy-900">
              {t('strengthenCase', lang)}
            </h3>
            <p className="text-sm text-navy-700/80 mt-0.5">
              {t('strengthenCaseItems', lang, flags.length)}
            </p>
          </div>
        </div>
        <ChevronDown
          size={22}
          className={`text-gold-600 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </button>

      {isOpen && (
        <div className="border-t border-gold-500/20 px-5 py-4 bg-cream-50 space-y-4">
          {flags.map((flag, idx) => (
            <div key={idx} className="flex gap-3 items-start">
              <AlertTriangle
                size={20}
                className="text-gold-600 flex-shrink-0 mt-0.5"
                aria-hidden
              />
              <div>
                <p className="text-base font-semibold text-navy-900">{flag.field}</p>
                <p className="text-sm text-navy-800/90 mt-1 leading-relaxed">
                  {flag.message}
                </p>
              </div>
            </div>
          ))}

          <p className="text-sm text-navy-700/70 pt-2 border-t border-gold-500/15 italic leading-relaxed">
            {t('strengthenCaseFooter', lang)}
          </p>
        </div>
      )}
    </div>
  );
}
