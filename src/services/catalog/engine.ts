// ============================================================================
// Service Catalog Engine
// Enterprise HCM Experience Platform
// Manages Service Catalog Lifecycle, Access Rules, and 8-Tier Traceability
// ============================================================================

import {
  AuditReport,
  Domain,
  Persona,
  ServiceDefinition,
  ServiceFilterCriteria,
  TraceabilityChain,
} from '../../types/service-catalog';
import { MASTER_SERVICES, MASTER_TRACEABILITY_CHAINS } from './master-catalog';

export class ServiceCatalogEngine {
  private services: ServiceDefinition[];
  private chains: Record<string, TraceabilityChain>;

  constructor(
    services: ServiceDefinition[] = MASTER_SERVICES,
    chains: Record<string, TraceabilityChain> = MASTER_TRACEABILITY_CHAINS
  ) {
    this.services = services;
    this.chains = chains;
  }

  public getAllServices(): ServiceDefinition[] {
    return [...this.services].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getService(code: string): ServiceDefinition | undefined {
    return this.services.find((s) => s.code === code);
  }

  public getTraceabilityChain(code: string): TraceabilityChain | undefined {
    return this.chains[code];
  }

  public getAllTraceabilityChains(): TraceabilityChain[] {
    return this.services
      .map((s) => this.chains[s.code])
      .filter((c): c is TraceabilityChain => Boolean(c));
  }

  public checkAccess(serviceCode: string, persona: Persona): boolean {
    const service = this.getService(serviceCode);
    if (!service) return false;
    return service.personas.includes(persona);
  }

  public filterServices(criteria: ServiceFilterCriteria): ServiceDefinition[] {
    return this.services.filter((svc) => {
      // 1. Search Query
      if (criteria.searchQuery && criteria.searchQuery.trim() !== '') {
        const q = criteria.searchQuery.toLowerCase().trim();
        const chain = this.chains[svc.code];
        const matchesCode = svc.code.toLowerCase().includes(q);
        const matchesNameEn = svc.nameKeyEn.toLowerCase().includes(q);
        const matchesNameFa = svc.nameKeyFa.toLowerCase().includes(q);
        const matchesApi = svc.api.toLowerCase().includes(q);
        const matchesPerm = svc.permission.toLowerCase().includes(q);
        const matchesComponent = svc.component.toLowerCase().includes(q);
        const matchesDomain = svc.domain.toLowerCase().includes(q);
        const matchesCoreEntity = chain?.coreEntity.tableName.toLowerCase().includes(q) ?? false;
        const matchesSapSource = chain?.sapSource.table.toLowerCase().includes(q) ?? false;
        const matchesSapField = chain?.sapSource.field.toLowerCase().includes(q) ?? false;
        const matchesTestId = chain?.testCase.testId.toLowerCase().includes(q) ?? false;

        if (
          !matchesCode &&
          !matchesNameEn &&
          !matchesNameFa &&
          !matchesApi &&
          !matchesPerm &&
          !matchesComponent &&
          !matchesDomain &&
          !matchesCoreEntity &&
          !matchesSapSource &&
          !matchesSapField &&
          !matchesTestId
        ) {
          return false;
        }
      }

      // 2. Domain Filter
      if (criteria.domain && criteria.domain !== 'ALL') {
        if (svc.domain !== criteria.domain) return false;
      }

      // 3. Persona Filter
      if (criteria.persona && criteria.persona !== 'ALL') {
        if (!svc.personas.includes(criteria.persona)) return false;
      }

      // 4. Service Type Filter
      if (criteria.serviceType && criteria.serviceType !== 'ALL') {
        if (svc.type !== criteria.serviceType) return false;
      }

      // 5. Verification Status Filter
      if (criteria.verificationStatus && criteria.verificationStatus !== 'ALL') {
        const chain = this.chains[svc.code];
        if (!chain || chain.sapSource.verificationStatus !== criteria.verificationStatus) {
          return false;
        }
      }

      // 6. Sensitivity Filter
      if (criteria.sensitivity && criteria.sensitivity !== 'ALL') {
        if (svc.sensitivity !== criteria.sensitivity) return false;
      }

      return true;
    });
  }

  public runTraceabilityAudit(): AuditReport {
    const totalServices = this.services.length;
    let traceableServices = 0;
    let standardAnchorCount = 0;
    let verificationRequiredCount = 0;

    const domainCounts: Record<Domain, number> = {
      PA: 0,
      OM: 0,
      PT: 0,
      PY: 0,
      TRAINING: 0,
      TALENT: 0,
      WORKFLOW: 0,
      ANALYTICS: 0,
    };

    const personaCounts: Record<Persona, number> = {
      EMPLOYEE: 0,
      MANAGER: 0,
      EXECUTIVE: 0,
      HR_ADMIN: 0,
      SYSTEM_ADMIN: 0,
    };

    const brokenChains: { serviceCode: string; missingStep: string }[] = [];

    for (const svc of this.services) {
      domainCounts[svc.domain] = (domainCounts[svc.domain] || 0) + 1;
      for (const p of svc.personas) {
        personaCounts[p] = (personaCounts[p] || 0) + 1;
      }

      const chain = this.chains[svc.code];
      if (!chain) {
        brokenChains.push({ serviceCode: svc.code, missingStep: 'Complete Traceability Chain' });
        continue;
      }

      // Validate each tier of the chain:
      // Service -> Persona -> Permission -> API -> HCM Core Entity -> SAP Source -> UI Component -> Test Case
      if (!chain.service || !chain.service.code) {
        brokenChains.push({ serviceCode: svc.code, missingStep: 'Step 1: Service Definition' });
      } else if (!chain.persona || !chain.persona.primary) {
        brokenChains.push({ serviceCode: svc.code, missingStep: 'Step 2: Persona' });
      } else if (!chain.permission || !chain.permission.code) {
        brokenChains.push({ serviceCode: svc.code, missingStep: 'Step 3: Permission' });
      } else if (!chain.api || !chain.api.endpoint) {
        brokenChains.push({ serviceCode: svc.code, missingStep: 'Step 4: API Endpoint' });
      } else if (!chain.coreEntity || !chain.coreEntity.tableName) {
        brokenChains.push({ serviceCode: svc.code, missingStep: 'Step 5: HCM Core Entity' });
      } else if (!chain.sapSource || !chain.sapSource.table) {
        brokenChains.push({ serviceCode: svc.code, missingStep: 'Step 6: SAP Source' });
      } else if (!chain.uiComponent || !chain.uiComponent.componentName) {
        brokenChains.push({ serviceCode: svc.code, missingStep: 'Step 7: UI Component' });
      } else if (!chain.testCase || !chain.testCase.testId) {
        brokenChains.push({ serviceCode: svc.code, missingStep: 'Step 8: Test Case' });
      } else {
        traceableServices++;
        if (chain.sapSource.verificationStatus === 'VERIFIED_STANDARD_ANCHOR') {
          standardAnchorCount++;
        } else {
          verificationRequiredCount++;
        }
      }
    }

    const coveragePercentage = totalServices > 0 ? (traceableServices / totalServices) * 100 : 0;
    const passedAudit = brokenChains.length === 0 && traceableServices === totalServices;

    return {
      totalServices,
      traceableServices,
      coveragePercentage,
      standardAnchorCount,
      verificationRequiredCount,
      domainCounts,
      personaCounts,
      brokenChains,
      passedAudit,
    };
  }

  public generateCsvExport(): string {
    const headers = [
      'Service Code',
      'Domain',
      'Primary Persona',
      'Permission Code',
      'API Endpoint',
      'HCM Core Entity',
      'SAP Source Table',
      'SAP Source Field',
      'Verification Status',
      'UI Component',
      'Test Case ID',
      'Test Suite',
    ];

    const rows = this.services.map((svc) => {
      const chain = this.chains[svc.code];
      return [
        svc.code,
        svc.domain,
        chain?.persona.primary || svc.personas[0] || '',
        svc.permission,
        svc.api,
        chain?.coreEntity.tableName || '',
        chain?.sapSource.table || '',
        chain?.sapSource.field || '',
        chain?.sapSource.verificationStatus || '',
        svc.component,
        chain?.testCase.testId || '',
        chain?.testCase.testSuite || '',
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}

export const catalogEngine = new ServiceCatalogEngine();
