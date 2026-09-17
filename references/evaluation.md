# Evaluation Strategy

The skill must be tested through portable eval cases.

Every eval includes:
- prompt
- expected_output
- assertions
- files when needed

Run each case with the current skill and, when practical, a baseline/previous skill version. Record pass/fail evidence. Use scripts for mechanical checks and human review for holistic UX/architecture quality.

For description triggering, maintain positive and near-miss negative queries and measure trigger rate.
