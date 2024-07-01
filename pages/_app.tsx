
import Head from "next/head";
import "../assets/css/Game.css";
import "../assets/css/Lobby.css";
import "../assets/css/global.css";
import React from "react";

function MyApp({ Component, pageProps }) {
return (
<>
<Head>
// Responsive meta tag
<meta name="viewport" content="width=device-width, initial-scale=1" />
//  bootstrap CDN
</Head>
<Component {...pageProps} />
</>
);
}
export default MyApp;
