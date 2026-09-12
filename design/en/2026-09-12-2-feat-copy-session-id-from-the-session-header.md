# 2026-09-12-2-feat-copy-session-id-from-the-session-header

## Direct Reason

The current session ID had to be obtained, but the interface offered no way to get it. The Session header was checked: its title area is a breadcrumb navigation that renders the raw `sessionId` only when `ancestry.length === 0` (the session is absent from the sidebar list), and otherwise shows the session title; the URL carries no session ID; and the header had no copy control. A local way to obtain the session ID was therefore needed.

The intended place was originally an item inside the Session header's three-dot menu (the one holding "download session log"), but that menu is not extensible: it is owned by `session-log-export` (`packages/session-query/session-log-export/src/client/HeaderAction.tsx`), its items are a hardcoded array, and the `Menu` primitive takes `items` as a plain prop with no slot for menu entries.

## Solution

A new `session-id-copy` feature module registers into `conversation.session.header.utilities` — the `list` slot (additive) the official code declares for the Session header's right-aligned utility group. That slot's two current occupants are exactly the "open locally" button and the three-dot menu at the header's right, so the new button renders beside them.

- The button is a 28px-tall pill holding a hash glyph beside a copy glyph; clicking copies the Session ID in place.
- The hash glyph is an inline SVG in the component: the official icon library has no identifier glyph, and a copy glyph alone does not express the relation to a session ID.
- Hovering or focusing shows `Session ID: {id}` through the `Tooltip` primitive, so the ID is visible without copying it first; after a successful copy the hint reads "Copied".
- Copying uses `writeClipboard` (provided by ui-primitives, preferring the async Clipboard API and falling back to `execCommand` when absent); on success the glyph swaps to a check mark for about a second, matching the official `MessageIconActions` feedback.
- `order: -20` places the button leftmost in that slot. The slot sorts ascending by order, and its current occupants are `open-in-app` (-10) and `session-log-download` (default 0).
- The session ID comes from the slot's owner parameters (the slot is `scope: 'session'`, so the component receives `sessionId` directly through `PropsRuntime`).
- The feature can be disabled from the Settings page, defaults to enabled, and uses the existing module control mechanism (disabling unmounts the registration).

## Approach

- The dsh repository is not modified to add a menu item: that would mean editing `session-log-export`'s source, which a dsh upgrade overwrites (adapting to dsh 0.1.5's caller-context change earlier is the precedent), and it lies outside the plugin repository.
- A `list` slot was chosen over `conversation.session.header.corner` (a `single` slot already occupied by ui-sidebar-right): an additive slot replaces no official declaration, matching how the plugin already uses `conversation.input.right`.
- The copy feedback copies the official pattern already in use (a brief check-glyph swap, re-clicks ignored during the feedback window, the timer cleared on unmount) rather than introducing a new notification component.
- The hash glyph is inlined rather than taken from the official icons: none of the official 75 glyphs is an identifier, and a plugin cannot import another plugin's component; an inline stroke path is this plugin's existing practice.
- The hint uses the `Tooltip` primitive rather than a native `title`: the primitive shows on both hover and keyboard focus and its bubble is themed by tokens. No native `title` is set, so two hints never stack.

## Involved Files

- [src/client/session-id-copy/](../../src/client/session-id-copy/): button component, installer, and styles.
- [src/types.ts](../../src/types.ts): adds `session-id-copy` to Config.
- [src/index.ts](../../src/index.ts): adds `session-id-copy` to the config schema.
- [src/client/index.ts](../../src/client/index.ts): adds the module to `modules` and `MODULE_ORDER`.
- [src/client/locales.ts](../../src/client/locales.ts): Chinese and English copy (toggle, button name, hover hint, and copied notice).
- [README.md](../../README.md) / [README.zh.md](../../README.zh.md): adds one feature row.