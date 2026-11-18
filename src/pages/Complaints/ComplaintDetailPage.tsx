// src/pages/Complaints/ComplaintDetailPage.tsx
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldAlert,
  Clock,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Mail,
  UserCheck,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Stepper } from '../../components/ui/Stepper';
import { AIDraftBanner } from '../../components/ui/AIDraftBanner';
import { ApprovalPanel } from '../../components/ui/ApprovalPanel';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { buildLink } from '../../utils/buildLink';
import { useAppStore, useComplaints, useCurrentUser } from '../../store';
import { StaffName } from '../../types/user';

const COMPLAINT_STEPS = [
  'RECEIVED',
  'MERITS_REVIEW',
  'ACCEPTED/NOT_ACCEPTED',
  'INVESTIGATING',
  'RESOLVED/REJECTED',
  'APPEAL_WINDOW',
  'APPEALED',
  'FINAL_CLOSED',
];

const getComplaintStepIndex = (status: string): number => {
  switch (status) {
    case 'RECEIVED':
      return 0;
    case 'MERITS_REVIEW':
    case 'OPEN':
      return 1;
    case 'ACCEPTED':
    case 'NOT_ACCEPTED':
      return 2;
    case 'INVESTIGATING':
      return 3;
    case 'RESOLVED':
    case 'REJECTED':
    case 'DISPOSED':
      return 4;
    case 'APPEAL_WINDOW':
      return 5;
    case 'APPEALED':
      return 6;
    case 'FINAL_CLOSED':
    case 'CLOSED':
      return 7;
    default:
      return 0;
  }
};

export const ComplaintDetailPage: React.FC = () => {
  const { id = 'CMP-2026-003' } = useParams<{ id: string }>();
  const toast = useToast();

  const complaints = useComplaints();
  const currentUser = useCurrentUser();

  const confirmClassification = useAppStore((s) => s.confirmComplaintClassification);
  const updateComplaintStatus = useAppStore((s) => s.updateComplaintStatus);
  const assignComplaintCRO = useAppStore((s) => s.assignComplaintCRO);
  const resolveComplaint = useAppStore((s) => s.resolveComplaint);
  const rejectComplaint = useAppStore((s) => s.rejectComplaint);
  const recordComplaintAcknowledgement = useAppStore((s) => s.recordComplaintAcknowledgement);

  const currentComplaint = complaints.find((c) => c.id === id) || complaints[0];

  // Modals state
  const [classificationModalOpen, setClassificationModalOpen] = useState(false);
  const [assignCROModalOpen, setAssignCROModalOpen] = useState(false);
  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [aiDraftVisible, setAiDraftVisible] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);

  // Form Inputs
  const [selectedType, setSelectedType] = useState<'RETAIL' | 'INSTITUTIONAL'>(
    currentComplaint?.type || 'RETAIL'
  );
  const [resolutionText, setResolutionText] = useState(
    currentComplaint?.resolutionSummary ||
      'Transferred funds with fee waiver applied; wire execution confirmation attached.'
  );
  const [rejectReasonText, setRejectReasonText] = useState('');

  if (!currentComplaint) {
    return (
      <div className="p-8 text-center text-xs text-textSecondary">
        Complaint {id} not found.
      </div>
    );
  }

  // Stepper calculations
  const currentStepNum = getComplaintStepIndex(currentComplaint.status);

  // Conflict exists only if the CRO was involved in the underlying matter
  const hasCroConflict = Boolean(currentComplaint.croConflict);

  // Classification Confirmation (Propagation #10)
  const handleConfirmClassification = () => {
    confirmClassification(currentComplaint.id, selectedType);
    setClassificationModalOpen(false);
    toast.show({
      message: `Classification confirmed as ${selectedType}. Statutory retail clocks initialized.`,
      variant: 'success',
    });
  };

  // Assign / Reroute CRO
  const handleAssignCRO = (officer: StaffName) => {
    assignComplaintCRO(currentComplaint.id, officer);
    setAssignCROModalOpen(false);
    toast.show({
      message: `Complaints Redressal Officer reassigned to ${officer}`,
      variant: 'success',
    });
  };

  // Send Acknowledgement (Template preview + human confirmation step)
  const handleSendAcknowledgement = () => {
    recordComplaintAcknowledgement(currentComplaint.id);
    setAckModalOpen(false);
    toast.show({
      message: 'Statutory 3-day acknowledgement dispatched to complainant',
      variant: 'success',
    });
  };

  // Resolve Complaint
  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionText.trim()) return;
    resolveComplaint(currentComplaint.id, resolutionText.trim());
    setResolveModalOpen(false);
    toast.show({
      message: `Complaint ${currentComplaint.id} marked as DISPOSED with resolution recorded`,
      variant: 'success',
    });
  };

  // Reject Complaint with reason
  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReasonText.trim()) return;
    rejectComplaint(currentComplaint.id, rejectReasonText.trim());
    setRejectModalOpen(false);
    toast.show({
      message: `Non-acceptance explanation dispatched for complaint ${currentComplaint.id}`,
      variant: 'info',
    });
  };

  // Close Complaint
  const handleCloseComplaintConfirm = () => {
    updateComplaintStatus(currentComplaint.id, 'CLOSED');
    setCloseConfirmOpen(false);
    toast.show({
      message: `Complaint ${currentComplaint.id} marked as CLOSED`,
      variant: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Complaint Redressal File: ${currentComplaint.id}`}
        subtitle={currentComplaint.clientName}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/complaints"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brandNavy bg-white border border-borderColor rounded-md hover:bg-gray-50 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Complaints
            </Link>
          </div>
        }
      />

      {/* State Stepper */}
      <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Redressal Lifecycle Stage
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                currentComplaint.status === 'CLOSED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : currentComplaint.status === 'DISPOSED'
                  ? 'bg-blue-100 text-brandNavy'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              Current: {currentComplaint.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!currentComplaint.classificationConfirmed && (
              <button
                type="button"
                onClick={() => setClassificationModalOpen(true)}
                className="px-2.5 py-1 text-xs font-semibold bg-brandNavy text-white hover:bg-slate-900 rounded shadow-xs"
              >
                Confirm Classification
              </button>
            )}
          </div>
        </div>

        <Stepper
          steps={COMPLAINT_STEPS}
          currentStep={currentStepNum}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Clocks, Summary, CRO Conflict, AI Response */}
        <div className="lg:col-span-2 space-y-6">
          {/* Statutory Retail Clocks (Visible ONLY after classificationConfirmed = true) */}
          {currentComplaint.classificationConfirmed && currentComplaint.isRetail ? (
            <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/40 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brandNavy uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brandNavy" />
                  <span>Statutory Retail Redressal Timelines (IFSCA Conduct Rules)</span>
                </span>
                <span className="text-[10px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                  Classification Confirmed
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                {/* 3 Working Days: Acknowledgement */}
                <div className="p-2.5 rounded bg-white border border-borderColor space-y-1">
                  <span className="text-[10px] text-textSecondary uppercase font-semibold block">
                    Acknowledgement
                  </span>
                  <p className="text-sm font-bold text-brandNavy">3 Working Days</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">
                    {currentComplaint.retailClocks?.acknowledgementDaysRemaining === 0
                      ? 'Acknowledged'
                      : 'Due: 3d from filing'}
                  </p>
                </div>

                {/* 5 Working Days: Non-Acceptance Explanation */}
                <div className="p-2.5 rounded bg-white border border-borderColor space-y-1">
                  <span className="text-[10px] text-textSecondary uppercase font-semibold block">
                    Non-Acceptance
                  </span>
                  <p className="text-sm font-bold text-brandNavy">5 Working Days</p>
                  <p className="text-[10px] text-textSecondary">If rejecting claim</p>
                </div>

                {/* 15 Days: Disposal Target */}
                <div className="p-2.5 rounded bg-white border border-borderColor space-y-1">
                  <span className="text-[10px] text-textSecondary uppercase font-semibold block">
                    Target Disposal
                  </span>
                  <p className="text-sm font-bold text-emerald-700">15 Days</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">
                    ~{currentComplaint.retailClocks?.disposalTargetDaysRemaining ?? 8}d remaining
                  </p>
                </div>

                {/* 30 Days: Ordinary Maximum */}
                <div className="p-2.5 rounded bg-white border border-borderColor space-y-1">
                  <span className="text-[10px] text-textSecondary uppercase font-semibold block">
                    Maximum Statutory
                  </span>
                  <p className="text-sm font-bold text-textPrimary">30 Days Max</p>
                  <p className="text-[10px] text-textSecondary">
                    ~{currentComplaint.retailClocks?.ordinaryMaxDaysRemaining ?? 23}d remaining
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/50 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-amber-900 font-medium">
                  Retail statutory timeline clocks (3d / 5d / 15d / 30d) activate once classification is formally confirmed.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setClassificationModalOpen(true)}
                className="px-2.5 py-1 text-xs font-semibold bg-brandNavy text-white rounded hover:bg-slate-900 shadow-xs shrink-0"
              >
                Confirm Now
              </button>
            </div>
          )}

          {/* CRO Conflict Check Alert */}
          {hasCroConflict && (
            <div className="p-4 rounded-lg border border-rose-300 bg-rose-50/70 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-700" />
                  <span>Conflict of Interest Detected on Assigned Complaints Officer</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-900">
                  CRO Conflict
                </span>
              </div>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                {currentComplaint.croConflictReason ||
                  `The current assigned officer (${currentComplaint.owner}) was directly involved in the underlying matter. Under statutory rules, grievance investigation must be rerouted to an independent officer.`}
              </p>
              <button
                type="button"
                onClick={() => setAssignCROModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-700 text-white rounded text-xs font-semibold hover:bg-rose-800 transition-colors shadow-xs"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Reroute to independent officer</span>
              </button>
            </div>
          )}

          {/* Complaint Details Card */}
          <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Grievance Background & Summary
            </h3>
            <div className="p-3 bg-slate-50 border border-borderColor rounded text-xs text-textPrimary leading-relaxed">
              {currentComplaint.summary}
            </div>

            {currentComplaint.resolutionSummary && (
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded text-xs space-y-1">
                <span className="font-bold text-emerald-900 block">Resolution & Remedial Action:</span>
                <p className="text-emerald-950 leading-relaxed">{currentComplaint.resolutionSummary}</p>
              </div>
            )}
          </div>

          {/* AI Response Drafting Section */}
          <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brandNavy" />
                <span>AI Redressal Workpaper & Draft Response</span>
              </h3>
              {!aiDraftVisible && (
                <button
                  type="button"
                  onClick={() => setAiDraftVisible(true)}
                  className="text-xs font-semibold text-brandNavy hover:underline"
                >
                  Generate AI Response Draft
                </button>
              )}
            </div>

            {aiDraftVisible && (
              <div className="space-y-3">
                <AIDraftBanner
                  title="AI Draft Response: Redressal Settlement & Root Cause Analysis"
                  confidence={95}
                  citedEventsCount={2}
                  onAccept={() => {
                    toast.show({
                      message: 'AI response draft accepted into complaint workpaper',
                      variant: 'success',
                    });
                  }}
                  onReject={(reason) => {
                    toast.show({ message: `AI draft rejected: ${reason}`, variant: 'info' });
                  }}
                />

                <div className="p-3 rounded bg-slate-50 border border-borderColor text-xs leading-relaxed space-y-2">
                  <p>
                    <strong>Synthesized Investigation Finding:</strong> Bank statement audit confirms client's USD withdrawal request was queued during the daily foreign exchange settlement clearing cutoff at 17:00 IST. Funds settled at T+1 09:12 IST.
                  </p>
                  <p className="text-textSecondary">
                    <strong>Recommended Formal Response:</strong> Provide complainant with swift acknowledgement containing the foreign correspondent MT103 transaction hash and waive the USD 25 cable processing fee.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-borderColor">
                  <button
                    type="button"
                    onClick={() => setApprovalModalOpen(true)}
                    className="px-3 py-1.5 bg-brandNavy text-white rounded text-xs font-semibold hover:bg-slate-900 shadow-xs"
                  >
                    Approve Response via Dual Sign-Off
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Strip */}
          <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setAckModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-borderColor text-textPrimary rounded text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-brandNavy" />
                <span>Send Formal Acknowledgement</span>
              </button>
              {currentComplaint.status !== 'DISPOSED' && currentComplaint.status !== 'CLOSED' && (
                <>
                  <button
                    type="button"
                    onClick={() => setResolveModalOpen(true)}
                    className="px-3 py-1.5 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-xs"
                  >
                    Resolve & Close Matter
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectModalOpen(true)}
                    className="px-3 py-1.5 bg-white border border-rose-300 text-rose-700 rounded text-xs font-semibold hover:bg-rose-50 transition-colors"
                  >
                    Reject with Non-Acceptance Reason
                  </button>
                </>
              )}
            </div>

            {currentComplaint.status !== 'CLOSED' && (
              <button
                type="button"
                onClick={() => setCloseConfirmOpen(true)}
                className="px-3 py-1.5 text-xs text-textSecondary hover:text-textPrimary font-semibold hover:bg-gray-100 rounded"
              >
                Close File
              </button>
            )}
          </div>
        </div>

        {/* Right Col: Complainant Metadata & Links */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Matter Properties
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-borderColor">
                <span className="text-textSecondary">Category</span>
                <span className="font-semibold text-textPrimary">{currentComplaint.category}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-borderColor">
                <span className="text-textSecondary">Investor Type</span>
                <span className="font-bold text-brandNavy bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {currentComplaint.type}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-borderColor">
                <span className="text-textSecondary">Classification Confirmed</span>
                <span
                  className={`font-semibold ${
                    currentComplaint.classificationConfirmed ? 'text-emerald-700' : 'text-amber-600'
                  }`}
                >
                  {currentComplaint.classificationConfirmed ? 'Yes (Confirmed)' : 'Pending Review'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-borderColor">
                <span className="text-textSecondary">Assigned CRO</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-textPrimary">{currentComplaint.owner}</span>
                  <button
                    type="button"
                    onClick={() => setAssignCROModalOpen(true)}
                    className="text-[10px] text-brandNavy font-semibold hover:underline"
                  >
                    Change
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-borderColor">
                <span className="text-textSecondary">Filing Date</span>
                <span className="font-mono text-textSecondary">
                  {new Date(currentComplaint.filedDate).toLocaleDateString('en-GB')}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-borderColor">
                <span className="text-textSecondary">Age</span>
                <span className="font-mono font-bold text-textPrimary">
                  {currentComplaint.ageDays} Days
                </span>
              </div>
            </div>
          </div>

          {/* Complainant Profile Link */}
          <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Linked Client Profile
            </h3>
            <div className="p-3 rounded bg-slate-50 border border-borderColor space-y-1.5 text-xs">
              <span className="font-mono font-bold text-brandNavy block">
                {currentComplaint.clientId}
              </span>
              <p className="font-semibold text-textPrimary">{currentComplaint.clientName}</p>
              <Link
                to={buildLink('/clients', { tab: 'clients', client: 'CLT-007' })}
                className="inline-flex items-center gap-1 font-semibold text-brandNavy hover:underline pt-1 text-[11px]"
              >
                <span>View Full Client KYC Profile</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Confirm Classification (Propagation #10) */}
      <Modal
        open={classificationModalOpen}
        onClose={() => setClassificationModalOpen(false)}
        title="Confirm Complainant Classification"
        subtitle="Classification dictates applicable statutory redressal timelines under IFSCA rules."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setClassificationModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmClassification}
              className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-slate-900 rounded shadow-xs"
            >
              Confirm & Start Clocks
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-textSecondary leading-relaxed">
            Select the verified regulatory status of the investor:
          </p>

          <div className="space-y-2">
            <label className="p-2.5 rounded border border-borderColor flex items-center justify-between cursor-pointer hover:bg-blue-50/30">
              <div>
                <span className="font-bold text-textPrimary block">Retail Investor</span>
                <span className="text-[11px] text-textSecondary">
                  Triggers 3d acknowledgement, 5d non-acceptance, 15d disposal clocks.
                </span>
              </div>
              <input
                type="radio"
                name="classification"
                checked={selectedType === 'RETAIL'}
                onChange={() => setSelectedType('RETAIL')}
                className="text-brandNavy"
              />
            </label>

            <label className="p-2.5 rounded border border-borderColor flex items-center justify-between cursor-pointer hover:bg-blue-50/30">
              <div>
                <span className="font-bold text-textPrimary block">Institutional Client</span>
                <span className="text-[11px] text-textSecondary">
                  Governed by bilateral broker-dealer SLA and dispute arbitration terms.
                </span>
              </div>
              <input
                type="radio"
                name="classification"
                checked={selectedType === 'INSTITUTIONAL'}
                onChange={() => setSelectedType('INSTITUTIONAL')}
                className="text-brandNavy"
              />
            </label>
          </div>
        </div>
      </Modal>

      {/* Modal: Assign CRO */}
      <Modal
        open={assignCROModalOpen}
        onClose={() => setAssignCROModalOpen(false)}
        title="Assign Complaints Redressal Officer (CRO)"
        subtitle="Select independent officer without operational conflicts."
        size="sm"
      >
        <div className="space-y-2 text-xs">
          {(['Priya Nair', 'Rohan Desai', 'Vikram Shah', 'Aarav Mehta'] as StaffName[]).map((name) => (
            <div
              key={name}
              onClick={() => handleAssignCRO(name)}
              className="p-2.5 rounded border border-borderColor hover:border-brandNavy hover:bg-blue-50/40 cursor-pointer transition-colors flex items-center justify-between"
            >
              <div>
                <span className="font-semibold text-textPrimary block">{name}</span>
                <span className="text-[10px] text-textSecondary">
                  {name === 'Priya Nair' ? 'Risk Officer (Independent)' : 'Governance Officer'}
                </span>
              </div>
              <span className="text-[11px] text-brandNavy font-semibold">Assign</span>
            </div>
          ))}
        </div>
      </Modal>

      {/* Modal: Acknowledgement Template Preview */}
      <Modal
        open={ackModalOpen}
        onClose={() => setAckModalOpen(false)}
        title="Statutory Acknowledgement Preview"
        subtitle="Dispatches mandatory 3-day acknowledgement to investor."
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
              onClick={handleSendAcknowledgement}
              className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-slate-900 rounded shadow-xs"
            >
              Approve & Dispatch Acknowledgement
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-xs leading-relaxed">
          <div className="p-3 rounded bg-slate-50 border border-borderColor font-mono text-[11px] space-y-2">
            <p><strong>To:</strong> {currentComplaint.clientName}</p>
            <p><strong>Ref:</strong> IFSC/ACK/CMP/{currentComplaint.id}</p>
            <p><strong>Subject:</strong> Formal Acknowledgement of Redressal Grievance {currentComplaint.id}</p>
            <p className="pt-2 border-t border-borderColor">
              Dear Investor,
              <br /><br />
              We acknowledge receipt of your grievance regarding "{currentComplaint.category}" filed under IFSC TrustOps. Your matter has been assigned reference ID <strong>{currentComplaint.id}</strong> under the oversight of Complaints Officer {currentComplaint.owner}.
              <br /><br />
              In accordance with IFSCA Conduct of Business Regulations, our target disposal timeline is 15 calendar days.
            </p>
          </div>
          <p className="text-[10px] text-textSecondary italic">
            Dispatches through registered institutional channel upon human officer approval.
          </p>
        </div>
      </Modal>

      {/* Modal: Response Approval */}
      <Modal
        open={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        title="Approve Redressal Response"
        subtitle="Maker-checker sign-off gate before dispatch to client."
        size="md"
      >
        <ApprovalPanel
          currentUser={currentUser}
          maker={currentComplaint.owner}
          requiredSignoffs={1}
          assignedApprover="Rohan Desai"
          onApprove={(approverName) => {
            setApprovalModalOpen(false);
            toast.show({
              message: `Redressal response approved by independent officer ${approverName}`,
              variant: 'success',
            });
          }}
          onReject={(reason) => {
            setApprovalModalOpen(false);
            toast.show({ message: `Response rejected: ${reason}`, variant: 'warning' });
          }}
        />
      </Modal>

      {/* Modal: Resolve Complaint */}
      <Modal
        open={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Resolve & Dispose Complaint"
        subtitle="Record formal redressal outcome and remedial action."
        size="md"
      >
        <form onSubmit={handleResolveSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
              Remedial Resolution Summary
            </label>
            <textarea
              rows={4}
              required
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              className="w-full p-2 border border-borderColor rounded-md focus:ring-1 focus:ring-brandNavy"
            />
          </div>
          <div className="pt-2 border-t border-borderColor flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setResolveModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 rounded shadow-xs"
            >
              Confirm Disposal
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Reject Complaint */}
      <Modal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Dispatch Non-Acceptance Explanation"
        subtitle="Mandatory statutory explanation due within 5 working days."
        size="md"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
              Explanation for Non-Acceptance
            </label>
            <textarea
              rows={4}
              required
              value={rejectReasonText}
              onChange={(e) => setRejectReasonText(e.target.value)}
              placeholder="State clear legal/regulatory reasons why the grievance is not accepted under exchange operating rules..."
              className="w-full p-2 border border-borderColor rounded-md focus:ring-1 focus:ring-rose-500"
            />
          </div>
          <div className="pt-2 border-t border-borderColor flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold bg-rose-700 text-white hover:bg-rose-800 rounded shadow-xs"
            >
              Dispatch Non-Acceptance
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog: Close Complaint */}
      <ConfirmDialog
        open={closeConfirmOpen}
        onCancel={() => setCloseConfirmOpen(false)}
        onConfirm={handleCloseComplaintConfirm}
        title="Close Complaint Matter File?"
        message="This action marks the complaint file as CLOSED and seals all audit correspondence."
        confirmText="Confirm Closure"
        variant="primary"
      />
    </div>
  );
};

export default ComplaintDetailPage;
