// src/components/ui/ChatMessage.tsx
import React from 'react';
import { Sparkles, User } from 'lucide-react';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { CitationChip, CitationChipProps } from './CitationChip';

export interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  confidence?: number;
  citations?: CitationChipProps[];
  className?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  timestamp,
  confidence,
  citations = [],
  className = '',
}) => {
  const isUser = role === 'user';

  return (
    <div
      className={`flex items-start gap-2.5 text-xs ${
        isUser ? 'flex-row-reverse' : ''
      } ${className}`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white ${
          isUser ? 'bg-brandNavy' : 'bg-teal-700'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[85%] rounded-md p-3 space-y-2 ${
          isUser
            ? 'bg-brandNavy text-white'
            : 'bg-white border border-borderColor text-textPrimary shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between gap-2 text-[10px] opacity-75 pb-1 border-b border-current/10">
          <span className="font-semibold">{isUser ? 'Aarav Mehta' : 'TrustOps Intelligence Agent'}</span>
          {timestamp && <span className="tabular-nums">{timestamp}</span>}
        </div>

        <p className="leading-relaxed whitespace-pre-wrap">{content}</p>

        {!isUser && (confidence !== undefined || citations.length > 0) && (
          <div className="pt-2 border-t border-borderColor/60 flex flex-wrap items-center gap-1.5">
            {confidence !== undefined && <ConfidenceIndicator score={confidence} />}
            {citations.map((c, i) => (
              <CitationChip key={i} {...c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
