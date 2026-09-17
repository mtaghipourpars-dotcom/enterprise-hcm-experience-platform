# PY — Payroll

## Scope

Salary statement, wage type breakdown, payroll history, tax, insurance, loans, benefits, deductions, employer costs and payroll traceability.

## Services

- My Payslip
- Wage Type Breakdown
- Payroll History
- Tax History
- Insurance History
- Loan Status
- Payroll X-Ray
- Cost Summary for authorized managers/executives

## Base SAP alignment

Master-data sources commonly include:
- PA0008 — Basic Pay
- PA0014 — Recurring Payments/Deductions
- PA0015 — Additional Payments
- PA0045 — Loans

Payroll results are not to be modeled as if a single transparent PA table were the source. Result data may reside in payroll result clusters and/or release-specific structures. The integration layer must define a verified extraction contract from the actual target system. The application base must store normalized payroll results plus exact source lineage; it must never fabricate a table name.

## Payroll X-Ray lineage

`Payroll Result -> Wage Type -> Processing/Rule Metadata -> Calculation Trace -> Net Result`

Where a calculation trace is not available directly from SAP, store only verified trace metadata produced by the integration/explanation service.
