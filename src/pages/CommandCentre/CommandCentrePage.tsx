// src/pages/CommandCentre/CommandCentrePage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Activity,
  ArrowRight,
  RefreshCw,
  Users,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { buildLink } from '../../utils/buildLink';
import { formatIST, formatTimeIST } from '../../utils/dateHelpers';
import { waitDelay } from '../../utils/delay';
import { useTicker } from '../../hooks/useTicker';
import {
  useCurrentUser,
  useControls,
  useIncidents,
  useObligations,
  useComplaints,
  useEvidence,
  useGovernance,
  useReports,
  useAIInvestigations,
  useActivityLog,
  useAppStore,
} from '../../store';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { CountdownClock } from '../../components/ui/CountdownClock';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';

export const CommandCentrePage: React.FC = () => {
  useTicker();
  const navigate = useNavigate();
  const { show } = useToast();

  const currentUser = useCurrentUser();
  const controls = useControls();
  const incidents = useIncidents();
  const obligations = useObligations();
  const complaints = useComplaints();
  const evidence = useEvidence();
  const governance = useGovernance();
  const reports = useReports();
  const aiInvestigations = useAIInvestigations();
  const changeProposals = useAppStore((s) => s.changeProposals);
  const activityLog = useActivityLog();

  const acceptAISuggestion = useAppStore((s) => s.acceptAISuggestion);
  const rejectAISuggestion = useAppStore((s) => s.rejectAISuggestion);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedDate, setLastRefreshedDate] = useState<Date>(new Date());

  // Modal state for rejecting AI suggestion
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedInvestigationId, setSelectedInvestigationId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // 1. Calculate Readiness Ring Stats
  // Formula: UNKNOWN is strictly excluded from denominator.
  const passCount = controls.filter((c) => c.status === 'PASS').length;
  const failCount = controls.filter((c) => c.status === 'FAIL').length;
  const warningCount = controls.filter((c) => c.status === 'WARNING').length;
  const unknownCount = controls.filter((c) => c.status === 'UNKNOWN').length;

  const evaluatedDenominator = passCount + failCount + warningCount;
  const compliantPercentage = evaluatedDenominator > 0
    ? Math.round((passCount / evaluatedDenominator) * 100)
    : 100;

  // 2. Data Slices
  const criticalExceptions = controls.filter((c) => c.status === 'FAIL');
  const urgentIncident = incidents.find((inc) => inc.status !== 'CLOSED') || incidents[0];
  const pendingAIItems = aiInvestigations.filter((inv) => inv.status === 'PENDING_REVIEW');

  // Top 5 critical/upcoming obligations
  const topObligations = obligations.slice(0, 5);

  // Evidence integrity stats
  const totalEvidence = evidence.length;
  const verifiedEvidence = evidence.filter((e) => e.hashStatus === 'VERIFIED').length;
  const mismatchEvidence = evidence.filter((e) => e.hashStatus === 'MISMATCH').length;

  // Complaints stats
  const activeComplaintsCount = complaints.filter((c) => c.status !== 'CLOSED').length;

  // Handle Refresh Data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await waitDelay(1500);
    setLastRefreshedDate(new Date());
    setIsRefreshing(false);
    show({ message: 'Regulatory telemetry refreshed', variant: 'success' });
  };

  // Run PO/CO Separation Check
  const handleRunSeparationCheck = () => {
    const poName = governance.officers.po.name;
    const coName = governance.officers.co.name;

    if (poName && coName && poName !== coName) {
      show({
        message: `Separation Check: PASS. Principal Officer (${poName}) and Compliance Officer (${coName}) held by distinct qualified officers.`,
        variant: 'success',
      });
    } else {
      show({
        message: 'Separation Check: FAIL. Conflict of interest detected between Principal Officer and Compliance Officer appointments.',
        variant: 'error',
      });
    }
  };

  const handleOpenRejectModal = (id: string) => {
    setSelectedInvestigationId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedInvestigationId || !rejectReason.trim()) return;
    rejectAISuggestion(selectedInvestigationId, rejectReason.trim());
    setRejectModalOpen(false);
    show({ message: 'AI suggestion rejected with audit log entry', variant: 'info' });
  };

  const handleConfirmAccept = (id: string) => {
    acceptAISuggestion(id);
    show({ message: 'AI proposal accepted and verified', variant: 'success' });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header with Welcome & Refresh Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-borderColor shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-textPrimary tracking-tight">
              Good day, {currentUser.name}
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
              Active Session
            </span>
          </div>
          <p className="text-xs text-textSecondary mt-1">
            Meridian Securities IFSC Limited · Broker Dealer & Clearing Member ·{' '}
            <span className="font-medium text-textPrimary">{formatIST(new Date())}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-borderColor hover:bg-gray-50 rounded-md text-textPrimary transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-textSecondary ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh data</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(buildLink('/tasks'))}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-brandNavy text-white hover:bg-brandNavy/90 rounded-md transition-all shadow-sm"
          >
            <span>Go to Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isRefreshing ? (
        <div className="bg-white p-8 rounded-lg border border-borderColor shadow-card space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
        </div>
      ) : (
        <>
          {/* Top KPI & Readiness Strip */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overall Regulatory Readiness Ring */}
            <div className="bg-white p-6 rounded-lg border border-borderColor shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-borderColor">
                  <h3 className="text-sm font-bold text-textPrimary flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brandNavy" />
                    Overall Regulatory Readiness
                  </h3>
                  <span className="text-[10px] text-textSecondary font-mono tabular-nums">
                    Refreshed: {formatTimeIST(lastRefreshedDate)}
                  </span>
                </div>

                <div className="flex items-center justify-around py-4">
                  <ProgressRing
                    percent={compliantPercentage}
                    size={130}
                    strokeWidth={12}
                    color="#002147"
                  />
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> PASS
                      </span>
                      <span className="font-bold tabular-nums text-textPrimary">{passCount}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1.5 text-rose-700 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> FAIL
                      </span>
                      <span className="font-bold tabular-nums text-rose-600">{failCount}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> WARNING
                      </span>
                      <span className="font-bold tabular-nums text-textPrimary">{warningCount}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-400" /> UNKNOWN
                      </span>
                      <span className="font-bold tabular-nums text-textSecondary">{unknownCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-bgPage p-2.5 rounded text-[11px] text-textSecondary border border-borderColor flex items-center justify-between">
                <span>Evaluated controls ({evaluatedDenominator} total)</span>
                <span className="font-bold text-brandNavy">{compliantPercentage}% Compliant</span>
              </div>
            </div>

            {/* Critical Exceptions Card */}
            <div className="bg-white p-6 rounded-lg border border-borderColor shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-borderColor">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <h3 className="text-sm font-bold text-textPrimary">Critical Exceptions</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(buildLink('/controls', { tab: 'exceptions' }))}
                    className="text-xs font-semibold text-brandNavy hover:underline"
                  >
                    View all
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  {criticalExceptions.length === 0 ? (
                    <div className="p-4 text-center text-xs text-textSecondary bg-emerald-50/60 rounded border border-emerald-200">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                      Zero critical exceptions detected. All continuous controls passing.
                    </div>
                  ) : (
                    criticalExceptions.map((ctrl) => (
                      <div
                        key={ctrl.id}
                        onClick={() => navigate(buildLink('/controls', { control: ctrl.id }))}
                        className="p-3 bg-rose-50/70 border border-rose-200 rounded-md cursor-pointer hover:bg-rose-100/60 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-rose-900">{ctrl.id}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-900">
                            CRITICAL FAIL
                          </span>
                        </div>
                        <p className="text-xs font-medium text-textPrimary mt-1 line-clamp-1">
                          {ctrl.title}
                        </p>
                        <p className="text-[11px] text-rose-800 mt-1 line-clamp-2">
                          {ctrl.exceptionDetail || ctrl.description}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {criticalExceptions.length > 0 && (
                <div className="pt-3 border-t border-borderColor mt-3 flex items-center justify-between">
                  <span className="text-xs text-textSecondary">Active investigation:</span>
                  <button
                    type="button"
                    onClick={() => navigate(buildLink('/clients/cases/CASE-2026-031'))}
                    className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 rounded transition-colors flex items-center gap-1.5"
                  >
                    <span>Open case (CASE-2026-031)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Staff & Officer Governance Coverage */}
            <div className="bg-white p-6 rounded-lg border border-borderColor shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-borderColor">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-brandNavy" />
                    <h3 className="text-sm font-bold text-textPrimary">Officer & Governance Role Coverage</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(buildLink('/governance', { tab: 'officers' }))}
                    className="text-xs font-semibold text-brandNavy hover:underline"
                  >
                    View all
                  </button>
                </div>

                <div className="mt-3 space-y-2.5 text-xs">
                  <div className="p-2.5 rounded bg-bgPage border border-borderColor flex items-center justify-between">
                    <div>
                      <p className="font-bold text-textPrimary">{governance.officers.po.name}</p>
                      <p className="text-[11px] text-textSecondary">{governance.officers.po.role}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                      Attested
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-bgPage border border-borderColor flex items-center justify-between">
                    <div>
                      <p className="font-bold text-textPrimary">{governance.officers.co.name}</p>
                      <p className="text-[11px] text-textSecondary">{governance.officers.co.role}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                      Attested
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-borderColor mt-3">
                <button
                  type="button"
                  onClick={handleRunSeparationCheck}
                  className="w-full py-2 bg-blue-50 text-brandNavy border border-blue-200 hover:bg-blue-100 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Run separation check</span>
                </button>
              </div>
            </div>
          </div>

          {/* Middle Row: Regulatory Deadlines & Active Glitch Incident */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Regulatory Deadlines Countdown Card */}
            <div className="bg-white p-6 rounded-lg border border-borderColor shadow-card">
              <div className="flex items-center justify-between pb-3 border-b border-borderColor">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brandNavy" />
                  <h3 className="text-sm font-bold text-textPrimary">Upcoming Regulatory Deadlines</h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(buildLink('/obligations'))}
                  className="text-xs font-semibold text-brandNavy hover:underline"
                >
                  View all
                </button>
              </div>

              <div className="mt-3 divide-y divide-borderColor">
                {topObligations.map((obl) => (
                  <div
                    key={obl.id}
                    onClick={() => navigate(buildLink('/obligations', { obligation: obl.id }))}
                    className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-gray-50 px-1 rounded transition-colors"
                  >
                    <div className="flex-1 pr-3">
                      <p className="text-xs font-bold text-textPrimary line-clamp-1">{obl.title}</p>
                      <p className="text-[11px] text-textSecondary mt-0.5">
                        {obl.statutoryReference} · {obl.frequency}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <CountdownClock targetTime={obl.dueDate} label="" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Open Incident & Technical Glitch Clocks */}
            <div className="bg-white p-6 rounded-lg border border-borderColor shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-borderColor">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-bold text-textPrimary">Open Incident & Statutory Clocks</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(buildLink('/incidents'))}
                    className="text-xs font-semibold text-brandNavy hover:underline"
                  >
                    View all
                  </button>
                </div>

                {urgentIncident ? (
                  <div className="mt-3 space-y-3">
                    <div className="p-3 bg-amber-50/70 rounded-md border border-amber-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900">{urgentIncident.id}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                          {urgentIncident.status} ({urgentIncident.durationMinutes}m Outage)
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-textPrimary mt-1">
                        {urgentIncident.title}
                      </p>
                      <p className="text-[11px] text-textSecondary mt-1 line-clamp-2">
                        {urgentIncident.description}
                      </p>
                    </div>

                    {urgentIncident.clocks && (
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 bg-bgPage border border-borderColor rounded">
                          <p className="text-[10px] text-textSecondary font-medium">1-Hour Notice</p>
                          <span className="inline-block mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {urgentIncident.clocks.initialNotice.status}
                          </span>
                        </div>
                        <div className="p-2 bg-bgPage border border-borderColor rounded">
                          <p className="text-[10px] text-textSecondary font-medium">T+1 Report</p>
                          <span className="inline-block mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {urgentIncident.clocks.preliminaryReport.status}
                          </span>
                        </div>
                        <div className="p-2 bg-bgPage border border-borderColor rounded">
                          <p className="text-[10px] text-textSecondary font-medium">14-Day RCA</p>
                          <div className="mt-1">
                            <CountdownClock targetTime={urgentIncident.clocks.rcaReport.deadline} label="" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-textSecondary">
                    Zero open incidents.
                  </div>
                )}
              </div>

              {urgentIncident && (
                <div className="pt-3 border-t border-borderColor mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate(buildLink(`/incidents/${urgentIncident.id}`))}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-brandNavy/90 rounded transition-colors flex items-center gap-1.5"
                  >
                    <span>Open incident ({urgentIncident.id})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Third Row: Operational Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Complaint Ageing */}
            <div className="bg-white p-4 rounded-lg border border-borderColor shadow-card">
              <div className="flex items-center justify-between pb-2 border-b border-borderColor">
                <span className="text-xs font-bold text-textPrimary">Complaint Ageing</span>
                <button
                  type="button"
                  onClick={() => navigate(buildLink('/complaints'))}
                  className="text-[11px] text-brandNavy font-medium hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-textPrimary tabular-nums">
                  {activeComplaintsCount}
                </span>
                <span className="text-xs text-textSecondary">Active grievances</span>
              </div>
              <p className="text-[11px] text-textSecondary mt-2">
                15 total filed. 3 complaints approaching 30-day resolution target.
              </p>
            </div>

            {/* Report Readiness */}
            <div className="bg-white p-4 rounded-lg border border-borderColor shadow-card">
              <div className="flex items-center justify-between pb-2 border-b border-borderColor">
                <span className="text-xs font-bold text-textPrimary">Report Readiness</span>
                <button
                  type="button"
                  onClick={() => navigate(buildLink('/reports'))}
                  className="text-[11px] text-brandNavy font-medium hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-textPrimary tabular-nums">
                  {reports.filter((r) => r.status === 'SUBMITTED' || r.status === 'ACKNOWLEDGED').length} / {reports.length}
                </span>
                <span className="text-xs text-emerald-700 font-medium">Lodged & ACK</span>
              </div>
              <p className="text-[11px] text-textSecondary mt-2">
                Next annual compliance audit due: 30 September.
              </p>
            </div>

            {/* Net-Worth & Capital Adequacy */}
            <div className="bg-white p-4 rounded-lg border border-borderColor shadow-card">
              <div className="flex items-center justify-between pb-2 border-b border-borderColor">
                <span className="text-xs font-bold text-textPrimary">Net-Worth & BMC</span>
                <button
                  type="button"
                  onClick={() => navigate(buildLink('/controls', { control: 'FIN-CAP-001' }))}
                  className="text-[11px] text-brandNavy font-medium hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-textPrimary tabular-nums">USD 4.82M</span>
                <span className="text-xs font-bold text-emerald-700">1.61x floor</span>
              </div>
              <p className="text-[11px] text-textSecondary mt-2">
                USD 3.00M minimum regulatory requirement strictly maintained.
              </p>
            </div>

            {/* Evidence Room Coverage & Hashes */}
            <div className="bg-white p-4 rounded-lg border border-borderColor shadow-card">
              <div className="flex items-center justify-between pb-2 border-b border-borderColor">
                <span className="text-xs font-bold text-textPrimary">Evidence Integrity</span>
                <button
                  type="button"
                  onClick={() => navigate(buildLink('/evidence'))}
                  className="text-[11px] text-brandNavy font-medium hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-textPrimary tabular-nums">
                  {verifiedEvidence} / {totalEvidence}
                </span>
                <span className="text-xs text-emerald-700 font-medium">Verified</span>
              </div>
              <p className="text-[11px] text-rose-600 font-medium mt-2">
                {mismatchEvidence} item flagged with hash mismatch (isolated under hold).
              </p>
            </div>
          </div>

          {/* Fourth Row: Pending AI Proposals & Regulatory Updates */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending AI Reviews */}
            <div className="bg-white p-6 rounded-lg border border-borderColor shadow-card">
              <div className="flex items-center justify-between pb-3 border-b border-borderColor">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brandNavy" />
                  <h3 className="text-sm font-bold text-textPrimary">Pending AI Syntheses & Reviews</h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(buildLink('/ai', { tab: 'review' }))}
                  className="text-xs font-semibold text-brandNavy hover:underline"
                >
                  Open AI Review
                </button>
              </div>

              <div className="mt-3 space-y-3">
                {pendingAIItems.length === 0 ? (
                  <p className="p-4 text-center text-xs text-textSecondary">
                    All automated AI proposals have been reviewed and attested.
                  </p>
                ) : (
                  pendingAIItems.map((inv) => (
                    <div key={inv.id} className="p-3 bg-blue-50/50 border border-blue-200 rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brandNavy">{inv.title}</span>
                        <span className="text-[10px] font-semibold bg-blue-100 text-brandNavy px-2 py-0.5 rounded">
                          {inv.id}
                        </span>
                      </div>
                      <p className="text-xs text-textSecondary mt-1">{inv.summary}</p>
                      <div className="mt-3 pt-2 border-t border-blue-200/60 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => navigate(buildLink('/ai', { tab: 'review', investigation: inv.id }))}
                          className="text-xs font-semibold text-brandNavy hover:underline"
                        >
                          Inspect detail
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleConfirmAccept(inv.id)}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 rounded transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Accept</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenRejectModal(inv.id)}
                            className="px-2.5 py-1 text-xs font-semibold bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 rounded transition-colors flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Regulatory Updates & Circular Amendments */}
            <div className="bg-white p-6 rounded-lg border border-borderColor shadow-card">
              <div className="flex items-center justify-between pb-3 border-b border-borderColor">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brandNavy" />
                  <h3 className="text-sm font-bold text-textPrimary">Regulatory Changes & Circular Tracker</h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(buildLink('/ai', { tab: 'sources' }))}
                  className="text-xs font-semibold text-brandNavy hover:underline"
                >
                  View all
                </button>
              </div>

              <div className="mt-3 divide-y divide-borderColor text-xs">
                {changeProposals.slice(0, 4).map((prop) => (
                  <div key={prop.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-textPrimary">{prop.clauseTitle}</p>
                      <p className="text-[11px] text-textSecondary mt-0.5">
                        Ref: {prop.proposalRef} · Stage: <span className="font-semibold text-brandNavy">{prop.stage}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(buildLink('/ai', { tab: 'sources', source: prop.sourceId }))}
                      className="px-2.5 py-1 text-xs font-medium border border-borderColor hover:bg-gray-50 rounded transition-colors"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row: Recent Activity Log */}
          <div className="bg-white p-6 rounded-lg border border-borderColor shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-borderColor">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-brandNavy" />
                <h3 className="text-sm font-bold text-textPrimary">Recent Activity Timeline</h3>
              </div>
              <button
                type="button"
                onClick={() => navigate(buildLink('/metrics'))}
                className="text-xs font-semibold text-brandNavy hover:underline"
              >
                View all analytics
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {activityLog.slice(0, 6).map((item) => (
                <div key={item.id} className="flex items-start justify-between text-xs py-1.5 border-b border-borderColor/50 last:border-0">
                  <div className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-brandNavy shrink-0 mt-1.5" />
                    <div>
                      <span className="font-bold text-textPrimary">{item.actor}</span>
                      <span className="text-textSecondary ml-1.5">{item.details}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-textSecondary shrink-0 font-mono tabular-nums">
                    {formatTimeIST(new Date(item.timestamp))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Reject Modal with Mandatory Reason */}
      <Modal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject AI Suggestion"
        subtitle="Mandatory regulatory audit requirement: explain why proposal was not accepted."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReject}
              disabled={!rejectReason.trim()}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-700 text-white hover:bg-rose-800 rounded disabled:opacity-50"
            >
              Confirm Rejection
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-textPrimary">
            Rejection Rationale <span className="text-rose-600">*</span>
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            placeholder="Explain why this synthesized remediation proposal does not meet institutional or regulatory requirements..."
            className="w-full p-2.5 text-xs border border-borderColor rounded-md focus:outline-none focus:ring-2 focus:ring-brandNavy"
          />
        </div>
      </Modal>
    </div>
  );
};

export default CommandCentrePage;
