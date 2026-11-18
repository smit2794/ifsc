// src/components/layout/FloatingAIAssistant.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  X,
  Minus,
  Maximize2,
  Send,
  ExternalLink,
  PlusCircle,
  Bot,
  User,
} from 'lucide-react';
import { useAppStore, useAssistant } from '../../store';
import { CitationChip } from '../ui/CitationChip';
import { useToast } from '../ui/Toast';
import { buildLink } from '../../utils/buildLink';
import { AISuggestedAction } from '../../types';

interface StreamingTextProps {
  text: string;
  isLatest: boolean;
  onFinish?: () => void;
}

const StreamingText: React.FC<StreamingTextProps> = ({ text, isLatest, onFinish }) => {
  const [displayedChars, setDisplayedChars] = useState(isLatest ? 0 : text.length);

  useEffect(() => {
    if (!isLatest) {
      setDisplayedChars(text.length);
      return;
    }

    setDisplayedChars(0);
    const step = 8;
    let timer: ReturnType<typeof setTimeout>;
    let currentLength = 0;

    const tick = () => {
      currentLength += step;
      if (currentLength >= text.length) {
        setDisplayedChars(text.length);
        onFinish?.();
      } else {
        setDisplayedChars(currentLength);
        timer = setTimeout(tick, 20);
      }
    };

    timer = setTimeout(tick, 20);
    return () => clearTimeout(timer);
  }, [text, isLatest, onFinish]);

  const visibleContent = text.slice(0, displayedChars);

  return (
    <div className="text-xs text-textPrimary whitespace-pre-wrap leading-relaxed font-sans">
      {visibleContent}
      {isLatest && displayedChars < text.length && (
        <span className="inline-block w-1.5 h-3 ml-0.5 bg-brandNavy animate-pulse align-middle" />
      )}
    </div>
  );
};

export const FloatingAIAssistant: React.FC = () => {
  const navigate = useNavigate();
  const assistant = useAssistant();
  const promptChips = useAppStore((s) => s.promptChips);
  const sendAssistantMessage = useAppStore((s) => s.sendAssistantMessage);
  const setAssistantOpen = useAppStore((s) => s.setAssistantOpen);
  const setAssistantMinimised = useAppStore((s) => s.setAssistantMinimised);
  const createTaskFromSuggestion = useAppStore((s) => s.createTaskFromSuggestion);

  const toast = useToast();
  const [inputQuery, setInputQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (assistant.isOpen && !assistant.isMinimised) {
      scrollToBottom();
    }
  }, [assistant.messages, assistant.isOpen, assistant.isMinimised]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = inputQuery.trim();
    if (!q) return;

    sendAssistantMessage(q);
    setInputQuery('');
  };

  const handleChipClick = (query: string) => {
    sendAssistantMessage(query);
  };

  const handleActionClick = (action: AISuggestedAction) => {
    if (action.targetType === 'CREATE_TASK') {
      createTaskFromSuggestion({
        title: `Manual Review: ${action.targetId || 'Regulatory telemetry anomaly'}`,
        priority: 'HIGH',
        category: 'EXCEPTION_REMEDIATION',
        description: `Task created from AI investigation synthesis for query: ${action.targetId || 'Unmatched inquiry'}`,
      });
      toast.show({ message: 'Task created from AI suggestion', variant: 'success' });
      return;
    }

    if (action.targetType === 'CASES') {
      navigate(action.targetId ? `/clients/cases/${action.targetId}` : buildLink('/clients', { tab: 'cases' }));
    } else if (action.targetType === 'CONTROLS') {
      navigate(buildLink('/controls', action.targetParams || { control: action.targetId }));
    } else if (action.targetType === 'INCIDENTS') {
      navigate(action.targetId ? `/incidents/${action.targetId}` : '/incidents');
    } else if (action.targetType === 'REPORTS') {
      navigate(buildLink('/reports', action.targetParams || { report: action.targetId }));
    } else if (action.targetType === 'COMPLAINTS') {
      navigate(buildLink('/complaints', action.targetParams || { id: action.targetId }));
    } else if (action.targetType === 'GOVERNANCE') {
      navigate(buildLink('/governance', action.targetParams || {}));
    } else if (action.targetType === 'CYBER_VENDORS') {
      navigate(buildLink('/cyber-vendors', action.targetParams || {}));
    } else if (action.targetType === 'AI') {
      navigate(buildLink('/ai', action.targetParams || {}));
    } else {
      navigate(buildLink('/command-centre', {}));
    }

    setAssistantOpen(false);
  };

  // If floating panel is not open, show the floating launcher button
  if (!assistant.isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setAssistantOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-brandNavy text-white rounded-full shadow-lg hover:bg-slate-900 hover:shadow-xl transition-all duration-200 border border-blue-400/30"
          title="Open IFSC TrustOps AI Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
          </div>
          <span className="text-xs font-semibold tracking-wide">TrustOps Assistant</span>
        </button>
      </div>
    );
  }

  // If minimised, show compact docking bar
  if (assistant.isMinimised) {
    return (
      <div className="fixed bottom-4 right-6 z-50 w-80 bg-brandNavy text-white rounded-lg shadow-xl border border-blue-400/30 flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold">TrustOps AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setAssistantMinimised(false)}
            className="p-1 hover:bg-white/10 rounded transition-colors text-white/80 hover:text-white"
            title="Expand Assistant"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setAssistantOpen(false)}
            className="p-1 hover:bg-white/10 rounded transition-colors text-white/80 hover:text-white"
            title="Close Assistant"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Full 400px panel view
  return (
    <>
      <div
        className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-5rem)] bg-white rounded-xl shadow-2xl border border-borderColor flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        style={{ width: '400px' }}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-brandNavy text-white flex items-center justify-between border-b border-blue-900 select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-400/40">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold tracking-tight">TrustOps Copilot</h3>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <p className="text-[10px] text-blue-200">GIFT IFSC Regulatory Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setAssistantMinimised(true)}
              className="p-1.5 hover:bg-white/10 rounded-md text-white/70 hover:text-white transition-colors"
              title="Minimise"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setAssistantOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-md text-white/70 hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Suggested Prompt Chips (Scrollable strip) */}
        <div className="p-2.5 bg-slate-50 border-b border-borderColor">
          <p className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider mb-1.5 px-0.5">
            Suggested Verification Prompts:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {promptChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleChipClick(chip.query)}
                className="text-[11px] text-left px-2 py-1 rounded bg-white hover:bg-blue-50 text-brandNavy font-medium border border-borderColor hover:border-blue-300 transition-colors shadow-xs"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Thread */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-bgPage/40">
          {assistant.messages.map((msg, idx) => {
            const isUser = msg.sender === 'USER';
            const isLatest = idx === assistant.messages.length - 1 && !isUser;

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-6 h-6 rounded-full bg-brandNavy text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2.5 shadow-xs ${
                    isUser
                      ? 'bg-brandNavy text-white rounded-br-none'
                      : 'bg-white border border-borderColor text-textPrimary rounded-bl-none'
                  }`}
                >
                  {isUser ? (
                    <div className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                  ) : (
                    <div className="space-y-2">
                      <StreamingText text={msg.text} isLatest={isLatest} />

                      {/* Citations if available */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="pt-2 border-t border-borderColor/60 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] font-semibold text-textSecondary">
                            Statutory Basis:
                          </span>
                          {msg.citations.map((cite, cIdx) => (
                            <CitationChip
                              key={cIdx}
                              code={cite.code}
                              clause={cite.clause}
                              sourceTitle={cite.title}
                            />
                          ))}
                        </div>
                      )}

                      {/* Suggested Actions */}
                      {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                        <div className="pt-2 border-t border-borderColor/60 flex flex-wrap gap-1.5">
                          {msg.suggestedActions.map((action, aIdx) => {
                            const isCreate = action.targetType === 'CREATE_TASK';

                            return (
                              <button
                                key={aIdx}
                                type="button"
                                onClick={() => handleActionClick(action)}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                                  isCreate
                                    ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                                    : 'bg-blue-50 text-brandNavy border border-blue-200 hover:bg-blue-100'
                                }`}
                              >
                                {isCreate ? (
                                  <PlusCircle className="w-3 h-3 text-amber-700" />
                                ) : (
                                  <ExternalLink className="w-3 h-3 text-brandNavy" />
                                )}
                                <span>{action.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className={`text-[9px] mt-1 ${
                      isUser ? 'text-blue-200 text-right' : 'text-textSecondary text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-2.5 bg-white border-t border-borderColor">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask regarding controls, glitch clocks, or regulations..."
              className="w-full text-xs py-2 pl-3 pr-10 border border-borderColor rounded-lg focus:outline-none focus:ring-1 focus:ring-brandNavy focus:border-brandNavy"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="absolute right-1.5 p-1 text-brandNavy hover:text-slate-900 disabled:opacity-40 transition-opacity"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[9px] text-textSecondary text-center mt-1.5 italic">
            Institution-side compliance engine. Responses cite verified GIFT IFSC statutory sources.
          </p>
        </form>
      </div>
    </>
  );
};
