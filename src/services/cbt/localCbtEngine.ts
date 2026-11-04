/**
 * Local-First Disaster Recovery Engine
 * Manages zero-latency offline caching, IndexedDB/LocalStorage persistence,
 * and recovery after accidental tab closes, power failures, or crashes.
 */

import { StudentAnswer } from '@/types';

export interface LocalCbtSession {
  sessionId: string;
  examId: string;
  studentId: string;
  answers: Record<string, StudentAnswer>;
  timeRemainingSeconds: number;
  currentQuestionIndex: number;
  currentSectionIndex: number;
  version: number;
  violationsCount: number;
  lastSavedAt: string;
  isSubmitted: boolean;
}

const STORAGE_KEY_PREFIX = 'navark_cbt_session_';

export const localCbtEngine = {
  getSessionKey(examId: string, studentId: string): string {
    return `${STORAGE_KEY_PREFIX}${examId}_${studentId}`;
  },

  saveLocalSession(session: LocalCbtSession): void {
    try {
      const key = this.getSessionKey(session.examId, session.studentId);
      const payload = {
        ...session,
        lastSavedAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to write local CBT session disaster cache:', e);
    }
  },

  loadLocalSession(examId: string, studentId: string): LocalCbtSession | null {
    try {
      const key = this.getSessionKey(examId, studentId);
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  clearLocalSession(examId: string, studentId: string): void {
    try {
      const key = this.getSessionKey(examId, studentId);
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Failed to clear local CBT session:', e);
    }
  },
};

