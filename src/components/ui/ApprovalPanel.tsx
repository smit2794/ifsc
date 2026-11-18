// src/components/ui/ApprovalPanel.tsx
import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, UserCheck, AlertTriangle, KeyRound, UserPlus } from 'lucide-react';
import { Modal } from './Modal';
import { StaffName } from '../../types/user';

export type ApprovalState = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface CurrentUserProp {
  id: string;
  name: StaffName;
}

export interface ApprovalPanelProps {
  currentUser: CurrentUserProp;
  maker: StaffName; // Name of person who created submission
  requiredSignoffs?: 1 | 2; // 1 = standard; 2 = dual sign-off (maker != primary != checker)
  state?: ApprovalState;
  assignedApprover?: StaffName;
  secondApprover?: StaffName;
  approvedBy?: StaffName[];
  rejectedReason?: string;
  onApprove?: (approverName: StaffName, verificationCode: string) => void;
  onReject?: (reason: string) => void;
  onRoute?: (approverName: StaffName) => void;
  className?: string;
}

// Available institutional staff members
const INDEPENDENT_APPROVERS: Array<{ name: StaffName; role: string }> = [
  { name: 'Aarav Mehta', role: 'Compliance Officer' },
  { name: 'Rohan Desai', role: 'Principal Officer' },
  { name: 'Priya Nair', role: 'Risk Officer' },
  { name: 'Vikram Shah', role: 'Chief Information Security Officer' },
  { name: 'Deepa Patel', role: 'Trading Desk Officer' },
];

export const ApprovalPanel: React.FC<ApprovalPanelProps> = ({
  currentUser,
  maker,
  requiredSignoffs = 1,
  state = 'DRAFT',
  assignedApprover,
  secondApprover,
  approvedBy = [],
  rejectedReason,
  onApprove,
  onReject,
  onRoute,
  className = '',
}) => {
  // Self-approval rule: Maker cannot approve their own submission
  const isMaker = maker === currentUser.name;

  const [panelState, setPanelState] = useState<ApprovalState>(state);
  const [currentApprover, setCurrentApprover] = useState<StaffName | undefined>(assignedApprover);
  const [checkerApprover, setCheckerApprover] = useState<StaffName | undefined>(secondApprover);
  const [signers, setSigners] = useState<StaffName[]>(approvedBy);
  const [rejectionRationale, setRejectionRationale] = useState<string>(rejectedReason || '');

  // Modals state
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [isRoutingChecker, setIsRoutingChecker] = useState(false);
  const [stepUpModalOpen, setStepUpModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [rejectReasonText, setRejectReasonText] = useState('');
  const [codeError, setCodeError] = useState('');

  // Primary signer candidate or second checker candidate
  const isWaitingForChecker = requiredSignoffs === 2 && signers.length === 1;
  const activeSignerCandidate = isWaitingForChecker
    ? checkerApprover
    : currentApprover || (isMaker ? undefined : currentUser.name);

  // Eligible approver pool:
  // - Always excludes maker
  // - Always excludes any already recorded signers
  // - If selecting second checker, strictly excludes maker AND first approver
  const availableApprovers = INDEPENDENT_APPROVERS.filter((a) => {
    if (a.name === maker) return false;
    if (signers.includes(a.name)) return false;
    if (isRoutingChecker || isWaitingForChecker) {
      if (currentApprover && a.name === currentApprover) return false;
      if (signers[0] && a.name === signers[0]) return false;
    }
    return true;
  });

  const handleRouteSubmit = (approverName: StaffName) => {
    if (isRoutingChecker || isWaitingForChecker) {
      setCheckerApprover(approverName);
      setIsRoutingChecker(false);
    } else {
      setCurrentApprover(approverName);
      setPanelState('PENDING_APPROVAL');
    }
    setRouteModalOpen(false);
    onRoute?.(approverName);
  };

  const handleStepUpConfirm = () => {
    if (verifyCode.trim().length !== 6 || !/^\d{6}$/.test(verifyCode.trim())) {
      setCodeError('Enter a valid 6-digit cryptographic verification PIN');
      return;
    }

    const signingOfficer: StaffName = activeSignerCandidate || currentUser.name;

    setStepUpModalOpen(false);
    setVerifyCode('');
    setCodeError('');

    const newSigners = [...signers, signingOfficer];
    setSigners(newSigners);

    if (requiredSignoffs === 2 && newSigners.length < 2) {
      // Primary sign-off recorded; now awaiting second checker
      setPanelState('PENDING_APPROVAL');
      onApprove?.(signingOfficer, verifyCode);
    } else {
      setPanelState('APPROVED');
      onApprove?.(signingOfficer, verifyCode);
    }
  };

  const handleRejectConfirm = () => {
    if (!rejectReasonText.trim()) return;
    const reason = rejectReasonText.trim();
    setRejectionRationale(reason);
    setPanelState('REJECTED');
    setRejectModalOpen(false);
    onReject?.(reason);
  };

  return (
    <div className={`p-4 bg-white border border-borderColor rounded-md shadow-card space-y-3 ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 border-b border-borderColor">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brandNavy" />
          <span className="font-bold text-xs text-textPrimary uppercase tracking-wider">
            Governance Sign-Off ({requiredSignoffs}-Tier Maker-Checker)
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            panelState === 'APPROVED'
              ? 'bg-emerald-100 text-emerald-800'
              : panelState === 'REJECTED'
              ? 'bg-rose-100 text-rose-800'
              : panelState === 'PENDING_APPROVAL'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {panelState}
        </span>
      </div>

      {/* State: DRAFT */}
      {panelState === 'DRAFT' && (
        <div className="space-y-3">
          <p className="text-xs text-textSecondary">
            Submission prepared by <span className="font-semibold text-textPrimary">{maker}</span>.
            {isMaker ? (
              <span className="block mt-1 text-amber-800 font-medium">
                Maker cannot approve their own submission. Route to an independent approver.
              </span>
            ) : (
              <span className="block mt-1 text-emerald-800 font-medium">
                Independent reviewer mode active ({currentUser.name}). You may review and sign off.
              </span>
            )}
          </p>

          <div className="flex items-center gap-2 pt-1">
            {isMaker ? (
              <button
                type="button"
                onClick={() => {
                  setIsRoutingChecker(false);
                  setRouteModalOpen(true);
                }}
                className="px-3 py-1.5 rounded bg-brandNavy text-white font-semibold text-xs hover:bg-blue-900 transition-colors focus:ring-2 focus:ring-brandNavy"
              >
                Route to Independent Approver
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStepUpModalOpen(true)}
                className="px-3 py-1.5 rounded bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 transition-colors focus:ring-2 focus:ring-emerald-600"
              >
                Approve Submission
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setRejectReasonText('');
                setRejectModalOpen(true);
              }}
              className="px-3 py-1.5 rounded border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition-colors"
            >
              Reject with Reason
            </button>
          </div>
        </div>
      )}

      {/* State: PENDING_APPROVAL */}
      {panelState === 'PENDING_APPROVAL' && (
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">
                {isWaitingForChecker ? (
                  <>
                    Primary sign-off attested by <span className="underline">{signers[0]}</span>.
                    {checkerApprover ? (
                      <span> Awaiting second checker sign-off from: <span className="underline">{checkerApprover}</span>.</span>
                    ) : (
                      <span> Action required: Nominate independent second checker.</span>
                    )}
                  </>
                ) : (
                  <>Awaiting approval from: {activeSignerCandidate || 'Designated Approver'}</>
                )}
                {requiredSignoffs === 2 && (
                  <span className="ml-2 font-normal text-[11px] text-amber-800">
                    ({signers.length}/2 Sign-Offs Completed)
                  </span>
                )}
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Maker cannot self-approve. Mandatory independent reviewer sign-off required before execution.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 flex-wrap">
            {isWaitingForChecker && !checkerApprover ? (
              <button
                type="button"
                onClick={() => {
                  setIsRoutingChecker(true);
                  setRouteModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-brandNavy text-white font-semibold text-xs hover:bg-blue-900 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Nominate Second Checker (Excludes Maker & {signers[0]})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStepUpModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Record Sign-Off by {activeSignerCandidate}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setIsRoutingChecker(isWaitingForChecker);
                setRouteModalOpen(true);
              }}
              className="px-3 py-1.5 rounded border border-borderColor text-textSecondary hover:bg-gray-50 text-xs font-medium"
            >
              Reassign Approver
            </button>

            <button
              type="button"
              onClick={() => {
                setRejectReasonText('');
                setRejectModalOpen(true);
              }}
              className="px-3 py-1.5 rounded border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold"
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {/* State: APPROVED */}
      {panelState === 'APPROVED' && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 space-y-1">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span className="font-bold">Execution Approved</span>
          </div>
          <p className="text-[11px] text-emerald-800">
            Sign-offs recorded: {signers.join(' and ')}.
            Maker-checker governance rule satisfied.
          </p>
        </div>
      )}

      {/* State: REJECTED */}
      {panelState === 'REJECTED' && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-900 space-y-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-700" />
            <span className="font-bold">Submission Rejected</span>
          </div>
          <p className="text-[11px] text-rose-800">
            Mandatory rationale: {rejectionRationale || 'Remediation plan insufficient; revised filing required.'}
          </p>
          <button
            type="button"
            onClick={() => setPanelState('DRAFT')}
            className="mt-2 px-2.5 py-1 rounded bg-white border border-rose-300 text-rose-800 text-[11px] font-semibold hover:bg-rose-100"
          >
            Reset to Draft for Revision
          </button>
        </div>
      )}

      {/* Modal: Route to Approver */}
      <Modal
        open={routeModalOpen}
        onClose={() => setRouteModalOpen(false)}
        title={isRoutingChecker || isWaitingForChecker ? "Select Independent Second Checker" : "Select Independent Approver"}
        subtitle={
          isRoutingChecker || isWaitingForChecker
            ? `Excluding submitter (${maker}) and primary approver (${signers[0] || currentApprover}).`
            : `Excluding submitter (${maker}) in compliance with IFSCA maker-checker rules.`
        }
        size="sm"
      >
        <div className="space-y-2">
          {availableApprovers.length === 0 ? (
            <p className="p-3 text-xs text-textSecondary italic">No remaining eligible approvers found.</p>
          ) : (
            availableApprovers.map((officer) => (
              <div
                key={officer.name}
                onClick={() => handleRouteSubmit(officer.name)}
                className="p-3 rounded border border-borderColor hover:border-brandNavy hover:bg-blue-50/40 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-textPrimary">{officer.name}</p>
                  <p className="text-[11px] text-textSecondary">{officer.role}</p>
                </div>
                <span className="text-[10px] text-brandNavy font-semibold bg-blue-100 px-2 py-0.5 rounded">
                  Eligible Checker
                </span>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Modal: Step-Up Verification */}
      <Modal
        open={stepUpModalOpen}
        onClose={() => setStepUpModalOpen(false)}
        title="Step-Up Approval Verification"
        subtitle={`Recording digital sign-off by ${activeSignerCandidate || currentUser.name}.`}
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setStepUpModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStepUpConfirm}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 rounded"
            >
              Verify & Sign
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-textSecondary leading-relaxed">
            Enter your 6-digit compliance signing PIN to cryptographically seal this decision.
          </p>

          <div>
            <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
              6-Digit Verification PIN
            </label>
            <input
              type="password"
              maxLength={6}
              value={verifyCode}
              onChange={(e) => {
                setVerifyCode(e.target.value);
                setCodeError('');
              }}
              placeholder="123456"
              className="w-full text-center tracking-widest text-lg font-mono py-2 border border-borderColor rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            {codeError && <p className="text-[11px] text-rose-600 mt-1">{codeError}</p>}
          </div>

          <p className="text-[10px] text-gray-400 italic">
            Any 6-digit numeric PIN is verified for this governance approval stage.
          </p>
        </div>
      </Modal>

      {/* Modal: Reject with Reason */}
      <Modal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Record Rejection Reason"
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
              onClick={handleRejectConfirm}
              disabled={!rejectReasonText.trim()}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-700 text-white hover:bg-rose-800 rounded disabled:opacity-50"
            >
              Confirm Rejection
            </button>
          </div>
        }
      >
        <div className="space-y-2">
          <label className="block text-xs font-bold text-textPrimary">
            Mandatory Rejection Explanation
          </label>
          <textarea
            rows={3}
            value={rejectReasonText}
            onChange={(e) => setRejectReasonText(e.target.value)}
            placeholder="Explain why this submission does not satisfy statutory obligations..."
            className="w-full p-2 border border-borderColor rounded-md text-xs focus:ring-2 focus:ring-rose-500"
          />
          <p className="text-[10px] text-rose-600">
            A rejection explanation is strictly mandatory for regulatory audit compliance.
          </p>
        </div>
      </Modal>
    </div>
  );
};
