# Traceability

Every service must be traceable:

Service -> Persona -> Permission -> UI -> API -> Core entity -> SAP-aligned source -> Test/Eval

Every normalized field that is mapped from SAP must be traceable:

`target_schema.target_table.target_field -> sap_table.sap_field`

Every production dashboard metric must be traceable to source entities and a deterministic calculation definition.
