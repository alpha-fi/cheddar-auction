import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import BN from "bn.js";
import useTenkNear from "../../hooks/useTenkNear";
import useAuctionNear from "../../hooks/useAuctionNear";
import { Token } from "../../near/contracts/tenk/index";
import { Bid, Sale, SaleView } from "../../near/contracts/auction/index";
import css from "../NFTDetail/NFTDetail.module.css";
import { DELIMETER } from "../NFTs/NFTs";
import * as nearAPI from "near-api-js";
import { nft_tokens } from "../NFTs/NFTs.module.css";
import { FT_CONTRACT_ACCOUNT } from "../Constants/Contracts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ShowModal } from "../Marketplace/Marketplace";
import useScreenSize from "../../hooks/useScreenSize";
import Spinner from "../Spinner/Spinner";
import { isValidAmountInput } from "../../helpers";
const {
  utils: {
    format: { parseNearAmount },
  },
} = nearAPI;

interface TokenSale {
  token: Token;
  sale?: SaleView;
  nftsName: string;
}

type Props = {
  show: ShowModal;
  setShow: React.Dispatch<React.SetStateAction<ShowModal>>;
};

export const AuctionBid = ({ show, setShow }: Props) => {
  const { Tenk } = useTenkNear();
  const { Auction, signIn } = useAuctionNear();
  const { width } = useScreenSize();
  const accountLength = width > 992 ? 35 : 20;

  const [nft, setNFT] = useState<TokenSale>();
  const [price, setPrice] = useState<string>("1");
  const [timeLeft, setTimeLeft] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const getNFTs = async () => {
      if (show.nft?.sale) {
        const sale = show.nft.sale;
        if (sale?.bids) {
          let bids = new Map(Object.entries(sale.bids));
          console.log(bids);
          const sale_view: SaleView = {
            bids: bids.get(sale.ft_token_type),
            created_at: sale.created_at,
            end_at: sale.end_at,
            price: sale.price / Math.pow(10, 24),
            ft_token_type: sale.ft_token_type,
          };

          const token_sale = {
            token: show.nft.token,
            sale: sale_view,
            nftsName: show.nft.nftsName,
          };
          if (sale_view.bids) {
            setPrice(
              (
                parseFloat(sale_view.bids[sale_view.bids.length - 1].price) /
                  Math.pow(10, 24) +
                0.05
              ).toString()
            );
          } else {
            setPrice((sale.price / Math.pow(10, 24) + 0.05).toString());
          }
          setNFT(token_sale);
        } else {
          setNFT({ token: show.nft.token, nftsName: show.nft.nftsName });
          setPrice((sale.price / Math.pow(10, 24) + 0.05).toString());
        }
      }
    };
    getNFTs();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(step, 1000);
    return () => {
      clearTimeout(timeoutId);
    };
  });

  function step() {
    // const nowTime = (new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)).getTime();
    const nowTime = new Date().getTime();
    const end_at = nft?.sale?.end_at;
    if (end_at) {
      const remaining = parseInt(end_at) - nowTime;

      let left = "Ended";
      if (remaining > 0) {
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((remaining / 1000 / 60) % 60);
        const seconds = Math.floor((remaining / 1000) % 60);
        if (width >= 992) {
          if (days > 0)
            left =
              days +
              " Days " +
              hours +
              " Hours " +
              minutes +
              " Minutes " +
              seconds +
              " Seconds";
          else
            left =
              hours + " Hours " + minutes + " Minutes " + seconds + " Seconds";
        } else {
          if (days > 0) {
            left = `${days} ${days === 1 ? "Day" : "Days"} and ${hours}:${
              minutes < 10 ? "0" + minutes : minutes
            }:${seconds < 10 ? "0" + seconds : seconds}`;
          } else {
            left = `${hours}:${minutes < 10 ? "0" + minutes : minutes}:${
              seconds < 10 ? "0" + seconds : seconds
            }`;
          }
        }
      }
      setTimeLeft(left);
    }
  }

  const placeBid = async () => {
    let current_price = (nft?.sale?.price || 0) * Math.pow(10, 24);
    if (nft?.sale?.bids) {
      current_price = parseInt(nft.sale.bids[nft.sale.bids.length - 1].price);
    }

    if (parseFloat(price) * Math.pow(10, 24) <= current_price!) {
      toast("You can place a bid with less price that current auction price.");
      // console.log("You can place a bid with less price that current auction price.");
    } else if (isNaN(parseFloat(price))) {
      toast("You must place a bid.");
    } else {
      setLoading(true);

      if (nft?.sale?.ft_token_type == "near") {
        const args = {
          token_id: nft.token.token_id,
          offer_price: parseFloat(price) * Math.pow(10, 24),
        };
        const bid_price = parseNearAmount(price);
        const options = {
          gas: new BN("30000000000000"),
          attachedDeposit: new BN(bid_price!),
        };

        const res = await Auction?.offer(args, options);

        console.log(res);
      } else {
        const args = {
          token_id: nft?.token.token_id!,
          amount: parseNearAmount(price)!,
        };
        const options = {
          gas: new BN("50000000000000"),
          attachedDeposit: new BN(1),
        };

        const res = await Auction?.offer_cheddar(args, options);
      }
    }
  };

  const signInWhitSpinner = () => {
    if (signIn) {
      setLoading(true);
      signIn();
    }
  };

  const handleImgOnLoad = () => {
    setShow((prev) => {
      return {
        ...prev,
        loading: false,
      };
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isValidAmountInput(e.target.value)) {
      setPrice(e.target.value);
    }
  };

  return (
    <>
      <div>
        <div>
          <div
            className={css.nft_container}
            style={{ display: show.loading ? "none" : "flex" }}
          >
            <div className={css.nft_token}>
              <img
                onLoad={handleImgOnLoad}
                alt="NFT"
                src={
                  "https://bafybeibghcllcmurku7lxyg4wgxn2zsu5qqk7h4r6bmyhpztmyd564cx54.ipfs.nftstorage.link/" +
                  nft?.token.metadata?.media
                }
              />
            </div>
            <div className={css.nft_description}>
              <div>
                <>
                  <div>
                    <p style={{ fontSize: "22px" }}>PLACE BID</p>
                  </div>

                  <div>
                    <div>
                      <p>
                        Name: {nft?.nftsName} {nft?.token.token_id}
                      </p>
                    </div>

                    <div>
                      <p>Owner: {nft?.token?.owner_id}</p>
                    </div>

                    {nft?.token.metadata?.description && (
                      <div>
                        <p>Description: {nft?.token.metadata?.description}</p>
                      </div>
                    )}
                    <div>
                      <p>
                        Starting Bid: {nft?.sale?.price?.toFixed(2)}{" "}
                        {nft?.sale?.ft_token_type == "near"
                          ? "NEAR"
                          : "CHEDDAR"}
                      </p>
                    </div>

                    <div>
                      <p>Remaining: {timeLeft}</p>
                    </div>
                  </div>

                  {nft?.sale?.bids && (
                    <div style={{ justifyContent: "flex-start" }}>
                      <p style={{ fontSize: "18px", marginTop: "10px" }}>
                        LAST BID
                      </p>

                      {nft.sale.bids && (
                        <>
                          <p>
                            {(
                              parseInt(
                                nft.sale.bids[nft.sale.bids?.length - 1].price
                              ) / Math.pow(10, 24)
                            ).toFixed(2)}{" "}
                            {nft.sale?.ft_token_type == "near"
                              ? "NEAR"
                              : "CHEDDAR"}
                            {" by "}
                            {nft.sale.bids[nft.sale.bids?.length - 1].owner_id
                              .length > accountLength
                              ? nft.sale.bids[
                                  nft.sale.bids?.length - 1
                                ].owner_id.substring(0, accountLength) + "..."
                              : nft.sale.bids[nft.sale.bids?.length - 1]
                                  .owner_id}
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                    }}
                  >
                    <p>Price</p>
                    <input
                      type="number"
                      value={price.toString()}
                      onChange={handleInputChange}
                      style={{
                        marginRight: "10px",
                        width: "70px",
                        padding: "0 0 0 5px",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      marginTop: "10px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                    }}
                  >
                    {timeLeft != "Ended" &&
                      Auction?.account.accountId &&
                      nft?.token?.owner_id != Auction.account.accountId && (
                        <button className="purple" onClick={(e) => placeBid()}>
                          Place Bid
                        </button>
                      )}
                    {!Auction?.account.accountId && (
                      <button className="yellow" onClick={signInWhitSpinner}>
                        Connect Wallet
                      </button>
                    )}
                  </div>
                </>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" style={{ width: "250px" }} />
      {loading && <Spinner showOverlay={true} />}
    </>
  );
};
