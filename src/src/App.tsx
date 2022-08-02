import { Header, Footer, NFTs, Marketplace, Storage } from "./components";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

export function App() {
  const queryClient = new QueryClient();

  return (
    <BrowserRouter>
      <QueryClientProvider client={new QueryClient()}>
        <Header />
        <Routes>
          <Route path="/" element={<NFTs />} />
          <Route path="/myassets/storage" element={<Storage />} />
          <Route path="/marketplace" element={<Marketplace />} />
        </Routes>
        <Footer />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  );
}
