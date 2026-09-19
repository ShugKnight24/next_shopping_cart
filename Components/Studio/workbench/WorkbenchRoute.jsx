import PropTypes from 'prop-types';
import { useCallback, useMemo, useState } from 'react';
import { CanvasViewport } from './CanvasViewport';
import { Inspector } from './Inspector';
import { LayerPanel } from './LayerPanel';
import { paintLayers } from './renderLayers';
import { STYLE_PRESETS } from './stylePresets';
import { TemplateGallery } from './TemplateGallery';
import { TEMPLATES_BY_MODE } from './templates';
import { ToolRail } from './ToolRail';
import { useWorkbench } from './useWorkbench';
import { useWorkbenchDesign } from './useWorkbenchDesign';
import styles from './WorkbenchRoute.module.css';
import {
  InspectorSection,
  StatusItem,
  WorkbenchButton,
  WorkbenchShell,
} from './WorkbenchShell';

/**
 * One assembled editor. The three product routes differ only in their substrate
 * painter, their document-properties panel, and their option defaults, so all
 * of the wiring lives here once.
 */
export const WorkbenchRoute = ({
  product,
  templateMode,
  drawSubstrate,
  documentSection,
  summarize,
  initialOptions = null,
}) => {
  const [options, setOptions] = useState(
    () => initialOptions ?? { ...product.defaults }
  );

  const artboard = useMemo(() => product.artboard(options), [product, options]);

  const workbench = useWorkbench({ artboard });
  const [panel, setPanel] = useState('inspector');

  const substratePainter = useCallback(
    (ctx, board) => drawSubstrate(ctx, { ...board, config: options }),
    [drawSubstrate, options]
  );

  /**
   * Cart and saved-design thumbnails render the artboard on its own, offscreen:
   * the on-screen canvas is the whole dark viewport, and a thumbnail of the
   * workbench chrome is not a thumbnail of the design.
   */
  const snapshot = useCallback(() => {
    if (typeof document === 'undefined') return null;

    try {
      const canvas = document.createElement('canvas');
      const scale = Math.min(2, 640 / artboard.width);
      canvas.width = Math.round(artboard.width * scale);
      canvas.height = Math.round(artboard.height * scale);

      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.scale(scale, scale);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, artboard.width, artboard.height);

      drawSubstrate(ctx, { ...artboard, config: options });
      paintLayers(ctx, { layers: workbench.layers, artboard, scale });

      return canvas.toDataURL('image/png');
    } catch {
      // Tainted canvas or an unsupported context — the cart line still works,
      // it just falls back to no image rather than blocking the add.
      return null;
    }
  }, [artboard, drawSubstrate, options, workbench.layers]);

  const design = useWorkbenchDesign({
    product,
    options,
    setOptions,
    workbench,
    snapshot,
    summarize,
  });

  const setOption = useCallback(
    (key, value) => setOptions((current) => ({ ...current, [key]: value })),
    []
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
    const dataUrl = snapshot();
    if (!dataUrl) {
      design.announce('Could not export this design.');
      return;
    }

    const link = document.createElement('a');
    link.download = `${product.mode}-proof-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    design.announce('Proof downloaded.');
  }, [snapshot, product.mode, design]);

  const templates = TEMPLATES_BY_MODE[templateMode] ?? [];
  const presets = STYLE_PRESETS[templateMode] ?? [];

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
        />
      }
      inspector={
        <div className={styles.panelHost}>
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

          {panel === 'inspector' && (
            <Inspector
              workbench={workbench}
              documentSection={documentSection({
                options,
                setOption,
                setOptions,
              })}
            >
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
                summary: summarize?.(options, workbench.layers) ?? null,
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

          <StatusItem label="Print" value={product.printSpec(options)} />
          <StatusItem label="Layers" value={workbench.layers.length} />

          <span className={styles.spacer} />

          <p className={styles.status} role="status" aria-live="polite">
            {design.status}
          </p>

          <StatusItem
            label="Total"
            value={`$${design.price.subtotal.toFixed(2)}`}
          />
        </>
      }
    >
      <CanvasViewport
        workbench={workbench}
        artboard={artboard}
        drawSubstrate={substratePainter}
        ariaLabel={`${product.title} design canvas, ${workbench.layers.length} layers`}
      />
    </WorkbenchShell>
  );
};

WorkbenchRoute.propTypes = {
  product: PropTypes.object.isRequired,
  templateMode: PropTypes.oneOf(['poster', 'apparel', 'book']).isRequired,
  drawSubstrate: PropTypes.func.isRequired,
  documentSection: PropTypes.func.isRequired,
  summarize: PropTypes.func,
  initialOptions: PropTypes.object,
};
