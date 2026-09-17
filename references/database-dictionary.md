# Database Dictionary Rules

Each table must document:
- purpose
- source SAP object/table
- source keys
- target keys
- effective dating
- PII/sensitivity
- synchronization behavior
- business owner
- service consumers

## Recommended technical columns for normalized entities

`id`, `external_id`, `source_system`, `source_object`, `source_key`, `source_version`, `source_valid_from`, `source_valid_to`, `created_at`, `updated_at`, `last_sync_at`, `data_status`.

Do not add a generic JSON field as a substitute for modeled columns when the source structure is stable. JSON is permitted only for explicitly versioned source payloads whose schema cannot be safely fixed without target-system metadata.
