import Link from 'next/link';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { LegacyLogo } from '../Legacy/LegacyLogo';
import { Logo } from '../Logo';
import { useToast } from '../UI/Toast';
import { BRAND_VARIANTS, useBrand } from './BrandContext';
import { BrandMark } from './BrandMark';
import styles from './BrandVariantPicker.module.css';

/**
 * BrandVariantPickerModal
 * Pick which expression of the cart mark the store wears. Every option is
 * the same chrome-and-gold cart; the preview canvas toggles light and dark.
 */
export function BrandVariantPickerModal({ isOpen, onClose }) {
  const { variant: activeVariant, setVariant } = useBrand();
  const [previewTheme, setPreviewTheme] = useState('light');
  const toast = useToast();
  const contentRef = useRef(null);
  useFocusTrap(contentRef, isOpen);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

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

  const modal = (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="brandModalTitle"
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderMark}>
            <BrandMark size={44} title="Cart Commerce" />
          </div>
          <div className={styles.modalTitleGroup}>
            <h2 id="brandModalTitle" className={styles.modalTitle}>
              Brand Identity &amp; Logo System
            </h2>
            <p className={styles.modalSubtitle}>
              One chrome-and-gold cart, five grounds. Choose the one the store
              wears in its header and footer.
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

        <div className={styles.modalBody}>
          <div className={styles.controlsBar}>
            <div
              className={styles.modeToggleGroup}
              role="group"
              aria-label="Preview canvas"
            >
              <button
                type="button"
                aria-pressed={previewTheme === 'light'}
                className={`${styles.themeButton} ${previewTheme === 'light' ? styles.themeButtonActive : ''}`}
                onClick={() => setPreviewTheme('light')}
              >
                Light Theme
              </button>
              <button
                type="button"
                aria-pressed={previewTheme === 'dark'}
                className={`${styles.themeButton} ${previewTheme === 'dark' ? styles.themeButtonActive : ''}`}
                onClick={() => setPreviewTheme('dark')}
              >
                Dark Theme
              </button>
            </div>
            <span className={styles.activeLabel}>
              Active: <strong>{BRAND_VARIANTS[activeVariant]?.name}</strong>
            </span>
          </div>

          <div className={styles.gridVariants}>
            {Object.values(BRAND_VARIANTS).map((v) => {
              const isActive = activeVariant === v.id;
              return (
                <div
                  key={v.id}
                  className={`${styles.variantCard} ${isActive ? styles.variantCardActive : ''}`}
                >
                  <div
                    className={`${styles.logoPreviewBox} ${
                      previewTheme === 'dark'
                        ? styles.previewDark
                        : styles.previewLight
                    }`}
                  >
                    <Logo
                      variant={v.id}
                      theme={previewTheme}
                      className={styles.previewLogo}
                    />
                  </div>

                  <div className={styles.variantHeader}>
                    <span className={styles.variantTag}>{v.badge}</span>
                    <h3 className={styles.variantName}>{v.name}</h3>
                  </div>
                  <p className={styles.variantDesc}>{v.usage}</p>

                  <button
                    type="button"
                    className={`${styles.selectButton} ${
                      isActive
                        ? styles.selectButtonActive
                        : styles.selectButtonInactive
                    }`}
                    onClick={() => handleSelect(v.id)}
                    disabled={isActive}
                  >
                    {isActive ? (
                      <>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
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

          <div className={styles.footerRow}>
            <div className={styles.legacySection}>
              <div className={styles.legacyLogoBox}>
                <LegacyLogo />
              </div>
              <p>
                2020 logo, archived in{' '}
                <code>public/static/img/legacy/logo.svg</code>
              </p>
            </div>
            <Link
              href="/brand"
              className={styles.guidelinesLink}
              onClick={onClose}
            >
              Full brand guidelines &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  // Portal to <body> so the dialog escapes the sticky header's stacking
  // context and sits above floating UI.
  return typeof document === 'undefined'
    ? modal
    : createPortal(modal, document.body);
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
  const { variant, currentInfo } = useBrand();

  return (
    <button
      type="button"
      className={styles.floatingSwitcherPill}
      onClick={onOpen}
      // No aria-label: the visible "Brand Style: <name>" is the name, so
      // voice control users can say what they see.
      title="Customize Brand Identity & Logo Variant"
    >
      <BrandMark variant={variant} theme="dark" size={20} title="" />
      <span>Brand Style:</span>
      <span className={styles.pillVariantBadge}>{currentInfo.name}</span>
    </button>
  );
}

BrandQuickSwitcherPill.propTypes = {
  onOpen: PropTypes.func.isRequired,
};
