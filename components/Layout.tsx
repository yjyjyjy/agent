import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from 'components/ui/Navbar';
import Footer from 'components/ui/Footer';
import { ReactNode } from 'react';
import { PageMeta } from '../types';

interface Props {
  children: ReactNode;
  meta?: PageMeta;
}

export default function Layout({ children, meta: pageMeta }: Props) {
  const router = useRouter();
  const meta = {
    title: 'Connect creators with their fans',
    description: 'Build communities for creators to engage their fans and earn a living doing what they love.',
    cardImage: '/og.jpg',
    ...pageMeta
  };

  return (
    <>

      <Head>
        <title>{meta.title}</title>
        <meta name="robots" content="follow, index" />
        {/* <link href="/favicon.ico" rel="shortcut icon" /> */}
        <link rel='icon' href='/favicon.svg' sizes='any' type='image/svg+xml' />
        <meta content={meta.description} name="description" />
        <meta property="og:url" content={`https://subscription-starter.vercel.app${router.asPath}`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:image" content={meta.cardImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@vercel" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={meta.cardImage} />
      </Head>
      <Navbar />
      <main id="skip">{children}</main>
      {/* <Footer /> */}
    </>
  );
}
