---
name: figma-ui-roundtrip
description: Use when generating editable Figma UI concepts, implementing selected Figma frames into the app, polishing UI against Figma, or logging Figma-based design decisions.
---

# Figma UI Roundtrip

Use this skill to keep Figma concept work, manual user refinement, production implementation, and design logging in one repeatable loop for this repo.

## Workflow

1. For concept generation, create editable Figma frames/components where available.
2. For implementation, require the exact selected Figma frame link.
3. Use Figma MCP/skills for structured design context.
4. Use screenshot context as visual backup.
5. Inspect existing app architecture before coding.
6. Reuse existing components and styling patterns.
7. Preserve working behavior.
8. Avoid new dependencies unless approved.
9. Implement as real app UI.
10. Run relevant checks.
11. Update docs/design/design-log.md.

## Boundaries

- Do not embed Figma, tldraw, or mockup canvases in production.
- Do not implement from a vague screenshot if a Figma frame link is available.
- Do not rewrite unrelated logic.
- Do not create a parallel design system unless requested.
- Do not over-optimize or over-abstract early UI.

## Repo fit

- Read `AGENTS.md`, `design.md`, and `.cursor/rules/design-studio-ui.mdc` before implementation.
- Prefer existing `client/src/App.css` tokens/classes and current React state/data patterns.
- For visual implementation, keep changes focused and update `docs/design/design-log.md` after checks.
