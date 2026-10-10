# Admin V2 UI Foundation

This directory is the target modular boundary for the Admin V2 interface.

## UX principles
- Preserve rkInfinity dark/futuristic brand language.
- Keep content dense but readable.
- Use responsive layouts rather than shrinking desktop UI.
- Shared states: loading, empty, error, success, confirmation.
- Keyboard-friendly navigation and visible focus states.
- Destructive actions require confirmation.
- Never expose secrets in UI.

## Modules
- dashboard
- cms
- ai
- crm
- analytics
- users
- security
- audit
- system
- settings

Implementation should migrate existing screens incrementally; do not replace working routes wholesale.
