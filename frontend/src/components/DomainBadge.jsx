import React from 'react';
import { Home, Briefcase, ShoppingBag } from 'lucide-react';

/**
 * DomainBadge Component
 * Shows the classified domain with icon and label
 */
export default function DomainBadge({ domain, confidence }) {
  const domainConfig = {
    tenant: {
      icon: Home,
      label: 'Tenant Dispute',
      color: 'bg-blue-50 text-blue-900 border-blue-200',
      iconColor: 'text-blue-600',
    },
    labor: {
      icon: Briefcase,
      label: 'Labor Issue',
      color: 'bg-amber-50 text-amber-900 border-amber-200',
      iconColor: 'text-amber-600',
    },
    consumer: {
      icon: ShoppingBag,
      label: 'Consumer Dispute',
      color: 'bg-green-50 text-green-900 border-green-200',
      iconColor: 'text-green-600',
    },
  };

  const config = domainConfig[domain] || domainConfig.tenant;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border ${config.color} mb-4`}>
      <Icon size={18} className={config.iconColor} />
      <span className="text-sm font-semibold">{config.label}</span>
      {confidence && (
        <span className="text-xs opacity-75">
          ({(confidence * 100).toFixed(0)}% match)
        </span>
      )}
    </div>
  );
}
