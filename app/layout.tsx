'use client';

// import '../assets/css/Game.css';
// import '../assets/css/Lobby.css';
import '../assets/css/global.css';
import 'react-toastify/dist/ReactToastify.css';
import React, {  } from 'react';
import StoreProvider from '../store/StoreProvider';
import Layout from '../features/Layout';
import { ToastContainer } from 'react-toastify';
import { MobileView } from '../features/Layout/MobileView';


interface Props {
 children
}

function MyApp({ children }: Props) {

  return (
    <html>
      <body>
        <StoreProvider>
          <MobileView>
            <Layout>{children}</Layout>
            <ToastContainer />
          </MobileView>
        </StoreProvider>
      </body>
    </html>
  );
}
export default MyApp;
