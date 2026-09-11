import { getAllProducts } from '../utils/productCatalog';

const SITE_URL = 'https://cart-commerce.vercel.app';

export function generateSiteMap(products = []) {
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/products', priority: '0.9', changefreq: 'daily' },
    { url: '/studio', priority: '0.8', changefreq: 'weekly' },
    { url: '/favorites', priority: '0.6', changefreq: 'weekly' },
    { url: '/cart', priority: '0.5', changefreq: 'weekly' },
    { url: '/checkout', priority: '0.4', changefreq: 'monthly' },
  ];

  const currentDate = new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (page) => `
    <url>
      <loc>${SITE_URL}${page.url}</loc>
      <lastmod>${currentDate}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>`
    )
    .join('')}
  ${products
    .map(
      (product) => `
    <url>
      <loc>${SITE_URL}/products/${product.itemid}</loc>
      <lastmod>${currentDate}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`
    )
    .join('')}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  const products = getAllProducts();
  const sitemap = generateSiteMap(products);

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=86400, stale-while-revalidate=43200'
  );
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default function SiteMap() {
  return null;
}
