import { describe, expect, it } from 'vitest';
import { generateSiteMap } from '../pages/sitemap.xml';

describe('SEO & Dynamic XML Sitemap', () => {
  const mockProducts = [
    { itemid: 'JORDAN-4-BRED-REIM' },
    { itemid: 'SONY-WH1000XM5' },
    { itemid: 'CHARIZARD-1ST-ED' },
  ];

  it('generates a valid XML sitemap with XML declaration and urlset namespace', () => {
    const sitemap = generateSiteMap(mockProducts);

    expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(sitemap).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    );
  });

  it('indexes all static routes with appropriate priority', () => {
    const sitemap = generateSiteMap(mockProducts);

    expect(sitemap).toContain('<loc>https://cart-commerce.vercel.app</loc>');
    expect(sitemap).toContain(
      '<loc>https://cart-commerce.vercel.app/products</loc>'
    );
    expect(sitemap).toContain(
      '<loc>https://cart-commerce.vercel.app/favorites</loc>'
    );
    expect(sitemap).toContain(
      '<loc>https://cart-commerce.vercel.app/cart</loc>'
    );
    expect(sitemap).toContain(
      '<loc>https://cart-commerce.vercel.app/checkout</loc>'
    );
  });

  it('generates dynamic product URLs for each catalog item', () => {
    const sitemap = generateSiteMap(mockProducts);

    expect(sitemap).toContain(
      '<loc>https://cart-commerce.vercel.app/products/JORDAN-4-BRED-REIM</loc>'
    );
    expect(sitemap).toContain(
      '<loc>https://cart-commerce.vercel.app/products/SONY-WH1000XM5</loc>'
    );
    expect(sitemap).toContain(
      '<loc>https://cart-commerce.vercel.app/products/CHARIZARD-1ST-ED</loc>'
    );
    expect(sitemap).toContain('<changefreq>weekly</changefreq>');
    expect(sitemap).toContain('<priority>0.8</priority>');
  });
});
