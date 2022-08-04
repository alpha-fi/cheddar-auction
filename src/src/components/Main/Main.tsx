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
  const userNFTsQuery = useUserNFTs(Tenk, Auction);
  const saleNFTsQuery = useSaleNFTs(Tenk, Auction);

  return (
    <>
      <Header />
      <Routes>
        <Route
          path="/myassets"
          element={<NFTs userNFTsQuery={userNFTsQuery} />}
        />
        <Route path="/myassets/storage" element={<Storage />} />
        <Route
          path="/"
          element={<Marketplace saleNFTsQuery={saleNFTsQuery} />}
        />
      </Routes>
      <Footer />
    </>
  );
}
