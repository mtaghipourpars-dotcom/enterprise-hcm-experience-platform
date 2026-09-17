# API Contract

Backend API is the only business-data interface for frontend.

Minimum modules:
- /api/employee
- /api/organization
- /api/time
- /api/payroll
- /api/training
- /api/talent
- /api/services
- /api/workflow
- /api/security
- /api/integration

Each endpoint must document:
- auth requirement
- permission
- query/path/body
- response schema
- validation
- error schema
- pagination/filtering
- source lineage when relevant
