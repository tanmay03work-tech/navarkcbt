import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cbtProctorService, LiveProctorSession } from '@/services/cbt/cbtProctorService';
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Clock,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
  Lock,
  Unlock,
  Send,
  Users,
  Search,
} from 'lucide-react';

interface LiveProctorCockpitProps {
  institutionId: string;
  examId: string;
  examTitle?: string;
}

export const LiveProctorCockpit: React.FC<LiveProctorCockpitProps> = ({
  institutionId,
  examId,
  examTitle,
}) => {
  const [sessions, setSessions] = useState<LiveProctorSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchSessions = async (showLoading: boolean = false) => {
    if (showLoading) setIsRefreshing(true);
    try {
      const liveData = await cbtProctorService.getLiveSessions(institutionId, examId);
      setSessions(liveData);
    } catch (err) {
      console.error('Failed to load proctor sessions:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(() => {
      fetchSessions(false);
    }, 8000); // 8-second auto-poll
    return () => clearInterval(interval);
  }, [institutionId, examId]);

  // Actions
  const handleExtendTime = async (sessionId: string) => {
    setActionLoadingId(`extend-${sessionId}`);
    try {
      const ok = await cbtProctorService.extendTime(sessionId, 15);
      if (ok) {
        setSessions(prev =>
          prev.map(s =>
            s.sessionId === sessionId
              ? { ...s, timeRemainingSeconds: s.timeRemainingSeconds + 15 * 60 }
              : s
          )
        );
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResetWarnings = async (sessionId: string) => {
    setActionLoadingId(`reset-${sessionId}`);
    try {
      const ok = await cbtProctorService.resetWarnings(sessionId);
      if (ok) {
        setSessions(prev =>
          prev.map(s =>
            s.sessionId === sessionId
              ? { ...s, violationsCount: 0, issueCode: 'HEALTHY_ACTIVE', issueReason: 'Warnings reset by faculty' }
              : s
          )
        );
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleForceSubmit = async (sessionId: string) => {
    if (!confirm('Are you sure you want to force submit this candidate terminal?')) return;
    setActionLoadingId(`submit-${sessionId}`);
    try {
      const ok = await cbtProctorService.forceSubmit(sessionId);
      if (ok) {
        setSessions(prev =>
          prev.map(s =>
            s.sessionId === sessionId
              ? { ...s, status: 'SUBMITTED', issueReason: 'Force submitted by admin' }
              : s
          )
        );
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnbindDevice = async (studentId: string) => {
    if (!confirm('Unbind this candidate device? They will be able to log in from a new computer.')) return;
    setActionLoadingId(`unbind-${studentId}`);
    try {
      await cbtProctorService.unbindDevice(studentId);
      alert('Device unbind successful. Candidate can now authenticate from a new terminal.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredSessions = sessions.filter(s => {
    const matchesSearch =
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentUserId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.batchName.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'ALERT') return matchesSearch && s.violationsCount > 0;
    if (statusFilter === 'ACTIVE') return matchesSearch && s.status === 'IN_PROGRESS';
    if (statusFilter === 'SUBMITTED') return matchesSearch && (s.status === 'SUBMITTED' || s.status === 'AUTO_SUBMITTED');
    return matchesSearch;
  });

  const activeCount = sessions.filter(s => s.status === 'IN_PROGRESS').length;
  const alertCount = sessions.filter(s => s.violationsCount > 0).length;
  const submittedCount = sessions.filter(s => s.status === 'SUBMITTED' || s.status === 'AUTO_SUBMITTED').length;

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="space-y-4">
      {/* Cockpit KPI Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-[#E7DCD3] shadow-xs">
          <span className="text-[10px] text-muted-foreground uppercase font-bold block">Active Terminals</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xl font-extrabold text-[#481D1A]">{activeCount}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-[#E7DCD3] shadow-xs">
          <span className="text-[10px] text-muted-foreground uppercase font-bold block">Security Alerts</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`h-2.5 w-2.5 rounded-full ${alertCount > 0 ? 'bg-rose-500 animate-ping' : 'bg-stone-300'}`} />
            <span className="text-xl font-extrabold text-rose-700">{alertCount}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-[#E7DCD3] shadow-xs">
          <span className="text-[10px] text-muted-foreground uppercase font-bold block">Submitted Attempts</span>
          <div className="flex items-center gap-2 mt-0.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-xl font-extrabold text-emerald-800">{submittedCount}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-[#E7DCD3] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Sync Status</span>
            <span className="text-xs font-bold text-stone-700">Auto 8s Poll</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchSessions(true)}
            className="h-8 w-8 p-0 border-[#481D1A] text-[#481D1A]"
            title="Refresh Cockpit"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-white border border-[#E7DCD3] shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name or ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-input bg-stone-50/50 outline-hidden focus:ring-1 focus:ring-[#481D1A]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'ACTIVE', 'ALERT', 'SUBMITTED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                statusFilter === tab
                  ? 'bg-[#481D1A] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tab === 'ALL' && `All (${sessions.length})`}
              {tab === 'ACTIVE' && `Live Active (${activeCount})`}
              {tab === 'ALERT' && `Violations (${alertCount})`}
              {tab === 'SUBMITTED' && `Completed (${submittedCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Candidate Sessions Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-muted-foreground">
          <div className="h-6 w-6 border-2 border-[#481D1A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Connecting to candidate terminals...</span>
        </div>
      ) : filteredSessions.length === 0 ? (
        <Card className="border-[#E7DCD3] bg-white p-8 text-center text-muted-foreground text-xs">
          No live candidate exam sessions found matching criteria.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSessions.map((session) => {
            const hasViolations = session.violationsCount > 0;
            const isCompleted = session.status === 'SUBMITTED' || session.status === 'AUTO_SUBMITTED';

            return (
              <Card
                key={session.sessionId}
                className={`border bg-white shadow-xs transition-all ${
                  hasViolations
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-[#E7DCD3]'
                }`}
              >
                <CardContent className="p-4 space-y-3">
                  {/* Candidate Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#481D1A] truncate">
                        {session.studentName}
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {session.studentUserId} • {session.batchName}
                      </p>
                    </div>

                    <Badge
                      className={`text-[9px] font-mono shrink-0 ${
                        hasViolations
                          ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-blue-100 text-blue-800 border-blue-300'
                      }`}
                    >
                      {hasViolations
                        ? `STRIKE ${session.violationsCount}/3`
                        : isCompleted
                        ? 'SUBMITTED'
                        : 'ACTIVE'}
                    </Badge>
                  </div>

                  {/* Terminal Metadata & Question Stats */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-lg bg-[#FFFBF5] border border-[#E7DCD3]">
                    <div>
                      <span className="text-[9px] text-muted-foreground uppercase block font-semibold">
                        Time Remaining
                      </span>
                      <span className="font-mono font-bold text-[#481D1A]">
                        {formatSeconds(session.timeRemainingSeconds)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] text-muted-foreground uppercase block font-semibold">
                        Progress
                      </span>
                      <span className="font-semibold text-emerald-700">
                        {session.attemptedCount} Ans / {session.unattemptedCount} Left
                      </span>
                    </div>

                    <div className="col-span-2 pt-1 border-t border-[#E7DCD3]/60 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1 font-mono truncate">
                        <Laptop className="h-3 w-3 shrink-0" />
                        {session.deviceName}
                      </span>
                      {hasViolations && (
                        <span className="text-rose-600 font-semibold truncate max-w-[140px]">
                          {session.issueReason}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Proctor Control Actions */}
                  {!isCompleted && (
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={actionLoadingId === `extend-${session.sessionId}`}
                        onClick={() => handleExtendTime(session.sessionId)}
                        className="h-7 text-[10px] font-semibold gap-1 border-stone-300 text-stone-700 hover:bg-stone-100"
                        title="Add 15 minutes to session timer"
                      >
                        <PlusCircle className="h-3 w-3 text-emerald-600" />
                        <span>+15 Mins</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={actionLoadingId === `reset-${session.sessionId}` || session.violationsCount === 0}
                        onClick={() => handleResetWarnings(session.sessionId)}
                        className="h-7 text-[10px] font-semibold gap-1 border-stone-300 text-stone-700 hover:bg-stone-100"
                        title="Clear violation warnings"
                      >
                        <RotateCcw className="h-3 w-3 text-amber-600" />
                        <span>Reset Strikes</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={actionLoadingId === `unbind-${session.studentId}`}
                        onClick={() => handleUnbindDevice(session.studentId)}
                        className="h-7 text-[10px] font-semibold gap-1 border-stone-300 text-stone-700 hover:bg-stone-100"
                        title="Unbind hardware device lockdown"
                      >
                        <Unlock className="h-3 w-3 text-blue-600" />
                        <span>Unbind Machine</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={actionLoadingId === `submit-${session.sessionId}`}
                        onClick={() => handleForceSubmit(session.sessionId)}
                        className="h-7 text-[10px] font-semibold gap-1 border-rose-300 text-rose-700 hover:bg-rose-50"
                        title="Force submit attempt"
                      >
                        <Lock className="h-3 w-3 text-rose-600" />
                        <span>Force Submit</span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

