// src/components/containers/ConnectedAIDraftBanner.tsx
import React from 'react';
import { AIDraftBanner } from '../ui/AIDraftBanner';
import { useAppStore } from '../../store';

interface ConnectedAIDraftBannerProps {
  investigationId: string;
  className?: string;
}

export const ConnectedAIDraftBanner: React.FC<ConnectedAIDraftBannerProps> = ({
  investigationId,
  className,
}) => {
  const investigations = useAppStore((s) => s.aiInvestigations);
  const acceptAISuggestion = useAppStore((s) => s.acceptAISuggestion);
  const rejectAISuggestion = useAppStore((s) => s.rejectAISuggestion);

  const item = investigations.find((inv) => inv.id === investigationId);

  if (!item) {
    return null;
  }

  return (
    <AIDraftBanner
      className={className}
      title={item.title}
      confidence={96}
      citedEventsCount={3}
      onAccept={() => acceptAISuggestion(item.id)}
      onReject={(reason) => rejectAISuggestion(item.id, reason)}
    />
  );
};
