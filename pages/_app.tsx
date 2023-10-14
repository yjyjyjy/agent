import 'styles/main.css';
import 'styles/unreset.scss';
import 'styles/chrome-bug.css';
import { useEffect, useState } from 'react';
import React from 'react';

import Layout from 'components/Layout';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { AppProps } from 'next/app';
import { MyUserContextProvider } from 'utils/useUser';
import type { Database } from 'types_db';
import { ToastProvider } from 'react-toast-notifications';
import Hotjar from '@hotjar/browser';

const siteId = 3639162;
const hotjarVersion = 6;

Hotjar.init(siteId, hotjarVersion);

export default function MyApp({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => createPagesBrowserClient<Database>());
  useEffect(() => {
    document.body.classList?.remove('loading');
  }, []);

  return (
    <div className='bg-base-200'>
      <SessionContextProvider supabaseClient={supabaseClient}>
        <MyUserContextProvider>
          <ToastProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ToastProvider>
        </MyUserContextProvider>
      </SessionContextProvider>
    </div>
  );
}
