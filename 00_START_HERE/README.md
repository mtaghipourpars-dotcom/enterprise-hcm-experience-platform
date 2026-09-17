# Enterprise HCM Experience Platform — Agent Skill Package

This is a complete specification package for a database-first, SAP-aligned HCM Experience Platform.

## What the machine receives

The package contains:
- a standards-compliant `SKILL.md`;
- domain references for PA, OM, PT, PY, Training & Event Management, and Talent & Performance Management;
- SAP-aligned base-layer rules and mapping matrices;
- database dictionary and starter PostgreSQL DDL;
- Service Catalog master specification;
- Persona/security model;
- API, UI, localization, integration, validation, and evaluation specifications;
- reusable templates and validation scripts.

## Critical architecture

`SAP -> Integration -> sap_raw -> hcm_core -> API -> Experience UI`

The `sap_raw` layer is the BASE integration contract. The `hcm_core` layer is the normalized business model. The UI never depends directly on SAP table names.

## Initial agent instruction

Read `SKILL.md` first. Do not code yet. Read the minimum required references, create the implementation plan, and validate the repository structure before changing application code.
