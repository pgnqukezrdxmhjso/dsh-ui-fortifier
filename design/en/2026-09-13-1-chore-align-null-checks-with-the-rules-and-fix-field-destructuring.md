# 2026-09-13-1-chore-align-null-checks-with-the-rules-and-fix-field-destructuring

## Direct Reason

Re-reading this round's written files to review them after the previous commit surfaced two rule violations in the `session-id-copy` component:

- `SessionIdCopyAction.tsx` destructured `props`, and `sessionId` was used at a single site. The rules forbid destructuring or separately assigning an object field unless that field is used at multiple sites or the assignment makes a line exceed 100 characters; `t` is used at three sites and may be destructured, but `sessionId` is read once to obtain the session ID and may not.
- `SessionIdCopyAction.tsx` tested the timer handle with `if (timer.current !== null)`. The rules require the `if(a)`/`if(!a)` form wherever it can be written.

The same problem existed widely in existing files: about thirty `=== null` / `!== null` / `=== undefined` comparisons across `settings-frame`, `provider-label`, and `model-picker`.

## Solution

- `session-id-copy`: destructuring `props` becomes per-field reads; the timer-handle test becomes a truthiness test.
- `provider-label`: `provider === undefined || provider.length === 0` becomes `!provider` — the field is a string or undefined, both forms have exactly the same falsy set, and the original already treated the empty string as "no provider".
- `settings-frame`: every null check in the mount, drag, and resize gesture and cleanup paths becomes the truthiness form; the condition of the four geometry-fallback ternaries changes from `saved === undefined` to `saved`.
- `model-picker`: the null checks in placement, scrolling, and selection become the truthiness form; `hasError` becomes a truthiness evaluation instead of a comparison expression.
- One comparison is kept in `model-picker`, `model.reasoning?.defaultEffort === undefined`; the reason follows.

## Approach

The rules require the `if(a)`/`if(!a)` form "wherever it can be written", and "can be written" is judged by provable equivalence, so the changes are classified by value type:

- **Provably equivalent, must be rewritten**: DOM elements, plain objects, arrays, and functions, whose falsy set is exactly `null`/`undefined`. The three requestAnimationFrame handles belong here: the specification makes the handle an integer greater than zero, so `0` never occurs.
- **Not provably equivalent, left alone**: the `string`-typed `defaultEffort`. The empty string is a valid string, so a truthiness test would diverge from "undefined only", and this plugin does not constrain that field's value domain.
- `provider-label` is the one string case that is both provably equivalent and more verbose as written: the original condition tested the empty string explicitly, which is the same set as the truthiness test.
- Ternary conditions are rewritten too: their truthiness semantics match an `if` condition, and rewriting only the `if` forms would leave one file with two styles.

## Additional Benefit

After `model-picker`'s error test changes from "not null" to truthiness, an empty error message no longer counts as an error — previously that case rendered an error bar with no content.

## Involved Files

- [src/client/session-id-copy/SessionIdCopyAction.tsx](../../src/client/session-id-copy/SessionIdCopyAction.tsx): destructuring and the timer test.
- [src/client/provider-label/ProviderLabel.tsx](../../src/client/provider-label/ProviderLabel.tsx): provider presence test.
- [src/client/settings-frame/SettingsFrameEnhancer.tsx](../../src/client/settings-frame/SettingsFrameEnhancer.tsx): gesture and geometry-fallback null checks.
- [src/client/model-picker/ModelPicker.tsx](../../src/client/model-picker/ModelPicker.tsx): placement, scrolling, selection, and error null checks.