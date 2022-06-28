import React from "react";
import ReactDOM from "react-dom";
import { Contract, Home, Main, Header, Footer, NFTs, Marketplace, NFTDetail, CreateAuction } from "./components"
import { HashRouter, Routes, Route, BrowserRouter } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Header/>
      <Routes>
        <Route path="/" element={<NFTs />} />
        <Route path="/marketplace" element={<Marketplace />}/>
        <Route path="/asset/:nftid" element={<NFTDetail />} />
        <Route path="/auction/:nftid" element={<CreateAuction />} />
        {/* <Route path="/main" element={<Main />} />
        <Route path="/:contractType/:method" element={<Contract />} />
        <Route path="/:contractType/:method" element={<Contract />} /> */}
      </Routes>
    </BrowserRouter>
    <Footer/>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
