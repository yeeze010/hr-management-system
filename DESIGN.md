# HR Management System Design Checklist

This project uses `design-system/MASTER.md` as the global source of truth.

## Audit Priority

1. Accessibility: contrast, visible focus, labels, keyboard order, aria labels.
2. Touch and interaction: 44px minimum targets, 8px spacing, clear disabled/loading states.
3. Performance: stable layouts, reduced layout shift, modest effects.
4. Style selection: restrained HR operations dashboard, no generic AI copy.
5. Layout and responsive: 375px viewport must not create page-level horizontal scroll.
6. Typography and color: semantic tokens, 16px readable body text, tabular numbers for metrics.
7. Animation: short state transitions and `prefers-reduced-motion` support.
8. Forms and feedback: visible labels, field-adjacent errors, submit feedback.
9. Navigation: role-aware entry points and predictable section switching.
10. Charts and data: labels and numeric values must accompany color.

## Current Product Direction

Human resources operations cockpit for role-based employee, recruitment, attendance, service, talent, report, and acceptance workflows.

## Implementation Notes

- Keep the product name as `人力资源管理系统` / `HR Management System`.
- Do not load app data before successful role login.
- Prefer existing component classes and CSS tokens before adding new patterns.
- Every new control must have visible focus, disabled semantics when unavailable, and a touch target of at least 44px.
