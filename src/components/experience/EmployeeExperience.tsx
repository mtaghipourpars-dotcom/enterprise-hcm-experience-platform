// ============================================================================
// Employee Experience (ESS - Employee Self-Service)
// Backed by Service Catalog & Live REST API Endpoints across PA, OM, PT, PY,
// Training & Event Management, Talent & Performance
// ============================================================================

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api/client';
import { Locale, getTranslation } from '../../locales/translations';
import { LineageBadge } from '../common/LineageBadge';
import {
  User,
  Clock,
  DollarSign,
  GraduationCap,
  Award,
  Users,
  Calendar,
  HeartPulse,
  Send,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ChevronRight,
  TrendingUp,
  FileText,
  Search,
  BookOpen,
  Target,
  Compass,
  ArrowUpRight,
  Plus,
  Loader2,
  RefreshCw,
  Info,
} from 'lucide-react';

interface EmployeeExperienceProps {
  locale: Locale;
  onInspectService: (serviceCode: string) => void;
}

type EssTab = 'dashboard' | 'profile' | 'time' | 'payroll' | 'training' | 'talent' | 'directory';

export const EmployeeExperience: React.FC<EmployeeExperienceProps> = ({
  locale,
  onInspectService,
}) => {
  const [currentTab, setCurrentTab] = useState<EssTab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // State data
  const [profile, setProfile] = useState<any>(null);
  const [family, setFamily] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [hse, setHse] = useState<any>(null);
  const [quotas, setQuotas] = useState<any[]>([]);
  const [absences, setAbsences] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [payslip, setPayslip] = useState<any>(null);
  const [payrollHistory, setPayrollHistory] = useState<any[]>([]);
  const [wageTypes, setWageTypes] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [trainingHistory, setTrainingHistory] = useState<any[]>([]);
  const [qualifications, setQualifications] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [idp, setIdp] = useState<any[]>([]);
  const [career, setCareer] = useState<any>(null);
  const [appraisals, setAppraisals] = useState<any[]>([]);
  const [directory, setDirectory] = useState<any[]>([]);
  const [searchDir, setSearchDir] = useState('');

  // Modals & Forms
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    absenceType: '0100',
    startDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
    reason: 'Personal family matters',
  });
  const [submittingLeave, setSubmittingLeave] = useState(false);

  const [showSelfAppraisalModal, setShowSelfAppraisalModal] = useState(false);
  const [appraisalForm, setAppraisalForm] = useState({
    cycleYear: 2026,
    achievements: 'Architected enterprise microservices platform and upgraded core event bus.',
    selfRating: 4.5,
    strengthAreas: 'Distributed systems design, performance optimization, mentorship',
    developmentNeeds: 'Executive stakeholder communication, cloud-native cost FinOps',
  });
  const [submittingAppraisal, setSubmittingAppraisal] = useState(false);

  const [selectedCourseEvent, setSelectedCourseEvent] = useState<string | null>(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const t = (key: string, fallback?: string) => getTranslation(locale, key, fallback);

  // Load all initial employee data
  const loadData = async () => {
    try {
      api.setPersona('EMPLOYEE');
      setLoading(true);

      const [
        profRes,
        famRes,
        eduRes,
        hseRes,
        qtaRes,
        absRes,
        attRes,
        payRes,
        payHistRes,
        wtRes,
        crsRes,
        bkRes,
        thRes,
        qlRes,
        glRes,
        idpRes,
        carRes,
        apRes,
        dirRes,
      ] = await Promise.all([
        api.getEmployeeProfile().catch(() => null),
        api.getEmployeeFamily().catch(() => null),
        api.getEmployeeEducation().catch(() => null),
        api.getEmployeeHse().catch(() => null),
        api.getTimeQuotas().catch(() => null),
        api.getTimeAbsences().catch(() => null),
        api.getTimeAttendance().catch(() => null),
        api.getPayslip().catch(() => null),
        api.getPayrollHistory().catch(() => null),
        api.getWageTypes().catch(() => null),
        api.getTrainingCourses().catch(() => null),
        api.getTrainingBookings().catch(() => null),
        api.getTrainingHistory().catch(() => null),
        api.getQualifications().catch(() => null),
        api.getGoals().catch(() => null),
        api.getIdp().catch(() => null),
        api.getCareerAspirations().catch(() => null),
        api.getAppraisals().catch(() => null),
        api.searchOrgDirectory().catch(() => null),
      ]);

      if (profRes?.data) setProfile(profRes.data);
      if (famRes?.data) setFamily(famRes.data);
      if (eduRes?.data) setEducation(eduRes.data);
      if (hseRes?.data) setHse(hseRes.data);
      if (qtaRes?.data) setQuotas(qtaRes.data);
      if (absRes?.data) setAbsences(absRes.data);
      if (attRes?.data) setAttendance(attRes.data);
      if (payRes?.data) setPayslip(payRes.data);
      if (payHistRes?.data) setPayrollHistory(payHistRes.data);
      if (wtRes?.data) setWageTypes(wtRes.data);
      if (crsRes?.data) setCourses(crsRes.data);
      if (bkRes?.data) setBookings(bkRes.data);
      if (thRes?.data) setTrainingHistory(thRes.data);
      if (qlRes?.data) setQualifications(qlRes.data);
      if (glRes?.data) setGoals(glRes.data);
      if (idpRes?.data) setIdp(idpRes.data);
      if (carRes?.data) setCareer(carRes.data);
      if (apRes?.data) setAppraisals(apRes.data);
      if (dirRes?.data?.items) setDirectory(dirRes.data.items);
    } catch (err: any) {
      console.error('Failed to load employee data:', err);
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

  // Submit Leave Request
  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLeave(true);
    setFeedback(null);
    try {
      const res = await api.submitTimeRequest(leaveForm);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'Leave request submitted successfully and routed to your manager for approval!',
        });
        setShowLeaveModal(false);
        // Refresh absences & quotas
        const [absRes, qtaRes] = await Promise.all([
          api.getTimeAbsences(),
          api.getTimeQuotas(),
        ]);
        if (absRes?.data) setAbsences(absRes.data);
        if (qtaRes?.data) setQuotas(qtaRes.data);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to submit leave request.',
      });
    } finally {
      setSubmittingLeave(false);
    }
  };

  // Book Training Event
  const handleBookCourse = async (eventId: string) => {
    setBookingInProgress(true);
    setFeedback(null);
    try {
      const res = await api.bookTrainingSession(eventId);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'Successfully enrolled in course session! Awaiting manager endorsement.',
        });
        const [bkRes, crsRes] = await Promise.all([
          api.getTrainingBookings(),
          api.getTrainingCourses(),
        ]);
        if (bkRes?.data) setBookings(bkRes.data);
        if (crsRes?.data) setCourses(crsRes.data);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Training enrollment failed.',
      });
    } finally {
      setBookingInProgress(false);
      setSelectedCourseEvent(null);
    }
  };

  // Submit Self Appraisal
  const handleSubmitSelfAppraisal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAppraisal(true);
    setFeedback(null);
    try {
      const res = await api.submitSelfAssessment(appraisalForm);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'Self-assessment submitted successfully for review cycle 2026!',
        });
        setShowSelfAppraisalModal(false);
        const apRes = await api.getAppraisals();
        if (apRes?.data) setAppraisals(apRes.data);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to submit appraisal.',
      });
    } finally {
      setSubmittingAppraisal(false);
    }
  };

  // Switch payslip period
  const handleSelectPayPeriod = async (periodId: string) => {
    try {
      const res = await api.getPayslip(undefined, periodId);
      if (res?.data) setPayslip(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="text-sm font-medium">Loading Employee Self-Service Workspace...</p>
        <p className="text-xs text-slate-500 mt-1">Connecting to Canonical HCM Services & SAP Lineage</p>
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

      {/* Hero Employee Identity Header */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border-2 border-blue-500/50 flex items-center justify-center text-blue-400 text-2xl font-bold shadow-inner">
                {profile?.personal?.firstName?.[0] || 'A'}
                {profile?.personal?.lastName?.[0] || 'M'}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" title="Active Employee" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {profile?.personal?.firstName} {profile?.personal?.lastName}
                </h2>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-800 text-blue-400 border border-slate-700">
                  PERNR: {profile?.employment?.pernr || '00001001'}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                  {profile?.employment?.status || 'ACTIVE'}
                </span>
                <LineageBadge
                  serviceCode="PA_PROFILE_001"
                  sapSources={['PA0001', 'PA0002', 'PA0006']}
                  onClick={onInspectService}
                />
              </div>

              <p className="text-sm text-slate-300 font-medium">
                {profile?.assignment?.positionTitle || 'Senior Software Architect'} • {profile?.assignment?.orgUnitName || 'Software Engineering'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span>Manager: <strong className="text-slate-200">{profile?.assignment?.managerName || 'Sara Tehrani'}</strong></span>
                <span>Cost Center: <strong className="text-slate-200">{profile?.assignment?.costCenter || 'CC_ENG_101'}</strong></span>
                <span>Hire Date: <strong className="text-slate-200">{profile?.employment?.hireDate || '2019-03-01'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowLeaveModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Request Leave</span>
            </button>

            <button
              onClick={() => setShowSelfAppraisalModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold shadow transition"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Submit Appraisal</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* ESS Sub-Tabs Navigation */}
        <div className="flex items-center space-x-1 sm:space-x-2 rtl:space-x-reverse border-t border-slate-800 mt-6 pt-3 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Overview', icon: TrendingUp },
            { id: 'profile', label: 'Master Data & Health', icon: User },
            { id: 'time', label: 'Time & Attendance', icon: Clock },
            { id: 'payroll', label: 'Payroll & Payslip', icon: DollarSign },
            { id: 'training', label: 'Learning & Skills', icon: GraduationCap },
            { id: 'talent', label: 'Performance & Goals', icon: Award },
            { id: 'directory', label: 'Org Directory', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as EssTab)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  active
                    ? 'bg-blue-600 text-white shadow'
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

      {/* TAB 1: OVERVIEW / DASHBOARD */}
      {currentTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Paid Leave Balance */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase">Paid Leave Quota</span>
                <Clock className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">
                  {quotas?.[0]?.balanceDays ?? 20}
                </span>
                <span className="text-xs text-slate-400">days available</span>
              </div>
              <div className="mt-2 text-xs text-emerald-400 flex items-center justify-between">
                <span>Entitlement: {quotas?.[0]?.entitlementDays ?? 26}d</span>
                <LineageBadge serviceCode="PT_QUOTA_001" sapSources={['PA2006']} onClick={onInspectService} />
              </div>
            </div>

            {/* Net Pay Last Month */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase">Last Net Pay</span>
                <DollarSign className="w-4 h-4 text-blue-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">
                  {payslip?.netAmount ? `${(payslip.netAmount / 1_000_000).toFixed(0)}M` : '360M'}
                </span>
                <span className="text-xs text-slate-400">{payslip?.currency || 'IRR'}</span>
              </div>
              <div className="mt-2 text-xs text-blue-400 flex items-center justify-between">
                <span>Period: {payslip?.period?.periodCode || '2026-02'}</span>
                <LineageBadge serviceCode="PY_PAYSLIP_001" sapSources={['PAYROLL_RT']} onClick={onInspectService} />
              </div>
            </div>

            {/* Active Goals Progress */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase">Performance Cycle</span>
                <Target className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">
                  {goals?.length || 2}
                </span>
                <span className="text-xs text-slate-400">active OKRs</span>
              </div>
              <div className="mt-2 text-xs text-indigo-400 flex items-center justify-between">
                <span>Status: On Track (75%)</span>
                <LineageBadge serviceCode="TM_GOALS_001" sapSources={['HAP_DOCUMENT']} onClick={onInspectService} />
              </div>
            </div>

            {/* Upcoming Training */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase">Training Enrolled</span>
                <GraduationCap className="w-4 h-4 text-purple-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">
                  {bookings?.length || 1}
                </span>
                <span className="text-xs text-slate-400">upcoming session</span>
              </div>
              <div className="mt-2 text-xs text-purple-400 flex items-center justify-between">
                <span>Next: S/4HANA Arch</span>
                <LineageBadge serviceCode="PE_MY_BOOKINGS_001" sapSources={['TEM_EVENT']} onClick={onInspectService} />
              </div>
            </div>
          </div>

          {/* Action Center & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Time & Absence Status */}
            <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Recent Time Off Requests</h3>
                </div>
                <LineageBadge serviceCode="PT_HISTORY_001" sapSources={['PA2001']} onClick={onInspectService} />
              </div>

              <div className="divide-y divide-slate-800/80">
                {absences && absences.length > 0 ? (
                  absences.map((abs) => (
                    <div key={abs.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-200">{abs.absenceName}</p>
                        <p className="text-xs text-slate-400">
                          {abs.startDate} to {abs.endDate} ({abs.absenceDays} days) • Reason: {abs.reason || 'General'}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          abs.status === 'APPROVED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : abs.status === 'SUBMITTED'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {abs.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-xs text-slate-500">No recent absence requests found.</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setCurrentTab('time')}
                  className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-medium"
                >
                  <span>View Full Attendance Timesheet & Quotas</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Column: Training & Skill Development */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">Skill Matrix & Gaps</h3>
                </div>
                <LineageBadge serviceCode="PE_MY_QUALIFICATIONS_001" sapSources={['PA0024']} onClick={onInspectService} />
              </div>

              <div className="space-y-3">
                {qualifications && qualifications.length > 0 ? (
                  qualifications.slice(0, 4).map((q, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">{q.qualificationName}</span>
                        <span className="text-slate-400 font-mono">
                          Lvl {q.proficiencyLevel} / Req {q.requiredLevel}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            q.gap === 0 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${(q.proficiencyLevel / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No qualification records available.</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800">
                <button
                  onClick={() => setCurrentTab('training')}
                  className="text-xs text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 font-medium"
                >
                  <span>Browse Course Catalog</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROFILE, FAMILY, EDUCATION, HEALTH & SAFETY */}
      {currentTab === 'profile' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Master Profile & Bio */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Personal & Organizational Bio</h3>
                </div>
                <LineageBadge serviceCode="PA_PROFILE_001" sapSources={['PA0001', 'PA0002']} onClick={onInspectService} />
              </div>

              <dl className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div>
                  <dt className="text-slate-400">National ID:</dt>
                  <dd className="font-mono text-slate-200 mt-0.5">{profile?.personal?.nationalId || '0012345678'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Birth Date:</dt>
                  <dd className="text-slate-200 mt-0.5">{profile?.personal?.birthDate || '1988-04-12'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Marital Status:</dt>
                  <dd className="text-slate-200 mt-0.5">{profile?.personal?.maritalStatus || 'MARRIED'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Gender:</dt>
                  <dd className="text-slate-200 mt-0.5">{profile?.personal?.gender || 'MALE'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Corporate Email:</dt>
                  <dd className="text-slate-200 mt-0.5 truncate">{profile?.employment?.email || 'arash.moradi@enterprise-hcm.com'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Contact Phone:</dt>
                  <dd className="text-slate-200 mt-0.5">{profile?.employment?.phone || '+98-912-111-2233'}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-slate-400">Registered Residential Address (PA0006):</dt>
                  <dd className="text-slate-200 mt-0.5">
                    {profile?.address ? `${profile.address.street}, ${profile.address.city}, ${profile.address.country} (ZIP: ${profile.address.postalCode})` : 'No. 42 Valiasr Ave, Farhang St, Tehran'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Health & Safety (HSE) */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-rose-400" />
                  <h3 className="text-sm font-bold text-white">Occupational Health & Medical (PA0028)</h3>
                </div>
                <LineageBadge serviceCode="PA_HSE_001" sapSources={['PA0028']} onClick={onInspectService} />
              </div>

              <dl className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div>
                  <dt className="text-slate-400">Blood Type:</dt>
                  <dd className="font-mono text-emerald-400 font-bold mt-0.5">{hse?.bloodType || 'O_POSITIVE'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Fitness Status:</dt>
                  <dd className="text-slate-200 mt-0.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-semibold">
                      {hse?.fitnessStatus || 'FIT_FOR_WORK'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400">Last Health Checkup:</dt>
                  <dd className="text-slate-200 mt-0.5">{hse?.lastCheckupDate || '2025-11-20'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Work Restrictions:</dt>
                  <dd className="text-slate-200 mt-0.5">{hse?.medicalRestrictions ? JSON.stringify(hse.medicalRestrictions) : 'None'}</dd>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-800">
                  <dt className="text-slate-400">Emergency Contact (PA0028):</dt>
                  <dd className="text-slate-200 mt-1 flex justify-between items-center">
                    <span>{hse?.emergencyContactName || 'Parisa Ghasemi'} ({hse?.emergencyContactRelationship || 'Spouse'})</span>
                    <span className="font-mono text-blue-400">{hse?.emergencyContactPhone || '+98-912-999-8877'}</span>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Family & Dependents */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Family & Dependents (PA0021)</h3>
                </div>
                <LineageBadge serviceCode="PA_FAMILY_001" sapSources={['PA0021']} onClick={onInspectService} />
              </div>

              <div className="divide-y divide-slate-800/80">
                {family && family.length > 0 ? (
                  family.map((fam) => (
                    <div key={fam.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-medium text-slate-200">{fam.firstName} {fam.lastName}</p>
                        <p className="text-slate-400">{fam.relationType} • Born: {fam.birthDate}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {fam.medicalInsuranceEnrolled && (
                          <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px]">
                            Medical Insured
                          </span>
                        )}
                        <span className="font-mono text-slate-400 text-[11px]">{fam.nationalId}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-3">No dependents listed.</p>
                )}
              </div>
            </div>

            {/* Education & Academic Degrees */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-teal-400" />
                  <h3 className="text-sm font-bold text-white">Education & Credentials (PA0022)</h3>
                </div>
                <LineageBadge serviceCode="PA_EDUCATION_001" sapSources={['PA0022']} onClick={onInspectService} />
              </div>

              <div className="divide-y divide-slate-800/80">
                {education && education.length > 0 ? (
                  education.map((edu) => (
                    <div key={edu.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-medium text-slate-200">{edu.degreeLevel}: {edu.fieldOfStudy}</p>
                        <p className="text-slate-400">{edu.institutionName} • Graduated {edu.graduationYear}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-teal-400 font-semibold">GPA: {edu.gpa}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-3">No education credentials registered.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TIME & ATTENDANCE */}
      {currentTab === 'time' && (
        <div className="space-y-6">
          {/* Quotas Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quotas && quotas.length > 0 ? (
              quotas.map((q) => (
                <div key={q.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-slate-300">{q.quotaName}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      Code: {q.quotaType}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">{q.balanceDays}</span>
                    <span className="text-xs text-slate-400">/ {q.entitlementDays} days left</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(100, (q.usedDays / q.entitlementDays) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>Used: {q.usedDays}d</span>
                    <span>Valid thru: {q.validTo}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 col-span-3">No quota balances available.</p>
            )}
          </div>

          {/* Time Off History & Request Button */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Absence & Leave History (PA2001)</h3>
              </div>
              <div className="flex items-center gap-2">
                <LineageBadge serviceCode="PT_REQUEST_001" sapSources={['PA2001']} onClick={onInspectService} />
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition shadow"
                >
                  New Request
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-2.5">Leave Type</th>
                    <th className="px-4 py-2.5">Start Date</th>
                    <th className="px-4 py-2.5">End Date</th>
                    <th className="px-4 py-2.5">Days</th>
                    <th className="px-4 py-2.5">Reason</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {absences.map((abs) => (
                    <tr key={abs.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3 font-medium text-white">{abs.absenceName}</td>
                      <td className="px-4 py-3 font-mono">{abs.startDate}</td>
                      <td className="px-4 py-3 font-mono">{abs.endDate}</td>
                      <td className="px-4 py-3 font-semibold">{abs.absenceDays}d</td>
                      <td className="px-4 py-3 text-slate-400">{abs.reason || '-'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            abs.status === 'APPROVED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {abs.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Daily Attendance Timesheet */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Daily Attendance Timesheet (PA2002)</h3>
              </div>
              <LineageBadge serviceCode="PT_ATTENDANCE_001" sapSources={['PA2002']} onClick={onInspectService} />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Check-In</th>
                    <th className="px-4 py-2.5">Check-Out</th>
                    <th className="px-4 py-2.5">Scheduled</th>
                    <th className="px-4 py-2.5">Actual Hours</th>
                    <th className="px-4 py-2.5">Overtime</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {attendance.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3 font-mono font-medium text-white">{att.attendanceDate}</td>
                      <td className="px-4 py-3 font-mono text-emerald-400">{att.checkInTime}</td>
                      <td className="px-4 py-3 font-mono text-blue-400">{att.checkOutTime}</td>
                      <td className="px-4 py-3 font-mono">{att.scheduledHours}h</td>
                      <td className="px-4 py-3 font-mono font-bold text-white">{att.actualHours}h</td>
                      <td className="px-4 py-3 font-mono text-amber-400 font-semibold">+{att.overtimeHours}h</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-semibold">
                          {att.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PAYROLL & PAYSLIP */}
      {currentTab === 'payroll' && (
        <div className="space-y-6">
          {/* Period Selector & Payslip Summary Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-bold text-white">Itemized Digital Payslip (PAYROLL_RT)</h3>
                  <LineageBadge serviceCode="PY_PAYSLIP_001" sapSources={['PAYROLL_RT']} onClick={onInspectService} />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Cluster PCL2 Payroll Result & Wage Type Analysis
                </p>
              </div>

              {/* Period Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Pay Period:</span>
                <select
                  value={payslip?.period?.id || ''}
                  onChange={(e) => handleSelectPayPeriod(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {payrollHistory.map((hist) => (
                    <option key={hist.periodId} value={hist.periodId}>
                      {hist.periodName} ({hist.periodCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-slate-850 border border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase">Gross Earnings</span>
                <p className="text-xl font-bold text-white mt-1">
                  {payslip?.grossAmount?.toLocaleString()} <span className="text-xs text-slate-400">{payslip?.currency}</span>
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-850 border border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase">Total Deductions</span>
                <p className="text-xl font-bold text-rose-400 mt-1">
                  -{payslip?.totalDeductions?.toLocaleString()} <span className="text-xs text-slate-400">{payslip?.currency}</span>
                </p>
              </div>

              <div className="p-4 rounded-lg bg-blue-950/40 border border-blue-800/80">
                <span className="text-xs font-semibold text-blue-300 uppercase">Net Salary Transferred</span>
                <p className="text-2xl font-black text-blue-400 mt-1">
                  {payslip?.netAmount?.toLocaleString()} <span className="text-xs text-blue-300">{payslip?.currency}</span>
                </p>
              </div>
            </div>

            {/* Line Items Breakdown: Earnings & Deductions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Earnings Table */}
              <div className="rounded-lg border border-slate-800 p-4 space-y-3 bg-slate-850/60">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Earnings & Allowances</h4>
                  <span className="text-xs text-slate-400">Amount</span>
                </div>
                <div className="space-y-2 text-xs">
                  {payslip?.items
                    ?.filter((item: any) => item.category === 'EARNING')
                    .map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between py-1 border-b border-slate-800/40 last:border-0">
                        <div className="space-y-0.5">
                          <span className="text-slate-200 font-medium">{item.wageTypeName}</span>
                          <span className="text-[10px] font-mono text-slate-500 block">WT: {item.wageTypeCode}</span>
                        </div>
                        <span className="font-mono text-slate-200 font-semibold">
                          {item.amount?.toLocaleString()} {payslip.currency}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Deductions Table */}
              <div className="rounded-lg border border-slate-800 p-4 space-y-3 bg-slate-850/60">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Statutory Deductions & Taxes</h4>
                  <span className="text-xs text-slate-400">Amount</span>
                </div>
                <div className="space-y-2 text-xs">
                  {payslip?.items
                    ?.filter((item: any) => item.category === 'DEDUCTION')
                    .map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between py-1 border-b border-slate-800/40 last:border-0">
                        <div className="space-y-0.5">
                          <span className="text-slate-200 font-medium">{item.wageTypeName}</span>
                          <span className="text-[10px] font-mono text-slate-500 block">WT: {item.wageTypeCode}</span>
                        </div>
                        <span className="font-mono text-rose-300 font-semibold">
                          -{item.amount?.toLocaleString()} {payslip.currency}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Wage Type Master Catalog */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-white">Wage Type Master Catalog (T512W / PY_WAGETYPE_001)</h3>
              </div>
              <LineageBadge serviceCode="PY_WAGETYPE_001" sapSources={['T512W']} onClick={onInspectService} />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-2.5">Code</th>
                    <th className="px-4 py-2.5">Wage Type Name</th>
                    <th className="px-4 py-2.5">Category</th>
                    <th className="px-4 py-2.5">Taxable</th>
                    <th className="px-4 py-2.5">Social Security Eligible</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {wageTypes.map((wt) => (
                    <tr key={wt.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-2.5 font-mono text-blue-400 font-bold">{wt.code}</td>
                      <td className="px-4 py-2.5 font-medium text-white">{wt.name}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          wt.category === 'EARNING' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {wt.category}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">{wt.taxable ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-2.5">{wt.socialSecurityEligible ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TRAINING & DEVELOPMENT (TEM) */}
      {currentTab === 'training' && (
        <div className="space-y-6">
          {/* Course Catalog */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Course Catalog & Upcoming Sessions (TEM_EVENT)</h3>
              </div>
              <LineageBadge serviceCode="PE_TRAINING_CENTER_001" sapSources={['TEM_EVENT']} onClick={onInspectService} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => (
                <div key={course.id} className="p-4 rounded-lg border border-slate-800 bg-slate-850 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-purple-950 text-purple-300 border border-purple-800">
                      {course.category} • {course.code}
                    </span>
                    <span className="text-xs text-slate-400">{course.durationHours} Hours</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{course.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{course.description}</p>
                  </div>

                  {/* Upcoming event sessions */}
                  {course.events && course.events.length > 0 && (
                    <div className="border-t border-slate-800 pt-3 space-y-2">
                      <p className="text-[11px] font-semibold text-slate-400">Scheduled Sessions:</p>
                      {course.events.map((evt: any) => (
                        <div key={evt.id} className="flex justify-between items-center text-xs bg-slate-900/80 p-2 rounded border border-slate-800">
                          <div>
                            <span className="font-mono text-slate-300">{evt.startDate}</span>
                            <span className="text-slate-500 text-[10px] block">Location: {evt.location} ({evt.enrolledCount}/{evt.maxCapacity} seats)</span>
                          </div>
                          <button
                            onClick={() => handleBookCourse(evt.id)}
                            disabled={bookingInProgress}
                            className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition"
                          >
                            Enroll
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* My Bookings & Training History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">My Active Bookings (PE_MY_BOOKINGS_001)</h3>
                </div>
                <LineageBadge serviceCode="PE_MY_BOOKINGS_001" sapSources={['TEM_EVENT']} onClick={onInspectService} />
              </div>

              <div className="divide-y divide-slate-800">
                {bookings && bookings.length > 0 ? (
                  bookings.map((bk) => (
                    <div key={bk.id} className="py-3 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-200">{bk.courseTitle}</p>
                        <p className="text-slate-400">Starts: {bk.startDate} • Location: {bk.location}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        bk.bookingStatus === 'CONFIRMED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {bk.bookingStatus}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-3">No active training bookings.</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Completed Certifications & History</h3>
                </div>
                <LineageBadge serviceCode="PE_MY_HISTORY_001" sapSources={['TEM_HISTORY']} onClick={onInspectService} />
              </div>

              <div className="divide-y divide-slate-800">
                {trainingHistory && trainingHistory.length > 0 ? (
                  trainingHistory.map((th) => (
                    <div key={th.id} className="py-3 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-200">{th.courseTitle}</p>
                        <p className="text-slate-400">Completed: {th.completionDate} • Grade: {th.grade || 'Pass'}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-semibold">
                        Certified
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-3">No completed courses yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: TALENT & PERFORMANCE */}
      {currentTab === 'talent' && (
        <div className="space-y-6">
          {/* Active OKR Goals */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Performance Goals & OKRs (Cycle 2026)</h3>
              </div>
              <LineageBadge serviceCode="TM_GOALS_001" sapSources={['HAP_DOCUMENT']} onClick={onInspectService} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal) => (
                <div key={goal.id} className="p-4 rounded-lg border border-slate-800 bg-slate-850 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white">{goal.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                      Weight: {goal.weight}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{goal.description}</p>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Progress</span>
                      <span className="font-bold text-indigo-400">{goal.progressPercentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${goal.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* IDP & Career Aspirations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Individual Development Plan */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-teal-400" />
                  <h3 className="text-sm font-bold text-white">Individual Development Plan (IDP)</h3>
                </div>
                <LineageBadge serviceCode="TM_IDP_001" sapSources={['HAP_DOCUMENT']} onClick={onInspectService} />
              </div>

              <div className="divide-y divide-slate-800">
                {idp.map((item) => (
                  <div key={item.id} className="py-3 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200">{item.actionItem}</span>
                      <span className="px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 text-[10px]">
                        Target: {item.targetDate}
                      </span>
                    </div>
                    <p className="text-slate-400">Area: {item.competencyArea} • Status: {item.status}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Aspirations */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Career Aspirations (TM_CAREER_001)</h3>
                </div>
                <LineageBadge serviceCode="TM_CAREER_001" sapSources={['HAP_DOCUMENT']} onClick={onInspectService} />
              </div>

              <dl className="text-xs space-y-3">
                <div>
                  <dt className="text-slate-400 font-semibold">Target Next Role:</dt>
                  <dd className="text-slate-200 font-bold mt-0.5">{career?.targetRole || 'Enterprise Principal Architect'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-semibold">Readiness Horizon:</dt>
                  <dd className="text-amber-400 font-medium mt-0.5">{career?.readinessHorizon || '1 to 2 Years'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-semibold">Mobility & Relocation Preference:</dt>
                  <dd className="text-slate-200 mt-0.5">{career?.mobilityPreference || 'Regional & International Remote'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: ORG DIRECTORY (WHO IS WHO) */}
      {currentTab === 'directory' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Enterprise Directory & Hierarchy (OM_WHOISWHO_001)</h3>
            </div>
            <LineageBadge serviceCode="OM_WHOISWHO_001" sapSources={['HRP1000', 'HRP1001']} onClick={onInspectService} />
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search colleagues by name, position, or department..."
              value={searchDir}
              onChange={(e) => setSearchDir(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-850 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {directory
              .filter((emp) =>
                searchDir
                  ? emp.fullName.toLowerCase().includes(searchDir.toLowerCase()) ||
                    emp.positionTitle?.toLowerCase().includes(searchDir.toLowerCase()) ||
                    emp.orgUnitName?.toLowerCase().includes(searchDir.toLowerCase())
                  : true
              )
              .map((emp) => (
                <div key={emp.employeeId} className="p-4 rounded-lg border border-slate-800 bg-slate-850 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                      {emp.firstName?.[0]}{emp.lastName?.[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{emp.fullName}</h4>
                      <p className="text-[11px] text-slate-400">{emp.positionTitle}</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 space-y-1">
                    <p>Department: <span className="text-slate-300">{emp.orgUnitName}</span></p>
                    <p>Email: <span className="text-blue-400 font-mono">{emp.email}</span></p>
                    <p>PERNR: <span className="font-mono text-slate-300">{emp.pernr}</span></p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* MODAL: Request Time Off */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Submit Time-Off Request (PT_REQUEST_001)</h3>
              </div>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitLeave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Leave Type (PA2001)</label>
                <select
                  value={leaveForm.absenceType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, absenceType: e.target.value })}
                  className="w-full bg-slate-850 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="0100">Annual Paid Vacation (0100)</option>
                  <option value="0200">Certified Medical / Sick Leave (0200)</option>
                  <option value="0300">Family & Parental Care Leave (0300)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full bg-slate-850 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full bg-slate-850 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Reason / Notes for Manager</label>
                <textarea
                  rows={3}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full bg-slate-850 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500"
                  placeholder="Provide context for approval..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLeave}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1.5 shadow"
                >
                  {submittingLeave ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Submit to Workflow</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Self Appraisal */}
      {showSelfAppraisalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Self-Assessment Appraisal (TM_SELF_ASSESSMENT_001)</h3>
              </div>
              <button
                onClick={() => setShowSelfAppraisalModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitSelfAppraisal} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Key Achievements (2026 Cycle)</label>
                <textarea
                  rows={3}
                  required
                  value={appraisalForm.achievements}
                  onChange={(e) => setAppraisalForm({ ...appraisalForm, achievements: e.target.value })}
                  className="w-full bg-slate-850 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Self Rating (1.0 to 5.0): <strong className="text-indigo-400">{appraisalForm.selfRating} / 5.0</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={appraisalForm.selfRating}
                  onChange={(e) => setAppraisalForm({ ...appraisalForm, selfRating: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Demonstrated Strengths</label>
                <input
                  type="text"
                  value={appraisalForm.strengthAreas}
                  onChange={(e) => setAppraisalForm({ ...appraisalForm, strengthAreas: e.target.value })}
                  className="w-full bg-slate-850 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Development & Growth Opportunities</label>
                <input
                  type="text"
                  value={appraisalForm.developmentNeeds}
                  onChange={(e) => setAppraisalForm({ ...appraisalForm, developmentNeeds: e.target.value })}
                  className="w-full bg-slate-850 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSelfAppraisalModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAppraisal}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5 shadow"
                >
                  {submittingAppraisal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Submit Evaluation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
