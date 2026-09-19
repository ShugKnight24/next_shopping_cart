---
name: studio-architecture
description: >
  How the Cart Commerce custom-creation studios are built — the shared design
  document, history, persistence, pricing and control kit under
  Components/Studio/core/, and the rules that keep editor options from going
  dead. Load before changing anything under Components/Studio/, /studio,
  /studio/social, or the custom-item path through the cart.
---

# Studio architecture

Five editors share one core: `StorybookStudio`, `PosterStudio`, `ApparelStudio`,
`CharacterCreator` (inside storybook) and `SocialStudio`. Everything they have
in common lives in `Components/Studio/core/`. Add to the core; do not grow a
fourth copy of something in a studio file.

## The one rule

**An option a shopper can pick must be honoured by every renderer that draws it.**

This codebase's characteristic bug is the pickable-but-invisible option. At one
point the character creator offered 5 collars, 6 coat colours, 5 badges and a
pet name that no renderer read, and `beanie` hardcoded blue hair in _two_
separate renderers. The product studios were worse: apparel `size` and poster
`paper` never reached the canvas at all.

So: add the option to `core/characterSchema.js` (or the studio's option table),
then wire **both** the SVG preview in `CharacterCreator` and the canvas path in
`CanvasEngine` / `drawCharacter.js`. Wiring one is a bug, not a partial feature.

To check whether an option is live, grep for its **consumers**, never its
definition — a dead option looks perfectly healthy in its own table.

## Core modules

| Module                         | What it owns                                                                                                            |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `core/designDoc.js`            | The serializable design: `createDesignDoc`, `migrateDesignDoc`, `summarizeDesign`, `designToCartItem`, `createDesignId` |
| `core/designCodec.js`          | `?d=` share links — `encodeDesign` / `decodeDesign` / `buildShareUrl`                                                   |
| `core/designStore.js`          | localStorage shelf + per-mode draft, as an external store                                                               |
| `core/useDesignPersistence.js` | Autosave, restore-offer, named saves, share                                                                             |
| `core/useDesignHistory.js`     | Undo/redo + `useUndoRedoShortcuts`                                                                                      |
| `core/pricing.js`              | `computePrice`, `formatPrice`, `modifierFor`                                                                            |
| `core/characterSchema.js`      | Every hero/companion option table + `normalizeAvatar` / `normalizeCompanion`                                            |
| `core/StudioControls.jsx`      | `SwatchRow`, `OptionPills`, `OptionCards`, `StudioSlider`, `PricePanel`, `QuantityStepper`                              |
| `core/DesignBar.jsx`           | Save / share link / My Designs / Start over strip                                                                       |

## Non-obvious constraints

- **Never write `role="radio"` on an option button.** It replaces the implicit
  `button` role, and the suite selects options with
  `getByRole('button', { name })` in dozens of places. `core/StudioControls.jsx`
  deliberately uses `role="group"` + `aria-pressed` + roving `tabIndex` + arrow
  keys instead. Same reasoning applies to any new control.
- **Tests query accessible names.** `__tests__/studio.test.jsx` (810 lines) and
  `__tests__/socialStudio.test.jsx` drive these editors entirely through role +
  name. Add controls alongside existing ones; never rename one to suit a
  refactor, and never edit the test to match the code.
- **`CanvasEngine` watermarks unconditionally unless told not to.** Pass
  `exportOptions={{ watermark: false }}` for cart and saved-design thumbnails —
  the PROOF ribbon belongs only on the downloadable proof.
- **The cart thumbnail must be the real canvas.** Snapshot via the `canvasRef`
  prop and `toDataURL('image/png')`, with the hand-drawn SVG as a jsdom-only
  fallback. Hand-drawn thumbnails drift from the design immediately.
- **Always attach the full `designDoc` to a cart line.** Human-readable
  `customAttributes` are for display; the doc is what makes an order
  reproducible and lets a cart line reopen in its editor.
- **Custom items are absent from `inventory` after a reload.** `SET_CART`
  rebuilds inventory from `buildInitialInventory()` only, so
  `UPDATE_QUANTITY` / `DECREASE_QUANTITY` bail at
  `if (!cartItem || !inventoryItem) return state`. Anything touching quantity on
  a custom line has to account for this.
- **`selectedVariant.priceModifier` is stored and never applied.**
  `utils/cartUtils.js` sums `item.price * quantity`, while the product page
  displays `price + modifier`. Do not add a second surface that quotes a
  modified price until the totals honour it.

## House rules

- CSS Modules only, design tokens from `styles/tokens.css`, no raw hex in CSS.
  Raw hex in JS (swatch values, canvas fills) is data and is fine.
- Zero emoji anywhere in the app — use `Components/Icons/` or `StudioSVGs.jsx`.
- Named exports, `PropTypes`, Prettier defaults from `.prettierrc`.
- `npm run lint` and `npm test` before calling anything done.
