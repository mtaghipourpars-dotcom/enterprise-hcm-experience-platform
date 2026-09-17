# Database Base Architecture

Use PostgreSQL schemas:

- `sap_raw`: SAP-aligned base; integration contract and audit of source structures.
- `hcm_core`: normalized business model.
- `hcm_service`: service catalog, UI metadata, workflow definitions.
- `hcm_security`: users, roles, permissions, row/service policies.
- `hcm_integration`: mappings, sync jobs, sync runs, errors, checkpoints.
- `hcm_audit`: audit and data lineage.
- `hcm_analytics`: authorized aggregate/materialized views only.

## SAP-aligned base rules

For transparent SAP tables / infotypes, preserve source field names and data types as far as PostgreSQL allows. Add technical ingestion columns without changing source semantics:

`_source_system`, `_source_client`, `_source_table`, `_source_key`, `_extract_ts`, `_load_ts`, `_record_hash`, `_sync_run_id`, `_valid_record`.

For effective-dated HR records, retain `begda` / `endda` exactly in the base layer.

For tables whose complete field list is release-specific or cluster-based, store the extracted source payload in a controlled raw representation and maintain an explicit field mapping registry. Never guess.

## Core rule

Normalized tables must retain:
- `source_system`
- `source_object`
- `source_key`
- `source_version`
- `source_valid_from`
- `source_valid_to`
