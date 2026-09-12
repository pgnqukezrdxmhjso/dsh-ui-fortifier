# 2026-09-12-1-fix-fix-narrow-screen-panel-overflow-and-occlusion-plus-placement

## Direct Reason

Opening the cascading model picker panel on a phone screen produced three problems:

1. **The panel was wider than the screen**: `.menu` used an absolute `min-width: 420px`, exceeding a phone's width. In CSS `min-width` wins over `max-width`, so the existing `max-width: min(520px, calc(100vw - 32px))` could not hold it back.
2. **The panel was occluded by the left conversation list**: the panel was `position: absolute` inside the composer card, while `.centerCol` (`AppFrame.module.css`) and `.conversationRoot[data-phase='active']` (`ConversationRoot.module.css`) both carry `overflow: hidden`; the part beyond the column was clipped, which reads as being blocked by the sidebar. Raising `z-index` cannot help — this is clipping, not stacking.
3. **Long model names were truncated**: `.modelName` declared `overflow: hidden` + `text-overflow: ellipsis` + `white-space: nowrap` together, so a long model id showed only an ellipsis.

Placement was also suboptimal: the panel aligned to the trigger's left edge, and the panel had no scroll positioning when opened.

## Solution

### Portal the panel and use fixed positioning (problems 1, 2)

In `ModelPicker.module.css`, `.menu` moves from `absolute` to `position: fixed` and `z-index` rises from 1000 to 1100; `right`, `bottom`, and `transform: translateX(-72px)` are all removed — once portaled to body the columns' overflow clips and the sidebar no longer apply, and the earlier left shift that dodged the "back to bottom" floating control is unnecessary.

In `ModelPicker.tsx` the panel mounts through `createPortal` into `document.body`. Because the panel leaves the `rootRef` subtree, the outside-click dismissal must also check `menuRef`; otherwise a click inside the panel is misread as outside and closes it.

### Min width follows the viewport (problem 1)

```css
min-width: min(420px, calc(100vw - 32px));
```

Wide screens keep 420px so both columns stay readable; narrow screens shrink inside the viewport.

### Model names wrap (problem 3)

`.modelName` drops the three truncation rules for `overflow-wrap: anywhere`. `anywhere` is a necessary addition: model ids are often long unbroken strings, and merely removing `nowrap` still overflows where there is no break opportunity.

### Right-edge alignment with viewport clamping (placement)

The panel's right edge aligns to the trigger's right edge, shifting back inside the bounds only when that would leave the viewport. Because the official `useAnchoredPosition` places from the trigger's **left** edge and exposes no alignment option, the plugin implements `useRightAlignedMenuPosition` locally: right-edge arithmetic `left = rect.right - width`, keeping the official clamping and `scroll`(capture)/`resize` recomputation, plus a `ResizeObserver` so the panel follows its own size changes.

The unplaced state uses `MEASURE_STYLE` (`visibility: hidden` at the origin) so the first frame measures real dimensions and nothing flashes at the origin — the same technique as the official `ModelSelect.tsx`. The viewport margin is 12, matching the official `MARGIN = 12`.

### Position to the current selection on open; reset on provider switch

- On open, the current provider (left column) and current model (right column) scroll into view, done in `useLayoutEffect` before paint so the panel never parks at the top and then jumps; `positionedRef` limits this to once per open, so later manual scrolling is never yanked back.
- Switching providers resets the model column's `scrollTop` to zero. The container is reused across switches, and React does not reset its scroll position.
- Switching back to the **current model's** provider positions to the current model instead: when that provider's list is not the active column, a `pendingCurrentScrollRef` flag hands the work to the placement effect after render (this branch must precede the `positionedRef` guard or it can never be reached); when it is already the active column the scroll happens on the spot — the list content does not change then and the effect will not re-run, so leaving the flag pending would strand the state until some unrelated re-render.

## Approach

- The occlusion was never a stacking problem; the root cause is an ancestor `overflow: hidden`. The official `ModelSelect` `.menu` comment says the same: "portaled to body ... so the sidebar and the columns' overflow clips cannot crop it". The same technique is used here.
- The basis for asserting that portaling does not pollute global styles: CSS Modules emits hash-prefixed, individually scoped selectors, and portaling changes an element's position, not its selectors; the theme layer's global rules all target `body` / `body *` / `::-webkit-scrollbar` with no bare class selector that could match this panel; design tokens are defined on `body`, so they are still inherited after portaling, and the `--dsw-elevation-stroke-color` this component rebinds keeps working (the theme layer already declares that variable per element in `gradient-shadow-text.css`).
- Placement is implemented locally rather than extending the upstream harness hook: the official `ModelSelect` mirrors the measure-and-clamp plumbing for the same reason — its source comment states that the hook places only from the left edge, and it marks the duplication with `jscpd:ignore`. Changing it upstream would mean editing the dsh repository, which the collaboration rules exclude from this repository.
- Scroll positioning computes `scrollTop` by hand rather than calling `element.scrollIntoView()`, which would scroll every scrollable ancestor and drag the background page along once the panel is portaled to body.

## Involved Files

- [src/client/model-picker/ModelPicker.module.css](../../src/client/model-picker/ModelPicker.module.css): panel becomes fixed, min width follows the viewport, model names wrap.
- [src/client/model-picker/ModelPicker.tsx](../../src/client/model-picker/ModelPicker.tsx): portal mounting, right-edge placement, open-time positioning and switch reset, outside-click check covering the panel.
- [package.json](../../package.json): version 0.5.2.