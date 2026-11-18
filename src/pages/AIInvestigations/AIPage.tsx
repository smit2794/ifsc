// src/pages/AIInvestigations/AIPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  ShieldAlert,
  History,
  FileText,
  Check,
  X,
  ExternalLink,
  PlusCircle,
  RotateCw,
  Eye,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { DiffViewer } from '../../components/ui/DiffViewer';
import { DocumentPreview } from '../../components/ui/DocumentPreview';
import { ApprovalPanel } from '../../components/ui/ApprovalPanel';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { buildLink } from '../../utils/buildLink';
import {
  useAppStore,
  useAIInvestigations,
  useRegulations,
  useCurrentUser,
} from '../../store';
import { AIAgentCardItem } from '../../types/ai';
import { RegulationSourceItem, RegulationChangeProposalItem } from '../../types/regulation';

interface AgentCannotDoMap {
  [agentId: string]: {
    allowedTools: string[];
    cannotDo: string[];
  };
}

const AGENT_RESTRICTIONS: AgentCannotDoMap = {
  'AGT-01': {
    allowedTools: ['Scheduler Telemetry', 'Statutory Clock Tracker', 'Draft Filing Synthesizer'],
    cannotDo: [
      'Cannot submit regulatory filings autonomously to IFSCA portal',
      'Cannot modify statutory reporting deadlines or clock countdowns',
      'Cannot waive glitch qualification criteria without officer sign-off',
    ],
  },
  'AGT-02': {
    allowedTools: ['IAM Connector Crawler', 'Permission Matrix Cross-Checker', 'Role Gap Analyzer'],
    cannotDo: [
      'Cannot modify active directory entitlements or revoke roles directly',
      'Cannot close SoD exception cases without verified evidence',
      'Cannot grant temporary dual-role exemptions',
    ],
  },
  'AGT-03': {
    allowedTools: ['WebCrypto SHA-256 Hasher', 'WORM Storage Verifier', 'Hash Chain Auditor'],
    cannotDo: [
      'Cannot delete, edit, or purge sealed evidence dossiers',
      'Cannot alter 8-year statutory retention schedules',
      'Cannot suppress checksum mismatch alerts',
    ],
  },
  'AGT-04': {
    allowedTools: ['UN/OFAC Watchlist Screener', 'Adverse Media Crawler', 'Fuzzy Match Classifier'],
    cannotDo: [
      'Cannot automatically whitelist sanctioned or PEP matches',
      'Cannot lift client account restrictions autonomously',
      'Cannot lower client AML risk tier without compliance approval',
    ],
  },
  'AGT-05': {
    allowedTools: ['Exchange FIX Drop-Copy Parser', 'Margin Ledger Comparator', 'Drift Detector'],
    cannotDo: [
      'Cannot execute offsetting financial journal adjustments',
      'Cannot alter trade execution timestamps or prices',
      'Cannot waive exchange clearing collateral shortfalls',
    ],
  },
  'AGT-06': {
    allowedTools: ['SOC-2 Type II Parser', 'Vendor Due-Diligence Checklist', 'BCP Drill Evaluator'],
    cannotDo: [
      'Cannot execute or sign cloud vendor Master Service Agreements',
      'Cannot alter vendor Tier 1 materiality classification',
      'Cannot grant security audit exception waivers',
    ],
  },
  'AGT-07': {
    allowedTools: ['Circular Diff Generator', 'Obligation Mapping Modeler', 'Clause Cross-Referencer'],
    cannotDo: [
      'Cannot amend institutional compliance policies autonomously',
      'Cannot enact regulatory proposals without dual officer sign-off',
      'Cannot publish external legal memoranda',
    ],
  },
};

const SEED_RUN_LOG = [
  {
    id: 'log-001',
    timestamp: '14:22:10 IST',
    agent: 'AGT-02 (SoD Inspector)',
    action: 'Crawl IAM Groups',
    detail: 'Detected conflict for USR-005 in IAM-GRP-COMPLIANCE-REVIEW.',
    status: 'COMPLETED',
  },
  {
    id: 'log-002',
    timestamp: '12:05:40 IST',
    agent: 'AGT-01 (Clock Monitor)',
    action: 'Direct Gateway Submission',
    detail: 'Attempted outbound POST to https://portal.ifsca.gov.in/glitch — Action blocked by Institutional Boundary Interceptor (Strict human officer submission required).',
    status: 'BLOCKED',
  },
  {
    id: 'log-003',
    timestamp: '10:35:12 IST',
    agent: 'AGT-03 (Seal Validator)',
    action: 'Verify Vault Hashes',
    detail: 'Verified 40 SHA-256 document checksums; detected 1 mismatch on EVD-038.',
    status: 'COMPLETED',
  },
  {
    id: 'log-004',
    timestamp: '09:15:00 IST',
    agent: 'AGT-07 (Change Modeler)',
    action: 'Clause Diff Generation',
    detail: 'Generated side-by-side comparison for PROP-CMI-9(2).',
    status: 'COMPLETED',
  },
];

export const AIPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawTab = searchParams.get('tab');
  const activeTab = useMemo(() => {
    if (rawTab && ['dashboard', 'investigate', 'history', 'review', 'sources'].includes(rawTab)) return rawTab;
    return 'dashboard';
  }, [rawTab]);

  // Fallback redirect if invalid ?tab=
  useEffect(() => {
    if (rawTab && !['dashboard', 'investigate', 'history', 'review', 'sources'].includes(rawTab)) {
      const p: Record<string, string> = {};
      searchParams.forEach((v, k) => {
        p[k] = v;
      });
      p.tab = 'dashboard';
      navigate(buildLink('/ai', p), { replace: true });
    }
  }, [rawTab, navigate, searchParams]);

  const aiAgents = useAppStore((s) => s.aiAgents);
  const aiInvestigations = useAIInvestigations();
  const regulations = useRegulations();
  const changeProposals = useAppStore((s) => s.changeProposals);
  const currentUser = useCurrentUser();

  const acceptAISuggestion = useAppStore((s) => s.acceptAISuggestion);
  const rejectAISuggestion = useAppStore((s) => s.rejectAISuggestion);
  const createTaskFromSuggestion = useAppStore((s) => s.createTaskFromSuggestion);
  const sendProposalToLegalReview = useAppStore((s) => s.sendProposalToLegalReview);
  const approveRegulationChange = useAppStore((s) => s.approveRegulationChange);

  const toast = useToast();
  const [previewSource, setPreviewSource] = useState<RegulationSourceItem | null>(null);
  const [approveProposal, setApproveProposal] = useState<RegulationChangeProposalItem | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AIAgentCardItem | null>(null);
  const [runningAgentId, setRunningAgentId] = useState<string | null>(null);
  const [agentRunResult, setAgentRunResult] = useState<string | null>(null);

  // Edit draft modal
  const [editDraftOpen, setEditDraftOpen] = useState(false);
  const [draftContent, setDraftContent] = useState('');

  // Reject modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleTabChange = (tab: string) => {
    navigate(buildLink('/ai', { tab }));
  };

  // Start Agent Investigation Run
  const handleStartAgentRun = (agent: AIAgentCardItem) => {
    setSelectedAgent(agent);
    setRunningAgentId(agent.id);
    setAgentRunResult(null);

    setTimeout(() => {
      setRunningAgentId(null);
      setAgentRunResult(
        `Investigation run by ${agent.name} completed successfully.\n` +
          `Confidence Score: ${agent.confidenceThreshold}%. Verified against institutional telemetry and GIFT IFSC regulations.\n` +
          `Finding: Telemetry within defined thresholds; zero critical bypass conditions observed outside flagged exceptions.`
      );
      toast.show({ message: `Agent ${agent.id} investigation complete`, variant: 'success' });
    }, 1200);
  };

  // Accept Suggestion (Propagation #6)
  const handleAccept = (invId: string) => {
    acceptAISuggestion(invId);
    toast.show({
      message: `AI Suggestion ${invId} ACCEPTED and recorded in audit log`,
      variant: 'success',
    });
  };

  // Reject Suggestion (Propagation #7)
  const handleOpenReject = (invId: string) => {
    setRejectTargetId(invId);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!rejectTargetId || !rejectReason.trim()) return;
    rejectAISuggestion(rejectTargetId, rejectReason.trim());
    setRejectModalOpen(false);
    toast.show({
      message: `AI Suggestion ${rejectTargetId} REJECTED with mandatory reason recorded`,
      variant: 'info',
    });
  };

  // Create Task (Propagation #8)
  const handleCreateTask = (inv: { id: string; title: string; summary: string }) => {
    createTaskFromSuggestion({
      title: `Remediate ${inv.title}`,
      description: inv.summary,
      priority: 'HIGH',
      category: 'EXCEPTION_REMEDIATION',
    });
    toast.show({ message: `Task created from AI suggestion ${inv.id}`, variant: 'success' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="AI Investigations & Intelligence"
        subtitle="Read-only investigative agents, regulation circular analysis, and human-in-the-loop review queue."
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              7 Autonomous Agents Active
            </span>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-borderColor overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Dashboard & Metrics', icon: Layers },
          { id: 'investigate', label: 'Investigative Agents (7)', icon: Bot },
          { id: 'history', label: 'Investigation History', icon: History },
          { id: 'review', label: 'Review Queue', icon: Sparkles },
          { id: 'sources', label: 'Regulation Sources (12)', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'border-brandNavy text-brandNavy bg-blue-50/40'
                  : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD & METRICS */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs">
              <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                Runs This Week
              </span>
              <p className="text-2xl font-bold text-textPrimary mt-1">14</p>
              <p className="text-[10px] text-textSecondary mt-0.5">Automated telemetry crawls</p>
            </div>
            <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs">
              <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                Acceptance Rate
              </span>
              <p className="text-2xl font-bold text-emerald-700 mt-1">94%</p>
              <p className="text-[10px] text-emerald-700 mt-0.5">Approved by Compliance Officers</p>
            </div>
            <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs">
              <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                Pending Reviews
              </span>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {aiInvestigations.filter((i) => i.status === 'PENDING_REVIEW').length}
              </p>
              <p className="text-[10px] text-amber-700 mt-0.5">Awaiting human sign-off</p>
            </div>
            <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs">
              <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                Blocked Actions
              </span>
              <p className="text-2xl font-bold text-rose-700 mt-1">1</p>
              <p className="text-[10px] text-rose-700 mt-0.5">Boundary interceptor enforced</p>
            </div>
          </div>

          {/* AI Run Log & Blocked Actions Section */}
          <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-brandNavy" />
                <span>AI Execution Log & Boundary Enforcement</span>
              </h3>
              <span className="text-[10px] text-textSecondary">Append-Only Telemetry</span>
            </div>

            <div className="space-y-2">
              {SEED_RUN_LOG.map((log) => {
                const isBlocked = log.status === 'BLOCKED';

                return (
                  <div
                    key={log.id}
                    className={`p-3 rounded-md border text-xs flex items-start justify-between gap-3 ${
                      isBlocked
                        ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                        : 'bg-slate-50 border-borderColor text-textPrimary'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold ${
                            isBlocked ? 'bg-rose-200 text-rose-900' : 'bg-blue-100 text-brandNavy'
                          }`}
                        >
                          {log.status}
                        </span>
                        <span className="font-semibold">{log.agent}</span>
                        <span className="text-textSecondary text-[11px]">· {log.action}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">{log.detail}</p>
                    </div>
                    <span className="font-mono text-[10px] text-textSecondary shrink-0">
                      {log.timestamp}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVESTIGATIVE AGENTS (7) */}
      {activeTab === 'investigate' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiAgents.map((agent) => {
              const restrictions = AGENT_RESTRICTIONS[agent.id] || {
                allowedTools: ['Read-Only Telemetry'],
                cannotDo: ['Cannot execute mutations without human officer review'],
              };
              const isRunning = runningAgentId === agent.id;

              return (
                <div
                  key={agent.id}
                  className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-brandNavy">
                          {agent.id}
                        </span>
                        <h4 className="text-xs font-bold text-textPrimary leading-tight">
                          {agent.name}
                        </h4>
                        <p className="text-[10px] text-textSecondary font-medium mt-0.5">
                          {agent.specialization}
                        </p>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                        {agent.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-textSecondary leading-relaxed">
                      {agent.description}
                    </p>

                    {/* Allowed Tools */}
                    <div>
                      <span className="text-[10px] font-bold text-textSecondary uppercase block mb-1">
                        Allowed Read-Only Tools:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {restrictions.allowedTools.map((tool, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-brandNavy border border-blue-200"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Cannot Do List */}
                    <div className="p-2.5 rounded bg-rose-50/50 border border-rose-200">
                      <span className="text-[10px] font-bold text-rose-900 uppercase block mb-1">
                        Strict Product Boundaries ("Cannot Do"):
                      </span>
                      <ul className="list-disc list-inside text-[10px] text-rose-800 space-y-0.5">
                        {restrictions.cannotDo.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-borderColor flex items-center justify-between">
                    <span className="text-[10px] text-textSecondary">
                      Verified Runs: <strong className="text-textPrimary">{agent.verifiedOutputsCount}</strong>
                    </span>
                    <button
                      type="button"
                      disabled={isRunning}
                      onClick={() => handleStartAgentRun(agent)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-brandNavy text-white text-xs font-semibold hover:bg-slate-900 disabled:opacity-50 transition-colors shadow-xs"
                    >
                      {isRunning ? (
                        <>
                          <RotateCw className="w-3 h-3 animate-spin" />
                          <span>Running...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>Start Run</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Agent Output Card */}
          {agentRunResult && selectedAgent && (
            <div className="p-4 rounded-lg border border-blue-300 bg-blue-50/50 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brandNavy flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Agent Output: {selectedAgent.name} ({selectedAgent.id})</span>
                </span>
                <button
                  type="button"
                  onClick={() => setAgentRunResult(null)}
                  className="text-textSecondary hover:text-textPrimary text-xs"
                >
                  Dismiss
                </button>
              </div>
              <p className="text-xs text-textPrimary whitespace-pre-wrap leading-relaxed">
                {agentRunResult}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INVESTIGATION HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white border border-borderColor rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-borderColor text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                  <th className="py-2.5 px-3.5">Investigation ID</th>
                  <th className="py-2.5 px-3.5">Target Entity</th>
                  <th className="py-2.5 px-3.5">Synthesis Finding</th>
                  <th className="py-2.5 px-3.5 text-center">Status</th>
                  <th className="py-2.5 px-3.5">Created At</th>
                  <th className="py-2.5 px-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderColor">
                {aiInvestigations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2.5 px-3.5 font-mono font-bold text-brandNavy">
                      {inv.id}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-[11px] text-textSecondary">
                      {inv.targetEntity}
                    </td>
                    <td className="py-2.5 px-3.5 max-w-md">
                      <p className="font-semibold text-textPrimary">{inv.title}</p>
                      <p className="text-[11px] text-textSecondary line-clamp-1">{inv.summary}</p>
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-textSecondary text-[11px]">
                      {new Date(inv.createdAt).toLocaleString('en-GB')}
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      {inv.targetEntity.startsWith('CASE') ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/clients/cases/${inv.targetEntity}`)}
                          className="text-brandNavy font-semibold text-[11px] hover:underline"
                        >
                          View Case
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleTabChange('review')}
                          className="text-brandNavy font-semibold text-[11px] hover:underline"
                        >
                          Inspect
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: REVIEW QUEUE */}
      {activeTab === 'review' && (
        <div className="space-y-4">
          {aiInvestigations.map((inv) => (
            <div
              key={inv.id}
              className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-borderColor pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-brandNavy">{inv.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-textPrimary mt-0.5">{inv.title}</h4>
                </div>

                <span className="text-[10px] text-textSecondary">
                  Target: <strong className="font-mono text-textPrimary">{inv.targetEntity}</strong>
                </span>
              </div>

              <p className="text-xs text-textPrimary leading-relaxed">{inv.summary}</p>

              {inv.rejectionReason && (
                <div className="p-2 rounded bg-rose-50 border border-rose-200 text-xs text-rose-900">
                  <strong>Rejection Rationale:</strong> {inv.rejectionReason}
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 border-t border-borderColor flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {inv.status === 'PENDING_REVIEW' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAccept(inv.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-brandNavy text-white text-xs font-semibold hover:bg-slate-900 rounded shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept Proposal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenReject(inv.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-rose-300 text-rose-700 text-xs font-semibold hover:bg-rose-50 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDraftContent(inv.summary);
                          setEditDraftOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-textSecondary hover:bg-gray-100 rounded"
                      >
                        Edit Draft
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => handleCreateTask(inv)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 text-brandNavy text-xs font-semibold hover:bg-blue-100 rounded"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Create Task from Suggestion</span>
                  </button>
                </div>

                {inv.targetEntity.startsWith('CASE') && (
                  <button
                    type="button"
                    onClick={() => navigate(`/clients/cases/${inv.targetEntity}`)}
                    className="text-xs font-semibold text-brandNavy hover:underline flex items-center gap-1"
                  >
                    <span>Inspect Target Case</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: REGULATION SOURCES (12) & CHANGE PROPOSALS */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          {/* Change Proposals with DiffViewer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                  Pending Circular Amendments & Regulatory Changes (4)
                </h3>
                <p className="text-[11px] text-textSecondary">
                  Requires Dual Officer Sign-Off (Compliance Officer + Independent Checker).
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {changeProposals.map((prop) => (
                <div
                  key={prop.id}
                  className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-brandNavy">
                        {prop.proposalRef} · Source: {prop.sourceId}
                      </span>
                      <h4 className="text-xs font-bold text-textPrimary">{prop.clauseTitle}</h4>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        prop.stage === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : prop.stage === 'CO_APPROVED'
                          ? 'bg-blue-100 text-brandNavy'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Stage: {prop.stage}
                    </span>
                  </div>

                  <DiffViewer
                    originalTitle="Official Regulatory Standard (Source)"
                    revisedTitle="Proposed Circular Modification"
                    originalText={prop.originalText}
                    revisedText={prop.amendedText}
                    clauseReference={prop.proposalRef}
                    effectiveDate={new Date(prop.effectiveDate).toLocaleDateString('en-GB')}
                  />

                  <div className="pt-2 border-t border-borderColor flex items-center justify-between">
                    <span className="text-[11px] text-textSecondary">
                      Submitted by: <strong className="text-textPrimary">{prop.submittedBy}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      {prop.stage === 'PROPOSED' && (
                        <button
                          type="button"
                          onClick={() => {
                            sendProposalToLegalReview(prop.id);
                            toast.show({
                              message: `Proposal ${prop.id} sent to legal review`,
                              variant: 'success',
                            });
                          }}
                          className="px-2.5 py-1 bg-white border border-borderColor text-textPrimary text-xs font-semibold hover:bg-gray-50 rounded"
                        >
                          Send to Legal Review
                        </button>
                      )}
                      {prop.stage !== 'ACTIVE' && (
                        <button
                          type="button"
                          onClick={() => setApproveProposal(prop)}
                          className="px-3 py-1 bg-brandNavy text-white text-xs font-semibold hover:bg-slate-900 rounded shadow-xs"
                        >
                          Approve Change (Dual Sign-Off)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regulation Sources (12) */}
          <div className="space-y-3 pt-4 border-t border-borderColor">
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Statutory Knowledge Base: 12 Regulation Sources
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {regulations.map((src) => (
                <div
                  key={src.id}
                  className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-brandNavy">
                        [{src.id} · {src.code}]
                      </span>
                      <span className="text-[10px] text-textSecondary font-mono">{src.version}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-textPrimary">{src.title}</h4>
                    <p className="text-[10px] text-textSecondary italic line-clamp-2">
                      {src.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-borderColor flex items-center justify-between">
                    <span className="text-[10px] text-textSecondary">Issuer: {src.issuer}</span>
                    <button
                      type="button"
                      onClick={() => setPreviewSource(src)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-brandNavy hover:underline"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Open Source</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Document Preview */}
      {previewSource && (
        <Modal
          open={Boolean(previewSource)}
          onClose={() => setPreviewSource(null)}
          title={`Regulation Source: ${previewSource.code}`}
          subtitle={previewSource.title}
          size="md"
        >
          <div className="space-y-3 text-xs">
            <DocumentPreview
              fileName={`${previewSource.code}-${previewSource.version}.pdf`}
              fileSize="2.4 MB"
              category={previewSource.issuer}
              uploadedAt={previewSource.promulgationDate}
              sha256={previewSource.documentHash}
            />

            <div className="p-3 bg-slate-50 border border-borderColor rounded-md space-y-1.5">
              <span className="font-bold text-textPrimary block">Regulatory Summary:</span>
              <p className="text-textSecondary leading-relaxed">{previewSource.summary}</p>
              <span className="text-[10px] text-textSecondary block mt-1">
                Total Promulgated Clauses: {previewSource.totalClauses} Clauses
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Dual Sign-off Approval for Change Proposal */}
      {approveProposal && (
        <Modal
          open={Boolean(approveProposal)}
          onClose={() => setApproveProposal(null)}
          title="Approve Regulatory Change"
          subtitle={`Dual sign-off gate for ${approveProposal.proposalRef}`}
          size="md"
        >
          <div className="space-y-3 text-xs">
            <ApprovalPanel
              currentUser={currentUser}
              maker={approveProposal.submittedBy}
              requiredSignoffs={2}
              assignedApprover="Aarav Mehta"
              secondApprover="Rohan Desai"
              onApprove={(approverName) => {
                approveRegulationChange(approveProposal.id);
                setApproveProposal(null);
                toast.show({
                  message: `Proposal ${approveProposal.proposalRef} approved by ${approverName} and activated`,
                  variant: 'success',
                });
              }}
              onReject={(reason) => {
                setApproveProposal(null);
                toast.show({ message: `Proposal rejected: ${reason}`, variant: 'warning' });
              }}
            />
          </div>
        </Modal>
      )}

      {/* Modal: Reject AI Proposal */}
      <Modal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject AI Suggestion"
        subtitle="Mandatory audit trail reason required under IFSCA regulations."
        size="sm"
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
              disabled={!rejectReason.trim()}
              onClick={handleConfirmReject}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-700 text-white hover:bg-rose-800 rounded disabled:opacity-50"
            >
              Confirm Rejection
            </button>
          </div>
        }
      >
        <div className="space-y-2 text-xs">
          <label className="block font-bold text-textPrimary">
            Rejection Explanation (Audit Log Requirement)
          </label>
          <textarea
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Explain why this suggestion is inaccurate or not applicable..."
            className="w-full p-2 border border-borderColor rounded-md focus:ring-1 focus:ring-rose-500"
          />
        </div>
      </Modal>

      {/* Modal: Edit Draft */}
      <Modal
        open={editDraftOpen}
        onClose={() => setEditDraftOpen(false)}
        title="Edit Proposed Text"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditDraftOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setEditDraftOpen(false);
                toast.show({ message: 'Draft updated and saved', variant: 'success' });
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-slate-900 rounded"
            >
              Save Draft
            </button>
          </div>
        }
      >
        <div className="space-y-2 text-xs">
          <label className="block font-bold text-textPrimary">
            Refined Investigation Summary
          </label>
          <textarea
            rows={5}
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            className="w-full p-2 border border-borderColor rounded-md focus:ring-1 focus:ring-brandNavy font-mono text-xs"
          />
        </div>
      </Modal>
    </div>
  );
};

export default AIPage;
