// More Info On Custom Documents: https://nextjs.org/docs/advanced-features/custom-document
import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
	static async getInitialProps(context) {
		const initialProps = await Document.getInitialProps(context)
		return { ...initialProps }
	}
	
	render() {
		const googleID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

		return (
			<Html lang="en">
				{/* Global Site Tag (gtag.js) - Google Analytics */}
				<script
					async
					src={`https://www.googletagmanager.com/gtag/js?id=${ googleID }`}
				/>
				<script
					dangerouslySetInnerHTML={{
						__html: `
							window.dataLayer = window.dataLayer || [];
							function gtag(){dataLayer.push(arguments);}
							gtag('js', new Date());
							gtag('config', '${ googleID }', {
								page_path: window.location.pathname,
							});
						`,
					}}
				/>
				<Head />
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		)
	}
}

export default MyDocument