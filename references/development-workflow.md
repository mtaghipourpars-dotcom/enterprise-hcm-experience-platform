# Development Workflow

1. Inspect repository and current state.
2. Identify impacted domain(s).
3. Read corresponding domain + SAP mapping + service catalog + traceability references.
4. Plan changes.
5. Update data model/mapping first.
6. Update API contract.
7. Update authorization.
8. Update UI/service registration.
9. Add/update tests and evals.
10. Run validation scripts.
11. Fix failures.
12. Document.
13. Proceed to next work item only after gates pass.

For multi-step or destructive operations use Plan -> Validate -> Execute.
