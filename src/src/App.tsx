import { Header, Footer, NFTs, Marketplace, Storage, Main } from "./components";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import useTenkNear from "./hooks/useTenkNear";
import useAuctionNear from "./hooks/useAuctionNear";
import { useSaleNFTs } from "./hooks/useSaleNFTs";
import { useUserNFTs } from "./hooks/useUserNFTs";

export function App() {
  const queryClient = new QueryClient();

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Main />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  );
}
