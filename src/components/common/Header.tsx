// ============================================================================
// Header & Navigation Component
// Enterprise HCM Experience Platform
// ============================================================================

import React from 'react';
import { Locale, getTranslation } from '../../locales/translations';
import { Persona } from '../../types/service-catalog';
import {
  Layers,
  GitCommit,
  Table,
  CheckCircle2,
  Globe,
  UserCheck,
  User,
  Briefcase,
  BarChart3,
} from 'lucide-react';

export type AppTab =
  | 'experience-employee'
  | 'experience-manager'
  | 'experience-executive'
  | 'catalog'
  | 'pipeline'
  | 'matrix'
  | 'audit';

interface HeaderProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  activePersona: Persona;
  onPersonaChange: (persona: Persona) => void;
  locale: Locale;
  onLocaleToggle: () => void;
  totalServices: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  activePersona,
  onPersonaChange,
  locale,
  onLocaleToggle,
  totalServices,
}) => {
  const t = (key: string, fallback?: string) => getTranslation(locale, key, fallback);

  const personas: Persona[] = ['EMPLOYEE', 'MANAGER', 'EXECUTIVE', 'HR_ADMIN', 'SYSTEM_ADMIN'];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-inner">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  {t('app.title')}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <CheckCircle2 className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1 text-emerald-400" />
                  {totalServices} Services Traceable
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t('app.subtitle')}
              </p>
            </div>
          </div>

          {/* Right Controls: Persona Switcher & Language Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Persona Simulator */}
            <div className="flex items-center bg-slate-800/80 rounded-lg border border-slate-700 px-2 py-1">
              <UserCheck className="w-4 h-4 text-blue-400 mr-2 rtl:mr-0 rtl:ml-2" />
              <span className="text-xs text-slate-400 mr-2 rtl:mr-0 rtl:ml-2 hidden sm:inline">
                {t('nav.persona_sim')}:
              </span>
              <select
                aria-label={t('nav.persona_sim')}
                value={activePersona}
                onChange={(e) => onPersonaChange(e.target.value as Persona)}
                className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
              >
                {personas.map((p) => (
                  <option key={p} value={p} className="bg-slate-800 text-white">
                    {t(`persona.${p}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Switcher */}
            <button
              onClick={onLocaleToggle}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Toggle Language / تغییر زبان"
            >
              <Globe className="w-3.5 h-3.5 mr-1.5 rtl:mr-0 rtl:ml-1.5 text-slate-400" />
              {t('language.toggle')}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-3 rtl:space-x-reverse border-t border-slate-800 pt-2 -mb-px overflow-x-auto">
          {/* 1. Experiences Section */}
          <button
            onClick={() => {
              onPersonaChange('EMPLOYEE');
              onTabChange('experience-employee');
            }}
            className={`flex items-center px-3 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              currentTab === 'experience-employee'
                ? 'border-blue-500 text-blue-400 bg-blue-950/20'
                : 'border-transparent text-slate-300 hover:text-white hover:border-slate-600'
            }`}
          >
            <User className="w-4 h-4 mr-1.5 rtl:mr-0 rtl:ml-1.5 text-blue-400" />
            {t('nav.experience_employee')}
          </button>

          <button
            onClick={() => {
              onPersonaChange('MANAGER');
              onTabChange('experience-manager');
            }}
            className={`flex items-center px-3 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              currentTab === 'experience-manager'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
                : 'border-transparent text-slate-300 hover:text-white hover:border-slate-600'
            }`}
          >
            <Briefcase className="w-4 h-4 mr-1.5 rtl:mr-0 rtl:ml-1.5 text-indigo-400" />
            {t('nav.experience_manager')}
          </button>

          <button
            onClick={() => {
              onPersonaChange('EXECUTIVE');
              onTabChange('experience-executive');
            }}
            className={`flex items-center px-3 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              currentTab === 'experience-executive'
                ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                : 'border-transparent text-slate-300 hover:text-white hover:border-slate-600'
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-1.5 rtl:mr-0 rtl:ml-1.5 text-purple-400" />
            {t('nav.experience_executive')}
          </button>

          <div className="h-6 w-px bg-slate-800 self-center mx-1 hidden md:block" />

          {/* 2. Architecture & Service Catalog Section */}
          <button
            onClick={() => onTabChange('catalog')}
            className={`flex items-center px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              currentTab === 'catalog'
                ? 'border-slate-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
          >
            <Layers className="w-3.5 h-3.5 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
            {t('nav.catalog')}
          </button>

          <button
            onClick={() => onTabChange('pipeline')}
            className={`flex items-center px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              currentTab === 'pipeline'
                ? 'border-slate-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
            {t('nav.pipeline')}
          </button>

          <button
            onClick={() => onTabChange('matrix')}
            className={`flex items-center px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              currentTab === 'matrix'
                ? 'border-slate-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
          >
            <Table className="w-3.5 h-3.5 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
            {t('nav.matrix')}
          </button>

          <button
            onClick={() => onTabChange('audit')}
            className={`flex items-center px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              currentTab === 'audit'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 rtl:mr-0 rtl:ml-1.5 text-emerald-400" />
            {t('nav.audit')}
          </button>
        </nav>
      </div>
    </header>
  );
};
