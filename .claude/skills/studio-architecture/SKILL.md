---
name: studio-architecture
description: >
  How the Cart Commerce studios are built — the full-screen workbench at
  /studio/{book,poster,apparel}, the shared design document and layer engine
  under Components/Studio/workbench/, the marketing previews, and the rules that
  keep editor options from going dead. Load before changing anything under
  Components/Studio/, the /studio routes, or the custom-item path through the
  cart.
---

# Studio architecture

Three surfaces, in order of depth:

| Surface | Where | What it is |
|---|---|---|
| **Workbench** | `/studio/book`, `/studio/poster`, `/studio/apparel` | The real editors. Full-screen dark app chrome, zoomable artboard, layer stack, templates. |
| **Preview** | `/studio` | A deliberately shallow live taster per product. Three or four controls, no layers. |
| **Social studio** | `/studio/social` | Independent editor with its own renderer. Not yet on the shared engine. |

## The one rule

**An option a shopper can pick must be honoured by every renderer that draws it.**

This codebase's characteristic bug is the pickable-but-invisible option: five
collars, six coat colours, five badges and a pet name that no renderer read;
apparel `size` and poster `paper` that never reached the canvas. `__tests__/
characterSchema.test.js` fails if a character option is wired to only one of the
two renderers. To check whether an option is live, grep for its **consumers**,
never its definition — a dead option looks healthy in its own table.

## Layout of the engine

```
Components/Studio/
  drawStamp.js          ~30 hand-drawn vector stamps. Pure. TINTABLE_STAMPS says
                        which honour `tint` — hide the control for the rest.
  drawSubstrate.js      The blank product: poster + frame/mat/paper, garment +
                        colourway/trim, book spread + scene. Draws NO copy.
  drawCharacter.js      drawHero / drawCompanion onto a canvas.
  core/                 designDoc, designCodec (?d= links), designStore,
                        useDesignPersistence, useDesignHistory, pricing,
                        characterSchema, StudioControls (light theme)
  workbench/            layerModel, renderLayers, useWorkbench,
                        useWorkbenchDesign, WorkbenchShell, CanvasViewport,
                        ToolRail, LayerPanel, Inspector, TemplateGallery,
                        CharacterPanel, WorkbenchFields (dark theme),
                        templates, stylePresets, products, WorkbenchRoute
  preview/              StudioPreview + previewConfigs
```

A route supplies three things and `WorkbenchRoute` does the rest: a `products.js`
entry, a `drawSubstrate` painter, and a `documentSection` render function.

## Non-obvious constraints

- **Never write `role="radio"` on an option button.** It replaces the implicit
  `button` role and the suites select options with `getByRole('button', {name})`.
  Both control kits use `role="group"` + `aria-pressed` + roving `tabIndex`.
- **Everything persisted lives in `options`.** The design document is
  `{mode, options, layers}`. The storybook cast sits in `options.avatar` /
  `options.companion` for exactly this reason — page-local state does not survive
  a save, a share link, or a reopened cart line.
- **The apparel artboard is 520x420.** The garment art uses absolute coordinates
  tuned for that canvas; any other size mis-proportions it.
- **Text auto-fits.** `renderLayers.paintText` shrinks a layer until its wrapped
  block fits its box, because a template authored against one font stack renders
  against whatever the browser resolves. Do not remove it — a single word wider
  than its box cannot be wrapped and will run off the artboard.
- **The preview handoff carries a template id, not layers.** Encoding every
  seeded layer produced ~2.4KB URLs; `meta.template` + `meta.slots` is ~250B and
  `WorkbenchRoute.rebuildFromTemplate` reconstitutes it.
- **Never put `Date.now()` in anything rendered during SSR.** The handoff link is
  built without `createDesignDoc` for this reason: a timestamp differs between
  server and client and React discards the whole element as a hydration mismatch.
- **Do not run `npm run build` while `next dev` is running.** They share `.next`
  and the dev server starts throwing `Cannot find module './chunks/...'`.
- **`drawBookStage` returns early on page 0**, so the cast only draws on an
  illustration spread. The book route opens on `activePage: 2`.

## Cart facts that still bite

- **`selectedVariant.priceModifier` is displayed and never charged.**
  `pages/products/[productid].jsx` shows `price + modifier`; `utils/cartUtils.js`
  sums `item.price * quantity`. Up to $150 per line.
- **Custom items vanish from `inventory` on reload**, so `UPDATE_QUANTITY` bails
  at `if (!cartItem || !inventoryItem) return state` and the qty box no-ops.
- `hooks/useActions.js` logs every cart action to the console.

## House rules

- CSS Modules only. Storefront CSS uses `styles/tokens.css`; workbench CSS uses
  the `--wb-*` layer from `workbench/theme.module.css`. No raw hex in either.
  Raw hex in JS (swatch values, canvas fills) is data and is fine.
- Zero emoji app-wide. Icons from `Components/Icons/` or `StudioSVGs.jsx`.
- Named exports, `PropTypes`, Prettier defaults.
- `npm run lint` and `npx vitest run` before calling anything done.
