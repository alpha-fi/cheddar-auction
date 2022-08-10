import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BN from "bn.js";
import useTenkNear from "../../hooks/useTenkNear";
import useAuctionNear from "../../hooks/useAuctionNear";
import { Token } from "../../near/contracts/tenk/index";
import { Bid, Sale, SaleView } from "../../near/contracts/auction/index";
import css from "../NFTDetail/NFTDetail.module.css";
import { DELIMETER } from "../NFTs/NFTs";
import { FT_CONTRACT_ACCOUNT } from "../Constants/Contracts";
import { ShowModal } from "../Marketplace/Marketplace";
import useScreenSize from "../../hooks/useScreenSize";
import Spinner from "../Spinner/Spinner";

interface TokenSale {
  token: Token;
  sale?: SaleView;
  nftsName: string;
}

type Props = {
  show: ShowModal;
  setShow: React.Dispatch<React.SetStateAction<ShowModal>>;
};

export const AuctionView = ({ show, setShow }: Props) => {
  const enum NFT_STATUS {
    ONAUCTION,
    SALED,
    CANCELLED,
  }
  const navigate = useNavigate();

  const { Tenk } = useTenkNear();
  const { Auction } = useAuctionNear();
  const { width } = useScreenSize();
  const accountLength = width > 992 ? 35 : 20;

  const [nft, setNFT] = useState<TokenSale>();
  const [loading, setLoading] = useState<boolean>(false);
  const [claimable, setClaimable] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<string>();
  const [status, setStatus] = useState<NFT_STATUS>(NFT_STATUS.ONAUCTION);

  useEffect(() => {
    const getNFTs = async () => {
      if (show.nft?.sale) {
        const sale = show.nft.sale;
        if (sale.bids) {
          let bids = new Map(Object.entries(sale.bids));
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
          setNFT(token_sale);
        } else {
          setNFT({ token: show.nft.token, nftsName: show.nft.nftsName });
        }
      }
    };
    getNFTs();
  }, [Tenk]);

  useEffect(() => {
    const timeoutId = setTimeout(step, 1000);
    return () => {
      clearTimeout(timeoutId);
    };
  });

  function step() {
    const nowTime = new Date().getTime();
    if (status == NFT_STATUS.ONAUCTION && nft?.sale) {
      const end_at = nft.sale.end_at;
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

      if (nft.sale.bids) {
        var claim =
          nft.sale.bids[0].owner_id == Tenk?.account.accountId && remaining < 0;
        setClaimable(claim);
      }
    }
  }

  const acceptBid = async () => {
    const args = {
      token_id: nft?.token.token_id!,
    };
    const options = {
      gas: new BN("200000000000000"),
    };
    setLoading(true);
    setStatus(NFT_STATUS.SALED);

    const res = await Auction?.accept_offer(args, options)
      .then(() => {
        console.log("ACCEPTED");
        setLoading(false);
        navigate("/");
      })
      .catch((error) => {
        console.log(error);
      });
    console.log(res);
  };

  const cancelAuction = async () => {
    setLoading(true);
    const args = {
      token_id: nft?.token.token_id!,
    };
    const options = {
      gas: new BN("200000000000000"),
      attachedDeposit: new BN("1"),
    };

    setStatus(NFT_STATUS.CANCELLED);

    const res = await Auction?.remove_sale(args, options)
      .then(() => {
        console.log("CANCELLED");
        setLoading(false);
        navigate("/");
      })
      .catch((error) => {
        console.log(error);
      });
    console.log(res);
  };

  const claimNFT = async () => {
    const args = {
      token_id: nft?.token.token_id!,
    };
    const options = {
      gas: new BN("200000000000000"),
    };

    setLoading(true);
    setStatus(NFT_STATUS.SALED);

    const res = await Auction?.claim_nft(args, options)
      .then(() => {
        console.log("ACCEPTED");
        setLoading(false);
        navigate("/");
      })
      .catch((error) => {
        console.log(error);
      });
    console.log(res);
  };

  const handleImgOnLoad = () => {
    setShow((prev) => {
      return {
        ...prev,
        loading: false,
      };
    });
  };

  return Auction?.account ? (
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
                <div>
                  <p style={{ fontSize: "22px" }}>VIEW AUCTION</p>
                </div>

                <div>
                  <div>
                    <p>
                      Name: {nft?.nftsName} {nft?.token.token_id}
                    </p>
                  </div>

                  {nft?.token.metadata?.description && (
                    <>
                      <div>
                        <p>Description: {nft?.token.metadata?.description}</p>
                      </div>
                    </>
                  )}
                  {nft?.sale && !loading && status == NFT_STATUS.ONAUCTION && (
                    <>
                      <div>
                        <p>
                          Starting Bid: {(nft?.sale.price).toFixed(2)}{" "}
                          {nft.sale?.ft_token_type == "near"
                            ? "NEAR"
                            : "CHEDDAR"}
                        </p>
                      </div>{" "}
                      <div>
                        <p>Remaining: {timeLeft ?? "Loading..."}</p>
                      </div>
                    </>
                  )}
                </div>

                {nft?.sale?.bids && (
                  <div>
                    <p style={{ fontSize: "18px", marginTop: "10px" }}>
                      LAST BID
                    </p>

                    {nft.sale.bids && (
                      <p>
                        {(
                          parseInt(
                            nft.sale.bids[nft.sale.bids?.length - 1].price
                          ) / Math.pow(10, 24)
                        ).toFixed(2)}{" "}
                        {nft.sale?.ft_token_type == "near" ? "NEAR" : "CHEDDAR"}
                        {" by "}
                        {nft.sale.bids[nft.sale.bids?.length - 1].owner_id
                          .length > accountLength
                          ? nft.sale.bids[
                              nft.sale.bids?.length - 1
                            ].owner_id.substring(0, accountLength) + "..."
                          : nft.sale.bids[nft.sale.bids?.length - 1].owner_id}
                      </p>
                    )}
                  </div>
                )}

                {status == NFT_STATUS.ONAUCTION && !nft?.sale && (
                  <>
                    <div>
                      <p>Status: SALED</p>
                    </div>

                    <button className="purple" onClick={(e) => navigate("/")}>
                      Return
                    </button>
                  </>
                )}
                <div
                  style={{
                    flexDirection: "row",
                    height: "auto",
                    justifyContent: "flex-start",
                    marginTop: "10px",
                  }}
                >
                  {nft?.sale && nft.token.owner_id == Tenk?.account.accountId && (
                    <>
                      {nft.sale.bids && (
                        <button
                          className="purple"
                          style={{ marginRight: "10px" }}
                          onClick={(e) => acceptBid()}
                        >
                          Accept Bid
                        </button>
                      )}
                      <button
                        style={{ backgroundColor: "red" }}
                        onClick={(e) => cancelAuction()}
                      >
                        Cancel Auction
                      </button>
                    </>
                  )}
                  {claimable && (
                    <div>
                      <button className="purple" onClick={(e) => claimNFT()}>
                        Claim NFT
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {loading && <Spinner showOverlay={true} />}
    </>
  ) : (
    <>
      <div style={{ width: "100%", minHeight: "450px" }}>
        <div className="dlion">
          <div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              Not Connected to Wallet
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
