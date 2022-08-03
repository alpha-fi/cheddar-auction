import { Route, Routes } from "react-router-dom";
import useAuctionNear from "../../hooks/useAuctionNear";
import { useSaleNFTs } from "../../hooks/useSaleNFTs";
import useTenkNear from "../../hooks/useTenkNear";
import { useUserNFTs } from "../../hooks/useUserNFTs";
import { Footer } from "../Footer/Footer";
import { Header } from "../Header/Header";
import { Marketplace } from "../Marketplace/Marketplace";
import { NFTs } from "../NFTs/NFTs";
import { Storage } from "../Storage/Storage";

export function Main() {
  const { Tenk } = useTenkNear();
  const { Auction } = useAuctionNear();
  useUserNFTs(Tenk, Auction);
  useSaleNFTs(Tenk, Auction);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<NFTs />} />
        <Route path="/myassets/storage" element={<Storage />} />
        <Route path="/marketplace" element={<Marketplace />} />
      </Routes>
      <Footer />
    </>
  );
}
