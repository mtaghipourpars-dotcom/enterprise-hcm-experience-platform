// ============================================================================
// Lineage Modal Component
// Displays complete 8-tier architectural chain for any service definition
// ============================================================================

import React from 'react';
import { catalogEngine } from '../../services/catalog/engine';
import { Locale, getTranslation } from '../../locales/translations';
import {
  X,
  Layers,
  UserCheck,
  Shield,
  Send,
  Database,
  Server,
  Layout,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface LineageModalProps {
  serviceCode: string | null;
  onClose: () => void;
  onOpenPipeline?: (serviceCode: string) => void;
  locale: Locale;
}

export const LineageModal: React.FC<LineageModalProps> = ({
  serviceCode,
  onClose,
  onOpenPipeline,
  locale,
}) => {
  if (!serviceCode) return null;

  const chain = catalogEngine.getTraceabilityChain(serviceCode);
  const service = catalogEngine.getService(serviceCode);

  if (!chain || !service) return null;

  const t = (key: string, fallback?: string) => getTranslation(locale, key, fallback);

  const tiers = [
    {
      num: 1,
      title: 'Tier 1: Service Definition',
      icon: Layers,
      color: 'text-blue-400 bg-blue-950/60 border-blue-800',
      items: [
        { label: 'Code', value: chain.service.code },
        { label: 'Domain / Subdomain', value: `${chain.service.domain} / ${chain.service.subdomain}` },
        { label: 'Type & Mode', value: `${chain.service.type} (${chain.service.readWriteMode})` },
      ],
    },
    {
      num: 2,
      title: 'Tier 2: Persona & Scope',
      icon: UserCheck,
      color: 'text-indigo-400 bg-indigo-950/60 border-indigo-800',
      items: [
        { label: 'Primary Persona', value: chain.persona.primary },
        { label: 'Allowed Personas', value: chain.persona.allowed.join(', ') },
        { label: 'Data Scope', value: chain.persona.scope },
      ],
    },
    {
      num: 3,
      title: 'Tier 3: Permission & Security',
      icon: Shield,
      color: 'text-amber-400 bg-amber-950/60 border-amber-800',
      items: [
        { label: 'Permission Code', value: chain.permission.code },
        { label: 'Action & Sensitivity', value: `${chain.permission.action} (${chain.permission.sensitivity})` },
        { label: 'Description', value: chain.permission.description },
      ],
    },
    {
      num: 4,
      title: 'Tier 4: API Route Contract',
      icon: Send,
      color: 'text-purple-400 bg-purple-950/60 border-purple-800',
      items: [
        { label: 'Endpoint', value: `${chain.api.method} ${chain.api.endpoint}` },
        { label: 'Response DTO', value: chain.api.responseContract },
        { label: 'Path Params', value: chain.api.pathParams.join(', ') || 'None' },
      ],
    },
    {
      num: 5,
      title: 'Tier 5: Canonical HCM Core Entity',
      icon: Database,
      color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800',
      items: [
        { label: 'Schema.Table', value: `${chain.coreEntity.schema}.${chain.coreEntity.tableName}` },
        { label: 'Primary Key', value: chain.coreEntity.primaryKey },
        { label: 'Temporal Model', value: chain.coreEntity.temporalModel },
      ],
    },
    {
      num: 6,
      title: 'Tier 6: SAP Source Landing Layer',
      icon: Server,
      color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
      items: [
        { label: 'SAP Table / Infotype', value: `${chain.sapSource.table}${chain.sapSource.infotypeNumber ? ` (${chain.sapSource.infotypeNumber})` : ''}` },
        { label: 'Source Field', value: chain.sapSource.field },
        { label: 'Verification Status', value: chain.sapSource.verificationStatus },
      ],
    },
    {
      num: 7,
      title: 'Tier 7: UI Experience Component',
      icon: Layout,
      color: 'text-pink-400 bg-pink-950/60 border-pink-800',
      items: [
        { label: 'Component Name', value: chain.uiComponent.componentName },
        { label: 'View Type', value: chain.uiComponent.viewType },
        { label: 'Module Path', value: chain.uiComponent.modulePath },
      ],
    },
    {
      num: 8,
      title: 'Tier 8: Automated Verification Test',
      icon: CheckCircle2,
      color: 'text-teal-400 bg-teal-950/60 border-teal-800',
      items: [
        { label: 'Test ID', value: chain.testCase.testId },
        { label: 'Test Suite', value: chain.testCase.testSuite },
        { label: 'Assertion Type', value: chain.testCase.assertionType },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {locale === 'fa' ? service.nameKeyFa : service.nameKeyEn}
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-semibold">
                  {chain.serviceCode}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                8-Tier Traceability Architecture & SAP Ground Truth Binding
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onOpenPipeline && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPipeline(serviceCode);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
              >
                <span>Inspect in Pipeline</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body - 8-Tier Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <div
                  key={tier.num}
                  className="rounded-lg border border-slate-800 bg-slate-800/40 p-4 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`p-1.5 rounded-md border ${tier.color}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      {tier.title}
                    </h4>
                  </div>
                  <dl className="space-y-2 text-xs">
                    {tier.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start gap-2 border-b border-slate-800/60 pb-1.5 last:border-0 last:pb-0">
                        <dt className="text-slate-400 font-medium">{item.label}:</dt>
                        <dd className="font-mono text-slate-200 text-right truncate max-w-[65%]">
                          {item.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-850 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Invariant Verified: Service → Persona → Permission → API → Core → SAP → UI → Test</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            {t('action.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
