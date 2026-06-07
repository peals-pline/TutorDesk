# Contributing to TutorDesk

Thanks for your interest in TutorDesk.

TutorDesk is a local-first tutor workspace. Contributions should preserve the core promise: student data should not be sent to third-party servers in the MVP.

## Good First Areas

- UI polish and empty states
- Accessibility improvements
- Report generation improvements
- Local-first storage and backup flows
- Tests for validators, reports, and data helpers
- Documentation and screenshots

## Development

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
```

## Pull Requests

Before opening a pull request:

- Keep changes focused.
- Add tests for model, validation, or report changes.
- Do not add backend dependencies for MVP features.
- Do not collect or transmit student data.
- Update the README or CHANGELOG when user-facing behavior changes.

## Product Principles

- Clarity over decoration.
- Local-first before cloud features.
- Teacher workflows before dashboard vanity metrics.
- Small readable components over one large app file.
