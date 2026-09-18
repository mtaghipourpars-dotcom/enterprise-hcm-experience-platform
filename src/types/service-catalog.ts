// ============================================================================
// Service Catalog & Traceability Engine Types
// Enterprise HCM Experience Platform
// ============================================================================

export type Domain =
  | 'PA'
  | 'OM'
  | 'PT'
  | 'PY'
  | 'TRAINING'
  | 'TALENT'
  | 'WORKFLOW'
  | 'ANALYTICS';

export type Persona =
  | 'EMPLOYEE'
  | 'MANAGER'
  | 'EXECUTIVE'
  | 'HR_ADMIN'
  | 'SYSTEM_ADMIN';

export type ServiceType =
  | 'PROFILE'
  | 'SEARCH'
  | 'WORKFLOW'
  | 'REPORT'
  | 'ANALYTICS'
  | 'APPROVAL'
  | 'CONFIGURATION';

export type ReadWriteMode = 'READ' | 'WRITE' | 'READ_WRITE';

export type SensitivityLevel =
  | 'PUBLIC'
  | 'STANDARD'
  | 'CONFIDENTIAL'
  | 'STRICTLY_CONFIDENTIAL';

export type VerificationStatus =
  | 'VERIFIED_STANDARD_ANCHOR'
  | 'VERIFICATION_REQUIRED';

export interface ServiceFieldSpec {
  name: string;
  labelKey: string;
  dataType: 'STRING' | 'NUMBER' | 'DATE' | 'CURRENCY' | 'ENUM' | 'BOOLEAN';
  isPii?: boolean;
  isFilterable?: boolean;
  isSortable?: boolean;
}

export interface ServiceDefinition {
  code: string;
  nameKeyEn: string;
  nameKeyFa: string;
  descriptionKeyEn: string;
  descriptionKeyFa: string;
  domain: Domain;
  subdomain: string;
  personas: Persona[];
  type: ServiceType;
  readWriteMode: ReadWriteMode;
  sensitivity: SensitivityLevel;
  component: string;
  api: string;
  permission: string;
  workflowDefinition?: string;
  activeFlag: boolean;
  sortOrder: number;
  coreEntities: string[];
  sapSources: string[];
  fields?: ServiceFieldSpec[];
}

export interface TraceabilityStep1Service {
  code: string;
  nameEn: string;
  nameFa: string;
  domain: Domain;
  subdomain: string;
  type: ServiceType;
  readWriteMode: ReadWriteMode;
  sensitivity: SensitivityLevel;
}

export interface TraceabilityStep2Persona {
  primary: Persona;
  allowed: Persona[];
  scope: 'SELF' | 'DIRECT_REPORTS' | 'ORG_UNIT' | 'ENTERPRISE';
}

export interface TraceabilityStep3Permission {
  code: string;
  domain: Domain;
  action: 'READ' | 'WRITE' | 'APPROVE' | 'EXECUTE';
  sensitivity: SensitivityLevel;
  description: string;
}

export interface TraceabilityStep4Api {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  pathParams: string[];
  queryParams?: string[];
  requestPayload?: string;
  responseContract: string;
}

export interface TraceabilityStep5CoreEntity {
  schema: 'hcm_core' | 'hcm_workflow' | 'hcm_security' | 'hcm_service';
  tableName: string;
  primaryKey: string;
  keyFields: string[];
  temporalModel: 'POINT_IN_TIME' | 'EFFECTIVE_DATED_T1' | 'EFFECTIVE_DATED_T2' | 'TIME_EVENT';
}

export interface TraceabilityStep6SapSource {
  table: string;
  field: string;
  infotypeNumber?: string;
  clusterOrDirect: 'TRANSPARENT_TABLE' | 'CLUSTER_RESULT' | 'OM_OBJECT_RELATION' | 'EXTRACT_PAYLOAD';
  verificationStatus: VerificationStatus;
  verificationNote?: string;
}

export interface TraceabilityStep7UiComponent {
  componentName: string;
  modulePath: string;
  viewType: 'PROFILE_VIEW' | 'SEARCH_GRID' | 'WIZARD_FORM' | 'ANALYTIC_DASHBOARD' | 'APPROVAL_INBOX' | 'REPORT_VIEW';
  responsiveSlots: ('MOBILE' | 'TABLET' | 'DESKTOP')[];
}

export interface TraceabilityStep8TestCase {
  testId: string;
  testSuite: string;
  description: string;
  assertionType: 'SCHEMA_LINEAGE' | 'RBAC_SECURITY' | 'API_CONTRACT' | 'TEMPORAL_INTEGRITY' | 'END_TO_END';
  status: 'PASS' | 'PENDING';
}

export interface TraceabilityChain {
  serviceCode: string;
  service: TraceabilityStep1Service;
  persona: TraceabilityStep2Persona;
  permission: TraceabilityStep3Permission;
  api: TraceabilityStep4Api;
  coreEntity: TraceabilityStep5CoreEntity;
  sapSource: TraceabilityStep6SapSource;
  uiComponent: TraceabilityStep7UiComponent;
  testCase: TraceabilityStep8TestCase;
}

export interface ServiceFilterCriteria {
  searchQuery?: string;
  domain?: Domain | 'ALL';
  persona?: Persona | 'ALL';
  serviceType?: ServiceType | 'ALL';
  verificationStatus?: VerificationStatus | 'ALL';
  sensitivity?: SensitivityLevel | 'ALL';
}

export interface AuditReport {
  totalServices: number;
  traceableServices: number;
  coveragePercentage: number;
  standardAnchorCount: number;
  verificationRequiredCount: number;
  domainCounts: Record<Domain, number>;
  personaCounts: Record<Persona, number>;
  brokenChains: { serviceCode: string; missingStep: string }[];
  passedAudit: boolean;
}
