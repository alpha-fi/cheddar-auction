import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import css from "../NFTs/NFTs.module.css";
import useTenkNear from "../../hooks/useTenkNear";
import useAuctionNear from "../../hooks/useAuctionNear";
import { TenkContract, Token } from "../../near/contracts/tenk/index";
import { Sale } from "../../near/contracts/auction/index";
import { TokenSale, DELIMETER } from "../NFTs/NFTs";
import {
  AUCTION_CONTRACT_ACCOUNT,
  TENK_CONTRACT_ACCOUNT,
} from "../Constants/Contracts";

const ONE_DAY = 1000 * 60 * 60 * 24;

export const Marketplace = () => {
  const navigate = useNavigate();

  const { Tenk } = useTenkNear();
  const { Auction } = useAuctionNear();

  const [nfts, setNFTs] = useState<TokenSale[]>();
  const [timeLeft, setTimeLeft] = useState<String[]>();

  // at first load, auto-submit if required arguments are fill in
  useEffect(() => {
    const getAuctions = async () => {
      const args = {
        nft_contract_id: TENK_CONTRACT_ACCOUNT,
        from_index: "0",
        limit: 50,
      };

      const res = await Auction?.account.viewFunction(
        AUCTION_CONTRACT_ACCOUNT,
        "get_sales_by_nft_contract_id",
        args
      );
      if (res) {
        console.log(res);
        const token_sales: TokenSale[] = [];
        for (let i = 0; i < res.length; i++) {
          const nft = await getNFT(res[i].token_id);
          const token_sale = {
            sale: res[i],
            token: nft,
          };
          token_sales.push(token_sale);
        }
        setNFTs(token_sales);
        console.log(token_sales);
      }
    };
    getAuctions();
  }, [Tenk]);

  useEffect(() => {
    const timeoutId = setTimeout(step, 1000);
    return () => {
      clearTimeout(timeoutId);
    };
  });

  function step() {
    // const nowTime = (new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)).getTime();
    const nowTime = new Date().getTime();
    const lefts: string[] = [];
    for (let i = 0; i < nfts?.length!; i++) {
      const end_at = nfts![i].sale?.end_at;
      if (end_at) {
        const remaining = parseInt(end_at) - nowTime;

        let left = "Ended";
        if (remaining > 0) {
          const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
          const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((remaining / 1000 / 60) % 60);
          const seconds = Math.floor((remaining / 1000) % 60);

          if (days > 0)
            left =
              days +
              "Days " +
              hours +
              " Hours " +
              minutes +
              " Minutes " +
              seconds +
              " Seconds";
          else
            left =
              hours + " Hours " + minutes + " Minutes " + seconds + " Seconds";
        }

        lefts.push(left);
      }
    }
    setTimeLeft(lefts);
  }

  const getNFT = async (nftid: string) => {
    const args = { token_id: nftid };
    const res: Sale = await Tenk?.account.viewFunction(
      Tenk.contractId,
      "nft_token",
      args
    );
    return res;
  };

  const goToDetail = (nftid: string) => {
    navigate(`/myassets/asset/${nftid}`);
  };

  return (
    <>
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
      <div style={{ width: "100%", minHeight: "450px" }}>
        <div className="dlion">
          <div className={css.nft_tokens}>
            <>
              {nfts?.map((nft, index) => {
                return (
                  <div className={css.nft_token} key={nft.token.token_id}>
                    <img
                      alt="NFT"
                      src={
                        "https://bafybeibghcllcmurku7lxyg4wgxn2zsu5qqk7h4r6bmyhpztmyd564cx54.ipfs.nftstorage.link/" +
                        nft.token.metadata?.media
                      }
                      onClick={(e) => goToDetail(nft.token.token_id)}
                    />
                    <div className={css.nft_token_info}>
                      <div style={{ display: "flex" }}>
                        <div>
                          <b className="title">NFT Id: {nft.token.token_id}</b>
                          <br />
                          {timeLeft && (
                            <>
                              <b className="title">{timeLeft![index]}</b>
                              <br />
                            </>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex" }}>
                        {timeLeft &&
                          timeLeft![index] != "Ended" &&
                          nft.token.owner_id != Tenk?.account.accountId && (
                            <button
                              className="secondary"
                              onClick={(e) =>
                                navigate(
                                  `/marketplace/placebid/${nft.token.token_id}`
                                )
                              }
                            >
                              Place Bid
                            </button>
                          )}
                        {timeLeft && timeLeft![index] == "Ended" && (
                          <button
                            className="secondary"
                            onClick={(e) =>
                              navigate(
                                `/marketplace/view/${nft.token.token_id}`
                              )
                            }
                          >
                            View Auction
                          </button>
                        )}
                      </div>
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
