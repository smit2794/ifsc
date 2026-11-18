// src/components/containers/ConnectedApprovalPanel.tsx
import React from 'react';
import { ApprovalPanel } from '../ui/ApprovalPanel';
import { useAppStore, useCurrentUser } from '../../store';

interface ConnectedApprovalPanelProps {
  approvalRecordId: string;
  className?: string;
}

export const ConnectedApprovalPanel: React.FC<ConnectedApprovalPanelProps> = ({
  approvalRecordId,
  className,
}) => {
  const currentUser = useCurrentUser();
  const approvals = useAppStore((s) => s.approvals);
  const recordApprovalSignoff = useAppStore((s) => s.recordApprovalSignoff);
  const rejectApproval = useAppStore((s) => s.rejectApproval);
  const routeApproval = useAppStore((s) => s.routeApproval);

  const record = approvals.find((a) => a.id === approvalRecordId);

  if (!record) {
    return null;
  }

  return (
    <ApprovalPanel
      className={className}
      maker={record.maker}
      currentUser={{ id: currentUser.id, name: currentUser.name }}
      requiredSignoffs={record.requiredSignoffs}
      state={record.state}
      assignedApprover={record.assignedApprover}
      secondApprover={record.secondApprover}
      approvedBy={record.approvedSignoffs.map((s) => s.approver)}
      rejectedReason={record.rejectedReason}
      onApprove={(approverName, code) => recordApprovalSignoff(record.id, approverName, code)}
      onReject={(reason) => rejectApproval(record.id, reason)}
      onRoute={(approverName) => routeApproval(record.id, approverName)}
    />
  );
};
