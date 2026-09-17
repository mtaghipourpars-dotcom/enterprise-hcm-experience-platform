# Enterprise HCM Experience Platform

This repository is the complete Agent Skill package and implementation specification.

## Architecture principle

The application is built on a **SAP-aligned BASE layer** rather than a UI-first mock schema.

`SAP -> sap_raw -> hcm_core -> services/API -> Employee/Manager/Executive UI`

## Domains

- PA Personnel Administration
- OM Organizational Management
- PT Time Management
- PY Payroll
- Training & Event Management
- Talent & Performance Management

## Important SAP alignment rule

The `sap_raw` layer must preserve SAP source identity. The exact field inventory for the target SAP system must be generated from DDIC/API metadata before production synchronization. Release-specific or cluster-based areas must not be fabricated.

## Validation

Run:

`python scripts/validate_skill.py .`

`python scripts/validate_catalog.py assets/service-catalog/service-catalog.master.json`

Then, where `skills-ref` is installed:

`skills-ref validate .`
