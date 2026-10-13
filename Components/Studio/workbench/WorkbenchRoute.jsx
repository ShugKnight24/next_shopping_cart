import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  artForLayer,
  castStarring,
  placeMember,
  takeHandoffName,
} from '../cast/castModel';
import { CastPanel } from '../cast/CastPanel';
import { SceneryPanel } from '../cast/CastProperties';
import { ADULT_HEIGHT } from '../cast/castRig';
import { pieceArt, pieceById } from '../cast/scenePieces';
import { StarterGallery } from '../starters/StarterGallery';
import { buildStarter, relayout, STARTERS } from '../starters/starters';
import { CanvasViewport } from './CanvasViewport';
import { Inspector } from './Inspector';
import { applyTemplate, refitLayerToRect, reframeLayer } from './layerModel';
import { LayerPanel } from './LayerPanel';
import { paintLayers } from './renderLayers';
import { STYLE_PRESETS } from './stylePresets';
import { TemplateGallery } from './TemplateGallery';
import { TEMPLATES_BY_MODE } from './templates';
import { RAIL_PANELS, ToolRail } from './ToolRail';
import { useWorkbench } from './useWorkbench';
import { useWorkbenchDesign } from './useWorkbenchDesign';
import styles from './WorkbenchRoute.module.css';
import {
  InspectorSection,
  StatusItem,
  WorkbenchButton,
  WorkbenchShell,
} from './WorkbenchShell';

const CAST_PANELS = [
  ...RAIL_PANELS,
  { id: 'cast', name: 'Cast', shortcut: '3' },
  { id: 'scenery', name: 'Scenery', shortcut: '4' },
];

/** Where new characters and scenery land when the route does not say. */
const defaultStage = (artboard) => ({
  x: artboard.width / 2,
  feet: artboard.height * 0.88,
  adultHeight: artboard.height * 0.5,
});

/** Split options into the substrate's own and the undoable document keys. */
const splitOptions = (options, keys) => {
  const base = {};
  const doc = {};
  Object.entries(options).forEach(([key, value]) => {
    (keys.includes(key) ? doc : base)[key] = value;
  });
  return { base, doc };
};

/**
 * One assembled editor. The three product routes differ only in their substrate
 * painter, their document-properties panel, and their option defaults, so all
 * of the wiring lives here once.
 *
 * Routes with a cast (`castEnabled`) get the Cast and Scenery panels, and
 * character and scenery layers that draw from `options.cast`. `docKeys` names
 * options that undo together with the layers (the cast always does), held in
 * the workbench history rather than here. `pageScope(options)` pages the layer
 * stack (see useWorkbench), `stageFor` says where new cast and scenery land,
 * and `stage` renders extra chrome under the canvas, such as a page strip.
 *
 * `setOptions(next, { commit })` takes `commit: false` for changes that
 * should not be their own undo step (turning a page, typing a name).
 */
export const WorkbenchRoute = ({
  product,
  templateMode,
  drawSubstrate,
  documentSection,
  summarize,
  initialOptions = null,
  initialLayers = [],
  castEnabled = false,
  docKeys = null,
  pageScope = null,
  stageFor = defaultStage,
  stage = null,
}) => {
  // Which idea is open undoes with its layers, and so does anything that
  // reshapes the artboard (size, orientation, format), because the layers
  // are refitted to it in the same step.
  const keys = useMemo(
    () => [
      ...new Set([
        ...(docKeys ?? []),
        ...(product.frameKeys ?? []),
        ...(castEnabled ? ['cast'] : []),
        ...(castEnabled && templateMode !== 'book' ? ['idea'] : []),
      ]),
    ],
    [docKeys, castEnabled, product, templateMode]
  );
  const [initial] = useState(() =>
    splitOptions(initialOptions ?? { ...product.defaults }, keys)
  );
  const [baseOptions, setBaseOptions] = useState(initial.base);

  const artboardOf = useCallback(
    (doc) => product.artboard({ ...baseOptions, ...doc }),
    [product, baseOptions]
  );

  // The page scope may read both halves of the options.
  const scopeOf = useCallback(
    (doc) => (pageScope ? pageScope({ ...baseOptions, ...doc }) : null),
    [pageScope, baseOptions]
  );

  const workbench = useWorkbench({
    artboard: artboardOf,
    initialLayers,
    initialDoc: initial.doc,
    pageScope: pageScope ? scopeOf : null,
  });

  const { artboard } = workbench;
  const options = useMemo(
    () => ({ ...baseOptions, ...workbench.doc }),
    [baseOptions, workbench.doc]
  );

  // Consecutive updates in one tick must build on each other.
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const { setDoc, transact } = workbench;

  const setOptions = useCallback(
    (next, { commit = true } = {}) => {
      const before = optionsRef.current;
      const value = typeof next === 'function' ? next(before) : next;
      optionsRef.current = value;
      const { base, doc } = splitOptions(value, keys);
      setBaseOptions(base);
      // Send only the document keys this call changed: the rest may be a
      // stale copy of an edit the workbench has already queued.
      const changed = Object.fromEntries(
        Object.entries(doc).filter(([key, v]) => v !== before[key])
      );
      if (!Object.keys(changed).length) return;
      // A new shape of artboard carries every layer (every page) with it.
      const from = product.artboard(before);
      const to = product.artboard(value);
      if (from.width === to.width && from.height === to.height) {
        // Same artboard, but a new mount or frame can move the print window.
        const fromRect = product.artRect?.(before);
        const toRect = product.artRect?.(value);
        const moved =
          fromRect &&
          ['x', 'y', 'width', 'height'].some((k) => fromRect[k] !== toRect[k]);
        if (!moved) setDoc(changed, { commit });
        else
          transact(
            ({ layers }) => ({
              doc: changed,
              layers: layers.map((l) => refitLayerToRect(l, fromRect, toRect)),
            }),
            { commit }
          );
      } else
        transact(
          ({ layers }) => ({
            doc: changed,
            layers: relayout(layers, from, to, templateMode, value),
          }),
          { commit }
        );
    },
    [keys, setDoc, transact, product, templateMode]
  );
  const [panel, setPanel] = useState('inspector');
  const [editingMember, setEditingMember] = useState(null);
  const castList = options.cast;
  const cast = useMemo(
    () => (castEnabled ? (castList ?? []) : null),
    [castEnabled, castList]
  );

  // Clicking something on the canvas shows what it is, whatever panel was open
  // — except right after adding it from the Cast or Scenery panel, where the
  // shopper is still picking.
  const stayInPanel = useRef(false);
  useEffect(() => {
    if (!workbench.selectedId) return;
    if (stayInPanel.current) stayInPanel.current = false;
    else setPanel('inspector');
  }, [workbench.selectedId]);

  const substratePainter = useCallback(
    (ctx, board) => drawSubstrate(ctx, { ...board, config: options }),
    [drawSubstrate, options]
  );

  /**
   * Cart and saved-design thumbnails render the artboard on its own, offscreen:
   * the on-screen canvas is the whole dark viewport, and a thumbnail of the
   * workbench chrome is not a thumbnail of the design.
   */
  const snapshot = useCallback(
    (exportWidth = null) => {
      if (typeof document === 'undefined') return null;

      try {
        const canvas = document.createElement('canvas');
        const scale = exportWidth
          ? exportWidth / artboard.width
          : Math.min(2, 640 / artboard.width);
        canvas.width = Math.round(artboard.width * scale);
        canvas.height = Math.round(artboard.height * scale);

        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.scale(scale, scale);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, artboard.width, artboard.height);

        drawSubstrate(ctx, { ...artboard, config: options });
        paintLayers(ctx, { layers: workbench.layers, artboard, scale, cast });

        return canvas.toDataURL('image/png');
      } catch {
        // Tainted canvas or an unsupported context — the cart line still works,
        // it just falls back to no image rather than blocking the add.
        return null;
      }
    },
    [artboard, drawSubstrate, options, workbench.layers, cast]
  );

  /**
   * A design handed off from the marketing preview arrives as a template id
   * plus the slot text the visitor typed, rather than a full layer stack — see
   * StudioPreview. Rebuild it here so it lands as real template layers and
   * template swapping keeps working.
   */
  const rebuildFromTemplate = useCallback(
    (doc) => {
      // The studio page's previews send an idea and a kid: build the same
      // starter here, with the same cast, at this artboard.
      const starter =
        doc?.meta?.idea &&
        STARTERS[templateMode]?.find((s) => s.id === doc.meta.idea);
      if (starter && castEnabled) {
        const options = { ...product.defaults, ...doc.options };
        const built = buildStarter(templateMode, starter, {
          artboard: product.artboard(options),
          options,
          cast: castStarring(
            doc.meta.hero?.look,
            doc.meta.hero?.name ?? takeHandoffName()
          ),
        });
        return {
          ...doc,
          options: {
            ...options,
            ...built.options,
            cast: built.cast,
            ...(starter.book ? {} : { idea: starter.id }),
          },
          layers: built.layers,
        };
      }

      if (!doc?.meta?.template) return doc;

      const template = (TEMPLATES_BY_MODE[templateMode] ?? []).find(
        (candidate) => candidate.id === doc.meta.template
      );
      if (!template) return doc;

      const slots = doc.meta.slots ?? {};
      const layers = applyTemplate(template, doc.layers ?? []).map((layer) =>
        layer.slotRole && slots[layer.slotRole]
          ? { ...layer, text: slots[layer.slotRole] }
          : layer
      );

      return { ...doc, layers };
    },
    [templateMode, castEnabled, product]
  );

  const design = useWorkbenchDesign({
    product,
    options,
    setOptions,
    workbench,
    snapshot,
    summarize,
    transformIncoming: rebuildFromTemplate,
  });

  const setOption = useCallback(
    (key, value) => setOptions((current) => ({ ...current, [key]: value })),
    [setOptions]
  );

  const handleToolChange = useCallback(
    (tool) => {
      // The creation tools act immediately rather than arming a draw mode: on a
      // product artboard there is nothing to rubber-band over, and a shopper
      // who picks "Text" expects text.
      if (tool === 'text') workbench.addLayer('text', { text: 'New text' });
      else if (tool === 'shape') workbench.addLayer('shape');
      else if (tool === 'art') workbench.addLayer('art', { art: 'star' });
      else if (tool === 'image') workbench.addLayer('image');
      else workbench.setTool(tool);

      if (tool !== 'select') setPanel('inspector');
    },
    [workbench]
  );

  const exportProof = useCallback(() => {
    // A digital post downloads at the size the platform wants.
    const dataUrl = snapshot(product.exportWidth?.(options));
    if (!dataUrl) {
      design.announce('Could not export this design.');
      return;
    }

    const link = document.createElement('a');
    link.download = `${product.mode}-${product.digital ? 'post' : 'proof'}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    design.announce('Proof downloaded.');
  }, [snapshot, product, options, design]);

  const templates = TEMPLATES_BY_MODE[templateMode] ?? [];
  const presets = STYLE_PRESETS[templateMode] ?? [];

  /* ---------------------------------------------------------------- cast -- */

  /**
   * Change the cast and its characters as one undo step. Someone who leaves
   * the cast leaves every page; a new outline (big hair, a sun hat) refits
   * their layers so they stay the same size, feet on the same spot.
   * `commit: false` is for typing a name, which changes no art.
   */
  const setCast = useCallback(
    (next, { commit = true } = {}) => {
      workbench.transact(
        ({ layers, doc }) => {
          const before = doc.cast ?? [];
          const removed = before
            .filter((m) => !next.some((n) => n.id === m.id))
            .map((m) => m.id);
          const changed = next.filter((m) => {
            const old = before.find((b) => b.id === m.id);
            return old && old !== m;
          });
          if (!removed.length && !changed.length)
            return { doc: { cast: next } };
          return {
            doc: { cast: next },
            layers: layers
              .filter(
                (l) => !(l.type === 'character' && removed.includes(l.castId))
              )
              .map((l) => {
                const member =
                  l.type === 'character' &&
                  changed.find((m) => m.id === l.castId);
                if (!member) return l;
                const old = before.find((b) => b.id === member.id);
                const prev = artForLayer(l, old);
                const art = artForLayer(l, member);
                return prev?.width === art?.width &&
                  prev?.height === art?.height
                  ? l
                  : reframeLayer(l, prev, art);
              }),
          };
        },
        { commit }
      );
    },
    [workbench]
  );

  const placeOnPage = useCallback(
    (member) => {
      // One of each person per page: a second click selects them instead.
      const here = workbench.layers.find(
        (l) => l.type === 'character' && l.castId === member.id
      );
      if (here) {
        stayInPanel.current = true;
        workbench.select(here.id);
        design.announce(`${here.name} is already on this page.`);
        return;
      }
      const at = stageFor(artboard, options);
      const others = workbench.layers.filter(
        (l) => l.type === 'character'
      ).length;
      const spec = placeMember(member, {
        ...at,
        x: at.x + ((others % 3) - 1) * at.adultHeight * 0.45,
      });
      if (!spec) return;
      stayInPanel.current = true;
      workbench.addLayer('character', spec);
      design.announce(`${spec.name} added to this page.`);
    },
    [stageFor, artboard, options, workbench, design]
  );

  const addPiece = useCallback(
    (id) => {
      const at = stageFor(artboard, options);
      const art = pieceArt(id);
      const k = at.adultHeight / ADULT_HEIGHT;
      const height = art.height * k;
      stayInPanel.current = true;
      workbench.addLayer('piece', {
        piece: id,
        name: pieceById(id).name,
        x: at.x,
        y:
          pieceById(id).category === 'sky'
            ? artboard.height * 0.22
            : at.feet - height / 2,
        width: art.width * k,
        height,
      });
    },
    [stageFor, artboard, options, workbench]
  );

  const placedCount = useMemo(() => {
    const pages = {};
    (workbench.allLayers ?? workbench.layers).forEach((l) => {
      if (l.type !== 'character') return;
      (pages[l.castId] ??= new Set()).add(l.page ?? 'all');
    });
    return Object.fromEntries(
      Object.entries(pages).map(([id, set]) => [id, set.size])
    );
  }, [workbench.allLayers, workbench.layers]);

  /**
   * Open a starter idea in one undo step; anyone the idea needs joins the
   * cast. A book idea is a whole book. Anywhere else an idea swaps only the
   * last idea's own layers, the way a story moment does: whatever the
   * shopper added themselves stays.
   */
  const applyStarter = useCallback(
    (starter) => {
      if (!starter || !cast) return;
      // A book idea is a whole book: say so before it replaces one.
      const hasWork = (workbench.allLayers ?? workbench.layers).length > 0;
      if (
        starter.book &&
        hasWork &&
        typeof window !== 'undefined' &&
        !window.confirm(
          `Replace your whole book with "${starter.name}"? You can undo this.`
        )
      )
        return;
      const built = buildStarter(templateMode, starter, {
        artboard,
        options: optionsRef.current,
        cast,
      });
      const { base, doc } = splitOptions(built.options ?? {}, keys);
      workbench.select(null);
      workbench.transact(({ layers }) => ({
        layers: starter.book
          ? built.layers
          : [...layers.filter((l) => !l.fromStarter), ...built.layers],
        doc: {
          ...doc,
          cast: built.cast,
          ...(starter.book ? {} : { idea: starter.id }),
        },
      }));
      if (Object.keys(base).length)
        setOptions((current) => ({ ...current, ...base }), { commit: false });
      setPanel('inspector');
      design.announce(`Opened "${starter.name}". Change anything you like.`);
    },
    [cast, templateMode, artboard, keys, workbench, setOptions, design]
  );

  const ideas = (props) =>
    cast ? (
      <StarterGallery
        mode={templateMode}
        artboard={artboard}
        options={options}
        cast={cast}
        drawSubstrate={drawSubstrate}
        onApply={applyStarter}
        {...props}
      />
    ) : null;

  const editMember = useCallback((id) => {
    setEditingMember(id);
    setPanel('cast');
  }, []);

  return (
    <WorkbenchShell
      title={product.title}
      subtitle={
        design.persistence.saved.length ? 'Autosaved' : 'Untitled design'
      }
      backHref="/studio"
      tools={
        <ToolRail
          tool={workbench.tool}
          onToolChange={handleToolChange}
          activePanel={panel}
          onPanelChange={setPanel}
          panels={castEnabled ? CAST_PANELS : RAIL_PANELS}
        />
      }
      inspector={
        <div className={styles.panelHost}>
          {panel === 'templates' && ideas()}

          {panel === 'templates' && (
            <TemplateGallery
              mode={templateMode}
              templates={templates}
              stylePresets={presets}
              workbench={workbench}
              onApplySubstrate={(substrate) =>
                substrate &&
                setOptions((current) => ({ ...current, ...substrate }))
              }
            />
          )}

          {panel === 'layers' && <LayerPanel workbench={workbench} />}

          {panel === 'cast' && cast && (
            <CastPanel
              cast={cast}
              editingId={editingMember}
              onEdit={setEditingMember}
              onChangeCast={setCast}
              onPlace={placeOnPage}
              placedCount={placedCount}
            />
          )}

          {panel === 'scenery' && cast && <SceneryPanel onAdd={addPiece} />}

          {panel === 'inspector' && (
            <Inspector
              workbench={workbench}
              context={
                cast
                  ? {
                      cast,
                      onEditMember: editMember,
                      pageLayers: workbench.layers,
                      selectLayer: workbench.select,
                    }
                  : null
              }
              settingsLabel={
                templateMode === 'book' ? 'Page settings' : 'Design settings'
              }
              ideas={
                // Whole-book ideas live in the Templates panel, never on an
                // empty page, where they would read as "fill this page".
                workbench.layers.length === 0 && templateMode !== 'book'
                  ? ideas({ title: 'Need an idea?', limit: 4 })
                  : null
              }
              documentSection={documentSection({
                options,
                setOption,
                setOptions,
                workbench,
                artboard,
                cast,
                openPanel: setPanel,
                editMember,
                placeOnPage,
                applyIdea: applyStarter,
                addPiece,
              })}
            >
              {product.digital ? (
                <InspectorSection title="Share">
                  <p className={styles.note}>
                    Free to make and download at{' '}
                    {product.exportLabel?.(options) ?? 'full size'}.
                  </p>
                  <WorkbenchButton variant="primary" onClick={exportProof}>
                    Download PNG
                  </WorkbenchButton>
                </InspectorSection>
              ) : (
                <InspectorSection title="Order">
                  <div className={styles.priceList}>
                    {design.price.lines.map((line) => (
                      <div key={line.label} className={styles.priceLine}>
                        <span>{line.label}</span>
                        <span>${line.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className={styles.priceTotal}>
                    <span>Total</span>
                    <strong>${design.price.subtotal.toFixed(2)}</strong>
                  </div>

                  <WorkbenchButton variant="primary" onClick={design.addToCart}>
                    Add to bag
                  </WorkbenchButton>
                </InspectorSection>
              )}
            </Inspector>
          )}
        </div>
      }
      actions={
        <>
          <WorkbenchButton
            onClick={workbench.undo}
            disabled={!workbench.canUndo}
            aria-label="Undo"
          >
            Undo
          </WorkbenchButton>
          <WorkbenchButton
            onClick={workbench.redo}
            disabled={!workbench.canRedo}
            aria-label="Redo"
          >
            Redo
          </WorkbenchButton>

          <span className={styles.spacer} />

          <WorkbenchButton
            onClick={() => {
              const entry = design.persistence.save({
                name: product.title,
                thumbnail: snapshot(),
                summary: summarize?.(options, workbench.allLayers) ?? null,
              });
              design.announce(`Saved "${entry.name}" to My Designs.`);
            }}
          >
            Save
          </WorkbenchButton>
          <WorkbenchButton
            onClick={async () => {
              const url = await design.persistence.share();
              if (url) design.announce('Share link copied.');
            }}
          >
            Share link
          </WorkbenchButton>
          <WorkbenchButton variant="subtle" onClick={exportProof}>
            Export PNG
          </WorkbenchButton>
        </>
      }
      status={
        <>
          <div className={styles.zoomGroup}>
            <button
              type="button"
              className={styles.zoomBtn}
              onClick={workbench.zoomOut}
              aria-label="Zoom out"
            >
              −
            </button>
            <span className={styles.zoomValue}>
              {Math.round(workbench.zoom * 100)}%
            </span>
            <button
              type="button"
              className={styles.zoomBtn}
              onClick={workbench.zoomIn}
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              className={styles.zoomBtn}
              onClick={workbench.zoomToActual}
            >
              100%
            </button>
          </div>

          <StatusItem
            label={product.digital ? 'Size' : 'Print'}
            value={product.printSpec(options)}
          />
          <StatusItem label="Layers" value={workbench.layers.length} />

          <span className={styles.spacer} />

          <p className={styles.status} role="status" aria-live="polite">
            {design.status}
          </p>

          {!product.digital && (
            <StatusItem
              label="Total"
              value={`$${design.price.subtotal.toFixed(2)}`}
            />
          )}
        </>
      }
    >
      <div className={styles.stageColumn}>
        <div className={styles.viewportHost}>
          <CanvasViewport
            workbench={workbench}
            artboard={artboard}
            drawSubstrate={substratePainter}
            cast={cast}
            ariaLabel={`${product.title} design canvas, ${workbench.layers.length} layers`}
          />
        </div>
        {stage?.({
          options,
          setOptions,
          workbench,
          artboard,
          drawSubstrate,
          cast,
        })}
      </div>
    </WorkbenchShell>
  );
};

WorkbenchRoute.propTypes = {
  product: PropTypes.object.isRequired,
  templateMode: PropTypes.oneOf(['poster', 'apparel', 'book', 'social'])
    .isRequired,
  drawSubstrate: PropTypes.func.isRequired,
  documentSection: PropTypes.func.isRequired,
  summarize: PropTypes.func,
  initialOptions: PropTypes.object,
  initialLayers: PropTypes.array,
  castEnabled: PropTypes.bool,
  docKeys: PropTypes.arrayOf(PropTypes.string),
  pageScope: PropTypes.func,
  stageFor: PropTypes.func,
  stage: PropTypes.func,
};
