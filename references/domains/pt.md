# PT — Time Management

## Scope

Work schedules, shifts, attendance, absences, leave quotas, overtime, mission, time requests, time evaluation exceptions and monthly work reports.

## Services

- My Work Schedule
- My Calendar
- Time Request Center
- Leave Request
- Mission Request
- Overtime Request
- Attendance Correction
- Missing Card
- Request Archive
- Monthly Attendance
- Quota Balance
- Attendance Exceptions

## Base SAP alignment

Classic sources to account for include:
- PA2001 — Absences
- PA2002 — Attendances
- PA2005 — Time Events/Time Recording Info as applicable
- PA2006 — Absence/Attendance Quotas
- PA2007 — Attendance/Quota-related controls where applicable
- PA0007 — Planned Working Time

Clock-event sources can include TEVEN or an integrated time-event provider depending on the implemented architecture. Preserve the real source identity and do not claim a single source unless verified in the target system.

## Critical rule

Time data is effective-dated and often processed by time evaluation. Keep raw source records separate from calculated monthly summaries.
