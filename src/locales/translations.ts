// ============================================================================
// Localization Dictionary (English & Persian)
// Enterprise HCM Experience Platform
// ============================================================================

export type Locale = 'en' | 'fa';

export interface TranslationMap {
  [key: string]: string;
}

export const translations: Record<Locale, TranslationMap> = {
  en: {
    // App header & layout
    'app.title': 'Enterprise HCM Experience Platform',
    'app.subtitle': 'Traceable Service Catalog & SAP Lineage Engine',
    'nav.experience_employee': 'Employee Experience',
    'nav.experience_manager': 'Manager Experience',
    'nav.experience_executive': 'Executive Cockpit',
    'nav.catalog': 'Service Catalog',
    'nav.pipeline': 'Traceability Pipeline',
    'nav.matrix': 'Traceability Matrix',
    'nav.audit': 'Compliance Audit',
    'nav.persona_sim': 'Active Persona',
    'language.toggle': 'فارسی',

    // Domains
    'domain.PA': 'Personnel Administration',
    'domain.OM': 'Organizational Management',
    'domain.PT': 'Time Management',
    'domain.PY': 'Payroll & Compensation',
    'domain.TRAINING': 'Training & Event Management',
    'domain.TALENT': 'Talent & Performance',
    'domain.WORKFLOW': 'Enterprise Workflow',
    'domain.ANALYTICS': 'Executive & Manager Analytics',

    // Personas
    'persona.EMPLOYEE': 'Employee',
    'persona.MANAGER': 'Manager',
    'persona.EXECUTIVE': 'Executive',
    'persona.HR_ADMIN': 'HR Administrator',
    'persona.SYSTEM_ADMIN': 'System Admin',

    // Service Types
    'type.PROFILE': 'Profile View',
    'type.SEARCH': 'Directory Search',
    'type.WORKFLOW': 'Self-Service Request',
    'type.REPORT': 'Historical Report',
    'type.ANALYTICS': 'Analytical Metric',
    'type.APPROVAL': 'Approval Inbox',
    'type.CONFIGURATION': 'System Configuration',

    // Verification Status
    'status.VERIFIED_STANDARD_ANCHOR': 'Verified SAP Standard Anchor',
    'status.VERIFICATION_REQUIRED': 'Verification Required (DDIC Missing)',

    // Pipeline Steps
    'step.1.title': '1. Service',
    'step.1.subtitle': 'Master Definition',
    'step.2.title': '2. Persona',
    'step.2.subtitle': 'Access Role',
    'step.3.title': '3. Permission',
    'step.3.subtitle': 'Authorization Scope',
    'step.4.title': '4. API Route',
    'step.4.subtitle': 'REST Endpoint Contract',
    'step.5.title': '5. HCM Core',
    'step.5.subtitle': 'Canonical Data Entity',
    'step.6.title': '6. SAP Source',
    'step.6.subtitle': 'Landing Layer Lineage',
    'step.7.title': '7. UI Component',
    'step.7.subtitle': 'Experience View Slot',
    'step.8.title': '8. Test Case',
    'step.8.subtitle': 'Traceability Verification',

    // Audit Dashboard
    'audit.title': 'Traceability & Architecture Audit',
    'audit.subtitle': 'Automated validation of end-to-end service lineage across all 8 architectural tiers',
    'audit.totalServices': 'Total Services',
    'audit.traceabilityRate': 'Traceability Rate',
    'audit.verifiedAnchors': 'Standard Anchors',
    'audit.verificationRequired': 'Target DDIC Pending',
    'audit.runAudit': 'Run Full Validation Suite',
    'audit.allPass': 'All 35 Service Definitions & Traceability Chains Passed Verification',

    // Actions & Common
    'action.inspect': 'Inspect Traceability',
    'action.exportCsv': 'Export Matrix (CSV)',
    'action.filter': 'Filter Services',
    'action.searchPlaceholder': 'Search service, API, entity or SAP source...',
    'action.allDomains': 'All Domains',
    'action.allPersonas': 'All Personas',
    'action.allStatuses': 'All Verification Statuses',
    'action.close': 'Close',
    'action.details': 'Technical Specifications',
    'empty.noResults': 'No services matching current filter criteria.',
  },
  fa: {
    // App header & layout
    'app.title': 'سامانه جامع تجربیات سرمایه انسانی سازمان (HCM)',
    'app.subtitle': 'موتور کاتالوگ خدمات و ردیابی زنجیره منشأ SAP',
    'nav.experience_employee': 'تجربه کارمند (ESS)',
    'nav.experience_manager': 'تجربه مدیر واحد (MSS)',
    'nav.experience_executive': 'داشبورد مدیریتی ارشد',
    'nav.catalog': 'کاتالوگ خدمات',
    'nav.pipeline': 'خط لوله ردیابی',
    'nav.matrix': 'ماتریس ردیابی',
    'nav.audit': 'ارزیابی انطباق معماری',
    'nav.persona_sim': 'نقش فعال',
    'language.toggle': 'English',

    // Domains
    'domain.PA': 'مدیریت پرسنلی و کارگزینی',
    'domain.OM': 'مدیریت و مهندسی سازمان',
    'domain.PT': 'مدیریت حضور و غیاب و کارکرد',
    'domain.PY': 'حقوق، دستمزد و جبران خدمات',
    'domain.TRAINING': 'آموزش و توسعه شایستگی',
    'domain.TALENT': 'مدیریت عملکرد و استعدادها',
    'domain.WORKFLOW': 'گردش کار و فرایندهای سازمانی',
    'domain.ANALYTICS': 'داشبوردهای تحلیلی مدیران و ارشد',

    // Personas
    'persona.EMPLOYEE': 'کارمند',
    'persona.MANAGER': 'مدیر واحد',
    'persona.EXECUTIVE': 'مدیر ارشد سازمان',
    'persona.HR_ADMIN': 'راهبر منابع انسانی',
    'persona.SYSTEM_ADMIN': 'راهبر سیستم',

    // Service Types
    'type.PROFILE': 'نمایش پروفایل',
    'type.SEARCH': 'جستجو در فهرست',
    'type.WORKFLOW': 'درخواست خودکاربری',
    'type.REPORT': 'گزارش تحلیلی/سوابق',
    'type.ANALYTICS': 'شاخص تحلیلی کلان',
    'type.APPROVAL': 'کارتابل تاییدات',
    'type.CONFIGURATION': 'تنظیمات سامانه',

    // Verification Status
    'status.VERIFIED_STANDARD_ANCHOR': 'تایید شده با استانداردهای پایه SAP',
    'status.VERIFICATION_REQUIRED': 'نیازمند راستی‌آزمایی در سیستم مقصد (DDIC)',

    // Pipeline Steps
    'step.1.title': '۱. سرویس',
    'step.1.subtitle': 'شناسنامه خدمت',
    'step.2.title': '۲. نقش دسترسی',
    'step.2.subtitle': 'سطح دسترسی کاربر',
    'step.3.title': '۳. مجوز امنیتی',
    'step.3.subtitle': 'کد دسترسی RBAC',
    'step.4.title': '۴. نقطه اتصال API',
    'step.4.subtitle': 'قرارداد وب سرویس REST',
    'step.5.title': '۵. موجودیت اصلی Core',
    'step.5.subtitle': 'جدول داده‌های نرمال',
    'step.6.title': '۶. منبع در SAP',
    'step.6.subtitle': 'ردیابی اینفوتایپ و جدول مبدأ',
    'step.7.title': '۷. مؤلفه رابط کاربری',
    'step.7.subtitle': 'کامپوننت نمایش فرانت‌اند',
    'step.8.title': '۸. مورد آزمون',
    'step.8.subtitle': 'راستی‌آزمایی زنجیره ردیابی',

    // Audit Dashboard
    'audit.title': 'ارزیابی جامع ردیابی و انطباق معماری',
    'audit.subtitle': 'اعتبارسنجی خودکار کل زنجیره سرویس در ۸ لایه استاندارد معماری',
    'audit.totalServices': 'مجموع سرویس‌ها',
    'audit.traceabilityRate': 'نرخ ردیابی‌پذیری',
    'audit.verifiedAnchors': 'سرویس‌های تثبیت‌شده پایه',
    'audit.verificationRequired': 'نیازمند استخراج دیکشنری SAP',
    'audit.runAudit': 'اجرای پایش کامل زنجیره داده',
    'audit.allPass': 'تمامی ۳۵ تعریف سرویس و زنجیره‌های ردیابی به طور کامل تایید شدند',

    // Actions & Common
    'action.inspect': 'بررسی زنجیره ردیابی',
    'action.exportCsv': 'خروجی ماتریس (CSV)',
    'action.filter': 'فیلتر خدمات',
    'action.searchPlaceholder': 'جستجوی سرویس، API، موجودیت یا منبع SAP...',
    'action.allDomains': 'همه دامنه‌ها',
    'action.allPersonas': 'همه نقش‌ها',
    'action.allStatuses': 'همه وضعیت‌های اعتبارسنجی',
    'action.close': 'بستن',
    'action.details': 'مشخصات فنی و قراردادها',
    'empty.noResults': 'هیچ سرویسی با شرایط جستجوی فعلی یافت نشد.',
  },
};

export function getTranslation(locale: Locale, key: string, fallback?: string): string {
  return translations[locale][key] || fallback || key;
}
