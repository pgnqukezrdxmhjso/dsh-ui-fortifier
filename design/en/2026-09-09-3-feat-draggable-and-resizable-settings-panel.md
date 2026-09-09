# 2026-09-09-3-feat-draggable-and-resizable-settings-panel

## Direct Reason

The user wants to adjust the position and size of the Settings panel directly, making it easier to compare content or to work with multiple displays.

## Solution

The Settings panel is the `.panel` rendered by `ui-settings-general`'s `SettingsRoot`: it sits in a flex-centering container at 800 wide and `min(800px, 100vh-48px)` tall, with no positioning or resizing capability. This plugin reuses the `settings.action` list slot to register an enhancer entry without changing dsh itself:

- On mount, the component finds the panel DOM via `closest('[role="dialog"]')`, switches the inline style to `position: fixed`, and keeps the current `left/top/width/height` so there is no visual jump; on unmount it clears the inline styles and returns to the CSS-default centered 800 width.
- Drag position: a grab handle rendered in the actions area (pointer capture + rAF throttle, following the column-handle pattern in `ui-layout`'s AppFrame). Dragging computes from the offset between the pointer start and the panel's top-left corner; on release the panel is clamped inside the viewport (top-left not below 0, bottom-right not past the viewport edge).
- Drag size: a resize handle is injected at the panel's bottom-right corner via `createPortal`, anchored at the top-left and expanding toward the bottom-right; minimum 480x320, maximum bounded by the viewport, and the same visibility constraint applies after resizing.
- Viewport constraint: the panel geometry persists to localStorage; each open first applies the persisted geometry, then clamps it to the current viewport. A `resize` listener (rAF-batched) watches the browser window; on change it first shrinks width/height that exceed the viewport, then clamps position, keeping the Settings frame always in view; both window resizes and mount write the current visual geometry back to storage, so the next open shows exactly what the last close left.
- Minimum size: when the window allows, the panel stays at least 480x320 (when the window is squeezed below the minimum it still shrinks to fit without persisting, so a transiently flattened geometry is never stored; when the window grows back the panel returns to at least 480x320 and never collapses to a line).

Both handles are buttons with aria-label accessible names. The `settings-frame` config toggle defaults to on and can be disabled on the Settings page.

The Settings page list itself has two layout constraints: content capped at 520px wide (so switches do not drift far from their labels when the panel is dragged wide), with a 0.5px divider between adjacent options for readability.

## Approach

- Position: reuse the `settings.action` list slot; the plugin registers its own enhancer entry without touching `ui-settings-general`'s declaration, aligned with the dsh.md collaboration rules.
- Interaction: pure pointer events plus inline styles; no Host-side change, no new Remote; geometry persists through localStorage (following the existing `dsh.conversation.contentWidth` precedent); the gesture baseline matches existing dsh drag components.
- Restore: unmount clears the inline styles back to the CSS defaults, leaving no residue; the 480x320 minimum plus viewport clamping stops the panel from becoming unrecoverable off-screen.

## Involved Files

- [src/client/settings-frame/](../../src/client/settings-frame/): enhancer component, installer, and handle styles.
- [src/index.ts](../../src/index.ts): adds the `settings-frame` config key.
- [src/client/index.ts](../../src/client/index.ts): adds the module to the modules table.
- [src/client/locales.ts](../../src/client/locales.ts): Chinese and English copy (toggle and handle aria-labels).
- [README.md](../../README.md) / [README.zh.md](../../README.zh.md): adds one feature row.