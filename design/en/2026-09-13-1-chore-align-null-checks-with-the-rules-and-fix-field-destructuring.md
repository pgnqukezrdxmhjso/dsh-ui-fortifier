# 2026-09-13-1-chore-align-null-checks-with-the-rules-and-fix-field-destructuring

## Direct Reason

The rules require boolean checks to be written as `a`/`!a` without changing behavior. About thirty `=== null` / `!== null` / `=== undefined` comparisons across `settings-frame`, `provider-label`, and `model-picker` did not follow that form.

The rules also forbid destructuring an object field or assigning one to a separate variable (outside three exemptions), while `session-id-copy` and `open-dsh-folder` read `props` by destructuring.

## Solution

- `session-id-copy`: drops the `props` destructuring for per-field reads; the timer-handle check becomes the truthiness form.
- `open-dsh-folder`: drops the `props` destructuring and accesses the injected callback directly at its use site.
- `provider-label`: the provider check changes from "undefined or zero length" to the truthiness form.
- `settings-frame`: the null checks in mount, drag, resize, and the geometry fallbacks become the truthiness form.
- `model-picker`: the null checks in placement, scrolling, and model selection become the truthiness form.

## Approach

"Without changing behavior" is judged by equivalent observable results, classified by operand type:

- **Rewritable**: DOM elements, plain objects, and arrays, whose falsy set matches `null`/`undefined`. The four geometry-fallback ternaries and two JSX logical-ands in `settings-frame` are the same class — their operands are objects — and are rewritten too so one file keeps one style.
- **Rewritable**: `requestAnimationFrame` and `setTimeout` handles. The specification makes the handle an integer greater than zero, so `0` never occurs.
- **Rewritable**: the local-storage read check in `settings-frame`. Its operand is `string | null`, but the empty string enters the parse branch and returns the same `undefined` when parsing fails, so the observable result is unchanged.
- **Rewritable**: the provider check in `provider-label`. The original condition already included the zero-length check, so it names the same set as the truthiness form.
- **Not rewritable**: the `string | null` error and provider fields in `model-picker`. A truthiness check additionally treats the empty string as falsy, diverging from a `null`-only check, so those three sites keep their `null` checks.
- **Not rewritable**: `defaultEffort` is a string, where the empty string is a valid value, and this plugin does not constrain that field's value domain.

Destructuring and separate assignment are judged against each exemption in turn:

- The copy function `t` is used at more than two sites in all five modules, meeting the second exemption.
- The session ID is used at two sites after a function conversion, meeting the third exemption.
- The injected callback in `open-dsh-folder` is used at one site with no function conversion, so none of the three exemptions holds; its destructuring is dropped and the callback is accessed directly at its use site.

## Involved Files

- [src/client/session-id-copy/SessionIdCopyAction.tsx](../../src/client/session-id-copy/SessionIdCopyAction.tsx): drops the destructuring and moves the timer check to the truthiness form.
- [src/client/open-dsh-folder/OpenDshFolderAction.tsx](../../src/client/open-dsh-folder/OpenDshFolderAction.tsx): drops the destructuring and accesses the injected callback at its use site.
- [src/client/provider-label/ProviderLabel.tsx](../../src/client/provider-label/ProviderLabel.tsx): provider check moves to the truthiness form.
- [src/client/settings-frame/SettingsFrameEnhancer.tsx](../../src/client/settings-frame/SettingsFrameEnhancer.tsx): gesture, cleanup, and geometry-fallback null checks move to the truthiness form.
- [src/client/model-picker/ModelPicker.tsx](../../src/client/model-picker/ModelPicker.tsx): placement, scrolling, and model-selection null checks move to the truthiness form.
