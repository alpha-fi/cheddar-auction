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

interface TokenSale {
  token: Token;
  sale?: SaleView;
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

  const nftid = show.nft?.token.token_id; //useParams<{ nftid: string }>();
  const { Tenk } = useTenkNear();
  const { Auction } = useAuctionNear();

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
          };
          setNFT(token_sale);
        } else {
          setNFT({ token: show.nft.token });
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
                <b
                  className="title"
                  style={{ padding: "10% 0", fontSize: "18px" }}
                >
                  VIEW AUCTION
                </b>
                <br />
                <br />

                <b className="title">Token ID: {nft?.token.token_id}</b>
                <br />
                {false && (
                  <>
                    <b className="title">
                      Description: {nft?.token.metadata?.description}
                    </b>
                    <br />
                  </>
                )}
                {nft?.sale && !loading && status == NFT_STATUS.ONAUCTION && (
                  <>
                    <b className="title">
                      Initial Price: {(nft?.sale.price).toFixed(2)}
                    </b>{" "}
                    {nft.sale?.ft_token_type == "near" ? "NEAR" : "CHEDDAR"}
                    <br />
                    <b className="title">Remaining: {timeLeft}</b>
                    <br />
                    <br />
                  </>
                )}

                {nft?.sale?.bids && (
                  <>
                    <b
                      className="title"
                      style={{ padding: "10% 0", fontSize: "18px" }}
                    >
                      Bid
                    </b>
                    <br />
                    {nft.sale.bids && (
                      <>
                        <b className="title">
                          Bid Owner:{" "}
                          {nft.sale.bids[nft.sale.bids?.length - 1].owner_id
                            .length > 20
                            ? nft.sale.bids[
                                nft.sale.bids?.length - 1
                              ].owner_id.substring(0, 20) + "..."
                            : nft.sale.bids[nft.sale.bids?.length - 1].owner_id}
                        </b>
                        <br />
                        <b className="title">
                          Bid Price:{" "}
                          {(
                            parseInt(
                              nft.sale.bids[nft.sale.bids?.length - 1].price
                            ) / Math.pow(10, 24)
                          ).toFixed(2)}{" "}
                          {nft.sale?.ft_token_type == "near"
                            ? "NEAR"
                            : "CHEDDAR"}
                        </b>
                        <br />
                      </>
                    )}
                  </>
                )}

                {status == NFT_STATUS.ONAUCTION && !nft?.sale && (
                  <>
                    <b className="title">SALED</b>
                    <br />
                    <button className="purple" onClick={(e) => navigate("/")}>
                      RETURN
                    </button>
                    <br />
                  </>
                )}

                {nft?.sale && nft.token.owner_id == Tenk?.account.accountId && (
                  <>
                    {nft.sale.bids && (
                      <>
                        <br />
                        <button
                          className="purple"
                          style={{ marginRight: "10px" }}
                          onClick={(e) => acceptBid()}
                        >
                          Accept Bid
                        </button>
                      </>
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
                  <>
                    <button className="purple" onClick={(e) => claimNFT()}>
                      Claim NFT
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
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
