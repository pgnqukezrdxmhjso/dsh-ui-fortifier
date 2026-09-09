# 2026-09-10-2-feat-cascading-model-picker

## Direct Reason

As providers multiply, the official model selector's provider-grouped vertical list gets hard to scan; the user wants a cascading picker: pick a provider first, then a model.

## Solution

The official `ui-model-selection` is left untouched (its ModelSelect lives in the single `conversation.input.model` slot and declares no child slots, so a search box cannot be injected inside; swapping the whole seat would outgrow official updates). The plugin adds a `model-picker` module registered into the `conversation.input.right` list slot (`order: 1000`, immediately right of `provider-label`):

- The left column renders providers (`state.groups`); clicking one switches the right column, which lists every model of that provider; clicking a model submits the selection. This is a cascading model picker (provider → model), distinct from the official grouped list.
- The trigger is an icon-only button (grid/nine-dot, denoting the model directory); the panel has a top search box whose filter rule is: **when any model name matches the query the left column keeps only providers that offer a matching model (hiding the rest) and the right column filters by model name; only when no model matches does the provider column filter by provider name, showing all of that provider's models** (avoiding an empty right column when searching a provider name, and inconsistent behavior when a provider name equals a model name); when the current provider is filtered out the panel falls back to the first visible provider.
- Two empty states are distinguished: before the directory loads (including a load failure) the left column shows "No providers loaded."; after a search with no provider or model match it shows "No matching providers or models." (no longer misreporting that nothing loaded).
- Data and verbs all reuse the official shared `ctx.modelDirectories.directoryFor(sessionId)`: `hooks.directory` is the same store, `load`/`select` ride the same directory instance, so the two selectors stay in sync — official button and slash-command selections reflect here too.
- Layout constraint: the panel has a **fixed height** (derived from the viewport); search result count only changes each column's internal scroll, not the panel height. When the panel opens upward it shifts **left as a whole** (not lifted upward) to clear the conversation's "back to bottom" floating button, and raises its `z-index` above that button so it is not occluded. The trigger uses a grid (nine-dot) icon denoting the model directory/collection, not a magnifier, to avoid confusion with the in-panel search box.
- The trigger capsule (28px) matches the official model button; the panel reuses official menu tokens (`--dsw-specific-menu`, `--dsw-elevation-prominent`).
- Empty, loading, and error states carry copy and a retry button; failed selections show an inline error.
- The `model-picker` config toggle (Settings label: "Input - Cascading model picker") defaults to on and can be disabled on the Settings page; disabling unmounts the registration and restores the original input layout.

## Approach

- Seat: `conversation.input.right` is the official list slot for "compact tool-row controls" (provider-label shares it); appending an entry touches no official declaration, aligned with the dsh.md collaboration rules.
- Data: bind the official store both ways instead of holding a plugin-private copy that could drift; the component only reads snapshots and submits through callbacks — no new Remote, no Host change.
- Interaction: panel open/close is entry-local state; outside click closes; keyboard-accessible names ride aria-label.

## Involved Files

- [src/client/model-picker/](../../src/client/model-picker/): picker component, installer, and styles.
- [src/index.ts](../../src/index.ts): adds the `model-picker` config key.
- [src/client/index.ts](../../src/client/index.ts): adds the module to the modules table.
- [src/client/locales.ts](../../src/client/locales.ts): Chinese and English copy (toggle and picker UI copy).
- [README.md](../../README.md) / [README.zh.md](../../README.zh.md): adds one feature row.