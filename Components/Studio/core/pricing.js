/**
 * One price engine for every studio.
 *
 * Before this, each studio priced differently and incompletely: apparel charged
 * the garment base only (size, placement and every applied patch were free),
 * poster summed size + frame + paper but not stamps. A shopper could add twelve
 * embroidered patches and pay for a blank hoodie. The breakdown returned here
 * is rendered in the editor so the number is never a surprise at checkout.
 */

/**
 * @param base       {number} starting price for the chosen product
 * @param modifiers  {Array<{label, amount, hidden?}>} option surcharges
 * @param layerCount {number} applied stamps/patches/emblems
 * @param perLayer   {number} surcharge per layer beyond `freeLayers`
 * @param freeLayers {number} how many layers are included in the base
 * @param quantity   {number}
 */
export const computePrice = ({
  base = 0,
  baseLabel = 'Base',
  modifiers = [],
  layerCount = 0,
  perLayer = 0,
  freeLayers = 0,
  quantity = 1,
}) => {
  const lines = [{ label: baseLabel, amount: base }];

  modifiers
    .filter((m) => m && !m.hidden && m.amount)
    .forEach((m) => lines.push({ label: m.label, amount: m.amount }));

  const billableLayers = Math.max(0, layerCount - freeLayers);
  const layersAmount = billableLayers * perLayer;

  if (layersAmount > 0) {
    lines.push({
      label: `${billableLayers} extra ${billableLayers === 1 ? 'applique' : 'appliques'}`,
      amount: layersAmount,
      meta: `${freeLayers} included`,
    });
  }

  const unit = lines.reduce((sum, line) => sum + line.amount, 0);

  return {
    lines,
    unit: round2(unit),
    quantity,
    subtotal: round2(unit * quantity),
    includedLayers: Math.min(layerCount, freeLayers),
    billableLayers,
  };
};

const round2 = (n) => Math.round(n * 100) / 100;

export const formatPrice = (n) => `$${Number(n ?? 0).toFixed(2)}`;

/** Turn an option table entry into a price line. */
export const modifierFor = (option, labelPrefix) =>
  option && option.priceModifier
    ? {
        label: labelPrefix ? `${labelPrefix}: ${option.name}` : option.name,
        amount: option.priceModifier,
      }
    : null;
