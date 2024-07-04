
import '../assets/css/Game.css';
import '../assets/css/Lobby.css';
import '../assets/css/global.css';
import React, {  } from 'react';
import StoreProvider from '../store/StoreProvider';
import Layout from '../features/Layout';

interface Props {
  Component: any;
  pageProps: any;
}

function MyApp({ Component, pageProps }: Props) {

  return (
    <StoreProvider>
      <Layout Component={Component} pageProps={pageProps} />
    </StoreProvider>
  );
}
export default MyApp;
