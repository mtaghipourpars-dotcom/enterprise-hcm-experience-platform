// ============================================================================
// Traceability Matrix Table Component
// Full Tabular End-to-End Lineage View with CSV Export
// ============================================================================

import React, { useState } from 'react';
import { Locale, getTranslation } from '../../locales/translations';
import {
  Domain,
  TraceabilityChain,
  VerificationStatus,
} from '../../types/service-catalog';
import {
  Table,
  Search,
  Download,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface TraceabilityMatrixTableProps {
  chains: TraceabilityChain[];
  locale: Locale;
  onInspectService: (serviceCode: string) => void;
  onExportCsv: () => void;
}

export const TraceabilityMatrixTable: React.FC<TraceabilityMatrixTableProps> = ({
  chains,
  locale,
  onInspectService,
  onExportCsv,
}) => {
  const t = (key: string, fallback?: string) => getTranslation(locale, key, fallback);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<Domain | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<VerificationStatus | 'ALL'>('ALL');

  const domains: Domain[] = ['PA', 'OM', 'PT', 'PY', 'TRAINING', 'TALENT', 'WORKFLOW', 'ANALYTICS'];

  const filteredChains = chains.filter((c) => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const match =
        c.serviceCode.toLowerCase().includes(q) ||
        c.service.nameEn.toLowerCase().includes(q) ||
        c.service.nameFa.toLowerCase().includes(q) ||
        c.permission.code.toLowerCase().includes(q) ||
        c.api.endpoint.toLowerCase().includes(q) ||
        c.coreEntity.tableName.toLowerCase().includes(q) ||
        c.sapSource.table.toLowerCase().includes(q) ||
        c.sapSource.field.toLowerCase().includes(q) ||
        c.uiComponent.componentName.toLowerCase().includes(q) ||
        c.testCase.testId.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (selectedDomain !== 'ALL' && c.service.domain !== selectedDomain) return false;
    if (selectedStatus !== 'ALL' && c.sapSource.verificationStatus !== selectedStatus) return false;

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Table Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('action.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Domain Filter */}
          <select
            aria-label="Filter matrix by domain"
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value as Domain | 'ALL')}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">{t('action.allDomains')}</option>
            {domains.map((d) => (
              <option key={d} value={d}>
                {d} - {t(`domain.${d}`)}
              </option>
            ))}
          </select>

          {/* Verification Status Filter */}
          <select
            aria-label="Filter matrix by verification status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as VerificationStatus | 'ALL')}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">{t('action.allStatuses')}</option>
            <option value="VERIFIED_STANDARD_ANCHOR">Verified Standard Anchor</option>
            <option value="VERIFICATION_REQUIRED">Verification Required</option>
          </select>
        </div>

        {/* Export CSV Button */}
        <button
          onClick={onExportCsv}
          className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white shadow transition shrink-0"
        >
          <Download className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
          {t('action.exportCsv')}
        </button>
      </div>

      {/* Main Responsive Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700 font-semibold">
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-3">Domain</th>
                <th className="py-3 px-3">Persona</th>
                <th className="py-3 px-3">Permission</th>
                <th className="py-3 px-3">API Route</th>
                <th className="py-3 px-3">HCM Core Entity</th>
                <th className="py-3 px-3">SAP Source</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">UI Component</th>
                <th className="py-3 px-3">Test Case</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredChains.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500">
                    {t('empty.noResults')}
                  </td>
                </tr>
              ) : (
                filteredChains.map((c) => {
                  const isAnchor = c.sapSource.verificationStatus === 'VERIFIED_STANDARD_ANCHOR';
                  return (
                    <tr
                      key={c.serviceCode}
                      className="hover:bg-slate-800/50 transition-colors"
                    >
                      {/* 1. Service */}
                      <td className="py-3 px-4 font-mono font-bold text-blue-400 whitespace-nowrap">
                        <div>{c.serviceCode}</div>
                        <div className="text-[11px] font-sans text-slate-400 font-normal">
                          {locale === 'fa' ? c.service.nameFa : c.service.nameEn}
                        </div>
                      </td>

                      {/* 2. Domain */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 border border-slate-700 text-slate-300">
                          {c.service.domain}
                        </span>
                      </td>

                      {/* 3. Persona */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-indigo-400 font-medium">
                          {t(`persona.${c.persona.primary}`)}
                        </span>
                      </td>

                      {/* 4. Permission */}
                      <td className="py-3 px-3 font-mono text-[11px] text-emerald-400 whitespace-nowrap">
                        {c.permission.code}
                      </td>

                      {/* 5. API Route */}
                      <td className="py-3 px-3 font-mono text-[11px] text-cyan-400 whitespace-nowrap">
                        <span className="text-slate-500 font-sans mr-1">{c.api.method}</span>
                        {c.api.endpoint}
                      </td>

                      {/* 6. HCM Core Entity */}
                      <td className="py-3 px-3 font-mono text-[11px] text-purple-400 whitespace-nowrap">
                        {c.coreEntity.tableName}
                      </td>

                      {/* 7. SAP Source */}
                      <td className="py-3 px-3 font-mono text-[11px] text-amber-400 whitespace-nowrap">
                        {c.sapSource.table}.{c.sapSource.field}
                      </td>

                      {/* 8. Verification Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {isAnchor ? (
                          <span className="inline-flex items-center text-[10px] font-medium text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Anchor
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-medium text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Verif Req
                          </span>
                        )}
                      </td>

                      {/* 9. UI Component */}
                      <td className="py-3 px-3 font-mono text-[11px] text-sky-400 whitespace-nowrap">
                        {c.uiComponent.componentName}
                      </td>

                      {/* 10. Test Case */}
                      <td className="py-3 px-3 font-mono text-[11px] text-teal-400 whitespace-nowrap">
                        {c.testCase.testId}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => onInspectService(c.serviceCode)}
                          className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition"
                          title={t('action.inspect')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="bg-slate-800/60 px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Total Visible Entries: <strong className="text-white">{filteredChains.length}</strong>
          </span>
          <span className="text-slate-400">
            Chain Formula: <code className="text-blue-400">Service → Persona → Permission → API → Core → SAP → UI → Test</code>
          </span>
        </div>
      </div>
    </div>
  );
};
