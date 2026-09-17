# SAP Mapping — OM

| SAP source family | Business meaning | Experience entity |
|---|---|---|
| HRP1000 | Object basic data | hcm_core.om_object |
| HRP1001 | Relationships | hcm_core.om_relationship |
| Related HRP* infotypes | Object-specific attributes | relevant hcm_core OM entity |

Keep SAP OM object identity fields (`OTYPE`, `OBJID`) and relationship keys (`RSIGN`, `RELAT`, `SOBID`) in the SAP-aligned layer where present. Add additional HRP sources only after target-system DDIC verification.
