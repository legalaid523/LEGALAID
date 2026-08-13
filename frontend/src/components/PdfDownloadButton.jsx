import React from 'react';
import { ScrollText, Edit2 } from 'lucide-react';

/**
 * "Notice ready" card with preview thumbnail and gold Download PDF CTA
 */
export default function PdfDownloadButton({
  documentTitle = 'Notice of Demand',
  documentType = 'notice',
  onDownload = () => {},
  onEdit = () => {},
  isLoading = false,
}) {
  const typeLabel = {
    notice: 'Legal notice for demand of payment',
    letter: 'Formal letter to concerned party',
    complaint: 'Complaint document for filing',
  };

  return (
    <div className="bg-cream-100 border-2 border-gold-500/50 rounded-xl overflow-hidden mb-5 shadow-md">
      <div className="px-5 py-4 bg-navy-900 border-b-2 border-gold-500 flex items-center gap-3">
        <ScrollText size={24} className="text-gold-500" aria-hidden />
        <div>
          <h3 className="font-serif-display text-lg text-cream-50">Notice ready</h3>
          <p className="text-sm text-cream-200/80">Your document has been prepared</p>
        </div>
      </div>

      <div className="px-5 py-5">
        {/* Document preview thumbnail */}
        <div className="mb-5 border-2 border-navy-900/10 rounded-lg overflow-hidden bg-white p-6 flex flex-col items-center justify-center min-h-[140px]">
          <div className="w-full max-w-[200px] space-y-2">
            <div className="h-2 bg-navy-900/20 rounded w-full" />
            <div className="h-2 bg-navy-900/15 rounded w-5/6" />
            <div className="h-2 bg-navy-900/15 rounded w-full" />
            <div className="h-2 bg-navy-900/10 rounded w-4/6" />
            <div className="h-8 bg-gold-500/20 rounded w-full mt-3 flex items-center justify-center">
              <ScrollText size={20} className="text-gold-600" aria-hidden />
            </div>
          </div>
          <p className="text-xs text-navy-700/60 mt-3">Document preview</p>
        </div>

        <h4 className="font-serif text-lg text-navy-900 mb-1">{documentTitle}</h4>
        <p className="text-sm text-navy-700/80 mb-5">
          {typeLabel[documentType] ?? typeLabel.notice}
        </p>

        <button
          type="button"
          onClick={onDownload}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gold-500 text-white font-semibold rounded-xl hover:bg-gold-600 active:bg-gold-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[48px] mb-3"
        >
          <ScrollText size={20} aria-hidden />
          <span>{isLoading ? 'Generating PDF...' : 'Download PDF'}</span>
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium text-navy-800 hover:text-gold-700 py-3 min-h-[44px] transition-colors"
        >
          <Edit2 size={16} aria-hidden />
          Edit details
        </button>
      </div>

      <div className="px-5 py-3 bg-cream-50 border-t border-gold-500/20">
        <p className="text-sm text-navy-700/70 text-center leading-relaxed">
          Review the document before sharing. Consider professional legal review before filing.
        </p>
      </div>
    </div>
  );
}
