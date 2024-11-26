// More Info On Custom Documents: https://nextjs.org/docs/advanced-features/custom-document
import Document, { Head, Html, Main, NextScript } from 'next/document';
import Script from 'next/script';

class MyDocument extends Document {
  static async getInitialProps(context) {
    const initialProps = await Document.getInitialProps(context);
    return { ...initialProps };
  }

  render() {
    const googleID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

    return (
      <Html lang="en">
        <Head>
          <meta charSet="UTF-8" />
          <link
            rel="stylesheet"
            href="https://pro.fontawesome.com/releases/v5.15.4/css/all.css"
          />
          <link rel="stylesheet" href="../static/normalize.css" />
          {/* Global Site Tag (gtag.js) - Google Analytics */}
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${googleID}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleID}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
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
