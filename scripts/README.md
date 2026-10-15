# Web scripts

Keep scripts grouped by their responsibility:

- `audits/` contains exhaustive data and rendered-page audits.
- `tests/` contains focused, deterministic regression tests.
- `data/` contains generated-asset download and update scripts.
- `withConfig.js` remains at the scripts root because it is the runtime wrapper for development and deployment commands.

Run scripts through the named package commands in `package.json`. Audit output is disposable and should use `artifacts/` or `/private/tmp`; successful local audits should not leave reports in the repository.
