import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface MemoryRecord {
  id: number;
  project_id: number;
  project_name: string;
  project_code: string;
  finding_id?: number;
  hindsight_memory_id?: string;
  vulnerability_category?: string;
  severity?: string;
  sanitized_title: string;
  sanitized_summary: string;
  remediation_notes?: string;
  retest_outcome?: string;
  retained_by_email: string;
  created_at?: string;
}

export interface SimilarFinding {
  id?: number;
  project_id: number;
  project_name: string;
  finding_id?: number;
  finding_title: string;
  vulnerability_category: string;
  severity: string;
  remediation_summary: string;
  retest_status: string;
  similarity_score: number;
  explanation: string;
  created_at?: string;
}

export interface MemoryCitation {
  project_name: string;
  finding_title: string;
  severity: string;
  retest_status: string;
  remediation_summary?: string;
}

export interface MemoryChatResponse {
  question: string;
  answer: string;
  has_relevant_memories: boolean;
  citations: MemoryCitation[];
}

export interface ContextChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ContextChatResponse {
  answer: string;
  references: MemoryCitation[];
}

export interface FloatingChatResponse {
  question: string;
  answer: string;
  has_past_memories: boolean;
  citations: MemoryCitation[];
}

export const memoryApi = {
  listRecords: async (limit = 50, offset = 0): Promise<MemoryRecord[]> => {
    try {
      const res = await client.get('/memory/records', { params: { limit, offset } });
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return [];
    }
  },

  retainFinding: async (findingId: number, remediationNotes?: string, retestOutcome?: string): Promise<MemoryRecord> => {
    const res = await client.post('/memory/retain', {
      finding_id: findingId,
      remediation_notes: remediationNotes,
      retest_outcome: retestOutcome,
    });
    return res.data;
  },

  getSimilarFindings: async (query: string, targetProjectId?: number, limit = 5): Promise<SimilarFinding[]> => {
    try {
      const res = await client.post('/memory/similar-findings', {
        query,
        target_project_id: targetProjectId,
        limit,
      });
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return [];
    }
  },

  checkStepSimilarity: async (projectId: number, findingTitle: string, stepCaption?: string, findingDesc?: string, findingId?: number) => {
    try {
      const res = await client.post<{ has_similarity: boolean; similar_count: number; similar_memories: SimilarFinding[] }>('/memory/check-step-similarity', {
        project_id: projectId,
        finding_id: findingId,
        finding_title: findingTitle,
        step_caption: stepCaption || '',
        finding_description: findingDesc || '',
      });
      return res.data;
    } catch {
      return { has_similarity: false, similar_count: 0, similar_memories: [] };
    }
  },

  contextChat: async (findingTitle: string, stepCaption: string, similarMemories: SimilarFinding[], messages: ContextChatMessage[]): Promise<ContextChatResponse> => {
    const res = await client.post('/memory/context-chat', {
      finding_title: findingTitle,
      step_caption: stepCaption,
      similar_memories: similarMemories,
      messages,
    });
    return res.data;
  },

  floatingChat: async (question: string, messages: ContextChatMessage[] = []): Promise<FloatingChatResponse> => {
    const res = await client.post('/memory/floating-chat', {
      question,
      messages,
    });
    return res.data;
  },

  chat: async (question: string, projectId?: number): Promise<MemoryChatResponse> => {
    const res = await client.post('/memory/chat', { question, project_id: projectId });
    return res.data;
  },

  submitFeedback: async (findingId: number, suggestedMemoryId?: number, isRelevant?: boolean, remediationAction?: string, notes?: string) => {
    const res = await client.post('/memory/feedback', {
      finding_id: findingId,
      suggested_memory_id: suggestedMemoryId,
      is_relevant: isRelevant,
      remediation_action: remediationAction,
      feedback_notes: notes,
    });
    return res.data;
  },
};
