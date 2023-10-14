import Document, { Head, Html, Main, NextScript } from 'next/document';
import Script from 'next/script';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <Script strategy="beforeInteractive" src="https://cdn.tolt.io/tolt.js" data-tolt="07e3abb5-a97b-453d-b28e-d5dbddcca064" />
        </Head>
        <body className="loading ">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
