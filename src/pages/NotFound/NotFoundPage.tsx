// src/pages/NotFound/NotFoundPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { buildLink } from '../../utils/buildLink';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-full bg-blue-50 text-brandNavy flex items-center justify-center mb-4 border border-blue-100">
        <FileQuestion className="w-8 h-8" />
      </div>

      <span className="text-xs font-bold tracking-widest text-brandNavy uppercase mb-1">
        404 — Resource Not Located
      </span>

      <h1 className="text-2xl sm:text-3xl font-bold text-textPrimary tracking-tight mb-2">
        Page Not Found
      </h1>

      <p className="max-w-md text-sm text-textSecondary mb-6">
        The requested URL is not an active route in IFSC TrustOps workspace. Please verify the URL or return to the Command Centre dashboard.
      </p>

      <Link
        to={buildLink('/')}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-brandNavy text-white font-medium text-xs shadow-sm hover:bg-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-brandNavy focus:ring-offset-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Command Centre
      </Link>
    </div>
  );
};

export default NotFoundPage;
