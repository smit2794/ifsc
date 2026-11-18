// src/types/ai.ts
export interface AISuggestedAction {
  label: string;
  targetType: string;
  targetId?: string;
  targetParams?: Record<string, string>;
}

export interface ScriptedAIResponseItem {
  id: string;
  triggerKeywords: string[];
  intent: string;
  headline: string;
  responseMarkdown: string;
  confidenceScore: number;
  citations: Array<{
    code: string;
    clause: string;
    title: string;
  }>;
  suggestedActions: AISuggestedAction[];
}

export interface AIAgentCardItem {
  id: string;
  name: string;
  specialization: string;
  domain: string;
  status: 'ACTIVE' | 'CALIBRATING';
  confidenceThreshold: number;
  description: string;
  verifiedOutputsCount: number;
}

export interface PromptChipItem {
  id: string;
  label: string;
  query: string;
  category: 'INVESTIGATION' | 'REGULATORY_QUERY' | 'CONTROL_GAP' | 'INCIDENT_TRIAGE';
}
