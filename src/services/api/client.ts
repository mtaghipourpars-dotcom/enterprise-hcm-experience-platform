// ============================================================================
// Enterprise HCM Experience Platform - Frontend API Client
// Handles typed REST requests with persona authentication headers and
// structured error handling across PA, OM, PT, PY, Training, Talent, Workflow
// ============================================================================

import { Persona } from '../../types/service-catalog';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  meta: {
    serviceCode: string;
    domain: string;
    timestamp: string;
    traceId: string;
    lineage: {
      domain: string;
      subdomain?: string;
      coreEntities: string[];
      sapSources: string[];
      canonicalTable?: string;
    };
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: {
    code: string;
    message: string;
    traceId?: string;
  };
}

export interface PersonaCredentials {
  userId: string;
  pernr: string;
  employeeId: string;
  username: string;
  fullName: string;
  role: string;
}

export const PERSONA_CREDENTIALS: Record<Persona, PersonaCredentials> = {
  EMPLOYEE: {
    userId: 'u001',
    pernr: '00001001',
    employeeId: 'e001',
    username: 'arash.moradi',
    fullName: 'Arash Moradi',
    role: 'Senior Software Architect',
  },
  MANAGER: {
    userId: 'u002',
    pernr: '00001002',
    employeeId: 'e002',
    username: 'sara.tehrani',
    fullName: 'Sara Tehrani',
    role: 'Engineering Director',
  },
  EXECUTIVE: {
    userId: 'u003',
    pernr: '00001003',
    employeeId: 'e003',
    username: 'kianoush.rostami',
    fullName: 'Kianoush Rostami',
    role: 'Vice President of Technology',
  },
  HR_ADMIN: {
    userId: 'u004',
    pernr: '00001004',
    employeeId: 'e004',
    username: 'maryam.alavi',
    fullName: 'Maryam Alavi',
    role: 'HR Operations Specialist',
  },
  SYSTEM_ADMIN: {
    userId: 'u003',
    pernr: '00001003',
    employeeId: 'e003',
    username: 'kianoush.rostami',
    fullName: 'System Administrator',
    role: 'System Administrator',
  },
};

class ApiClient {
  private activePersona: Persona = 'EMPLOYEE';

  public setPersona(persona: Persona) {
    this.activePersona = persona;
  }

  public getPersona(): Persona {
    return this.activePersona;
  }

  public getCredentials(): PersonaCredentials {
    return PERSONA_CREDENTIALS[this.activePersona] || PERSONA_CREDENTIALS.EMPLOYEE;
  }

  private getHeaders(): Record<string, string> {
    const creds = this.getCredentials();
    return {
      'Content-Type': 'application/json',
      'x-user-id': creds.userId,
      'x-pernr': creds.pernr,
      'x-username': creds.username,
    };
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers = {
      ...this.getHeaders(),
      ...(options.headers as Record<string, string> || {}),
    };

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers,
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const body = await response.json();
        if (!response.ok && !body.error) {
          throw new Error(body.message || `HTTP ${response.status}: Request failed`);
        }
        return body;
      }

      throw new Error(`Unexpected non-JSON response (HTTP ${response.status})`);
    } catch (err: any) {
      console.warn(`[ApiClient] Request to ${endpoint} failed:`, err.message);
      throw err;
    }
  }

  // --------------------------------------------------------------------------
  // Domain 1: PA (Personnel Administration)
  // --------------------------------------------------------------------------
  public async getEmployeeProfile(idOrPernr?: string) {
    const target = idOrPernr || this.getCredentials().pernr;
    return this.request(`/api/employee/${target}/profile`);
  }

  public async getEmployeeFamily(idOrPernr?: string) {
    const target = idOrPernr || this.getCredentials().pernr;
    return this.request(`/api/employee/${target}/family`);
  }

  public async getEmployeeEducation(idOrPernr?: string) {
    const target = idOrPernr || this.getCredentials().pernr;
    return this.request(`/api/employee/${target}/education`);
  }

  public async getEmployeeHse(idOrPernr?: string) {
    const target = idOrPernr || this.getCredentials().pernr;
    return this.request(`/api/employee/${target}/hse`);
  }

  // --------------------------------------------------------------------------
  // Domain 2: OM (Organizational Management)
  // --------------------------------------------------------------------------
  public async searchOrgDirectory(query: string = '', page: number = 1, limit: number = 20) {
    return this.request(`/api/organization/directory?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }

  public async getPositionDetails(positionId: string) {
    return this.request(`/api/organization/position/${positionId}`);
  }

  // --------------------------------------------------------------------------
  // Domain 3: PT (Time Management)
  // --------------------------------------------------------------------------
  public async getTimeQuotas(idOrPernr?: string) {
    const target = idOrPernr || this.getCredentials().pernr;
    return this.request(`/api/time/quotas?employeeId=${target}`);
  }

  public async getTimeAbsences(idOrPernr?: string) {
    const target = idOrPernr || this.getCredentials().pernr;
    return this.request(`/api/time/absences?employeeId=${target}`);
  }

  public async submitTimeRequest(payload: {
    absenceType: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }) {
    return this.request('/api/time/request', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getTimeAttendance(idOrPernr?: string, startDate?: string, endDate?: string) {
    const target = idOrPernr || this.getCredentials().pernr;
    let url = `/api/time/attendance?employeeId=${target}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return this.request(url);
  }

  // --------------------------------------------------------------------------
  // Domain 4: PY (Payroll)
  // --------------------------------------------------------------------------
  public async getPayslip(idOrPernr?: string, periodId?: string) {
    const target = idOrPernr || this.getCredentials().pernr;
    let url = `/api/payroll/payslip?employeeId=${target}`;
    if (periodId) url += `&periodId=${periodId}`;
    return this.request(url);
  }

  public async getPayrollHistory(idOrPernr?: string) {
    const target = idOrPernr || this.getCredentials().pernr;
    return this.request(`/api/payroll/history?employeeId=${target}`);
  }

  public async getWageTypes() {
    return this.request('/api/payroll/wagetypes');
  }

  // --------------------------------------------------------------------------
  // Domain 5: Training (L&D)
  // --------------------------------------------------------------------------
  public async getTrainingCourses(search?: string) {
    let url = '/api/training/courses';
    if (search) url += `?search=${encodeURIComponent(search)}`;
    return this.request(url);
  }

  public async getTrainingBookings(idOrPernr?: string) {
    const target = idOrPernr || this.getCredentials().pernr;
    return this.request(`/api/training/bookings?employeeId=${target}`);
  }

  public async bookTrainingSession(eventId: string) {
    return this.request('/api/training/book', {
      method: 'POST',
      body: JSON.stringify({ eventId }),
    });
  }

  public async getTrainingHistory(idOrPernr?: string) {
    const target = idOrPernr || this.getCredentials().pernr;
    return this.request(`/api/training/history?employeeId=${target}`);
  }

  public async getQualifications(idOrPernr?: string) {
    const target = idOrPernr || this.getCredentials().pernr;
    return this.request(`/api/training/qualifications?employeeId=${target}`);
  }

  // --------------------------------------------------------------------------
  // Domain 6: Talent & Performance
  // --------------------------------------------------------------------------
  public async getGoals(idOrPernr?: string, cycleYear?: number) {
    const target = idOrPernr || this.getCredentials().pernr;
    let url = `/api/talent/goals?employeeId=${target}`;
    if (cycleYear) url += `&cycleYear=${cycleYear}`;
    return this.request(url);
  }

  public async getIdp(idOrPernr?: string) {
    const target = idOrPernr || this.getCredentials().pernr;
    return this.request(`/api/talent/idp?employeeId=${target}`);
  }

  public async getCareerAspirations(idOrPernr?: string) {
    const target = idOrPernr || this.getCredentials().pernr;
    return this.request(`/api/talent/career?employeeId=${target}`);
  }

  public async submitSelfAssessment(payload: {
    cycleYear: number;
    achievements: string;
    selfRating: number;
    strengthAreas?: string;
    developmentNeeds?: string;
  }) {
    return this.request('/api/talent/self-assessment', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getAppraisals(idOrPernr?: string) {
    const target = idOrPernr || this.getCredentials().pernr;
    return this.request(`/api/talent/appraisals?employeeId=${target}`);
  }

  // --------------------------------------------------------------------------
  // Domain 7: Manager Services
  // --------------------------------------------------------------------------
  public async getManagerTeam() {
    return this.request('/api/manager/team');
  }

  public async getManagerCost() {
    return this.request('/api/manager/cost');
  }

  public async getManagerTime() {
    return this.request('/api/manager/time');
  }

  public async getManagerCapability() {
    return this.request('/api/manager/capability');
  }

  public async decideTrainingBooking(payload: {
    bookingId: string;
    decision: 'APPROVED' | 'REJECTED';
    comments?: string;
  }) {
    return this.request('/api/manager/training/decision', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getManagerTalent() {
    return this.request('/api/manager/talent');
  }

  // --------------------------------------------------------------------------
  // Domain 8: Executive Analytics
  // --------------------------------------------------------------------------
  public async getExecutiveKpis() {
    return this.request('/api/analytics/kpis');
  }

  public async getExecutiveWorkforce() {
    return this.request('/api/analytics/workforce');
  }

  public async getExecutiveBudget() {
    return this.request('/api/analytics/budget');
  }

  // --------------------------------------------------------------------------
  // Domain 9: Workflow Engine
  // --------------------------------------------------------------------------
  public async getWorkflowInbox() {
    return this.request('/api/workflow/inbox');
  }

  public async takeWorkflowAction(payload: {
    taskId: string;
    decision: 'APPROVE' | 'REJECT';
    comments?: string;
  }) {
    return this.request('/api/workflow/action', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getWorkflowHistory() {
    return this.request('/api/workflow/history');
  }

  public async setWorkflowDelegation(payload: {
    delegateId: string;
    startDate: string;
    endDate: string;
    notes?: string;
  }) {
    return this.request('/api/workflow/delegation', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --------------------------------------------------------------------------
  // Domain 10: System & Catalog
  // --------------------------------------------------------------------------
  public async getHealth() {
    return this.request('/api/health');
  }

  public async getCatalogIntrospection() {
    return this.request('/api/catalog');
  }
}

export const api = new ApiClient();
