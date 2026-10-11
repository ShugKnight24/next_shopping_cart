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

Two surfaces, in order of depth:

| Surface | Where | What it is |
|---|---|---|
| **Workbench** | `/studio/book`, `/studio/poster`, `/studio/apparel`, `/studio/social` | The real editors. Full-screen dark app chrome, zoomable artboard, layer stack, cast, ideas. |
| **Preview** | `/studio` | A deliberately shallow live taster per product. Three or four controls, no layers. |

Every workbench works the same way, and should stay that way: it **opens on a
finished idea** acted out by the starter cast; the settings panel reads top to
bottom as idea → look/backdrop → who is in it (`CastOnDesign`) → the product
itself, every choice a picture tile (`TileGrid`, `detail` for price); and a
strip under the canvas shows the design across the product's range (book:
`PageStrip`; poster frames, garments, post formats: `VariantStrip`). The shared
pieces live in `workbench/DesignPanel.jsx`.

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
  drawCharacter.js      drawHero / drawCompanion onto a canvas. The book's pets
                        still draw through drawCompanion.
  cast/                 The cast rig. castRig (original layered SVG people:
                        adults, kids, little ones; looks, poses, moods, props),
                        scenePieces (movable scenery art), castRaster (SVG to
                        decoded images for the canvas), castModel (options.cast),
                        CastPanel / LookEditor / CastProperties (picture-tile
                        pickers).
  book/                 bookPages (spreads, moments, stage geometry), BookPanel,
                        PageStrip.
  poster/ apparel/      PosterPanel, ApparelPanel: each product's settings.
  social/               socialArt (formats, themes, backdrops, the post's
                        substrate) and SocialPanel. Social is `digital`: a
                        Share/Download section replaces the order, export runs
                        at the format's pixel width, and its persistence mode
                        is 'social-post' so old-editor drafts never load.
  starters/             Starter ideas per product (starters.js) and the
                        "Start from an idea" gallery. Built from the live cast
                        and artboard; poster and apparel ideas stay inside the
                        free layer count so an idea never raises the price.
                        catalog.js lists store products with same-origin
                        photos (others would taint the canvas on export).
Components/Scroll3D/    ScrollStory (sticky scroll-scrubbed Three.js section
                        with DOM captions) plus shopScene / studioScene. The
                        studio scene's book, poster and hoodie are rendered by
                        the editors' own renderers (warmLayers first).
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
  `{mode, options, layers}`. The storybook cast sits in `options.cast` and its
  pages in `options.spreads` / `options.activeSpread` for exactly this reason —
  page-local state does not survive a save, a share link, or a reopened cart
  line.
- **People are cast members; placements are layers.** A `character` layer holds
  `castId`, `pose`, `mood`, `prop`; who the person is (hair, outfit) lives in
  `options.cast`, so one edit reaches every page. `WorkbenchRoute.setCast`
  refits a member's layers when their outline changes and deletes them when the
  member leaves. `__tests__/castRig.test.js` draws every person field, pose,
  mood and prop against the defaults and fails if an option does not change the
  art — the cast's version of the one rule.
- **Books are paged.** `useWorkbench({ scope })` shows and edits only layers
  whose `page` is the active spread (unpaged layers belong to `scope.fallback`,
  the first story spread) while one history spans the book. Persistence, price
  and the order summary read `workbench.allLayers`, never the scoped `layers`.
- **History holds layers and a `doc`.** Each entry is `{ layers, doc }`; routes
  opt option keys into `doc` with `docKeys` (the cast always is), so undoing
  "delete page" or "remove from cast" restores options and art together. Use
  `workbench.transact` for a change to both; `setOptions(next, { commit:
  false })` for navigation or typing. The open page (`activeSpread`) is not
  history — undo never turns the page.
- **Ideas swap, they do not replace.** Starter layers carry `fromStarter`;
  opening another idea (outside the book) swaps only those, records
  `options.idea`, and keeps whatever the shopper added — like a book moment.
- **The artboard can follow the document.** `product.frameKeys` (poster size
  and orientation, book and social format) are doc keys; changing one refits
  every layer in the same undo step (`starters.relayout` re-lays-out the open
  idea for the new shape, `layerModel.refitLayer` scales the rest).
- **Theme colours are roles.** Social layers record `colorRole` / `fillRole`;
  a theme change repaints only layers still wearing the old theme's colour.
- **Image layers load through `castRaster.imageForUrl`** (the default
  `imageFor` in `paintLayers`). Before it, image layers never drew a picture.
- **A drag is one undo step.** Previews overwrite the present entry and keep
  the pre-gesture state in `pending`; the identity commit at gesture end
  records it. Before this, drags were never undoable.
- **Sticky needs `overflow: clip`, not `hidden`, on ancestors.** Hidden makes a
  scroll container and the 3D story's sticky viewport stops sticking.
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
- **The book route no longer passes `avatar` / `companion` to the substrate.**
  The cast are layers; `drawBookStage` only paints them for callers that still
  pass the legacy records (the marketing preview).

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
