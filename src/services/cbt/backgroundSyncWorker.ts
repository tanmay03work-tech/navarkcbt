/**
 * 10-Second Jittered Delta Background Sync Worker
 * Periodically batches and syncs answer deltas to Supabase.
 * Prevents server thrashing and handles offline network buffers gracefully.
 */

import { supabase } from '@/lib/supabase';
import { StudentAnswer } from '@/types';

export type SyncState = 'IDLE' | 'SYNCING' | 'SYNCED' | 'OFFLINE_BUFFER' | 'ERROR';

export interface BackgroundSyncConfig {
  sessionId: string;
  institutionId: string;
  examId: string;
  studentId: string;
  baseIntervalMs?: number;
  getTimeRemainingSeconds: () => number;
  getCurrentQIndex: () => number;
  getAttemptedCount: () => number;
  getUnattemptedCount: () => number;
  getFlaggedCount: () => number;
  getAllAnswers: () => Record<string, StudentAnswer>;
  onSyncStateChange?: (state: SyncState, lastSyncedAt?: Date) => void;
}

export class BackgroundSyncWorker {
  private config: BackgroundSyncConfig;
  private timer: any = null;
  private isRunning: boolean = false;
  private currentVersion: number = 1;
  private lastSyncedHash: string = '';
  private syncState: SyncState = 'IDLE';

  constructor(config: BackgroundSyncConfig) {
    this.config = {
      baseIntervalMs: 10_000,
      ...config,
    };
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.scheduleNextTick();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.setSyncState('IDLE');
  }

  private setSyncState(state: SyncState, lastSyncedAt?: Date): void {
    this.syncState = state;
    this.config.onSyncStateChange?.(state, lastSyncedAt);
  }

  private scheduleNextTick(): void {
    if (!this.isRunning) return;

    // Add +/- 1500ms random jitter to prevent server thundering herd
    const jitter = Math.floor(Math.random() * 3000) - 1500;
    const interval = Math.max(5000, (this.config.baseIntervalMs || 10_000) + jitter);

    this.timer = setTimeout(async () => {
      await this.performSync();
      if (this.isRunning) {
        this.scheduleNextTick();
      }
    }, interval);
  }

  public async performSync(force: boolean = false): Promise<boolean> {
    const answers = this.config.getAllAnswers();
    const answersJsonString = JSON.stringify(answers);

    // Skip if nothing changed and not forced
    if (!force && answersJsonString === this.lastSyncedHash) {
      return true;
    }

    if (!navigator.onLine) {
      this.setSyncState('OFFLINE_BUFFER');
      return false;
    }

    this.setSyncState('SYNCING');

    try {
      this.currentVersion += 1;
      const { data, error } = await supabase.rpc('sync_cbt_answer_delta', {
        p_session_id: this.config.sessionId,
        p_institution_id: this.config.institutionId,
        p_exam_id: this.config.examId,
        p_student_id: this.config.studentId,
        p_version_id: this.currentVersion,
        p_time_remaining_seconds: this.config.getTimeRemainingSeconds(),
        p_answers_json: answers,
        p_current_q_index: this.config.getCurrentQIndex(),
        p_attempted_count: this.config.getAttemptedCount(),
        p_unattempted_count: this.config.getUnattemptedCount(),
        p_flagged_count: this.config.getFlaggedCount(),
      });

      if (error) {
        console.warn('Background sync error:', error);
        this.setSyncState('OFFLINE_BUFFER');
        return false;
      }

      this.lastSyncedHash = answersJsonString;
      this.setSyncState('SYNCED', new Date());
      return true;
    } catch (err) {
      console.warn('Failed to dispatch 10s sync delta:', err);
      this.setSyncState('OFFLINE_BUFFER');
      return false;
    }
  }
}

