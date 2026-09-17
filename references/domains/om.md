# OM — Organizational Management

## Scope

Organization units, positions, jobs, relationships, reporting lines, position requirements, job descriptions, resources/equipment and Who-Is-Who.

## Core concepts

Use SAP OM object model as the integration vocabulary: object types such as organizational unit, position, job, person and relationships. Preserve `OTYPE`, `OBJID`, `RSIGN`, `RELAT`, `SOBID`, and effective dates in the SAP-aligned layer where the source object provides them.

## Services

- Who Is Who
- Organization Tree
- Position Profile
- Job Description
- Position Requirements
- Assigned Resources
- Manager/Subordinate View

## SAP base

Use HRP/OM object data and related infotypes. At minimum, the integration design must support HRP1000 and HRP1001; add object-specific infotypes only after inspecting the target system DDIC. Do not invent a fixed HRP table list for release-specific extensions.
