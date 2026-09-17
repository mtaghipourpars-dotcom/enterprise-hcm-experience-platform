# SAP Mapping — PY

| SAP source | Business meaning | Experience entity |
|---|---|---|
| PA0008 | Basic pay master data | hcm_core.pay_basic |
| PA0014 | Recurring pay/deductions | hcm_core.pay_recurring |
| PA0015 | Additional pay | hcm_core.pay_additional |
| PA0045 | Loans | hcm_core.employee_loan |
| Payroll result source/cluster | Actual payroll result | hcm_core.payroll_result / payroll_wage_type |

**Important:** Payroll result storage is implementation- and release-dependent. Do not invent a transparent result table. Build an extraction adapter against the actual payroll result storage/API, then persist a normalized result plus exact lineage.
