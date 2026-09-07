import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useBrand, BRAND_VARIANTS } from '../Components/Brand/BrandContext';
import { Logo } from '../Components/Logo';
import { LegacyLogo } from '../Components/Legacy/LegacyLogo';
import { useToast } from '../Components/UI/Toast';

export default function BrandPage() {
  const { variant: activeVariant, setVariant } = useBrand();
  const [previewTheme, setPreviewTheme] = useState('light');
  const toast = useToast();

  const handleSelectVariant = (variantId) => {
    setVariant(variantId);
    const msg = `Active brand updated to: ${BRAND_VARIANTS[variantId].name}! All headers, footers & logos updated.`;
    if (toast?.success) {
      toast.success(msg);
    } else if (toast?.addToast) {
      toast.addToast({ message: msg, type: 'success' });
    }
  };

  return (
    <>
      <Head>
        <title>Brand Identity &amp; Logo System | Cart Commerce</title>
        <meta
          name="description"
          content="Explore the diverse visual identity and logo variants for Cart Commerce: Sleek Modern, Soviet Constructivist, Dark & Edgy, and Lighthearted Pop."
        />
        <meta property="og:title" content="Brand Identity | Cart Commerce" />
        <meta
          property="og:description"
          content="Modern luxury branding, vector marks, and design system."
        />
        <meta property="og:image" content="/static/img/og-preview.svg" />
      </Head>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
        {/* Breadcrumb navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#64748b', marginBottom: '1.5rem' }}>
          <Link href="/" style={{ color: '#0284c7', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>Brand Identity</span>
        </div>

        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span
            style={{
              display: 'inline-block',
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#b45309',
              fontSize: '0.8rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              marginBottom: '1rem',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            Design System &bull; 2026 Brand Refresh
          </span>
          <h1
            style={{
              fontSize: '2.75rem',
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-0.03em',
              margin: '0 0 1rem 0',
            }}
          >
            Brand Identity &amp; Logo System
          </h1>
          <p
            style={{
              fontSize: '1.15rem',
              color: '#475569',
              maxWidth: '720px',
              margin: '0 auto 2rem',
              lineHeight: 1.6,
            }}
          >
            A versatile visual identity system for Cart Commerce. Four distinct aesthetic
            variants — Sleek Modern, Soviet Constructivist, Dark &amp; Edgy, and Lighthearted Pop — designed
            for personality, legibility, and effortless theme switching.
          </p>

          {/* Theme preview selector */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#f8fafc',
              padding: '0.4rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', padding: '0 0.5rem' }}>
              Preview Background:
            </span>
            <button
              type="button"
              onClick={() => setPreviewTheme('light')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: previewTheme === 'light' ? '#0f172a' : 'transparent',
                color: previewTheme === 'light' ? '#ffffff' : '#475569',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Light Storefront
            </button>
            <button
              type="button"
              onClick={() => setPreviewTheme('dark')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: previewTheme === 'dark' ? '#0f172a' : 'transparent',
                color: previewTheme === 'dark' ? '#ffffff' : '#475569',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Dark Editorial
            </button>
          </div>
        </div>

        {/* 4 Variants Presentation Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '1.75rem',
            marginBottom: '4rem',
          }}
        >
          {Object.values(BRAND_VARIANTS).map((variant) => {
            const isActive = activeVariant === variant.id;
            return (
              <div
                key={variant.id}
                style={{
                  border: isActive ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '2rem',
                  background: '#ffffff',
                  boxShadow: isActive
                    ? '0 16px 32px -8px rgba(245, 158, 11, 0.25)'
                    : '0 4px 12px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* Active Store Brand Tag */}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '1.25rem',
                      right: '1.25rem',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '9999px',
                      boxShadow: '0 2px 6px rgba(217, 119, 6, 0.3)',
                    }}
                  >
                    Active Store Brand
                  </div>
                )}

                <div style={{ marginBottom: '1.25rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#d97706',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {variant.badge}
                  </span>
                  <h2
                    style={{
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      margin: '0.25rem 0 0',
                    }}
                  >
                    {variant.name}
                  </h2>
                </div>

                {/* Logo Preview Stage */}
                <div
                  style={{
                    background:
                      previewTheme === 'dark'
                        ? 'linear-gradient(180deg, #112233 0%, #0d1a29 100%)'
                        : '#ffffff',
                    border:
                      previewTheme === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.08)'
                        : '1px solid #f1f5f9',
                    borderRadius: '14px',
                    padding: '2rem 1.5rem',
                    minHeight: '130px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    boxShadow:
                      previewTheme === 'light'
                        ? 'inset 0 2px 4px rgba(0, 0, 0, 0.02)'
                        : 'none',
                  }}
                >
                  <Logo
                    variant={variant.id}
                    theme={previewTheme}
                    style={{ maxWidth: '280px', width: '100%' }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem', flexGrow: 1 }}>
                  <p
                    style={{
                      fontSize: '0.92rem',
                      color: '#475569',
                      lineHeight: 1.6,
                      margin: '0 0 1rem 0',
                    }}
                  >
                    {variant.description}
                  </p>
                  <div
                    style={{
                      background: '#f8fafc',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      color: '#64748b',
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      Typography &amp; Subtitle:
                    </div>
                    <div>Line 1: <code>CART COMMERCE</code> (Bold 800, tracking 0.14em)</div>
                    <div>Line 2: <code>{variant.subtitle}</code> (Gold 700, tracking 0.28em)</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectVariant(variant.id)}
                  disabled={isActive}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: isActive ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    border: 'none',
                    background: isActive
                      ? '#f1f5f9'
                      : 'linear-gradient(135deg, #0f172a, #1e293b)',
                    color: isActive ? '#0f172a' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: isActive
                      ? 'none'
                      : '0 4px 14px rgba(15, 23, 42, 0.2)',
                  }}
                >
                  {isActive ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Currently Selected for Store
                    </>
                  ) : (
                    'Select This Variant for Store'
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Brand Touchpoints: Favicon, Touch Icon, Social Banner */}
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            padding: '2.5rem',
            marginBottom: '4rem',
          }}
        >
          <div style={{ marginBottom: '2rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#0284c7',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Multi-Surface Consistency
            </span>
            <h2
              style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: '0.25rem 0 0.5rem',
              }}
            >
              Icons &amp; Social Previews
            </h2>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
              All brand marks scale gracefully from 16px browser tabs to 1200px editorial social banners.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '2rem',
              alignItems: 'center',
            }}
          >
            {/* Favicon Preview */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <img
                  src="/favicon.svg"
                  alt="Cart Commerce Favicon"
                  width="64"
                  height="64"
                />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
                Vector Favicon
              </h3>
              <code style={{ fontSize: '0.78rem', color: '#64748b' }}>
                /favicon.svg (64&times;64)
              </code>
            </div>

            {/* Apple Touch Icon Preview */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  margin: '0 auto 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
                }}
              >
                <img
                  src="/apple-touch-icon.svg"
                  alt="Apple Touch Icon"
                  width="90"
                  height="90"
                />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
                Apple Touch Icon
              </h3>
              <code style={{ fontSize: '0.78rem', color: '#64748b' }}>
                /apple-touch-icon.svg (180&times;180)
              </code>
            </div>

            {/* OpenGraph Preview */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '220px',
                  margin: '0 auto 1rem',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <img
                  src="/static/img/og-preview.svg"
                  alt="OpenGraph Preview Banner"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
                OpenGraph Social Card
              </h3>
              <code style={{ fontSize: '0.78rem', color: '#64748b' }}>
                /static/img/og-preview.svg (1200&times;630)
              </code>
            </div>
          </div>
        </div>

        {/* Legacy Archive Section */}
        <div
          style={{
            border: '1px dashed #cbd5e1',
            borderRadius: '16px',
            padding: '2rem',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '2rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ maxWidth: '520px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#64748b',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Archival Asset Protection
            </span>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#334155',
                margin: '0.25rem 0 0.5rem',
              }}
            >
              Original Legacy 2020 Brand Assets
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
              The legacy cyan/red cloud logo is preserved in{' '}
              <code>public/static/img/legacy/logo.svg</code> and can be rendered at any time via{' '}
              <code>Components/Legacy/LegacyLogo.jsx</code>.
            </p>
          </div>
          <div style={{ maxWidth: '240px', width: '100%', opacity: 0.85 }}>
            <LegacyLogo />
          </div>
        </div>
      </div>
    </>
  );
}
