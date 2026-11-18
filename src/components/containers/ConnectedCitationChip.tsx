// src/components/containers/ConnectedCitationChip.tsx
import React from 'react';
import { CitationChip } from '../ui/CitationChip';
import { useAppStore } from '../../store';

interface ConnectedCitationChipProps {
  sourceId: string;
  clause: string;
  className?: string;
}

export const ConnectedCitationChip: React.FC<ConnectedCitationChipProps> = ({
  sourceId,
  clause,
  className,
}) => {
  const regulations = useAppStore((s) => s.regulations);
  const reg = regulations.find((r) => r.id === sourceId || r.code === sourceId);
  const sourceTitle = reg ? reg.title : 'IFSCA Regulatory Mandate';
  const code = reg ? reg.id : sourceId;

  return (
    <CitationChip
      className={className}
      code={code}
      clause={clause}
      sourceTitle={sourceTitle}
      clauseText={reg?.summary}
    />
  );
};
