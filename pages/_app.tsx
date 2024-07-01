
import Head from "next/head";
import "../assets/css/Game.css";
import "../assets/css/Lobby.css";
import "../assets/css/global.css";
import React, { RefObject, useRef } from "react";
import { Socket, io } from "socket.io-client";

function MyApp({ Component, pageProps }) {

  // Manage socket.io websocket
  const socket = useRef<Socket>(io("http://localhost:3000"));


return (
<>
<Head>
// Responsive meta tag
<meta name="viewport" content="width=device-width, initial-scale=1" />
//  bootstrap CDN
</Head>
<Component {...pageProps} socket={socket} />
</>
);
}
export default MyApp;
