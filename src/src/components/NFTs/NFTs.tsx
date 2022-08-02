import { useState } from "react";
import css from "./NFTs.module.css";
import useTenkNear from "../../hooks/useTenkNear";
import useAuctionNear from "../../hooks/useAuctionNear";
import { Token } from "../../near/contracts/tenk/index";
import { Sale } from "../../near/contracts/auction/index";
import NFTModal from "../NFTModal/NFTModal";
import { useUserNFTs } from "../../hooks/useUserNFTs";

export const DELIMETER = "||";

export interface TokenSale {
  token: Token;
  sale?: Sale;
}

export const NFTs = () => {
  const [showModal, setShowModal] = useState({
    name: "",
    nftid: "",
    loading: false,
  });

  const { Tenk } = useTenkNear();
  const { Auction } = useAuctionNear();

  const userNFTsQuery = useUserNFTs(Tenk, Auction);
  const { data: nfts = [] } = userNFTsQuery;

  const handleOnClick = (name: string, nftid: string) => {
    setShowModal({ name, nftid, loading: true });
    userNFTsQuery.refetch();
  };

  return (
    <>
      {nfts && nfts?.length > 0 ? (
        <div className={css.nft_header}>
          <div className={css.desc}>
            <a
              href="https://explorer.testnet.near.org/accounts/nft.cheddar.testnet"
              title="Cheddar"
              target="_blank"
              rel="noopener noreferrer"
            >
              Cheddar
            </a>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "center" }}>No NFTs</div>
      )}
      <div className="container">
        <div className="dlion">
          <div></div>
          <div className={css.nft_tokens}>
            <>
              {nfts?.map((nft) => {
                return (
                  <div className={css.nft_token} key={nft.token.token_id}>
                    <img
                      alt="NFT"
                      src={
                        "https://bafybeibghcllcmurku7lxyg4wgxn2zsu5qqk7h4r6bmyhpztmyd564cx54.ipfs.nftstorage.link/" +
                        nft.token.metadata?.media
                      }
                      onClick={(e) =>
                        handleOnClick("NFTDetail", nft.token.token_id)
                      }
                    />
                    <div className={css.nft_token_info}>
                      <b className="title">NFT Id:{nft.token.token_id}</b>
                      {nft.sale ? (
                        <button
                          className="purple"
                          onClick={() =>
                            handleOnClick("AuctionView", nft.token.token_id)
                          }
                        >
                          View Auction
                        </button>
                      ) : (
                        <button
                          className="purple"
                          onClick={() =>
                            handleOnClick("AuctionCreate", nft.token.token_id)
                          }
                        >
                          Create Auction
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          </div>
        </div>
      </div>
      <NFTModal show={showModal} setShow={setShowModal} />
    </>
  );
};
