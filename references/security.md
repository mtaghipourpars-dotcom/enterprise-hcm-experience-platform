# Security

Roles:
- EMPLOYEE
- MANAGER
- EXECUTIVE
- HR_ADMIN
- SYSTEM_ADMIN

Authorization dimensions:
- service
- action
- persona/role
- organizational scope
- employee scope
- data sensitivity

Examples:
- employee may read own payroll
- manager may see authorized team aggregates, not unrestricted individual payroll
- executive may see enterprise aggregates according to policy

Server-side authorization is mandatory.
