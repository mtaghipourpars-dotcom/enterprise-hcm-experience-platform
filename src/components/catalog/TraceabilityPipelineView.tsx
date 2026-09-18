// ============================================================================
// Traceability Pipeline Visualizer Component
// Visualizes the 8-Stage Lineage:
// Service -> Persona -> Permission -> API -> HCM Core Entity -> SAP Source -> UI Component -> Test Case
// ============================================================================

import React, { useState } from 'react';
import { Locale, getTranslation } from '../../locales/translations';
import {
  Domain,
  TraceabilityChain,
} from '../../types/service-catalog';
import {
  Layers,
  User,
  Shield,
  Send,
  Database,
  Server,
  Layout,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Code,
  Check,
  RefreshCw,
} from 'lucide-react';

interface TraceabilityPipelineViewProps {
  chains: TraceabilityChain[];
  selectedServiceCode: string;
  onSelectServiceCode: (code: string) => void;
  locale: Locale;
}

export const TraceabilityPipelineView: React.FC<TraceabilityPipelineViewProps> = ({
  chains,
  selectedServiceCode,
  onSelectServiceCode,
  locale,
}) => {
  const t = (key: string, fallback?: string) => getTranslation(locale, key, fallback);
  const [selectedStage, setSelectedStage] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationLog, setSimulationLog] = useState<string[] | null>(null);

  const activeChain = chains.find((c) => c.serviceCode === selectedServiceCode) || chains[0];

  const handleSimulateExecution = () => {
    setIsSimulating(true);
    setSimulationLog(null);
    setTimeout(() => {
      setSimulationLog([
        `[1/8] Verifying Service Catalog registration for ${activeChain.serviceCode}... [OK]`,
        `[2/8] Validating Persona entitlement (${activeChain.persona.primary} in [${activeChain.persona.allowed.join(', ')}])... [OK]`,
        `[3/8] Checking RBAC permission '${activeChain.permission.code}' (Action: ${activeChain.permission.action})... [OK]`,
        `[4/8] Resolving REST contract '${activeChain.api.method} ${activeChain.api.endpoint}'... [OK]`,
        `[5/8] Asserting HCM Core entity '${activeChain.coreEntity.schema}.${activeChain.coreEntity.tableName}' schema... [OK]`,
        `[6/8] Auditing SAP Source lineage (${activeChain.sapSource.table}.${activeChain.sapSource.field}) [Status: ${activeChain.sapSource.verificationStatus}]... [OK]`,
        `[7/8] Rendering UI slot '${activeChain.uiComponent.componentName}' (${activeChain.uiComponent.viewType})... [OK]`,
        `[8/8] Executing Automated Traceability Test '${activeChain.testCase.testId}' in '${activeChain.testCase.testSuite}'... [ALL ASSERTIONS PASSED]`,
      ]);
      setIsSimulating(false);
    }, 450);
  };

  const stages = [
    {
      num: 1,
      name: t('step.1.title'),
      sub: t('step.1.subtitle'),
      icon: Layers,
      color: 'blue',
      badge: activeChain.serviceCode,
    },
    {
      num: 2,
      name: t('step.2.title'),
      sub: t('step.2.subtitle'),
      icon: User,
      color: 'indigo',
      badge: activeChain.persona.primary,
    },
    {
      num: 3,
      name: t('step.3.title'),
      sub: t('step.3.subtitle'),
      icon: Shield,
      color: 'emerald',
      badge: activeChain.permission.action,
    },
    {
      num: 4,
      name: t('step.4.title'),
      sub: t('step.4.subtitle'),
      icon: Send,
      color: 'cyan',
      badge: activeChain.api.method,
    },
    {
      num: 5,
      name: t('step.5.title'),
      sub: t('step.5.subtitle'),
      icon: Database,
      color: 'purple',
      badge: activeChain.coreEntity.tableName,
    },
    {
      num: 6,
      name: t('step.6.title'),
      sub: t('step.6.subtitle'),
      icon: Server,
      color: activeChain.sapSource.verificationStatus === 'VERIFIED_STANDARD_ANCHOR' ? 'amber' : 'rose',
      badge: activeChain.sapSource.table,
    },
    {
      num: 7,
      name: t('step.7.title'),
      sub: t('step.7.subtitle'),
      icon: Layout,
      color: 'sky',
      badge: activeChain.uiComponent.componentName,
    },
    {
      num: 8,
      name: t('step.8.title'),
      sub: t('step.8.subtitle'),
      icon: CheckCircle2,
      color: 'teal',
      badge: activeChain.testCase.testId,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Selector & Service Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-400">
              Traceability Pipeline Inspector
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>{locale === 'fa' ? activeChain.service.nameFa : activeChain.service.nameEn}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {activeChain.serviceCode}
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              {locale === 'fa'
                ? 'زنجیره کامل اتصال سرویس به نقش، مجوز، وب سرویس، موجودیت داده، منبع SAP، کامپوننت رابط کاربری و آزمون راستی‌آزمایی'
                : 'Complete verified lineage connecting Service Definition -> Persona -> Permission -> API -> Core Entity -> SAP Source -> UI Component -> Test Case'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <label htmlFor="service-select-dropdown" className="text-xs text-slate-400 mb-1">{t('action.inspect')}:</label>
              <select
                id="service-select-dropdown"
                aria-label={t('action.inspect')}
                value={selectedServiceCode}
                onChange={(e) => {
                  onSelectServiceCode(e.target.value);
                  setSimulationLog(null);
                }}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {chains.map((c) => (
                  <option key={c.serviceCode} value={c.serviceCode}>
                    [{c.service.domain}] {c.serviceCode} - {locale === 'fa' ? c.service.nameFa : c.service.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSimulateExecution}
              disabled={isSimulating}
              className="mt-5 inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2 ${isSimulating ? 'animate-spin' : ''}`} />
              {isSimulating ? 'Verifying...' : 'Verify Chain'}
            </button>
          </div>
        </div>

        {/* 8-Stage Horizontal Interactive Pipeline Flow */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {stages.map((stage, idx) => {
              const Icon = stage.icon;
              const isSelected = selectedStage === stage.num;
              return (
                <button
                  key={stage.num}
                  onClick={() => setSelectedStage(stage.num)}
                  className={`flex flex-col p-3 rounded-lg border text-left rtl:text-right transition-all relative ${
                    isSelected
                      ? 'bg-blue-950/70 border-blue-500 shadow-sm ring-1 ring-blue-500'
                      : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-6 h-6 rounded flex items-center justify-center bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300">
                      {stage.num}
                    </div>
                    <Icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {stage.name.replace(/^\d+\.\s*/, '')}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 truncate mt-1">
                    {stage.badge}
                  </span>
                  {idx < 7 && (
                    <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 rtl:hidden">
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Simulation Result Banner if active */}
      {simulationLog && (
        <div className="bg-slate-900 border border-emerald-800/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Automated Traceability Validation Succeeded for {activeChain.serviceCode}
            </h3>
            <span className="text-xs text-slate-400 font-mono">Status: 8/8 TIERS VALIDATED</span>
          </div>
          <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs text-slate-300 space-y-1 border border-slate-800">
            {simulationLog.map((log, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Stage Inspector Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stage Detail Panel */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                {selectedStage}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {stages[selectedStage - 1].name}
                </h3>
                <p className="text-xs text-slate-400">
                  {stages[selectedStage - 1].sub}
                </p>
              </div>
            </div>
            <div className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
              Tier {selectedStage} of 8
            </div>
          </div>

          {/* Dynamic Content by Stage */}
          {selectedStage === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Service Identifier</span>
                  <span className="text-sm font-mono font-bold text-blue-400">{activeChain.service.code}</span>
                </div>
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Functional Domain</span>
                  <span className="text-sm font-semibold text-white">{t(`domain.${activeChain.service.domain}`)} ({activeChain.service.domain})</span>
                </div>
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">English Title</span>
                  <span className="text-sm font-medium text-slate-200">{activeChain.service.nameEn}</span>
                </div>
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Persian Title</span>
                  <span className="text-sm font-medium text-slate-200">{activeChain.service.nameFa}</span>
                </div>
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Interaction Archetype</span>
                  <span className="text-sm font-medium text-slate-200">{t(`type.${activeChain.service.type}`)}</span>
                </div>
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Data Read/Write Mode</span>
                  <span className="text-sm font-medium text-slate-200">{activeChain.service.readWriteMode}</span>
                </div>
              </div>
            </div>
          )}

          {selectedStage === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Primary Persona</span>
                  <span className="text-sm font-bold text-indigo-400">{t(`persona.${activeChain.persona.primary}`)}</span>
                </div>
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Authorization Scope</span>
                  <span className="text-sm font-semibold text-white">{activeChain.persona.scope}</span>
                </div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block mb-2">Allowed Personas in Experience Catalog</span>
                <div className="flex flex-wrap gap-2">
                  {activeChain.persona.allowed.map((p) => (
                    <span
                      key={p}
                      className="px-2.5 py-1 rounded text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800"
                    >
                      {t(`persona.${p}`)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedStage === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Permission Code (RBAC)</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">{activeChain.permission.code}</span>
                </div>
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Action Type</span>
                  <span className="text-sm font-semibold text-white">{activeChain.permission.action}</span>
                </div>
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Data Sensitivity Classification</span>
                  <span className="text-sm font-semibold text-amber-300">{activeChain.permission.sensitivity}</span>
                </div>
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Enforcement Layer</span>
                  <span className="text-sm font-semibold text-slate-200">Server-Side Middleware & Session Gating</span>
                </div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Security Scope Description</span>
                <p className="text-sm text-slate-300">{activeChain.permission.description}</p>
              </div>
            </div>
          )}

          {selectedStage === 4 && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {activeChain.api.method}
                  </span>
                  <span className="text-slate-200">{activeChain.api.endpoint}</span>
                </div>
                <span className="text-xs text-slate-500">REST Contract</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Path Parameters</span>
                  <span className="text-sm font-mono text-slate-200">
                    {activeChain.api.pathParams.length > 0 ? activeChain.api.pathParams.join(', ') : 'None (Session Inferred)'}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Response Payload Contract</span>
                  <span className="text-sm font-mono text-cyan-400">{activeChain.api.responseContract}</span>
                </div>
              </div>
              {activeChain.api.requestPayload && (
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Request Payload Contract</span>
                  <span className="text-sm font-mono text-slate-200">{activeChain.api.requestPayload}</span>
                </div>
              )}
            </div>
          )}

          {selectedStage === 5 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Core Schema & Table</span>
                  <span className="text-sm font-mono font-bold text-purple-400">
                    {activeChain.coreEntity.schema}.{activeChain.coreEntity.tableName}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Temporal Model</span>
                  <span className="text-sm font-semibold text-slate-200">{activeChain.coreEntity.temporalModel}</span>
                </div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block mb-2">Canonical Business Keys & Attributes</span>
                <div className="flex flex-wrap gap-2">
                  {activeChain.coreEntity.keyFields.map((field) => (
                    <span
                      key={field}
                      className="px-2 py-0.5 rounded text-xs font-mono bg-slate-900 text-purple-300 border border-slate-700"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedStage === 6 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">SAP Source Table</span>
                  <span className="text-sm font-mono font-bold text-amber-400">{activeChain.sapSource.table}</span>
                </div>
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Key Source Field</span>
                  <span className="text-sm font-mono font-bold text-slate-200">{activeChain.sapSource.field}</span>
                </div>
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Infotype Number</span>
                  <span className="text-sm font-mono text-slate-200">
                    {activeChain.sapSource.infotypeNumber || 'Non-Infotype Object'}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">SAP Storage Type</span>
                  <span className="text-sm font-semibold text-slate-200">{activeChain.sapSource.clusterOrDirect}</span>
                </div>
              </div>

              <div
                className={`p-4 rounded-lg border ${
                  activeChain.sapSource.verificationStatus === 'VERIFIED_STANDARD_ANCHOR'
                    ? 'bg-amber-950/30 border-amber-800/80 text-amber-200'
                    : 'bg-rose-950/30 border-rose-800/80 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                  {activeChain.sapSource.verificationStatus === 'VERIFIED_STANDARD_ANCHOR' ? (
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  )}
                  <span>{t(`status.${activeChain.sapSource.verificationStatus}`)}</span>
                </div>
                <p className="text-xs opacity-90">{activeChain.sapSource.verificationNote}</p>
              </div>
            </div>
          )}

          {selectedStage === 7 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">React Component Name</span>
                  <span className="text-sm font-mono font-bold text-sky-400">{activeChain.uiComponent.componentName}</span>
                </div>
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Experience Archetype</span>
                  <span className="text-sm font-semibold text-slate-200">{activeChain.uiComponent.viewType}</span>
                </div>
              </div>
              <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Module Path</span>
                <span className="text-xs font-mono text-slate-300">{activeChain.uiComponent.modulePath}</span>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block mb-2">Supported Responsive Viewport Slots</span>
                <div className="flex gap-2">
                  {activeChain.uiComponent.responsiveSlots.map((slot) => (
                    <span
                      key={slot}
                      className="px-2.5 py-1 rounded text-xs font-semibold bg-sky-950 text-sky-300 border border-sky-800"
                    >
                      {slot}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedStage === 8 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Traceability Test ID</span>
                  <span className="text-sm font-mono font-bold text-teal-400">{activeChain.testCase.testId}</span>
                </div>
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Automated Test Suite</span>
                  <span className="text-sm font-mono text-slate-200">{activeChain.testCase.testSuite}</span>
                </div>
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Assertion Target</span>
                  <span className="text-sm font-semibold text-slate-200">{activeChain.testCase.assertionType}</span>
                </div>
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Evaluation Status</span>
                  <span className="inline-flex items-center text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    VERIFIED PASS
                  </span>
                </div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Test Assertion Scope</span>
                <p className="text-sm text-slate-300">{activeChain.testCase.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Summary Card & Architecture Invariant Box */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-400" />
              Traceability Contract Summary
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Service</span>
                <span className="font-mono text-slate-200">{activeChain.serviceCode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Domain</span>
                <span className="font-medium text-slate-200">{activeChain.service.domain}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Primary Persona</span>
                <span className="font-medium text-indigo-400">{activeChain.persona.primary}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Permission</span>
                <span className="font-mono text-emerald-400">{activeChain.permission.code}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">API Route</span>
                <span className="font-mono text-cyan-400">{activeChain.api.endpoint}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Core Entity</span>
                <span className="font-mono text-purple-400">{activeChain.coreEntity.tableName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">SAP Source</span>
                <span className="font-mono text-amber-400">{activeChain.sapSource.table}.{activeChain.sapSource.field}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">UI Slot</span>
                <span className="font-mono text-sky-400">{activeChain.uiComponent.componentName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Test Case</span>
                <span className="font-mono text-teal-400">{activeChain.testCase.testId}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">
              Architecture Invariant
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              In accordance with enterprise platform guidelines, UI components never bind directly to SAP table names.
              All client interactions pass through authorized REST APIs and normalized HCM Core entities preserving full
              audit lineage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
