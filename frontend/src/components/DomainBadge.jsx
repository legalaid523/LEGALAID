import React from 'react';
import { Home, Briefcase, ShoppingBag } from 'lucide-react';

const DOMAIN_CONFIG = {
  tenant: { icon: Home, label: 'Tenant Dispute' },
  labor: { icon: Briefcase, label: 'Labor Issue' },
  consumer: { icon: ShoppingBag, label: 'Consumer Dispute' },
};

/**
 * Domain pill — shown above chat once classified
 */
export default function DomainBadge({ domain, confidence }) {
  const normalizedKey = (domain || '').toLowerCase().trim();
  let key = 'tenant';
  if (normalizedKey.includes('labor') || normalizedKey.includes('work') || normalizedKey.includes('employment')) {
    key = 'labor';
  } else if (normalizedKey.includes('consumer') || normalizedKey.includes('shop') || normalizedKey.includes('purchase')) {
    key = 'consumer';
  } else if (normalizedKey.includes('tenant') || normalizedKey.includes('rent') || normalizedKey.includes('house') || normalizedKey.includes('landlord')) {
    key = 'tenant';
  }

  const config = DOMAIN_CONFIG[key] ?? DOMAIN_CONFIG.tenant;
  const Icon = config.icon;

  return (
    <div className="flex justify-center mb-5">
      <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border-2 border-gold-500/40 bg-navy-900 text-cream-50 shadow-md min-h-[44px]">
        <Icon size={20} className="text-gold-500" aria-hidden />
        <span className="text-sm font-semibold tracking-wide">{config.label}</span>
        {confidence != null && (
          <span className="text-xs text-gold-500/90 font-medium">
            {(confidence * 100).toFixed(0)}% match
          </span>
        )}
      </div>
    </div>
  );
}
