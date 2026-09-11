// More Info On Custom Documents: https://nextjs.org/docs/advanced-features/custom-document
import Document, { Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(context) {
    const initialProps = await Document.getInitialProps(context);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="UTF-8" />
          <meta name="theme-color" content="#0f172a" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
          <link rel="alternate icon" href="/favicon.ico" />
          <meta property="og:image" content="/static/img/og-preview.svg" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
