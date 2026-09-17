# Solution Architecture

## Logical layers

1. Source systems: SAP S/4HANA HCM and future connected providers.
2. Integration layer: extraction, transformation, validation, synchronization, retry and observability.
3. `sap_raw`: SAP-aligned base/landing layer. Preserve source table/object identity and source keys.
4. `hcm_core`: normalized business entities and cross-domain relationships.
5. Service/API layer: business services, workflows, authorization, aggregation.
6. Experience layer: Employee, Manager, Executive views.
7. Analytics layer: aggregated, authorized management metrics.

## Key decision

Do NOT make the normalized business schema the only storage model. Keep an explicit SAP-aligned base so future SAP integration maps into stable tables first and services second.

## Example

`PA0002-NACHN -> sap_raw.pa0002.nachn -> hcm_core.person.last_name -> EmployeeProfileService -> UI`

For source areas that are not a single transparent table (for example payroll result clusters or release-specific Training/Talent stores), use a source-object extract contract rather than inventing a table.
