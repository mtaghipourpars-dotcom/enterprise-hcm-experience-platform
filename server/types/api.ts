// ============================================================================
// Enterprise HCM Experience Platform - Backend API Type System
// Standard Request/Response Envelopes, DTOs, Error Model, Lineage & RBAC
// ============================================================================

export type PersonaRole = 'EMPLOYEE' | 'MANAGER' | 'EXECUTIVE' | 'HR_ADMIN' | 'SYSTEM_ADMIN';

export type ActionType = 'READ' | 'WRITE' | 'APPROVE' | 'SEARCH' | 'REPORT' | 'ANALYTICS';

export type SensitivityLevel = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'STRICTLY_CONFIDENTIAL';

export type AuditStatus = 'SUCCESS' | 'FAILURE' | 'DENIED';

export interface AuthUser {
  id: string;
  employeeId: string;
  pernr: string;
  email: string;
  firstName: string;
  lastName: string;
  persona: PersonaRole;
  roles: string[];
  permissions: string[];
  orgUnitId: string;
  positionId: string;
}

export interface LineageMetadata {
  domain: string;
  coreEntities: string[];
  sapSources: string[];
  verificationStatus: 'VERIFIED_STANDARD_ANCHOR' | 'VERIFICATION_REQUIRED';
}

export interface ResponseMeta {
  timestamp: string;
  requestId: string;
  serviceCode: string;
  lineage: LineageMetadata;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  success: true;
  serviceCode: string;
  data: T;
  meta: ResponseMeta;
}

export interface ApiValidationErrorDetail {
  field: string;
  message: string;
  code?: string;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  status: number;
  details?: ApiValidationErrorDetail[] | any;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  serviceCode: string;
  error: ApiErrorPayload;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorUserId: string;
  actorPernr: string;
  actorPersona: PersonaRole;
  serviceCode: string;
  action: ActionType;
  endpoint: string;
  method: string;
  targetId?: string;
  status: AuditStatus;
  httpStatus: number;
  ipAddress: string;
  durationMs: number;
  metadata?: Record<string, any>;
}

// ----------------------------------------------------------------------------
// Domain DTOs
// ----------------------------------------------------------------------------

export interface EmployeeProfileDto {
  id: string;
  pernr: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  birthDate: string;
  gender: string;
  maritalStatus: string;
  employmentStatus: string;
  hireDate: string;
  orgUnitId: string;
  orgUnitName: string;
  positionId: string;
  positionTitle: string;
  jobCode: string;
  jobTitle: string;
  costCenter: string;
  managerId: string;
  managerName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  effectiveDates: {
    validFrom: string;
    validTo: string;
  };
}

export interface FamilyMemberDto {
  id: string;
  employeeId: string;
  relationType: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  nationalId: string;
  isDependent: boolean;
  medicalInsuranceEnrolled: boolean;
}

export interface EducationRecordDto {
  id: string;
  employeeId: string;
  degreeLevel: string;
  fieldOfStudy: string;
  institutionName: string;
  graduationYear: number;
  gpa?: number;
}

export interface HseProfileDto {
  id: string;
  employeeId: string;
  bloodType: string;
  lastCheckupDate: string;
  fitnessStatus: string;
  medicalRestrictions: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface OrgDirectoryEntryDto {
  id: string;
  pernr: string;
  fullName: string;
  positionTitle: string;
  orgUnitName: string;
  email: string;
  phone: string;
  managerPernr?: string;
  managerName?: string;
}

export interface PositionDetailDto {
  id: string;
  positionCode: string;
  title: string;
  orgUnitId: string;
  orgUnitName: string;
  jobCode: string;
  jobTitle: string;
  isHeadOfOrgUnit: boolean;
  occupantPernr?: string;
  occupantName?: string;
  validFrom: string;
  validTo: string;
}

export interface TimeAbsenceDto {
  id: string;
  employeeId: string;
  absenceType: string;
  absenceName: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reason?: string;
  workflowInstanceId?: string;
  createdAt: string;
}

export interface TimeAttendanceDto {
  id: string;
  employeeId: string;
  attendanceDate: string;
  scheduledHours: number;
  actualHours: number;
  overtimeHours: number;
  checkInTime?: string;
  checkOutTime?: string;
  status: string;
}

export interface TimeQuotaDto {
  id: string;
  employeeId: string;
  quotaType: string;
  quotaName: string;
  entitlementDays: number;
  usedDays: number;
  balanceDays: number;
  validFrom: string;
  validTo: string;
}

export interface PayslipDto {
  id: string;
  employeeId: string;
  periodCode: string;
  periodName: string;
  paymentDate: string;
  currency: string;
  grossAmount: number;
  netAmount: number;
  totalDeductions: number;
  earnings: Array<{
    wageTypeCode: string;
    name: string;
    amount: number;
  }>;
  deductions: Array<{
    wageTypeCode: string;
    name: string;
    amount: number;
  }>;
  taxAmount: number;
  insuranceAmount: number;
}

export interface TrainingCourseDto {
  id: string;
  courseCode: string;
  title: string;
  description: string;
  durationHours: number;
  deliveryMethod: string;
  category: string;
  prerequisites?: string[];
  upcomingEvents: Array<{
    eventId: string;
    startDate: string;
    endDate: string;
    location: string;
    availableSeats: number;
    instructor: string;
  }>;
}

export interface TrainingBookingDto {
  id: string;
  employeeId: string;
  eventId: string;
  courseCode: string;
  courseTitle: string;
  startDate: string;
  endDate: string;
  bookingStatus: 'PENDING_APPROVAL' | 'CONFIRMED' | 'CANCELLED' | 'ATTENDED';
  bookingDate: string;
}

export interface QualificationGapDto {
  id: string;
  employeeId: string;
  qualificationCode: string;
  qualificationName: string;
  requiredProficiency: number;
  currentProficiency: number;
  gap: number;
  status: 'COMPLIANT' | 'GAP_IDENTIFIED';
}

export interface EmployeeGoalDto {
  id: string;
  employeeId: string;
  cycleId: string;
  cycleName: string;
  title: string;
  description: string;
  category: string;
  weight: number;
  progressPercent: number;
  status: 'DRAFT' | 'IN_PROGRESS' | 'ACHIEVED' | 'DEFERRED';
  targetDate: string;
}

export interface IndividualDevelopmentPlanDto {
  id: string;
  employeeId: string;
  goalTitle: string;
  actionItem: string;
  competencyName: string;
  targetCompletionDate: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface CareerAspirationDto {
  id: string;
  employeeId: string;
  targetRole: string;
  timeframeYears: number;
  readinessLevel: 'READY_NOW' | 'READY_1_2_YEARS' | 'LONG_TERM';
  notes: string;
}

export interface AppraisalSummaryDto {
  id: string;
  employeeId: string;
  cycleId: string;
  cycleName: string;
  appraisalStatus: 'SELF_ASSESSMENT' | 'MANAGER_REVIEW' | 'COMPLETED';
  overallRating: number;
  managerComments?: string;
  completedAt?: string;
}

export interface ManagerTeamOverviewDto {
  managerId: string;
  managerPernr: string;
  managerName: string;
  directReportsCount: number;
  teamMembers: Array<{
    employeeId: string;
    pernr: string;
    fullName: string;
    positionTitle: string;
    employmentStatus: string;
    timeStatusToday: string;
    openTasksCount: number;
  }>;
  teamKpis: {
    headcount: number;
    attendanceRate: number;
    trainingCompletionRate: number;
    goalsOnTrackPercent: number;
  };
}

export interface WorkflowTaskDto {
  taskId: string;
  instanceId: string;
  serviceCode: string;
  title: string;
  requesterPernr: string;
  requesterName: string;
  requestType: string;
  submittedDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  details: Record<string, any>;
}
