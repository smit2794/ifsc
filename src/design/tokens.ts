// src/design/tokens.ts
// Light theme ONLY. No dark mode options or dark styles.

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type HashStatus = 'VERIFIED' | 'MISMATCH' | 'UNVERIFIED';

export const tokens = {
  colors: {
    bgPage: '#F6F8FB',
    bgSurface: '#FFFFFF',
    border: '#E3E8EF',

    textPrimary: '#101828',
    textSecondary: '#475467',

    brandNavy: '#1D3A8A',
    brandTeal: '#0F9D8A',

    status: {
      pass: { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
      fail: { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
      warning: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
      unknown: { bg: '#F1F5F9', text: '#475467', border: '#CBD5E1' },
      notApplicable: { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE' },
    },

    severity: {
      critical: { bg: '#FEE2E2', text: '#7F1D1D' },
      high: { bg: '#FFEDD5', text: '#7C2D12' },
      medium: { bg: '#FEF3C7', text: '#78350F' },
      low: { bg: '#F0FDF4', text: '#14532D' },
    },
  },

  radius: {
    sm: '6px',
    md: '12px',
    lg: '16px',
    full: '9999px',
  },

  shadow: {
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.08)',
    md: '0 4px 12px 0 rgb(0 0 0 / 0.08)',
    lg: '0 8px 24px 0 rgb(0 0 0 / 0.10)',
  },

  layout: {
    sidebar: { width: '240px', collapsed: '64px' },
    drawer: { width: '480px' },
    aiPanel: { width: '400px' },
  },
} as const;
