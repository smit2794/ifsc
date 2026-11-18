// src/pages/Clients/CaseDetailPage.tsx
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Clock,
  ExternalLink,
  Lock,
  Sparkles,
  Link2,
  FileCheck,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Stepper } from '../../components/ui/Stepper';
import { AIDraftBanner } from '../../components/ui/AIDraftBanner';
import { CitationChip } from '../../components/ui/CitationChip';
import { ApprovalPanel } from '../../components/ui/ApprovalPanel';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeleton';
import { buildLink } from '../../utils/buildLink';
import { useAppStore, useCases, useCurrentUser, useControls, useEvidence } from '../../store';
import { StaffName } from '../../types/user';
import { CaseState } from '../../types/case';

const CASE_STEPS: CaseState[] = [
  'TRIAGED',
  'INVESTIGATING',
  'REMEDIATION_PROPOSED',
  'RESOLVED',
  'CLOSED',
];

export const CaseDetailPage: React.FC = () => {
  const { id = 'CASE-2026-031' } = useParams<{ id: string }>();

  const cases = useCases();
  const controls = useControls();
  const evidenceList = useEvidence();
  const currentUser = useCurrentUser();

  const closeCase = useAppStore((s) => s.closeCase);
  const updateCaseStatus = useAppStore((s) => s.updateCaseStatus);
  const assignCaseReviewer = useAppStore((s) => s.assignCaseReviewer);
  const proposeCaseResolution = useAppStore((s) => s.proposeCaseResolution);
  const linkCaseEvidence = useAppStore((s) => s.linkCaseEvidence);
  const approveCaseResolution = useAppStore((s) => s.approveCaseResolution);
  const acceptAISuggestion = useAppStore((s) => s.acceptAISuggestion);
  const rejectAISuggestion = useAppStore((s) => s.rejectAISuggestion);

  const currentCase = cases.find((c) => c.id === id) || cases[0];
  const linkedControl = controls.find((ctrl) => ctrl.id === currentCase?.linkedControlId);

  const toast = useToast();
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [linkEvidenceModalOpen, setLinkEvidenceModalOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [evaluatingSkeleton, setEvaluatingSkeleton] = useState(false);

  // Form Inputs
  const [resolutionInput, setResolutionInput] = useState(
    currentCase?.remediationPlan ||
      'Revoke compliance oversight entitlement in Okta IAM; execute cryptographic audit log attestation to confirm zero compliance actions were executed by trading personnel.'
  );
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>('EVD-040');

  if (!currentCase) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-textSecondary">Case {id} not found.</p>
        <Link to={buildLink('/clients', { tab: 'cases' })} className="text-xs text-brandNavy underline mt-2 block">
          Return to Cases
        </Link>
      </div>
    );
  }

  // Stepper calculations
  const stepIndex = CASE_STEPS.indexOf(currentCase.status);
  const currentStepNum = stepIndex >= 0 ? stepIndex : 0;

  // Move to next state
  const handleAdvanceState = () => {
    if (currentStepNum < CASE_STEPS.length - 1) {
      const nextState = CASE_STEPS[currentStepNum + 1];
      updateCaseStatus(currentCase.id, nextState);
      toast.show({ message: `Case transitioned to ${nextState}`, variant: 'success' });
    }
  };

  // AI Proposal Handlers
  const handleAcceptAIProposal = () => {
    acceptAISuggestion('INV-2026-001');
    toast.show({
      message: 'AI Investigation findings and remediation recommendations accepted into case file',
      variant: 'success',
    });
  };

  const handleRejectAIProposal = (reason: string) => {
    rejectAISuggestion('INV-2026-001', reason);
    toast.show({ message: `AI proposal rejected: ${reason}`, variant: 'info' });
  };

  // Assign Reviewer
  const handleAssignReviewer = (officer: StaffName) => {
    assignCaseReviewer(currentCase.id, officer);
    setAssignModalOpen(false);
    toast.show({ message: `Reviewer ${officer} assigned to ${currentCase.id}`, variant: 'success' });
  };

  // Submit Resolution Proposal
  const handleProposeResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionInput.trim()) return;
    proposeCaseResolution(currentCase.id, resolutionInput.trim());
    setResolutionModalOpen(false);
    toast.show({
      message: 'Remediation resolution proposed; awaiting independent officer sign-off',
      variant: 'success',
    });
  };

  // Link Evidence
  const handleConfirmLinkEvidence = () => {
    if (!selectedEvidenceId) return;
    linkCaseEvidence(currentCase.id, selectedEvidenceId);
    setLinkEvidenceModalOpen(false);
    toast.show({
      message: `Evidence dossier ${selectedEvidenceId} linked to ${currentCase.id}`,
      variant: 'success',
    });
  };

  // Close Case with Propagation #1
  const handleConfirmCloseCase = () => {
    setCloseConfirmOpen(false);
    setEvaluatingSkeleton(true);

    // Execute real-time cryptographic audit log sealing & control re-evaluation
    setTimeout(() => {
      closeCase(currentCase.id, currentCase.remediationEvidenceId || selectedEvidenceId);
      setEvaluatingSkeleton(false);
      toast.show({
        message: `Case ${currentCase.id} CLOSED. Control GOV-SOD-001 re-evaluated to PASS.`,
        variant: 'success',
      });
    }, 1200);
  };

  // Prerequisite checks for closure
  const hasLinkedEvidence = Boolean(currentCase.remediationEvidenceId);
  const isResolutionApproved = currentCase.status === 'RESOLVED' || Boolean(currentCase.approver);
  const canCloseCase = hasLinkedEvidence && isResolutionApproved && currentCase.status !== 'CLOSED';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Investigation Case: ${currentCase.id}`}
        subtitle={currentCase.title}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to={buildLink('/clients', { tab: 'cases' })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brandNavy bg-white border border-borderColor rounded-md hover:bg-gray-50 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Cases
            </Link>
          </div>
        }
      />

      {/* Evaluating Skeleton Overlay if closing */}
      {evaluatingSkeleton && (
        <div className="p-6 bg-white border border-blue-200 rounded-lg shadow-sm space-y-3 animate-pulse">
          <div className="flex items-center gap-2 text-xs font-bold text-brandNavy">
            <RotateCw className="w-4 h-4 animate-spin text-brandNavy" />
            <span>Evaluating Control Dependencies (SSO/IAM & HR Connectors)...</span>
          </div>
          <p className="text-xs text-textSecondary">
            Verifying credential de-provisioning attestation and re-running SoD crawl on Okta IAM...
          </p>
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      )}

      {/* State Stepper */}
      <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Investigation Lifecycle Stage
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                currentCase.status === 'CLOSED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : currentCase.status === 'RESOLVED'
                  ? 'bg-blue-100 text-brandNavy'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              Current: {currentCase.status}
            </span>
          </div>

          {currentCase.status !== 'CLOSED' && currentCase.status !== 'RESOLVED' && (
            <button
              type="button"
              onClick={handleAdvanceState}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-brandNavy text-white hover:bg-slate-900 rounded shadow-xs"
            >
              <span>Advance to Next Stage</span>
            </button>
          )}
        </div>

        <Stepper
          steps={[
            'Triaged',
            'Investigating',
            'Remediation Proposed',
            'Resolution Approved',
            'Case Closed',
          ]}
          currentStep={currentStepNum}
        />
      </div>

      {/* Main Grid: Details & AI Workpapers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Investigation Workpapers & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Investigator Panel */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>AI Investigation Workpaper & Telemetry Synthesis</span>
            </h3>

            <AIDraftBanner
              title="AI Investigator Synthesis: SoD Privilege Overlap Analysis"
              confidence={96}
              citedEventsCount={2}
              onAccept={handleAcceptAIProposal}
              onReject={handleRejectAIProposal}
            />

            <div className="p-4 rounded-lg border border-borderColor bg-white space-y-3.5 shadow-xs">
              <div className="text-xs text-textPrimary leading-relaxed space-y-2">
                <p>
                  <strong>Root Cause Telemetry:</strong> Scheduled directory crawl detected user{' '}
                  <span className="font-mono font-semibold text-rose-700">Deepa Patel (USR-005, Trading Desk Officer)</span> actively enrolled in Okta directory group{' '}
                  <code className="px-1.5 py-0.5 rounded bg-slate-100 border text-[11px] font-mono text-slate-800">
                    IAM-GRP-COMPLIANCE-REVIEW
                  </code> while retaining full order execution rights on India INX.
                </p>
                <p className="text-textSecondary">
                  Under IFSCA regulations, personnel engaged in order-routing or clearing execution are strictly barred from possessing compliance audit or supervisory bypass privileges.
                </p>
              </div>

              {/* Cited Events */}
              <div className="p-3 rounded bg-slate-50 border border-borderColor text-xs space-y-1.5">
                <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block">
                  Verified Audit Events Cited:
                </span>
                <div className="space-y-1 font-mono text-[11px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.2 rounded bg-blue-100 text-brandNavy font-semibold">EVT-IAM-9418</span>
                    <span>18 hrs ago: Group membership assigned via Okta Admin Console session.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.2 rounded bg-blue-100 text-brandNavy font-semibold">EVT-OKTA-3021</span>
                    <span>14 hrs ago: Trading gateway session token initialized under execution role.</span>
                  </div>
                </div>
              </div>

              {/* Statutory Citations */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-borderColor">
                <span className="text-[11px] font-semibold text-textSecondary">Statutory Ground:</span>
                <CitationChip
                  code="S2"
                  clause="CMI Reg. 9"
                  sourceTitle="IFSCA Capital Market Intermediaries Regulations, 2021"
                  clauseText="Capital Market Intermediaries shall ensure strict segregation of duties between trading execution and compliance functions."
                />
                <CitationChip
                  code="S2"
                  clause="Schedule III"
                  sourceTitle="Code of Conduct for Intermediaries"
                  clauseText="Maintenance of Chinese Walls and independence of governance officers."
                />
              </div>

              {/* Missing Evidence Callout */}
              <div className="p-3 rounded bg-amber-50 border border-amber-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-amber-900 block">Required Remediation Evidence</span>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Case closure requires cryptographic audit proof confirming role revocation in Okta and attesting zero compliance sign-offs occurred during overlap.
                  </p>
                  {!hasLinkedEvidence ? (
                    <button
                      type="button"
                      onClick={() => setLinkEvidenceModalOpen(true)}
                      className="inline-flex items-center gap-1 font-semibold text-brandNavy underline mt-1 text-[11px]"
                    >
                      <Link2 className="w-3 h-3" />
                      <span>Link Evidence Dossier EVD-040 Now</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-800 mt-1 text-[11px]">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Evidence Dossier {currentCase.remediationEvidenceId} Linked</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Remediation Resolution Section */}
          <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brandNavy" />
                <span>Proposed Remediation Plan & Resolution</span>
              </h3>
              {currentCase.status !== 'CLOSED' && (
                <button
                  type="button"
                  onClick={() => setResolutionModalOpen(true)}
                  className="text-xs font-semibold text-brandNavy hover:underline"
                >
                  Edit Resolution
                </button>
              )}
            </div>

            <div className="p-3 rounded bg-slate-50 border border-borderColor text-xs leading-relaxed text-textPrimary">
              {currentCase.remediationPlan || 'No formal remediation plan drafted yet.'}
            </div>

            {/* Maker-Checker Approval Section */}
            <div className="space-y-2 pt-2 border-t border-borderColor">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                  Independent Sign-off Gate
                </span>
                <span className="text-[11px] text-textSecondary">
                  Maker: <strong className="text-textPrimary">{currentCase.maker}</strong>
                </span>
              </div>

              {/* ApprovalPanel */}
              <ApprovalPanel
                currentUser={currentUser}
                maker={currentCase.maker}
                requiredSignoffs={1}
                state={
                  currentCase.status === 'RESOLVED' || currentCase.status === 'CLOSED'
                    ? 'APPROVED'
                    : currentCase.status === 'REMEDIATION_PROPOSED'
                    ? 'PENDING_APPROVAL'
                    : 'DRAFT'
                }
                assignedApprover={currentCase.approver || 'Rohan Desai'}
                onApprove={(approverName) => {
                  approveCaseResolution(currentCase.id, approverName);
                  toast.show({
                    message: `Resolution approved by independent officer ${approverName}`,
                    variant: 'success',
                  });
                }}
                onReject={(reason) => {
                  toast.show({ message: `Resolution rejected: ${reason}`, variant: 'warning' });
                }}
              />
            </div>
          </div>

          {/* Closure Gate Box */}
          <div
            className={`p-4 rounded-lg border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              canCloseCase
                ? 'bg-emerald-50/70 border-emerald-300'
                : 'bg-slate-50 border-borderColor'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <Lock className={`w-4 h-4 ${canCloseCase ? 'text-emerald-700' : 'text-textSecondary'}`} />
                <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                  Case Closure & Control Re-Evaluation Gate
                </h4>
              </div>
              <p className="text-[11px] text-textSecondary mt-1 leading-relaxed">
                {currentCase.status === 'CLOSED'
                  ? 'Case is CLOSED. Control GOV-SOD-001 has been re-evaluated and returned PASS.'
                  : canCloseCase
                  ? 'All closure requirements satisfied (evidence linked & independent approval recorded).'
                  : 'Closure blocked until: (1) Remediation evidence is linked AND (2) Independent sign-off is granted.'}
              </p>
            </div>

            {currentCase.status !== 'CLOSED' && (
              <button
                type="button"
                disabled={!canCloseCase}
                onClick={() => setCloseConfirmOpen(true)}
                className="px-4 py-2 bg-emerald-700 text-white rounded-md text-xs font-semibold hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs shrink-0"
              >
                Close Case
              </button>
            )}
          </div>
        </div>

        {/* Right Col: Case Metadata, Linked Entities, Timeline */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Case Properties
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-borderColor">
                <span className="text-textSecondary">Severity</span>
                <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {currentCase.severity}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-borderColor">
                <span className="text-textSecondary">Case Owner</span>
                <span className="font-semibold text-textPrimary">{currentCase.owner}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-borderColor">
                <span className="text-textSecondary">Case Maker</span>
                <span className="font-semibold text-textPrimary">{currentCase.maker}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-borderColor">
                <span className="text-textSecondary">Assigned Reviewer</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-textPrimary">
                    {currentCase.reviewer || 'Unassigned'}
                  </span>
                  {currentCase.status !== 'CLOSED' && (
                    <button
                      type="button"
                      onClick={() => setAssignModalOpen(true)}
                      className="text-[10px] text-brandNavy font-semibold hover:underline"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-borderColor">
                <span className="text-textSecondary">Created Timestamp</span>
                <span className="text-textSecondary font-mono text-[11px]">
                  {new Date(currentCase.createdAt).toLocaleString('en-GB')}
                </span>
              </div>
              {currentCase.closedAt && (
                <div className="flex items-center justify-between py-1 border-b border-borderColor">
                  <span className="text-textSecondary">Closed Timestamp</span>
                  <span className="text-emerald-700 font-mono text-[11px] font-semibold">
                    {new Date(currentCase.closedAt).toLocaleString('en-GB')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Cross-Module Linked Items */}
          <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Cross-Module Dependencies
            </h3>

            <div className="space-y-2 text-xs">
              {/* Linked Control */}
              <div className="p-2.5 rounded bg-slate-50 border border-borderColor flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-textSecondary uppercase block">Linked Control</span>
                  <span className="font-mono font-bold text-brandNavy">
                    {currentCase.linkedControlId || 'GOV-SOD-001'}
                  </span>
                  <span className="text-[10px] text-textSecondary block mt-0.5">
                    {linkedControl?.title || 'Segregation of Trading and Compliance Duties'}
                  </span>
                </div>
                <Link
                  to={buildLink('/controls', { control: currentCase.linkedControlId || 'GOV-SOD-001' })}
                  className="p-1 text-brandNavy hover:text-slate-900"
                  title="Inspect Control"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>

              {/* Linked Evidence */}
              <div className="p-2.5 rounded bg-slate-50 border border-borderColor flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-textSecondary uppercase block">Remediation Evidence</span>
                  <span className="font-mono font-bold text-brandNavy">
                    {currentCase.remediationEvidenceId || 'Pending Linkage'}
                  </span>
                  <span className="text-[10px] text-textSecondary block mt-0.5">
                    {currentCase.remediationEvidenceId
                      ? 'Okta IAM Role Assignment Audit Log'
                      : 'Not yet attached to case'}
                  </span>
                </div>
                {currentCase.remediationEvidenceId ? (
                  <Link
                    to={buildLink('/evidence', { evidence: currentCase.remediationEvidenceId })}
                    className="p-1 text-brandNavy hover:text-slate-900"
                    title="View Evidence Vault"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setLinkEvidenceModalOpen(true)}
                    className="text-[10px] text-brandNavy font-semibold hover:underline"
                  >
                    Link Now
                  </button>
                )}
              </div>

              {/* Open in AI Investigations */}
              <div className="p-2.5 rounded bg-blue-50/50 border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-blue-900 uppercase font-semibold block">
                    AI Investigation Suite
                  </span>
                  <span className="text-xs font-bold text-brandNavy">INV-2026-001</span>
                </div>
                <Link
                  to={buildLink('/ai', { tab: 'history', investigation: 'INV-2026-001' })}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-brandNavy hover:underline"
                >
                  <span>Open in AI</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Case Activity Timeline */}
          <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-textSecondary" />
              <span>Immutable Audit Timeline</span>
            </h3>

            <div className="space-y-3 text-xs border-l-2 border-borderColor pl-3 ml-1.5">
              {currentCase.timeline.map((entry) => (
                <div key={entry.id} className="relative space-y-0.5">
                  <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-brandNavy border-2 border-white" />
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-textPrimary">{entry.action}</span>
                    <span className="text-[10px] text-textSecondary font-mono">
                      {new Date(entry.timestamp).toLocaleTimeString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-textSecondary">
                    By <span className="font-semibold text-textPrimary">{entry.actor}</span>
                    {entry.detail && ` — ${entry.detail}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Assign Reviewer */}
      <Modal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Case Reviewer"
        subtitle="Select independent officer from institutional roster."
        size="sm"
      >
        <div className="space-y-2 text-xs">
          {(['Priya Nair', 'Rohan Desai', 'Vikram Shah', 'Deepa Patel'] as StaffName[]).map((name) => (
            <div
              key={name}
              onClick={() => handleAssignReviewer(name)}
              className="p-2.5 rounded border border-borderColor hover:border-brandNavy hover:bg-blue-50/40 cursor-pointer transition-colors flex items-center justify-between"
            >
              <span className="font-semibold text-textPrimary">{name}</span>
              <span className="text-[11px] text-brandNavy font-medium">Select</span>
            </div>
          ))}
        </div>
      </Modal>

      {/* Modal: Edit Resolution */}
      <Modal
        open={resolutionModalOpen}
        onClose={() => setResolutionModalOpen(false)}
        title="Draft Remediation Resolution"
        subtitle="Specify corrective actions to be verified by independent checker."
        size="md"
      >
        <form onSubmit={handleProposeResolution} className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
              Remediation Action Summary
            </label>
            <textarea
              rows={4}
              value={resolutionInput}
              onChange={(e) => setResolutionInput(e.target.value)}
              className="w-full p-2 border border-borderColor rounded-md focus:ring-1 focus:ring-brandNavy"
            />
          </div>
          <div className="pt-2 border-t border-borderColor flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setResolutionModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-slate-900 rounded shadow-xs"
            >
              Propose Resolution
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Link Evidence */}
      <Modal
        open={linkEvidenceModalOpen}
        onClose={() => setLinkEvidenceModalOpen(false)}
        title="Link Remediation Evidence Dossier"
        subtitle="Select verified sealed dossier to satisfy case closure requirements."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setLinkEvidenceModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmLinkEvidence}
              className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-slate-900 rounded shadow-xs"
            >
              Link Selected Evidence
            </button>
          </div>
        }
      >
        <div className="space-y-2.5 text-xs">
          <p className="text-textSecondary">
            Choose from sealed evidence items or attach the dedicated SoD audit extract:
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {evidenceList
              .filter((e) => e.id === 'EVD-040' || e.category === 'Governance & Appointments')
              .map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvidenceId(ev.id)}
                  className={`p-2.5 rounded border cursor-pointer transition-colors ${
                    selectedEvidenceId === ev.id
                      ? 'border-brandNavy bg-blue-50/70 font-semibold'
                      : 'border-borderColor hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-brandNavy">{ev.id}</span>
                    <span className="text-[10px] font-mono text-textSecondary">
                      SHA: {ev.hash.slice(0, 12)}...
                    </span>
                  </div>
                  <p className="text-[11px] text-textPrimary mt-0.5">{ev.title}</p>
                </div>
              ))}
          </div>
        </div>
      </Modal>

      {/* Confirm Dialog: Close Case (Propagation #1) */}
      <ConfirmDialog
        open={closeConfirmOpen}
        onCancel={() => setCloseConfirmOpen(false)}
        onConfirm={handleConfirmCloseCase}
        title={`Confirm Closure for Case ${currentCase.id}?`}
        message="Closing this case with linked evidence will immediately fire Propagation Rule #1. Control GOV-SOD-001 will be re-evaluated using SSO/IAM and HR connectors (both HEALTHY), returning PASS. RMS connector is bypassed."
        confirmText="Close Case & Re-Evaluate"
        variant="primary"
      />
    </div>
  );
};

export default CaseDetailPage;
