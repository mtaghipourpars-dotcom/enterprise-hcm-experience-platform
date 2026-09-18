// ============================================================================
// Enterprise HCM Experience Platform - Service Catalog Engine
// Complete 8-Tier Traceability Architecture:
// Service -> Persona -> Permission -> API -> HCM Core Entity -> SAP Source -> UI Component -> Test Case
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Header, AppTab } from './components/common/Header';
import { ServiceCatalogGrid } from './components/catalog/ServiceCatalogGrid';
import { TraceabilityPipelineView } from './components/catalog/TraceabilityPipelineView';
import { TraceabilityMatrixTable } from './components/catalog/TraceabilityMatrixTable';
import { TraceabilityAuditDashboard } from './components/catalog/TraceabilityAuditDashboard';
import { EmployeeExperience } from './components/experience/EmployeeExperience';
import { ManagerExperience } from './components/experience/ManagerExperience';
import { ExecutiveExperience } from './components/experience/ExecutiveExperience';
import { LineageModal } from './components/common/LineageModal';
import { catalogEngine } from './services/catalog/engine';
import { Locale } from './locales/translations';
import { Persona } from './types/service-catalog';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('experience-employee');
  const [activePersona, setActivePersona] = useState<Persona>('EMPLOYEE');
  const [locale, setLocale] = useState<Locale>('en');
  const [selectedServiceCode, setSelectedServiceCode] = useState<string>('PA_PROFILE_001');
  const [modalServiceCode, setModalServiceCode] = useState<string | null>(null);

  // Synchronize document direction and language for Persian (RTL) / English (LTR)
  useEffect(() => {
    document.documentElement.dir = locale === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  const allServices = catalogEngine.getAllServices();
  const allChains = catalogEngine.getAllTraceabilityChains();
  const auditReport = catalogEngine.runTraceabilityAudit();

  const handleToggleLocale = () => {
    setLocale((prev) => (prev === 'en' ? 'fa' : 'en'));
  };

  const handleInspectService = (serviceCode: string) => {
    setModalServiceCode(serviceCode);
  };

  const handleNavigateToPipeline = (serviceCode: string) => {
    setSelectedServiceCode(serviceCode);
    setModalServiceCode(null);
    setCurrentTab('pipeline');
  };

  const handlePersonaChange = (newPersona: Persona) => {
    setActivePersona(newPersona);
    if (newPersona === 'EMPLOYEE') setCurrentTab('experience-employee');
    else if (newPersona === 'MANAGER') setCurrentTab('experience-manager');
    else if (newPersona === 'EXECUTIVE') setCurrentTab('experience-executive');
  };

  const handleExportCsv = () => {
    const csvContent = catalogEngine.generateCsvExport();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `hcm-traceability-matrix-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="hcm-app-container" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Platform Header & Navigation */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        activePersona={activePersona}
        onPersonaChange={handlePersonaChange}
        locale={locale}
        onLocaleToggle={handleToggleLocale}
        totalServices={allServices.length}
      />

      {/* Main Workspace View */}
      <main id="hcm-main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 1. EMPLOYEE SELF-SERVICE EXPERIENCE */}
        {currentTab === 'experience-employee' && (
          <section id="hcm-employee-section" aria-label="Employee Experience">
            <EmployeeExperience
              locale={locale}
              onInspectService={handleInspectService}
            />
          </section>
        )}

        {/* 2. MANAGER SELF-SERVICE EXPERIENCE */}
        {currentTab === 'experience-manager' && (
          <section id="hcm-manager-section" aria-label="Manager Experience">
            <ManagerExperience
              locale={locale}
              onInspectService={handleInspectService}
            />
          </section>
        )}

        {/* 3. EXECUTIVE LEADERSHIP EXPERIENCE */}
        {currentTab === 'experience-executive' && (
          <section id="hcm-executive-section" aria-label="Executive Experience">
            <ExecutiveExperience
              locale={locale}
              onInspectService={handleInspectService}
            />
          </section>
        )}

        {/* 4. TRACEABILITY PIPELINE VIEW */}
        {currentTab === 'pipeline' && (
          <section id="hcm-pipeline-section" aria-label="Traceability Pipeline">
            <TraceabilityPipelineView
              chains={allChains}
              selectedServiceCode={selectedServiceCode}
              onSelectServiceCode={setSelectedServiceCode}
              locale={locale}
            />
          </section>
        )}

        {/* 5. SERVICE CATALOG GRID */}
        {currentTab === 'catalog' && (
          <section id="hcm-catalog-section" aria-label="Service Catalog">
            <ServiceCatalogGrid
              services={allServices}
              activePersona={activePersona}
              locale={locale}
              onInspectService={handleInspectService}
            />
          </section>
        )}

        {/* 6. TRACEABILITY MATRIX */}
        {currentTab === 'matrix' && (
          <section id="hcm-matrix-section" aria-label="Traceability Matrix">
            <TraceabilityMatrixTable
              chains={allChains}
              locale={locale}
              onInspectService={handleInspectService}
              onExportCsv={handleExportCsv}
            />
          </section>
        )}

        {/* 7. COMPLIANCE AUDIT DASHBOARD */}
        {currentTab === 'audit' && (
          <section id="hcm-audit-section" aria-label="Compliance Audit">
            <TraceabilityAuditDashboard
              report={auditReport}
              locale={locale}
              onRunAudit={() => {}}
            />
          </section>
        )}
      </main>

      {/* Interactive 8-Tier SAP Lineage Modal */}
      {modalServiceCode && (
        <LineageModal
          serviceCode={modalServiceCode}
          onClose={() => setModalServiceCode(null)}
          onOpenPipeline={handleNavigateToPipeline}
          locale={locale}
        />
      )}

      {/* Enterprise Platform Footer */}
      <footer id="hcm-footer" className="bg-slate-900/80 border-t border-slate-800/80 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Enterprise HCM Experience Platform • SAP-Aligned Base & Canonical HCM Core</span>
          <span className="font-mono text-slate-400">
            Chain Invariant: Service → Persona → Permission → API → Core → SAP → UI → Test
          </span>
        </div>
      </footer>
    </div>
  );
}
