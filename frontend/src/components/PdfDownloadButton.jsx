import React from 'react';
import { Download, FileText, Edit2 } from 'lucide-react';

/**
 * PdfDownloadButton Component
 * Shows document ready card with PDF download and edit options
 */
export default function PdfDownloadButton({ 
  documentTitle = 'Notice of Demand',
  documentType = 'notice',
  onDownload = () => alert('PDF download would start here'),
  onEdit = () => alert('Edit mode would open here'),
  thumbnail = null,
  isLoading = false
}) {
  return (
    <div className="bg-white border-l-4 border-gold-500 rounded-lg overflow-hidden mb-4 shadow-sm">
      {/* Header with success indicator */}
      <div className="px-4 py-4 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-green-600 animate-pulse-gold"></div>
        <div>
          <h3 className="font-semibold text-navy-900">Document Ready</h3>
          <p className="text-xs text-gray-700">Your {documentType} has been prepared</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {/* Document preview thumbnail */}
        {thumbnail ? (
          <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 p-3">
            <img
              src={thumbnail}
              alt="Document preview"
              className="w-full h-40 object-cover rounded"
            />
          </div>
        ) : (
          <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 p-6 flex items-center justify-center">
            <FileText size={48} className="text-gray-400" />
          </div>
        )}

        {/* Document title */}
        <h4 className="font-serif text-lg text-navy-900 mb-1">
          {documentTitle}
        </h4>
        <p className="text-xs text-gray-600 mb-4">
          {documentType === 'notice' && 'Legal notice for demand of payment'}
          {documentType === 'letter' && 'Formal letter to concerned party'}
          {documentType === 'complaint' && 'Complaint document for filing'}
        </p>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onDownload}
            disabled={isLoading}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            <Download size={18} />
            <span>{isLoading ? 'Generating...' : 'Download PDF'}</span>
          </button>

          <button
            onClick={onEdit}
            className="flex-1 btn-secondary flex items-center justify-center gap-2"
          >
            <Edit2 size={18} />
            <span>Edit Details</span>
          </button>
        </div>
      </div>

      {/* Footer note */}
      <div className="px-4 py-3 bg-cream-50 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          📋 Review the document before sharing. You may need professional legal review before filing.
        </p>
      </div>
    </div>
  );
}
