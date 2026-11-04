/**
 * CBT Anti-Cheat & Tab-Switch Proctoring Engine
 * Monitors window blur, tab switching, and fullscreen state.
 * Implements the 3-strike warning policy and logs violations to Supabase.
 */

import { supabase } from '@/lib/supabase';

export interface ProctoringCallbacks {
  onWarning: (strikeCount: number, message: string) => void;
  onLockSession: (reason: string) => void;
}

export class CbtProctoringEngine {
  private sessionId: string;
  private institutionId: string;
  private studentId: string;
  private callbacks: ProctoringCallbacks;
  private violationsCount: number = 0;
  private isListening: boolean = false;
  private isHandlingViolation: boolean = false;
  private lastViolationTime: number = 0;

  constructor(
    sessionId: string,
    institutionId: string,
    studentId: string,
    initialViolations: number,
    callbacks: ProctoringCallbacks
  ) {
    this.sessionId = sessionId;
    this.institutionId = institutionId;
    this.studentId = studentId;
    this.violationsCount = initialViolations;
    this.callbacks = callbacks;
  }

  public startMonitoring(): void {
    if (this.isListening) return;
    this.isListening = true;

    window.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('blur', this.handleWindowBlur);
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
  }

  public stopMonitoring(): void {
    if (!this.isListening) return;
    this.isListening = false;

    window.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('blur', this.handleWindowBlur);
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
  }

  private handleVisibilityChange = async () => {
    if (document.hidden) {
      await this.recordViolation('TAB_SWITCH', 'Tab switched or browser minimized');
    }
  };

  private handleWindowBlur = async () => {
    // Check if document lost focus or tab was switched
    if (!document.hasFocus() || document.hidden) {
      await this.recordViolation('WINDOW_BLUR', 'Window lost focus / tab switched');
    }
  };

  private handleFullscreenChange = async () => {
    if (!document.fullscreenElement) {
      await this.recordViolation('FULLSCREEN_EXIT', 'Fullscreen examination arena exited');
    }
  };

  public async recordViolation(eventType: string, details: string): Promise<void> {
    const now = Date.now();
    // Debounce rapid duplicate trigger within 2 seconds
    if (this.isHandlingViolation || !this.isListening || (now - this.lastViolationTime < 2000)) return;
    this.isHandlingViolation = true;
    this.lastViolationTime = now;

    try {
      this.violationsCount += 1;

      // Always show warning dialog to the candidate immediately on client
      const warningMsg = `Warning (${this.violationsCount}): Tab switching, window minimization, or navigating away from the test screen is strictly prohibited!`;
      this.callbacks.onWarning(this.violationsCount, warningMsg);

      // Log to Supabase RPC (non-blocking)
      try {
        await supabase.rpc('log_cbt_violation', {
          p_session_id: this.sessionId,
          p_institution_id: this.institutionId,
          p_student_id: this.studentId,
          p_event_type: eventType,
          p_details_json: { reason: details, clientTime: new Date().toISOString(), strike: this.violationsCount },
        });
      } catch (err) {
        console.warn('Failed to log violation to server:', err);
      }

      // Check max violations policy
      if (this.violationsCount >= 5) {
        this.callbacks.onLockSession(
          'Maximum security violations exceeded. Your test is being auto-submitted.'
        );
      }
    } finally {
      setTimeout(() => {
        this.isHandlingViolation = false;
      }, 1000);
    }
  }

  public async requestFullscreen(): Promise<boolean> {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      return true;
    } catch {
      return false;
    }
  }
}

