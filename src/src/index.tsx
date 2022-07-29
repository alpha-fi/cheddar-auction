import React from "react";
import ReactDOM from "react-dom";
import {
  Contract,
  Home,
  Main,
  Header,
  Footer,
  NFTs,
  Marketplace,
  NFTDetail,
  AuctionCreate,
  AuctionView,
  AuctionBid,
  Storage,
} from "./components";
import { HashRouter, Routes, Route, BrowserRouter } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<NFTs />} />
        <Route path="/myassets/storage" element={<Storage />} />
        <Route path="/marketplace" element={<Marketplace />} />
        {/* 
        <Route path="/myassets/asset/:nftid" element={<NFTDetail />} />
        <Route path="/myassets/auction/:nftid" element={<AuctionCreate />} />
        <Route path="/marketplace/view/:nftid" element={<AuctionView />} />
        <Route path="/marketplace/placebid/:nftid" element={<AuctionBid />} />
        <Route path="/main" element={<Main />} />
        <Route path="/:contractType/:method" element={<Contract />} />
        <Route path="/:contractType/:method" element={<Contract />} /> 
        */}
      </Routes>
    </BrowserRouter>
    <Footer />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
