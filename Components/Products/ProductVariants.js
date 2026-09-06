export function ProductVariants({ variants, onSelect, selectedVariant }) {
  return (
    <div className="product-variants">
      <h3>Variants</h3>
      {variants.map((variant, index) => (
        <button
          key={index}
          className={`variant-button ${selectedVariant === variant ? 'selected' : ''}`}
          onClick={() => onSelect(variant)}
          aria-label={`Select ${variant}`}
        >
          {variant}
        </button>
      ))}
    </div>
  );
}
