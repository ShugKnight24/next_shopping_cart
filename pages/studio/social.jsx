import Head from 'next/head';
import { SocialStudio } from '../../Components/Studio/SocialStudio';

export default function SocialStudioPage() {
  return (
    <>
      <Head>
        <title>Social Media Creation Studio | Cart Commerce</title>
        <meta
          name="description"
          content="Generate high-converting marketing posts for Instagram, TikTok, Twitter/X, and Pinterest. 1-click product catalog import and export print-ready assets."
        />
        <link
          rel="canonical"
          href="https://next-shopping-cart-shugknight24.vercel.app/studio/social"
        />
      </Head>

      <main style={{ minHeight: '80vh', background: '#f8fafc' }}>
        <SocialStudio />
      </main>
    </>
  );
}
