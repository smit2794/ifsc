// src/pages/Reports/ReportsPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Eye,
  Calendar as CalendarIcon,
  Layers,
  FileCheck,
  FileText,
  RotateCw,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { DetailDrawer } from '../../components/ui/DetailDrawer';
import { DocumentPreview } from '../../components/ui/DocumentPreview';
import { FileUploadBox } from '../../components/ui/FileUploadBox';
import { HashBadge } from '../../components/ui/HashBadge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { buildLink } from '../../utils/buildLink';
import { useAppStore, useReports, useCurrentUser } from '../../store';
import {
  ReportInstanceItem,
  ReportCategory,
  ReportTemplateItem,
} from '../../types/report';

const REPORT_SECTIONS: Array<{
  category: ReportCategory;
  title: string;
  subtitle: string;
}> = [
  {
    category: 'QUARTERLY_ASSURANCE',
    title: 'Quarterly',
    subtitle: 'Periodic compliance assurance returns as configured per exchange template.',
  },
  {
    category: 'ANNUAL_COMPLIANCE_AUDIT',
    title: 'Annual Compliance Audit',
    subtitle: 'Statutory external compliance audit docket due annually by 30 September.',
  },
  {
    category: 'ANNUAL_SYSTEM_AUDIT',
    title: 'System Audit',
    subtitle: 'Algorithmic trading resilience, stress testing, and cyber controls audit.',
  },
  {
    category: 'TECHNICAL_GLITCH_REPORT',
    title: 'Technical Glitch',
    subtitle: 'Event-driven statutory glitch reporting (1-Hour Notice, T+1, 14-Day RCA).',
  },
  {
    category: 'REGULATORY_NOTIFICATION',
    title: 'Regulatory Notices',
    subtitle: 'Capital adequacy returns, grievance disposal reports, and DR drill filings.',
  },
  {
    category: 'OFFICER_CHANGE_FILING',
    title: 'Change Notifications',
    subtitle: 'Statutory 15-day prior disclosures for Key Managerial Personnel appointments.',
  },
];

export const ReportsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const reports = useReports();
  const reportTemplates = useAppStore((s) => s.reportTemplates);
  const currentUser = useCurrentUser();

  const addReport = useAppStore((s) => s.addReport);
  const markReportSubmitted = useAppStore((s) => s.markReportSubmitted);
  const acknowledgeFiling = useAppStore((s) => s.acknowledgeFiling);

  const rawTab = searchParams.get('tab');
  const activeTab = useMemo(() => {
    if (rawTab && ['dashboard', 'types', 'templates', 'calendar'].includes(rawTab)) return rawTab;
    return 'dashboard';
  }, [rawTab]);

  // Fallback redirect if invalid ?tab=
  useEffect(() => {
    if (rawTab && !['dashboard', 'types', 'templates', 'calendar'].includes(rawTab)) {
      const p: Record<string, string> = {};
      searchParams.forEach((v, k) => {
        p[k] = v;
      });
      p.tab = 'dashboard';
      navigate(buildLink('/reports', p), { replace: true });
    }
  }, [rawTab, navigate, searchParams]);
  const selectedReportId = searchParams.get('report');

  const selectedReport = useMemo(() => {
    return reports.find((r) => r.id === selectedReportId);
  }, [reports, selectedReportId]);

  // Tab switching helper
  const handleTabChange = (tab: string) => {
    navigate(buildLink('/reports', { tab }));
  };

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<ReportTemplateItem | null>(null);

  // Detail Drawer Validation state
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    hasRun: boolean;
    missingFields: Array<{ field: string; fixLink: string }>;
  }>({ hasRun: false, missingFields: [] });

  // Acknowledgement form state
  const [ackRefInput, setAckRefInput] = useState('');

  // New report form state
  const [selectedTemplateId, setSelectedTemplateId] = useState('TMPL-001');
  const [newReportPeriod, setNewReportPeriod] = useState('Q3 FY 2025-26');

  // KPI Calculations
  const totalReports = reports.length;
  const acknowledgedCount = reports.filter((r) => r.status === 'ACKNOWLEDGED').length;
  const submittedCount = reports.filter((r) => r.status === 'SUBMITTED').length;
  const draftCount = reports.filter((r) => r.status === 'DRAFT' || r.status === 'IN_PROGRESS').length;
  const ackRate = totalReports > 0 ? Math.round((acknowledgedCount / totalReports) * 100) : 0;

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch =
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.period.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reports, searchQuery, statusFilter]);

  // Handle Create Report Submit
  const handleCreateReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tmpl = reportTemplates.find((t) => t.id === selectedTemplateId) || reportTemplates[0];
    const newId = `RPT-2026-${(reports.length + 1).toString().padStart(3, '0')}`;

    const newReport: ReportInstanceItem = {
      id: newId,
      templateId: tmpl.id,
      title: `${tmpl.name} (${newReportPeriod})`,
      category: tmpl.category,
      period: newReportPeriod,
      dueDate: new Date(Date.now() + 15 * 86_400_000).toISOString(),
      status: 'DRAFT',
      preparedBy: currentUser.name,
      approver: tmpl.defaultApprover,
      hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    };

    addReport(newReport);
    setCreateModalOpen(false);
    toast.show({
      message: `Report ${newId} created. Detail drawer ready for compilation.`,
      variant: 'success',
    });
    navigate(buildLink('/reports', { tab: 'dashboard', report: newId }));
  };

  // Run Validation (1s Skeleton)
  const handleRunValidation = () => {
    setValidating(true);
    setValidationResult({ hasRun: false, missingFields: [] });

    setTimeout(() => {
      setValidating(false);
      if (selectedReport?.id === 'RPT-2026-GLT-03') {
        // RCA report still under compilation
        setValidationResult({
          hasRun: true,
          missingFields: [
            {
              field: 'Co-location network cross-connect packet capture log',
              fixLink: '/evidence?category=Trade%20Operations%20%26%20Logs',
            },
            {
              field: 'Secondary gateway failover latency attestation',
              fixLink: '/controls?control=OPS-BCP-002',
            },
          ],
        });
      } else {
        setValidationResult({ hasRun: true, missingFields: [] });
      }
    }, 1000);
  };

  // Export Report File (Strict toast text check)
  const handleExportReportFile = () => {
    toast.show({
      message: 'Report file prepared',
      variant: 'success',
    });
  };

  // Download Preview (Strict toast text check)
  const handleDownloadPreview = () => {
    toast.show({
      message: 'Preview ready',
      variant: 'success',
    });
  };

  // Mark Submitted via Official Channel
  const handleConfirmSubmitted = () => {
    if (!selectedReport) return;
    markReportSubmitted(selectedReport.id);
    setSubmitConfirmOpen(false);
    toast.show({
      message: `Report ${selectedReport.id} marked as submitted via official channel`,
      variant: 'success',
    });
  };

  // Upload Acknowledgement (Propagation #3)
  const handleConfirmAcknowledgement = () => {
    if (!selectedReport) return;
    const ref = ackRefInput.trim() || `IFSCA/ACK/${selectedReport.id.replace('RPT-', '')}/2026`;
    acknowledgeFiling(selectedReport.id, ref);
    setAckModalOpen(false);
    setAckRefInput('');
    toast.show({
      message: `Filing ACKNOWLEDGED with receipt ref ${ref}`,
      variant: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Regulatory Reports & Statutory Calendar"
        subtitle="Mandatory periodic disclosures, glitch notifications, and external audit submissions."
        actions={
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brandNavy text-white rounded-md text-xs font-semibold hover:bg-slate-900 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Report
          </button>
        }
      />

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
            Total Filings
          </span>
          <p className="text-2xl font-bold text-textPrimary mt-1">{totalReports}</p>
          <p className="text-[10px] text-textSecondary mt-0.5">Across 6 Statutory Categories</p>
        </div>
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
            Acknowledged
          </span>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{acknowledgedCount}</p>
          <p className="text-[10px] text-emerald-700 mt-0.5">Receipts sealed in Vault</p>
        </div>
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
            Submitted
          </span>
          <p className="text-2xl font-bold text-blue-700 mt-1">{submittedCount}</p>
          <p className="text-[10px] text-blue-700 mt-0.5">Awaiting Receipt Reference</p>
        </div>
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
            Draft / In Progress
          </span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{draftCount}</p>
          <p className="text-[10px] text-amber-700 mt-0.5">Compilation in Progress</p>
        </div>
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
            Acknowledgement Rate
          </span>
          <p className="text-2xl font-bold text-purple-700 mt-1">{ackRate}%</p>
          <p className="text-[10px] text-purple-700 mt-0.5">Statutory compliance ratio</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-borderColor">
        <button
          type="button"
          onClick={() => handleTabChange('dashboard')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'dashboard'
              ? 'border-brandNavy text-brandNavy bg-blue-50/40'
              : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-gray-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Statutory Filings Dashboard</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('types')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'types'
              ? 'border-brandNavy text-brandNavy bg-blue-50/40'
              : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-gray-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Report Types ({REPORT_SECTIONS.length})</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('templates')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'templates'
              ? 'border-brandNavy text-brandNavy bg-blue-50/40'
              : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-gray-50'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Report Templates ({reportTemplates.length})</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('calendar')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'calendar'
              ? 'border-brandNavy text-brandNavy bg-blue-50/40'
              : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-gray-50'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Statutory Filing Calendar</span>
        </button>
      </div>

      {/* TAB 1: DASHBOARD (ALL 6 STATUTORY REPORT TYPE SECTIONS) */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="p-3 bg-white border border-borderColor rounded-lg flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 text-textSecondary absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search reports by ID, title, or period..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-borderColor rounded-md focus:outline-none focus:ring-1 focus:ring-brandNavy focus:border-brandNavy"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 border border-borderColor rounded-md bg-white text-textPrimary focus:outline-none focus:ring-1 focus:ring-brandNavy"
            >
              <option value="ALL">All Filing Statuses</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DRAFT">Draft</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>

          {/* 6 Report Type Sections */}
          <div className="space-y-6">
            {REPORT_SECTIONS.map((sec) => {
              const secReports = filteredReports.filter((r) => r.category === sec.category);

              return (
                <div
                  key={sec.category}
                  className="bg-white border border-borderColor rounded-lg overflow-hidden shadow-xs"
                >
                  <div className="px-4 py-3 bg-slate-50 border-b border-borderColor flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                        {sec.title} ({secReports.length})
                      </h3>
                      <p className="text-[11px] text-textSecondary mt-0.5">{sec.subtitle}</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-borderColor text-[10px] font-bold text-textSecondary uppercase tracking-wider bg-white">
                          <th className="py-2.5 px-3.5">Filing ID</th>
                          <th className="py-2.5 px-3.5">Report Title</th>
                          <th className="py-2.5 px-3.5">Reporting Period</th>
                          <th className="py-2.5 px-3.5">Due Date</th>
                          <th className="py-2.5 px-3.5 text-center">Status</th>
                          <th className="py-2.5 px-3.5">Acknowledgement Ref</th>
                          <th className="py-2.5 px-3.5 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-borderColor">
                        {secReports.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-4 text-center text-textSecondary italic">
                              No reports in this category matching search filters.
                            </td>
                          </tr>
                        ) : (
                          secReports.map((rpt) => {
                            const isAck = rpt.status === 'ACKNOWLEDGED';
                            const isSub = rpt.status === 'SUBMITTED';

                            return (
                              <tr
                                key={rpt.id}
                                onClick={() =>
                                  navigate(buildLink('/reports', { tab: 'dashboard', report: rpt.id }))
                                }
                                className={`hover:bg-blue-50/40 cursor-pointer transition-colors ${
                                  rpt.id === 'RPT-2026-GLT-03' ? 'bg-amber-50/20' : ''
                                }`}
                              >
                                <td className="py-2.5 px-3.5 font-mono font-bold text-brandNavy">
                                  {rpt.id}
                                </td>
                                <td className="py-2.5 px-3.5 font-semibold text-textPrimary max-w-md">
                                  <div className="flex items-center gap-1.5">
                                    <span>{rpt.title}</span>
                                    {rpt.linkedIncidentId && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                        {rpt.linkedIncidentId}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3.5 text-textSecondary">{rpt.period}</td>
                                <td className="py-2.5 px-3.5 text-textSecondary font-mono text-[11px]">
                                  {new Date(rpt.dueDate).toLocaleDateString('en-GB')}
                                </td>
                                <td className="py-2.5 px-3.5 text-center">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                      isAck
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : isSub
                                        ? 'bg-blue-100 text-brandNavy'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {rpt.status}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-700">
                                  {rpt.acknowledgmentRef || '—'}
                                </td>
                                <td className="py-2.5 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      navigate(buildLink('/reports', { tab: 'dashboard', report: rpt.id }))
                                    }
                                    className="text-brandNavy hover:text-slate-900 font-semibold text-[11px] hover:underline"
                                  >
                                    View Detail
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: REPORT TYPES */}
      {activeTab === 'types' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORT_SECTIONS.map((sec) => (
            <div
              key={sec.category}
              className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <span className="font-mono text-[10px] font-bold text-brandNavy uppercase">{sec.category}</span>
                <h4 className="text-sm font-bold text-textPrimary leading-tight">{sec.title}</h4>
                <p className="text-[11px] text-textSecondary leading-relaxed">{sec.subtitle}</p>
              </div>
              <div className="pt-2 border-t border-borderColor flex items-center justify-between text-xs">
                <span className="text-textSecondary">
                  Active filings: <strong className="text-textPrimary">{reports.filter((r) => r.category === sec.category).length}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => handleTabChange('dashboard')}
                  className="text-brandNavy font-semibold text-[11px] hover:underline"
                >
                  View in Dashboard
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: TEMPLATES (10) */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTemplates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-brandNavy">{tmpl.code}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-gray-100 text-gray-700">
                    {tmpl.frequency}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-textPrimary leading-tight">{tmpl.name}</h4>
                <p className="text-[11px] text-textSecondary font-medium">
                  Form: {tmpl.statutoryForm} · {tmpl.governingRegulation}
                </p>
                <p className="text-[10px] text-textSecondary italic pt-1">
                  Deadline: {tmpl.deadlineRule}
                </p>
              </div>

              <div className="pt-2 border-t border-borderColor flex items-center justify-between">
                <span className="text-[10px] text-textSecondary">
                  Approver: <strong>{tmpl.defaultApprover}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(tmpl)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-brandNavy hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Template</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="bg-white border border-borderColor rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-brandNavy" />
              <span>Statutory Compliance Filing Schedule</span>
            </h3>
            <span className="text-xs text-textSecondary">Active Operational Year FY 2025-26</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {reports.slice(0, 9).map((r) => (
              <div
                key={r.id}
                onClick={() => navigate(buildLink('/reports', { tab: 'dashboard', report: r.id }))}
                className="p-3 rounded border border-borderColor hover:border-brandNavy hover:bg-blue-50/30 cursor-pointer transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-brandNavy">{r.id}</span>
                  <span className="text-[10px] font-mono text-textSecondary">
                    Due: {new Date(r.dueDate).toLocaleDateString('en-GB')}
                  </span>
                </div>
                <p className="font-semibold text-textPrimary truncate">{r.title}</p>
                <div className="flex items-center justify-between pt-1 text-[10px]">
                  <span className="text-textSecondary">{r.period}</span>
                  <span
                    className={`font-bold px-1.5 py-0.2 rounded ${
                      r.status === 'ACKNOWLEDGED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REPORT DETAIL DRAWER (?report=) */}
      {selectedReport && (
        <DetailDrawer
          title={`Filing Docket: ${selectedReport.id}`}
          subtitle={selectedReport.title}
          paramKey="report"
          width="w-full sm:max-w-lg lg:max-w-xl"
        >
          <div className="space-y-6 text-xs">
            {/* Status & Period Strip */}
            <div className="p-3.5 rounded-lg border border-borderColor bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-bold tracking-wider">
                  Category & Reporting Period
                </span>
                <p className="text-xs font-bold text-textPrimary mt-0.5">
                  {selectedReport.category} · {selectedReport.period}
                </p>
                <p className="text-[11px] text-textSecondary mt-0.5">
                  Prepared by: <strong className="text-textPrimary">{selectedReport.preparedBy}</strong>
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${
                    selectedReport.status === 'ACKNOWLEDGED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedReport.status === 'SUBMITTED'
                      ? 'bg-blue-100 text-brandNavy'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedReport.status}
                </span>
                <p className="text-[10px] font-mono text-textSecondary mt-1">
                  Due: {new Date(selectedReport.dueDate).toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>

            {/* Validation Section */}
            <div className="p-4 rounded-lg border border-borderColor bg-white space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-brandNavy" />
                  <span>Pre-Submission Integrity Validation</span>
                </h4>
                <button
                  type="button"
                  disabled={validating}
                  onClick={handleRunValidation}
                  className="px-2.5 py-1 bg-brandNavy text-white rounded text-xs font-semibold hover:bg-slate-900 transition-colors shadow-xs flex items-center gap-1"
                >
                  {validating ? (
                    <>
                      <RotateCw className="w-3 h-3 animate-spin" />
                      <span>Validating...</span>
                    </>
                  ) : (
                    <span>Run Validation</span>
                  )}
                </button>
              </div>

              {validating ? (
                <div className="space-y-2 pt-1 animate-pulse">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : validationResult.hasRun ? (
                validationResult.missingFields.length > 0 ? (
                  <div className="p-3 rounded bg-rose-50 border border-rose-200 text-xs space-y-2">
                    <span className="font-bold text-rose-900 block flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-700" />
                      <span>Validation Failed: Missing Critical Evidence Fields</span>
                    </span>
                    <ul className="space-y-1.5 text-[11px] text-rose-950">
                      {validationResult.missingFields.map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between">
                          <span>• {item.field}</span>
                          <Link
                            to={item.fixLink}
                            className="font-bold text-brandNavy underline hover:text-slate-900"
                          >
                            Fix
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>All mandatory regulatory fields and hash checksums validated successfully.</span>
                  </div>
                )
              ) : (
                <p className="text-[11px] text-textSecondary italic">
                  Run validation to check for missing reconciliation attachments or unsigned disclosures.
                </p>
              )}
            </div>

            {/* Cryptographic Seal & Hash */}
            <div className="p-4 rounded-lg border border-borderColor bg-white space-y-2.5">
              <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                Cryptographic Audit Hash
              </h4>
              <div className="p-2.5 rounded bg-slate-50 border border-borderColor flex items-center justify-between">
                <span className="font-mono text-[11px] text-slate-800 truncate mr-2">
                  {selectedReport.hash}
                </span>
                <HashBadge hash={selectedReport.hash} status="VERIFIED" />
              </div>
            </div>

            {/* Cross-Module Links */}
            <div className="p-4 rounded-lg border border-borderColor bg-white space-y-2.5">
              <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                Linked Compliance Objects
              </h4>
              <div className="space-y-1.5 text-xs">
                {selectedReport.linkedIncidentId && (
                  <div className="p-2 rounded bg-slate-50 border border-borderColor flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-textSecondary uppercase block">Linked Incident</span>
                      <span className="font-mono font-bold text-brandNavy">
                        {selectedReport.linkedIncidentId}
                      </span>
                    </div>
                    <Link
                      to={`/incidents/${selectedReport.linkedIncidentId}`}
                      className="text-xs font-semibold text-brandNavy hover:underline flex items-center gap-1"
                    >
                      <span>Open Incident</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}

                <div className="p-2 rounded bg-slate-50 border border-borderColor flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-textSecondary uppercase block">Obligation Rule</span>
                    <span className="font-mono font-bold text-brandNavy">OBL-007</span>
                  </div>
                  <Link
                    to={buildLink('/obligations', { obligation: 'OBL-007' })}
                    className="text-xs font-semibold text-brandNavy hover:underline flex items-center gap-1"
                  >
                    <span>Inspect Obligation</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-borderColor space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportReportFile}
                    className="px-3 py-1.5 bg-white border border-borderColor text-textPrimary rounded text-xs font-semibold hover:bg-gray-50 transition-colors shadow-xs"
                  >
                    Export report file
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPreview}
                    className="px-3 py-1.5 bg-white border border-borderColor text-textPrimary rounded text-xs font-semibold hover:bg-gray-50 transition-colors shadow-xs"
                  >
                    Download preview
                  </button>
                </div>

                {selectedReport.status !== 'ACKNOWLEDGED' && selectedReport.status !== 'SUBMITTED' && (
                  <button
                    type="button"
                    onClick={() => setSubmitConfirmOpen(true)}
                    className="px-3.5 py-1.5 bg-brandNavy text-white rounded text-xs font-semibold hover:bg-slate-900 transition-colors shadow-xs"
                  >
                    Mark as submitted via official channel
                  </button>
                )}

                {selectedReport.status === 'SUBMITTED' && (
                  <button
                    type="button"
                    onClick={() => setAckModalOpen(true)}
                    className="px-3.5 py-1.5 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-xs"
                  >
                    Upload acknowledgement
                  </button>
                )}
              </div>
            </div>
          </div>
        </DetailDrawer>
      )}

      {/* Modal: Create Report */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Initialize Statutory Report Instance"
        subtitle="Select approved template to generate pre-filled filing docket."
        size="md"
      >
        <form onSubmit={handleCreateReportSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
              Select Statutory Template
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full p-2 border border-borderColor rounded-md bg-white text-textPrimary"
            >
              {reportTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.code} — {t.name} ({t.frequency})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
              Reporting Period
            </label>
            <input
              type="text"
              required
              value={newReportPeriod}
              onChange={(e) => setNewReportPeriod(e.target.value)}
              placeholder="e.g. Q3 FY 2025-26"
              className="w-full p-2 border border-borderColor rounded-md focus:ring-1 focus:ring-brandNavy"
            />
          </div>

          <p className="text-[10px] text-textSecondary italic pt-1">
            New reports initialize in DRAFT state. Final submission requires designated officer authorization.
          </p>

          <div className="pt-3 border-t border-borderColor flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-slate-900 rounded shadow-xs"
            >
              Initialize Filing
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Preview Template */}
      {previewTemplate && (
        <Modal
          open={Boolean(previewTemplate)}
          onClose={() => setPreviewTemplate(null)}
          title={`Template: ${previewTemplate.code}`}
          subtitle={previewTemplate.name}
          size="md"
        >
          <div className="space-y-3 text-xs">
            <DocumentPreview
              fileName={`${previewTemplate.code}.pdf`}
              fileSize="1.2 MB"
              category={previewTemplate.category}
              uploadedAt="Official Gazette 2024"
              sha256="4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e"
            />

            <div className="p-3 bg-slate-50 border border-borderColor rounded space-y-1">
              <p><strong>Statutory Form:</strong> {previewTemplate.statutoryForm}</p>
              <p><strong>Governing Regulation:</strong> {previewTemplate.governingRegulation}</p>
              <p><strong>Statutory Deadline Rule:</strong> {previewTemplate.deadlineRule}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Upload Acknowledgement (Propagation #3) */}
      <Modal
        open={ackModalOpen}
        onClose={() => setAckModalOpen(false)}
        title="Upload Official Regulatory Acknowledgement"
        subtitle="Record receipt reference issued by IFSCA / Exchange Submission Portal."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setAckModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmAcknowledgement}
              className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 rounded shadow-xs"
            >
              Record Acknowledgement
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
              Acknowledgement Reference Number
            </label>
            <input
              type="text"
              value={ackRefInput}
              onChange={(e) => setAckRefInput(e.target.value)}
              placeholder="e.g. IFSCA/ACK/GLT/2026/014-R1"
              className="w-full p-2 border border-borderColor rounded-md focus:ring-1 focus:ring-emerald-600 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
              Upload Official PDF Receipt
            </label>
            <FileUploadBox
              accept=".pdf,.png"
              onUpload={(_file: File, hash: string) => {
                toast.show({
                  message: `Receipt sealed with SHA-256: ${hash.slice(0, 16)}...`,
                  variant: 'success',
                });
              }}
            />
          </div>
        </div>
      </Modal>

      {/* Confirm Dialog: Mark Submitted via official channel */}
      <ConfirmDialog
        open={submitConfirmOpen}
        onCancel={() => setSubmitConfirmOpen(false)}
        onConfirm={handleConfirmSubmitted}
        title="Mark as submitted via official channel"
        message="Confirm that this statutory filing has been formally submitted by a designated officer through the official regulatory portal. State will transition to SUBMITTED."
        confirmText="Mark as submitted via official channel"
        variant="primary"
      />
    </div>
  );
};

export default ReportsPage;
