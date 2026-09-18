// ============================================================================
// Manager Experience (MSS - Manager Self-Service)
// Backed by Service Catalog & Live REST API Endpoints across MGR_TEAM,
// MGR_COST, MGR_TIME, MGR_CAPABILITY, MGR_TRAINING, MGR_TALENT, WF_INBOX
// ============================================================================

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api/client';
import { Locale, getTranslation } from '../../locales/translations';
import { LineageBadge } from '../common/LineageBadge';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Award,
  ShieldAlert,
  Send,
  Calendar,
  AlertCircle,
  TrendingUp,
  UserCheck,
  Briefcase,
  Layers,
  ChevronRight,
  Loader2,
  RefreshCw,
  FileText,
  UserX,
  Share2,
} from 'lucide-react';

interface ManagerExperienceProps {
  locale: Locale;
  onInspectService: (serviceCode: string) => void;
}

type MssTab = 'roster' | 'inbox' | 'time' | 'cost' | 'capability' | 'talent' | 'delegation';

export const ManagerExperience: React.FC<ManagerExperienceProps> = ({
  locale,
  onInspectService,
}) => {
  const [currentTab, setCurrentTab] = useState<MssTab>('inbox');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Manager state data
  const [team, setTeam] = useState<any[]>([]);
  const [inbox, setInbox] = useState<any[]>([]);
  const [teamTime, setTeamTime] = useState<any>(null);
  const [teamCost, setTeamCost] = useState<any>(null);
  const [capabilities, setCapabilities] = useState<any[]>([]);
  const [talentReviews, setTalentReviews] = useState<any[]>([]);
  const [workflowHistory, setWorkflowHistory] = useState<any[]>([]);

  // Action Modal for Approval
  const [actionModal, setActionModal] = useState<{
    task: any;
    decision: 'APPROVE' | 'REJECT';
  } | null>(null);
  const [actionComments, setActionComments] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  // Delegation Modal
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [delegationForm, setDelegationForm] = useState({
    delegateId: 'e003', // Kianoush Rostami
    startDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 86400000 * 10).toISOString().slice(0, 10),
    notes: 'Delegation of managerial approval authority during annual leave.',
  });
  const [submittingDelegation, setSubmittingDelegation] = useState(false);

  const t = (key: string, fallback?: string) => getTranslation(locale, key, fallback);

  // Fetch all manager data
  const loadData = async () => {
    try {
      api.setPersona('MANAGER');
      setLoading(true);

      const [
        teamRes,
        inboxRes,
        timeRes,
        costRes,
        capRes,
        talRes,
        wfHistRes,
      ] = await Promise.all([
        api.getManagerTeam().catch(() => null),
        api.getWorkflowInbox().catch(() => null),
        api.getManagerTime().catch(() => null),
        api.getManagerCost().catch(() => null),
        api.getManagerCapability().catch(() => null),
        api.getManagerTalent().catch(() => null),
        api.getWorkflowHistory().catch(() => null),
      ]);

      if (teamRes?.data) setTeam(teamRes.data);
      if (inboxRes?.data) setInbox(inboxRes.data);
      if (timeRes?.data) setTeamTime(timeRes.data);
      if (costRes?.data) setTeamCost(costRes.data);
      if (capRes?.data) setCapabilities(capRes.data);
      if (talRes?.data) setTalentReviews(talRes.data);
      if (wfHistRes?.data) setWorkflowHistory(wfHistRes.data);
    } catch (err: any) {
      console.error('Failed to load manager data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  // Execute workflow action (Approve / Reject)
  const handleExecuteAction = async () => {
    if (!actionModal) return;
    setProcessingAction(true);
    setFeedback(null);
    try {
      const res = await api.takeWorkflowAction({
        taskId: actionModal.task.id,
        decision: actionModal.decision,
        comments: actionComments || undefined,
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Task ${actionModal.task.title} was successfully ${
            actionModal.decision === 'APPROVE' ? 'APPROVED' : 'REJECTED'
          }!`,
        });
        setActionModal(null);
        setActionComments('');
        // Refresh inbox & history
        const [newInbox, newHist] = await Promise.all([
          api.getWorkflowInbox(),
          api.getWorkflowHistory(),
        ]);
        if (newInbox?.data) setInbox(newInbox.data);
        if (newHist?.data) setWorkflowHistory(newHist.data);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Workflow action execution failed.',
      });
    } finally {
      setProcessingAction(false);
    }
  };

  // Set Managerial Delegation
  const handleSubmitDelegation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingDelegation(true);
    setFeedback(null);
    try {
      const res = await api.setWorkflowDelegation(delegationForm);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'Managerial approval authority successfully delegated!',
        });
        setShowDelegationModal(false);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to establish delegation.',
      });
    } finally {
      setSubmittingDelegation(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="text-sm font-medium">Loading Manager Decision Cockpit...</p>
        <p className="text-xs text-slate-500 mt-1">Aggregating Team Metrics, Workflow Tasks & Capabilities</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`flex items-center justify-between p-4 rounded-lg border text-sm transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/70 border-rose-800 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100 uppercase font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Manager Identity Header */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border-2 border-indigo-500/50 flex items-center justify-center text-indigo-400 text-2xl font-bold shadow-inner">
                ST
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" title="Active Manager" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Sara Tehrani
                </h2>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-800 text-indigo-400 border border-slate-700">
                  PERNR: 00001002
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-800/80">
                  PEOPLE MANAGER
                </span>
                <LineageBadge
                  serviceCode="MGR_TEAM_001"
                  sapSources={['PA0001', 'HRP1001']}
                  onClick={onInspectService}
                />
              </div>

              <p className="text-sm text-slate-300 font-medium">
                Engineering Director • Software Engineering Department (Org Unit 50000101)
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span>Cost Center: <strong className="text-slate-200">CC_ENG_100 / CC_ENG_101</strong></span>
                <span>Division: <strong className="text-slate-200">Technology & Systems Division</strong></span>
                <span>Reports To: <strong className="text-slate-200">Kianoush Rostami (VP Technology)</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowDelegationModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Delegate Authority</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Refresh Team Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* MSS Sub-Tabs Navigation */}
        <div className="flex items-center space-x-1 sm:space-x-2 rtl:space-x-reverse border-t border-slate-800 mt-6 pt-3 overflow-x-auto">
          {[
            { id: 'inbox', label: `Approvals Inbox (${inbox.length})`, icon: CheckCircle2 },
            { id: 'roster', label: `Direct Reports (${team.length})`, icon: Users },
            { id: 'time', label: 'Team Presence & Leaves', icon: Clock },
            { id: 'cost', label: 'Cost Center Budget', icon: DollarSign },
            { id: 'capability', label: 'Capability Matrix', icon: Award },
            { id: 'talent', label: 'Talent & Reviews', icon: TrendingUp },
            { id: 'delegation', label: 'Delegation Log', icon: Share2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as MssTab)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  active
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: APPROVALS INBOX (WF_INBOX_001, WF_ACTION_001) */}
      {currentTab === 'inbox' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Pending Approval Tasks (WF_INBOX_001)</h3>
              </div>
              <LineageBadge serviceCode="WF_INBOX_001" sapSources={['SWWWIHEAD']} onClick={onInspectService} />
            </div>

            {inbox.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs font-medium">Your approval queue is completely clear!</p>
                <p className="text-[11px]">All pending team requests have been processed.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {inbox.map((task) => (
                  <div key={task.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                          {task.workflowType}
                        </span>
                        <h4 className="text-xs font-bold text-white">{task.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400">
                        Requester: <strong className="text-slate-200">{task.requesterName}</strong> • Submitted:{' '}
                        {task.createdAt}
                      </p>
                      {task.details && (
                        <p className="text-[11px] text-slate-400 font-mono bg-slate-850 p-1.5 rounded border border-slate-800 inline-block">
                          Period: {task.details.startDate} to {task.details.endDate} ({task.details.days}d) • Reason: {task.details.reason || 'N/A'}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActionModal({ task, decision: 'APPROVE' })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => setActionModal({ task, decision: 'REJECT' })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold shadow transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historical Approvals Audit Trail */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-white">Historical Approval Actions (WF_HISTORY_001)</h3>
              </div>
              <LineageBadge serviceCode="WF_HISTORY_001" sapSources={['SWWLOGHIST']} onClick={onInspectService} />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-2.5">Task Description</th>
                    <th className="px-4 py-2.5">Workflow</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Date Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {workflowHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-2.5 text-white font-medium">{item.title}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-400">{item.workflowType}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 font-mono">{item.updatedAt || item.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIRECT REPORTS ROSTER (MGR_TEAM_001) */}
      {currentTab === 'roster' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Direct Reports & Organizational Staffing (MGR_TEAM_001)</h3>
            </div>
            <LineageBadge serviceCode="MGR_TEAM_001" sapSources={['PA0001', 'HRP1001']} onClick={onInspectService} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.map((member) => (
              <div key={member.id} className="p-4 rounded-xl border border-slate-800 bg-slate-850 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold text-base">
                    {member.firstName?.[0]}{member.lastName?.[0]}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white">
                      {member.firstName} {member.lastName}
                    </h4>
                    <p className="text-[11px] text-indigo-300 font-medium">{member.positionTitle}</p>
                    <p className="text-[10px] font-mono text-slate-400">PERNR: {member.pernr}</p>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-2 space-y-1 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Job Code:</span>
                    <span className="font-mono text-slate-200">{member.jobCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="text-blue-400 font-mono truncate max-w-[150px]">{member.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hire Date:</span>
                    <span className="text-slate-200 font-mono">{member.hireDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-semibold">
                      {member.employmentStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TEAM PRESENCE & TIME (MGR_TIME_001) */}
      {currentTab === 'time' && (
        <div className="space-y-6">
          {/* Presence Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
              <span className="text-xs font-semibold text-slate-400 uppercase">Present Today</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {teamTime?.presentCount ?? 3} <span className="text-xs text-slate-400">/ {team.length} members</span>
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
              <span className="text-xs font-semibold text-slate-400 uppercase">On Planned Leave</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {teamTime?.onLeaveCount ?? 0}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
              <span className="text-xs font-semibold text-slate-400 uppercase">Pending Leave Requests</span>
              <p className="text-2xl font-bold text-blue-400 mt-1">
                {teamTime?.pendingRequests?.length ?? 1}
              </p>
            </div>
          </div>

          {/* Pending Leave Requests for Team */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Team Leave Approvals (MGR_TIME_001)</h3>
              </div>
              <LineageBadge serviceCode="MGR_TIME_001" sapSources={['PA2001', 'PA2002']} onClick={onInspectService} />
            </div>

            <div className="divide-y divide-slate-800">
              {teamTime?.pendingRequests && teamTime.pendingRequests.length > 0 ? (
                teamTime.pendingRequests.map((req: any) => (
                  <div key={req.id} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">{req.employeeName}</p>
                      <p className="text-slate-400">
                        {req.absenceName}: {req.startDate} to {req.endDate} ({req.days} days) • Reason: {req.reason}
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentTab('inbox')}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium"
                    >
                      Review in Inbox
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-3">No pending time-off requests.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COST CENTER & PAYROLL (MGR_COST_001) */}
      {currentTab === 'cost' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Team Payroll & Cost Center Aggregates (MGR_COST_001)</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Cost Center: CC_ENG_100 / CC_ENG_101 • Consolidated Gross Expenditure
                </p>
              </div>
              <LineageBadge serviceCode="MGR_COST_001" sapSources={['PCL2_CLUSTER_PAYROLL']} onClick={onInspectService} />
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-slate-850 border border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase">Monthly Payroll Total</span>
                <p className="text-2xl font-bold text-white mt-1">
                  {teamCost?.totalGross?.toLocaleString() || '1,350,000,000'}{' '}
                  <span className="text-xs text-slate-400">{teamCost?.currency || 'IRR'}</span>
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-850 border border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase">Average Direct Report Pay</span>
                <p className="text-2xl font-bold text-indigo-400 mt-1">
                  {teamCost?.avgGross?.toLocaleString() || '450,000,000'}{' '}
                  <span className="text-xs text-slate-400">{teamCost?.currency || 'IRR'}</span>
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-850 border border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase">Cost Center Headcount</span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  {teamCost?.headcount || 3} <span className="text-xs text-slate-400">Engineers</span>
                </p>
              </div>
            </div>

            {/* Direct Report Cost Breakdown */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Direct Report Compensation Allocation</h4>
              <div className="divide-y divide-slate-800/60 border border-slate-800 rounded-lg overflow-hidden">
                {teamCost?.breakdown?.map((emp: any) => (
                  <div key={emp.employeeId} className="p-3 bg-slate-850 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">{emp.employeeName}</p>
                      <p className="text-[11px] text-slate-400">{emp.positionTitle}</p>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">
                      {emp.grossAmount?.toLocaleString()} {teamCost.currency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CAPABILITY MATRIX (MGR_CAPABILITY_001) */}
      {currentTab === 'capability' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Team Competency & Capability Gap Matrix (MGR_CAPABILITY_001)</h3>
            </div>
            <LineageBadge serviceCode="MGR_CAPABILITY_001" sapSources={['PA0024']} onClick={onInspectService} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-700">
                <tr>
                  <th className="px-4 py-2.5">Direct Report</th>
                  <th className="px-4 py-2.5">Competency Skill</th>
                  <th className="px-4 py-2.5">Actual Level</th>
                  <th className="px-4 py-2.5">Required Level</th>
                  <th className="px-4 py-2.5">Skill Gap</th>
                  <th className="px-4 py-2.5">Readiness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {capabilities.map((cap, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3 font-medium text-white">{cap.employeeName}</td>
                    <td className="px-4 py-3 font-semibold text-purple-300">{cap.qualificationName}</td>
                    <td className="px-4 py-3 font-mono font-bold">{cap.proficiencyLevel} / 5</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{cap.requiredLevel} / 5</td>
                    <td className="px-4 py-3">
                      {cap.gap === 0 ? (
                        <span className="text-emerald-400 font-semibold">Matched (0)</span>
                      ) : (
                        <span className="text-amber-400 font-semibold font-mono">-{cap.gap} Level</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        cap.gap === 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {cap.gap === 0 ? 'Optimal' : 'Needs L&D'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: TALENT REVIEWS (MGR_TALENT_001) */}
      {currentTab === 'talent' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Team Annual Performance & 9-Box Placement (MGR_TALENT_001)</h3>
            </div>
            <LineageBadge serviceCode="MGR_TALENT_001" sapSources={['HAP_DOCUMENT']} onClick={onInspectService} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {talentReviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl border border-slate-800 bg-slate-850 space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-white">{rev.employeeName}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                    Cycle {rev.cycleYear}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Final Rating:</span>
                    <span className="font-bold text-emerald-400 font-mono">{rev.finalRating} / 5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Appraisal Status:</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-semibold">
                      {rev.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    Reviewer Notes: {rev.managerNotes || 'Exceptional software architectural contributions and system stability.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: DELEGATION LOG (WF_DELEGATE_001) */}
      {currentTab === 'delegation' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Managerial Approval Authority Delegation (WF_DELEGATE_001)</h3>
            </div>
            <div className="flex items-center gap-2">
              <LineageBadge serviceCode="WF_DELEGATE_001" sapSources={['SWW_DELEG']} onClick={onInspectService} />
              <button
                onClick={() => setShowDelegationModal(true)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
              >
                Set New Delegation
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Allows a people manager to designate a proxy decision maker during planned absences or travel.
            Any approval actions executed by the delegate are audited with complete digital signature traces.
          </p>
        </div>
      )}

      {/* MODAL: Approval Decision Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {actionModal.decision === 'APPROVE' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
                <h3 className="text-sm font-bold text-white">
                  Confirm {actionModal.decision === 'APPROVE' ? 'Approval' : 'Rejection'}
                </h3>
              </div>
              <button
                onClick={() => setActionModal(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-300 font-medium">Task: {actionModal.task.title}</p>
              <p className="text-slate-400">Requester: {actionModal.task.requesterName}</p>

              <div className="pt-2">
                <label className="block text-slate-300 font-medium mb-1">
                  Manager Comments / Decision Notes (Audited)
                </label>
                <textarea
                  rows={3}
                  value={actionComments}
                  onChange={(e) => setActionComments(e.target.value)}
                  placeholder="Optional justification notes..."
                  className="w-full bg-slate-850 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={processingAction}
                className={`px-4 py-2 rounded-lg text-white font-medium text-xs flex items-center gap-1.5 shadow ${
                  actionModal.decision === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {processingAction ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Confirm {actionModal.decision}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Authority Delegation */}
      {showDelegationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Delegate Managerial Authority (WF_DELEGATE_001)</h3>
              </div>
              <button
                onClick={() => setShowDelegationModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitDelegation} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Designated Delegate</label>
                <select
                  value={delegationForm.delegateId}
                  onChange={(e) => setDelegationForm({ ...delegationForm, delegateId: e.target.value })}
                  className="w-full bg-slate-850 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="e003">Kianoush Rostami (VP Technology)</option>
                  <option value="e004">Maryam Alavi (HR Operations)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={delegationForm.startDate}
                    onChange={(e) => setDelegationForm({ ...delegationForm, startDate: e.target.value })}
                    className="w-full bg-slate-850 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={delegationForm.endDate}
                    onChange={(e) => setDelegationForm({ ...delegationForm, endDate: e.target.value })}
                    className="w-full bg-slate-850 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Delegation Purpose / Notes</label>
                <textarea
                  rows={2}
                  value={delegationForm.notes}
                  onChange={(e) => setDelegationForm({ ...delegationForm, notes: e.target.value })}
                  className="w-full bg-slate-850 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDelegationModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDelegation}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5 shadow"
                >
                  {submittingDelegation ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Save Delegation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
