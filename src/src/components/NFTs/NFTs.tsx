import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import css from "./NFTs.module.css";
import useTenkNear from "../../hooks/useTenkNear";
import useAuctionNear from "../../hooks/useAuctionNear";
import { TenkContract, Token } from "../../near/contracts/tenk/index";
import { Sale } from "../../near/contracts/auction/index";
import {
  AUCTION_CONTRACT_ACCOUNT,
  TENK_CONTRACT_ACCOUNT,
} from "../Constants/Contracts";

export const DELIMETER = "||";

export interface TokenSale {
  token: Token;
  sale?: Sale;
}

export const NFTs = () => {
  const navigate = useNavigate();

  const { Tenk } = useTenkNear();
  const { Auction } = useAuctionNear();

  const [nfts, setNFTs] = useState<TokenSale[]>();

  // at first load, auto-submit if required arguments are fill in
  useEffect(() => {
    const getNFTs = async () => {
      const args = {
        account_id: Tenk?.account.accountId,
        from_index: "0",
        limit: 50,
      };
      const res: Token[] = await Tenk?.account.viewFunction(
        Tenk.contractId,
        "nft_tokens_for_owner",
        args
      );
      if (res) {
        const token_sales: TokenSale[] = [];
        for (let i = 0; i < res.length; i++) {
          const sale: Sale = await getSaleForNFT(res[i].token_id);
          const token_sale = {
            token: res[i],
            sale: sale,
          };
          token_sales.push(token_sale);
        }
        setNFTs(token_sales);
        console.log(token_sales);
      }
    };
    getNFTs();
  }, [Tenk]);

  const getSaleForNFT = async (nftid: string) => {
    const nft_contract_token = TENK_CONTRACT_ACCOUNT + DELIMETER + nftid;
    const args = { nft_contract_token: nft_contract_token };
    console.log("args", args, Auction);

    const res: Sale = await Auction?.account.viewFunction(
      AUCTION_CONTRACT_ACCOUNT,
      "get_sale",
      args
    );
    console.log(res);
    return res;
  };

  const goToDetail = (nftid: string): void => {
    navigate(`/myassets/asset/${nftid}`);
  };

  console.log(nfts);
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
      <div style={{ width: "100%", minHeight: "450px" }}>
        <div className="dlion">
          <div></div>
          <div className={css.nft_tokens}>
            <>
              {nfts?.map((nft) => {
                return (
                  <div className={css.nft_token}>
                    <img
                      alt="NFT"
                      src={
                        "https://bafybeibghcllcmurku7lxyg4wgxn2zsu5qqk7h4r6bmyhpztmyd564cx54.ipfs.nftstorage.link/" +
                        nft.token.metadata?.media
                      }
                      onClick={(e) => goToDetail(nft.token.token_id)}
                    />
                    <div className={css.nft_token_info}>
                      <b className="title">NFT Id:{nft.token.token_id}</b>
                      {nft.sale ? (
                        <button
                          className="secondary"
                          onClick={(e) =>
                            navigate(`/marketplace/view/${nft.token.token_id}`)
                          }
                        >
                          View Auction
                        </button>
                      ) : (
                        <button
                          className="secondary"
                          onClick={(e) =>
                            navigate(`/myassets/auction/${nft.token.token_id}`)
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
    </>
  );
};
