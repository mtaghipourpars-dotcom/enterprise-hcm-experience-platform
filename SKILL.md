---
name: enterprise-hcm-experience-platform
description: Build and evolve the Enterprise HCM Experience Platform as a real-data, database-first, SAP-aligned system for Employee, Manager, and Executive experiences across PA, OM, PT, PY, Training & Event Management, and Talent & Performance Management. Use this skill when designing, implementing, reviewing, testing, integrating, or extending the platform. Load only the domain/reference files relevant to the current task; never invent enterprise data or bypass the SAP-aligned base data layer.
compatibility: Requires a filesystem-capable coding agent, Git, a TypeScript/Node toolchain, PostgreSQL, and access to project references. SAP integration is added through adapters; production SAP connectivity is not assumed.
metadata:
  project: enterprise-hcm-experience-platform
  version: "1.0.0"
  architecture: "database-first;sap-aligned-base"
  domains: "PA;OM;PT;PY;Training;Talent"
---

# Mission

Build a real-data-driven HCM Experience Platform on top of an SAP-aligned enterprise data foundation.

## Non-negotiable rules

1. **Database first.** UI never talks directly to SAP or the database.
2. **SAP-aligned base.** The `sap_raw` layer preserves SAP source object/table names, source keys, field names, and effective-dated semantics wherever the source is a table/infotype. Do not redesign the SAP-aligned layer around UI convenience.
3. **Normalized experience layer.** `hcm_core` may normalize/rename for business use, but every record must retain an explicit source mapping to the SAP-aligned base.
4. **No fake business data.** Production and demo flows read from database records. Synthetic data may exist only under a clearly isolated test profile.
5. **No hard-coded UI/business text.** Labels, service definitions, persona mappings, navigation, and configurable text are externalized.
6. **Six first-class business domains:** PA, OM, PT, PY, Training & Event Management, Talent & Performance Management.
7. **Security is server-side.** Frontend visibility is not an authorization boundary.
8. **Every feature is traceable:** Persona -> Service -> API -> Core entity -> SAP-aligned source -> test.
9. **Do not invent SAP structures.** Where the exact SAP source object is uncertain or release-specific, use the mapping registry with `verification_required=true`; do not fabricate fields.
10. **Use progressive disclosure.** Read only references required for the current task.

## Required workflow

ANALYZE -> PLAN -> READ REFERENCES -> DESIGN -> IMPLEMENT -> TEST -> VALIDATE -> FIX -> DOCUMENT -> PROCEED

Before a change touching data model, service catalog, SAP mappings, security, or workflow:
- inspect the existing artifact;
- read the relevant reference;
- create/update a plan;
- validate dependencies;
- implement;
- run validators and tests;
- only then continue.

## Domain reference loading

- PA task -> read `references/domains/pa.md` and `references/sap/pa-mapping.md`
- OM task -> read `references/domains/om.md` and `references/sap/om-mapping.md`
- PT task -> read `references/domains/pt.md` and `references/sap/pt-mapping.md`
- PY task -> read `references/domains/py.md` and `references/sap/py-mapping.md`
- Training task -> read `references/domains/training-event-management.md` and `references/sap/training-mapping.md`
- Talent/Performance task -> read `references/domains/talent-performance-management.md` and `references/sap/talent-mapping.md`
- Service Catalog task -> read `references/service-catalog.md` and `references/traceability.md`
- Database task -> read `references/database-base-architecture.md`, `references/database-dictionary.md`, and relevant domain reference
- UI/UX task -> read `references/ui-ux.md`, `references/personas.md`, and `references/localization.md`
- SAP integration task -> read `references/sap-integration.md` and all affected SAP mapping files
- Eval/quality task -> read `references/evaluation.md` and `references/gotchas.md`

## Definition of done

A feature is done only when database mapping, API, authorization, UI/service registration, localization, tests, traceability, and documentation are complete and validators pass.
