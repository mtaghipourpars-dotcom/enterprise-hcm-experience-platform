# SAP Mapping — Training & Event Management

Training/Event Management is object/relationship driven and can vary by release/product scope.

Baseline mapping contract:
- preserve SAP object type/object id
- preserve validity dates
- preserve relationship type/target object
- preserve source system/client
- map course/event/qualification/booking entities through an explicit object mapping registry

Required artifact from the target SAP system before production synchronization:
1. DDIC/object inventory
2. training event object types
3. qualification object types
4. relationship types
5. field-level extract definitions

Until that inventory exists, set `verification_required=true` in the mapping registry.
