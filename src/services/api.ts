import {
  NoticeItem,
  SportEvent,
  EventAttendance,
  ChatMessage,
  CompletedDrillSession,
  BlogPost,
  AuthUser,
  UserReport,
  PsychologyJournalEntry,
  TacticalScoutingSheet,
  AthleteProfile,
  AthleteEquipmentSetup,
  MatchDiaryEntry
} from '../types';

const TOKEN_KEY = 'tm_guacu_auth_token';
const USER_KEY = 'tm_guacu_auth_user';

export const GUEST_USER: AuthUser = {
  id: 'guest',
  name: 'Visitante Comunitário',
  nickname: 'Visitante',
  role: 'visitante',
  email: 'visitante@tmguacu.com.br'
};

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredSession(user: AuthUser | null, token: string | null) {
  try {
    if (user && token) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.warn('Storage write failed', e);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {})
  };

  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Erro HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export const apiService = {
  auth: {
    getUser: getStoredUser,
    getToken: getStoredToken,
    async login(username: string, password?: string): Promise<AuthUser> {
      const data = await request<{ user: AuthUser; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      setStoredSession(data.user, data.token);
      return data.user;
    },
    async logout(): Promise<void> {
      const token = getStoredToken();
      if (token) {
        try {
          await request('/api/auth/logout', { method: 'POST' });
        } catch (e) {
          console.warn('Remote logout error:', e);
        }
      }
      setStoredSession(null, null);
    },
    async checkSession(): Promise<AuthUser | null> {
      const token = getStoredToken();
      if (!token) return null;
      try {
        const res = await request<{ user: AuthUser | null }>('/api/auth/me');
        if (res.user) {
          setStoredSession(res.user, token);
          return res.user;
        } else {
          setStoredSession(null, null);
          return null;
        }
      } catch {
        setStoredSession(null, null);
        return null;
      }
    },
    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
      await request('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });
    }
  },

  notices: {
    async getAll(): Promise<NoticeItem[]> {
      return await request<NoticeItem[]>('/api/notices');
    },
    async create(noticeData: Partial<NoticeItem>): Promise<NoticeItem> {
      return await request<NoticeItem>('/api/notices', {
        method: 'POST',
        body: JSON.stringify(noticeData)
      });
    },
    async delete(id: string): Promise<void> {
      await request(`/api/notices/${id}`, {
        method: 'DELETE'
      });
    }
  },

  events: {
    async getAll(): Promise<SportEvent[]> {
      return await request<SportEvent[]>('/api/events');
    },
    async create(eventData: Partial<SportEvent>): Promise<SportEvent> {
      return await request<SportEvent>('/api/events', {
        method: 'POST',
        body: JSON.stringify(eventData)
      });
    }
  },

  attendances: {
    async getAll(): Promise<EventAttendance[]> {
      return await request<EventAttendance[]>('/api/attendances');
    },
    async toggle(eventId: string, transportNeed?: string, category?: string): Promise<{ confirmed: boolean; attendances: EventAttendance[] }> {
      return await request<{ confirmed: boolean; attendances: EventAttendance[] }>('/api/attendances/toggle', {
        method: 'POST',
        body: JSON.stringify({ eventId, transportNeed, category })
      });
    }
  },

  chat: {
    async getMessages(): Promise<ChatMessage[]> {
      return await request<ChatMessage[]>('/api/chat');
    },
    async sendMessage(channelId: string, text: string): Promise<ChatMessage> {
      return await request<ChatMessage>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ channelId, text })
      });
    },
    async deleteMessage(id: string): Promise<void> {
      await request(`/api/chat/messages/${id}`, {
        method: 'DELETE'
      });
    }
  },

  reports: {
    async getAll(): Promise<UserReport[]> {
      return await request<UserReport[]>('/api/reports');
    },
    async submit(reportedChannel: string, reason: string, messageId?: string): Promise<UserReport> {
      const res = await request<{ success: boolean; message: string; reportId: string }>('/api/reports', {
        method: 'POST',
        body: JSON.stringify({ reportedChannel, reason, reportedMessageId: messageId })
      });
      return {
        id: res.reportId,
        reporterName: 'Você',
        reporterRole: 'atleta',
        reportedChannel,
        reportedMessageId: messageId,
        reason,
        createdAtISO: new Date().toISOString(),
        status: 'Pendente'
      };
    },
    async resolve(id: string, action: 'dismiss' | 'remove_message', decisionNote?: string): Promise<void> {
      await request(`/api/reports/${id}/resolve`, {
        method: 'PATCH',
        body: JSON.stringify({ action, decisionNote })
      });
    }
  },

  drills: {
    async getHistory(): Promise<CompletedDrillSession[]> {
      return await request<CompletedDrillSession[]>('/api/drills/history');
    },
    async saveSession(session: Partial<CompletedDrillSession>): Promise<CompletedDrillSession> {
      return await request<CompletedDrillSession>('/api/drills/history', {
        method: 'POST',
        body: JSON.stringify(session)
      });
    }
  },

  stories: {
    async getAll(): Promise<BlogPost[]> {
      return await request<BlogPost[]>('/api/stories');
    },
    async submit(story: Partial<BlogPost> & { hasConsent: boolean }): Promise<BlogPost> {
      return await request<BlogPost>('/api/stories', {
        method: 'POST',
        body: JSON.stringify(story)
      });
    },
    async updateStatus(id: string, status: 'Publicado' | 'Arquivado' | 'Em Revisão'): Promise<void> {
      await request(`/api/stories/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    }
  },

  consents: {
    async register(data: {
      policyVersion: string;
      isMinor: boolean;
      legalGuardianName?: string;
      legalGuardianCpf?: string;
      legalGuardianRelationship?: string;
      legalGuardianPhone?: string;
      agreedTerms: boolean;
    }): Promise<{ success: boolean; consentId: string }> {
      return await request<{ success: boolean; consentId: string }>('/api/consents', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
  },

  athletes: {
    async getAll(): Promise<AthleteProfile[]> {
      return await request<AthleteProfile[]>('/api/athletes');
    },
    async getMe(): Promise<AthleteProfile> {
      return await request<AthleteProfile>('/api/athletes/me');
    },
    async updateMe(data: Partial<AthleteProfile>): Promise<{ success: boolean; profile: any }> {
      return await request<{ success: boolean; profile: any }>('/api/athletes/me', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    }
  },

  psychology: {
    async getEntries(): Promise<PsychologyJournalEntry[]> {
      return await request<PsychologyJournalEntry[]>('/api/psychology/journal');
    },
    async addEntry(entry: Omit<PsychologyJournalEntry, 'id' | 'date'>): Promise<PsychologyJournalEntry> {
      return await request<PsychologyJournalEntry>('/api/psychology/journal', {
        method: 'POST',
        body: JSON.stringify(entry)
      });
    },
    async deleteEntry(id: string): Promise<void> {
      await request(`/api/psychology/journal/${id}`, {
        method: 'DELETE'
      });
    }
  },

  tactical: {
    async getScoutings(): Promise<TacticalScoutingSheet[]> {
      return await request<TacticalScoutingSheet[]>('/api/tactical/scouting');
    },
    async addScouting(sheet: Omit<TacticalScoutingSheet, 'id'>): Promise<TacticalScoutingSheet> {
      return await request<TacticalScoutingSheet>('/api/tactical/scouting', {
        method: 'POST',
        body: JSON.stringify(sheet)
      });
    },
    async deleteScouting(id: string): Promise<void> {
      await request(`/api/tactical/scouting/${id}`, {
        method: 'DELETE'
      });
    }
  },

  ai: {
    async getCoachAdvice(params: {
      topic?: string;
      question: string;
      athleteLevel?: string;
      athleteGrip?: string;
    }): Promise<{ source: string; advice: string; disclaimer: string }> {
      return await request<{ source: string; advice: string; disclaimer: string }>('/api/ai/coach-advice', {
        method: 'POST',
        body: JSON.stringify(params)
      });
    }
  },

  equipment: {
    async getMyEquipment(): Promise<AthleteEquipmentSetup | null> {
      const res = await request<{ equipment: AthleteEquipmentSetup | null }>('/api/equipment/my');
      return res.equipment;
    },
    async updateMyEquipment(setup: Partial<AthleteEquipmentSetup>): Promise<{ success: boolean; message: string }> {
      return await request<{ success: boolean; message: string }>('/api/equipment/my', {
        method: 'PUT',
        body: JSON.stringify(setup)
      });
    }
  },

  matches: {
    async getMatches(): Promise<MatchDiaryEntry[]> {
      return await request<MatchDiaryEntry[]>('/api/matches');
    },
    async saveMatch(entry: Omit<MatchDiaryEntry, 'id' | 'createdAtISO'>): Promise<MatchDiaryEntry> {
      return await request<MatchDiaryEntry>('/api/matches', {
        method: 'POST',
        body: JSON.stringify(entry)
      });
    },
    async deleteMatch(id: string): Promise<void> {
      await request(`/api/matches/${id}`, {
        method: 'DELETE'
      });
    }
  }
};
