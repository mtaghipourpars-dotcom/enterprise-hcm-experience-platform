# SAP Integration

## Adapter model

`HcmDataProvider` interface with implementations such as:
- DatabaseProvider (current operational database)
- SapODataProvider
- SapRfcProvider
- SapBapiProvider
- SapCpiProvider

## Sync lifecycle

DISCOVER -> EXTRACT -> VALIDATE -> TRANSFORM -> UPSERT -> RECONCILE -> REPORT

## Full vs delta

Every source mapping must declare:
- extraction_mode: full|delta|snapshot
- key strategy
- change detection
- deletion/inactivation semantics
- effective dating behavior

## Never overwrite source identity

The SAP-aligned row must remain traceable to the exact source key and sync run.
