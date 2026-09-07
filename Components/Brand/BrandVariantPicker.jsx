import { useState } from 'react';
import PropTypes from 'prop-types';
import { useBrand, BRAND_VARIANTS } from './BrandContext';
import { Logo } from '../Logo';
import { LegacyLogo } from '../Legacy/LegacyLogo';
import { useToast } from '../UI/Toast';
import styles from './BrandVariantPicker.module.css';

/**
 * BrandVariantPickerModal
 * Full modal for exploring the 3 modern logo variants, toggling preview themes,
 * comparing against the legacy logo, and selecting the store's active brand.
 */
export function BrandVariantPickerModal({ isOpen, onClose }) {
  const { variant: activeVariant, setVariant } = useBrand();
  const [previewTheme, setPreviewTheme] = useState('light');
  const toast = useToast();

  if (!isOpen) return null;

  const handleSelect = (variantId) => {
    setVariant(variantId);
    const msg = `Active brand set to: ${BRAND_VARIANTS[variantId].name}`;
    if (toast?.success) {
      toast.success(msg);
    } else if (toast?.addToast) {
      toast.addToast({ message: msg, type: 'success' });
    }
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="brandModalTitle"
    >
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleGroup}>
            <h2 id="brandModalTitle" className={styles.modalTitle}>
              Brand Identity &amp; Logo System
            </h2>
            <p className={styles.modalSubtitle}>
              Explore our 4 brand aesthetic variants and select your preferred style for the store.
            </p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close brand modal"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          {/* Controls Bar: Theme Switcher */}
          <div className={styles.controlsBar}>
            <div className={styles.modeToggleGroup}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                Preview Canvas:
              </span>
              <button
                type="button"
                className={`${styles.themeButton} ${previewTheme === 'light' ? styles.themeButtonActive : ''}`}
                onClick={() => setPreviewTheme('light')}
              >
                Light Theme
              </button>
              <button
                type="button"
                className={`${styles.themeButton} ${previewTheme === 'dark' ? styles.themeButtonActive : ''}`}
                onClick={() => setPreviewTheme('dark')}
              >
                Dark Theme
              </button>
            </div>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Active Brand: <strong>{BRAND_VARIANTS[activeVariant]?.name}</strong>
            </span>
          </div>

          {/* 3 Modern Variants Grid */}
          <div className={styles.gridVariants}>
            {Object.values(BRAND_VARIANTS).map((v) => {
              const isActive = activeVariant === v.id;
              return (
                <div
                  key={v.id}
                  className={`${styles.variantCard} ${isActive ? styles.variantCardActive : ''}`}
                >
                  {isActive && (
                    <span className={styles.activeBadge}>Active Store Brand</span>
                  )}
                  <div className={styles.variantHeader}>
                    <span className={styles.variantTag}>{v.badge}</span>
                    <h3 className={styles.variantName}>{v.name}</h3>
                  </div>

                  {/* Logo Preview Canvas */}
                  <div
                    className={`${styles.logoPreviewBox} ${
                      previewTheme === 'dark' ? styles.previewDark : styles.previewLight
                    }`}
                  >
                    <Logo
                      variant={v.id}
                      theme={previewTheme}
                      style={{ maxWidth: '240px', width: '100%' }}
                    />
                  </div>

                  <p className={styles.variantDesc}>{v.description}</p>

                  <button
                    type="button"
                    className={`${styles.selectButton} ${
                      isActive ? styles.selectButtonActive : styles.selectButtonInactive
                    }`}
                    onClick={() => handleSelect(v.id)}
                    disabled={isActive}
                  >
                    {isActive ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Currently Active
                      </>
                    ) : (
                      'Set as Active Brand'
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Archived Legacy Comparison */}
          <div className={styles.legacySection}>
            <div className={styles.legacyInfo}>
              <h4>Legacy 2020 Asset Archive</h4>
              <p>
                Original cyan and red cloud logo preserved for archival reference in{' '}
                <code>public/static/img/legacy/logo.svg</code>.
              </p>
            </div>
            <div className={styles.legacyLogoBox}>
              <LegacyLogo />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

BrandVariantPickerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

/**
 * Floating Quick Switcher Pill
 * Unobtrusive floating trigger on the page to quickly view and switch brand variants.
 */
export function BrandQuickSwitcherPill({ onOpen }) {
  const { currentInfo } = useBrand();

  return (
    <button
      type="button"
      className={styles.floatingSwitcherPill}
      onClick={onOpen}
      aria-label="Customize Brand Identity"
      title="Customize Brand Identity & Logo Variant"
    >
      <span className={styles.pillSparkle}>✦</span>
      <span>Brand Style:</span>
      <span className={styles.pillVariantBadge}>{currentInfo.name}</span>
    </button>
  );
}

BrandQuickSwitcherPill.propTypes = {
  onOpen: PropTypes.func.isRequired,
};
