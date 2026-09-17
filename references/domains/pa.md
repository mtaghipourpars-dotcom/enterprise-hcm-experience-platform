# PA — Personnel Administration

## Scope

Employee personal, employment, family, education, address, contracts, health/HSE, military, veteran, awards, disciplinary and other key personnel profile information.

## Service families

- Personal Profile
- Family & Dependents
- Education History
- Employment History
- Address & Contact
- Employment Contract
- HSE/Medical Profile
- Medical Results
- Accidents & Diseases
- Medical Visits
- Military Service
- Veteran Status
- Awards
- Disciplinary Records

## Base SAP alignment

Primary classic PA sources to model explicitly where applicable:
- PA0000 — Actions / employment status
- PA0001 — Organizational Assignment
- PA0002 — Personal Data
- PA0006 — Addresses
- PA0021 — Family Members/Dependents
- PA0022 — Education
- PA0024 — Qualifications/other personnel profile data as applicable to the target release
- PA0041 — Date Specifications where used
- PA0007 — Planned Working Time where applicable
- PA0008 — Basic Pay
- PA0014 — Recurring Payments/Deductions
- PA0015 — Additional Payments
- PA0045 — Loans

Do not assume all source fields are required by the application. Build field-level crosswalks from the actual SAP DDIC before production synchronization.
