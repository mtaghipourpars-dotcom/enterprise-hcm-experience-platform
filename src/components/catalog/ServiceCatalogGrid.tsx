// ============================================================================
// Service Catalog Grid Component
// Displays searchable, filterable catalog cards with RBAC and Lineage Badges
// ============================================================================

import React, { useState } from 'react';
import { Locale, getTranslation } from '../../locales/translations';
import {
  Domain,
  Persona,
  ServiceDefinition,
  ServiceFilterCriteria,
  ServiceType,
  VerificationStatus,
} from '../../types/service-catalog';
import {
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  GitCommit,
  Lock,
  ArrowUpRight,
  Database,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';

interface ServiceCatalogGridProps {
  services: ServiceDefinition[];
  activePersona: Persona;
  locale: Locale;
  onInspectService: (serviceCode: string) => void;
}

export const ServiceCatalogGrid: React.FC<ServiceCatalogGridProps> = ({
  services,
  activePersona,
  locale,
  onInspectService,
}) => {
  const t = (key: string, fallback?: string) => getTranslation(locale, key, fallback);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<Domain | 'ALL'>('ALL');
  const [selectedPersona, setSelectedPersona] = useState<Persona | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<ServiceType | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<VerificationStatus | 'ALL'>('ALL');

  const domains: Domain[] = ['PA', 'OM', 'PT', 'PY', 'TRAINING', 'TALENT', 'WORKFLOW', 'ANALYTICS'];
  const personas: Persona[] = ['EMPLOYEE', 'MANAGER', 'EXECUTIVE', 'HR_ADMIN', 'SYSTEM_ADMIN'];
  const serviceTypes: ServiceType[] = [
    'PROFILE',
    'SEARCH',
    'WORKFLOW',
    'REPORT',
    'ANALYTICS',
    'APPROVAL',
  ];

  const filteredServices = services.filter((svc) => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchesCode = svc.code.toLowerCase().includes(q);
      const matchesNameEn = svc.nameKeyEn.toLowerCase().includes(q);
      const matchesNameFa = svc.nameKeyFa.toLowerCase().includes(q);
      const matchesDesc = svc.descriptionKeyEn.toLowerCase().includes(q);
      const matchesApi = svc.api.toLowerCase().includes(q);
      const matchesEntity = svc.coreEntities.some((e) => e.toLowerCase().includes(q));
      const matchesSap = svc.sapSources.some((s) => s.toLowerCase().includes(q));

      if (
        !matchesCode &&
        !matchesNameEn &&
        !matchesNameFa &&
        !matchesDesc &&
        !matchesApi &&
        !matchesEntity &&
        !matchesSap
      ) {
        return false;
      }
    }

    if (selectedDomain !== 'ALL' && svc.domain !== selectedDomain) return false;
    if (selectedPersona !== 'ALL' && !svc.personas.includes(selectedPersona)) return false;
    if (selectedType !== 'ALL' && svc.type !== selectedType) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('action.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Domain Filter */}
            <select
              aria-label="Filter by functional domain"
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

            {/* Persona Filter */}
            <select
              aria-label="Filter by persona role"
              value={selectedPersona}
              onChange={(e) => setSelectedPersona(e.target.value as Persona | 'ALL')}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">{t('action.allPersonas')}</option>
              {personas.map((p) => (
                <option key={p} value={p}>
                  {t(`persona.${p}`)}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              aria-label="Filter by service type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as ServiceType | 'ALL')}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Interaction Types</option>
              {serviceTypes.map((st) => (
                <option key={st} value={st}>
                  {t(`type.${st}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Stats Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
          <span>
            Showing <strong className="text-white">{filteredServices.length}</strong> of{' '}
            <strong className="text-white">{services.length}</strong> services
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Simulated Persona: <strong className="text-blue-400">{t(`persona.${activePersona}`)}</strong>
          </span>
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <p className="text-slate-400 text-sm">{t('empty.noResults')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((svc) => {
            const hasAccess = svc.personas.includes(activePersona);
            const isVerificationRequired = svc.sapSources.some(
              (s) =>
                s.includes('PCL2') ||
                s.includes('TALENT') ||
                s.includes('TEM') ||
                s.includes('PAD25')
            );

            return (
              <div
                key={svc.code}
                className={`bg-slate-900 border rounded-xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm ${
                  hasAccess
                    ? 'border-slate-800 hover:border-slate-700 hover:shadow-md'
                    : 'border-slate-800/60 opacity-75 bg-slate-900/60'
                }`}
              >
                {/* Header: Domain, Code, Status & Persona Lock */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                        {svc.domain}
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-400">
                        {svc.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isVerificationRequired ? (
                        <span
                          title="Target DDIC Verification Required"
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-950/80 text-amber-300 border border-amber-800 flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          VERIF
                        </span>
                      ) : (
                        <span
                          title="Standard SAP Anchor Verified"
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          ANCHOR
                        </span>
                      )}

                      {!hasAccess && (
                        <span
                          title="Current Persona Not Authorized"
                          className="p-1 rounded bg-rose-950/80 text-rose-300 border border-rose-800"
                        >
                          <Lock className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-white mb-1 leading-snug">
                    {locale === 'fa' ? svc.nameKeyFa : svc.nameKeyEn}
                  </h3>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                    {locale === 'fa' ? svc.descriptionKeyFa : svc.descriptionKeyEn}
                  </p>

                  {/* Metadata Chips */}
                  <div className="space-y-2 mb-4 text-xs">
                    <div className="flex items-center justify-between text-slate-400 bg-slate-800/40 px-2.5 py-1.5 rounded border border-slate-800">
                      <span className="text-[11px]">API Contract:</span>
                      <span className="font-mono text-cyan-400 text-[11px] truncate max-w-[170px]">
                        {svc.api}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 bg-slate-800/40 px-2.5 py-1.5 rounded border border-slate-800">
                      <span className="text-[11px]">Core Entity:</span>
                      <span className="font-mono text-purple-400 text-[11px] truncate max-w-[170px]">
                        {svc.coreEntities[0]}
                      </span>
                    </div>
                  </div>

                  {/* Personas Badge List */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {svc.personas.map((p) => (
                      <span
                        key={p}
                        className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          p === activePersona
                            ? 'bg-blue-900 text-blue-200 font-bold border border-blue-600'
                            : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                        }`}
                      >
                        {t(`persona.${p}`)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">
                    UI: {svc.component}
                  </span>
                  <button
                    onClick={() => onInspectService(svc.code)}
                    className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white border border-slate-700 hover:border-blue-500 transition-colors"
                  >
                    <GitCommit className="w-3.5 h-3.5 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
                    {t('action.inspect')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
