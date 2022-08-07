import {
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import BN from "bn.js";
import useTenkNear from "../../hooks/useTenkNear";
import useAuctionNear from "../../hooks/useAuctionNear";
import { Token } from "../../near/contracts/tenk/index";
import { Sale } from "../../near/contracts/auction/index";
import css from "../NFTDetail/NFTDetail.module.css";
import { u64 } from "../../near/contracts/auction/helper";
import { DELIMETER, TokenSale } from "../NFTs/NFTs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ShowModal } from "../Marketplace/Marketplace";

type Props = {
  show: ShowModal;
  setShow: React.Dispatch<React.SetStateAction<ShowModal>>;
};

export const AuctionCreate = ({ show, setShow }: Props) => {
  const navigate = useNavigate();

  const { nft } = show; //useParams<{ nftid: string }>();
  const { Tenk } = useTenkNear();
  const { Auction } = useAuctionNear();

  const ft_cheddar = "token-v3.cheddar.testnet";

  const [nfta, setNFT] = useState<TokenSale>();
  const [price, setPrice] = useState<number>(1);
  const [ft, setFT] = useState<string>("NEAR");

  const [endtime, setEndTime] = useState<string>(
    new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
      .toJSON()
      .slice(0, 19)
  );

  const onCreateAuction = async () => {
    const endTime = Math.round(new Date(endtime).getTime()) as u64;
    var nowTime = new Date().getTime() as u64;
    const period: u64 = endTime - nowTime;

    console.log(nowTime, endTime, period);

    if (period <= 0) {
      console.log("failed to set endTime!");
      toast("failed to set endTime!");
      return;
    }
    if (price <= 0) {
      console.log("invalid price!");
      toast("invalid price!");
      return;
    }

    const args = {
      token_id: parseInt(nfta?.token.token_id!),
      account_id: Auction?.contractId!,
      period: period,
      price: price, // * Math.pow(10, 24): price,
      token_type: ft == "NEAR" ? "near" : ft_cheddar,
    };

    const options = {
      gas: new BN("30000000000000"),
      attachedDeposit: new BN("10000000000000000000000"),
    };

    await Auction?.create_auction(args, options);
    console.log("auction created");
  };

  useEffect(() => {
    const getNFTs = async () => {
      if (show.nft) {
        let sale = show.nft.sale;

        if (sale) {
          if (sale.ft_token_type == "near") {
            sale.price = sale.price / Math.pow(10, 24);
          }
        }
        const token_sale = {
          token: show.nft.token,
          sale: sale,
        };
        setNFT(token_sale);
      }
    };
    getNFTs();
  }, [Tenk]);

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
                  <p style={{ fontSize: "22px" }}>CREATE AUCTION</p>
                </div>

                <div>
                  <p>Token ID: {nft?.token.token_id}</p>
                </div>

                <div>
                  <div>
                    <div>
                      <p>Price:</p>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={price.toString()}
                        onChange={(e) => setPrice(parseFloat(e.target.value))}
                        style={{
                          marginRight: "10px",
                          width: "200px",
                          padding: "0 0 0 5px",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div>
                      <p>Auction Finish Time:</p>
                    </div>
                    <div>
                      <input
                        type="datetime-local"
                        value={endtime}
                        style={{ width: "200px", padding: "0 0 0 5px" }}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <div>
                      <p>FT Type:</p>
                    </div>
                    <div>
                      <select
                        onChange={(e) => setFT(e.target.value)}
                        style={{ padding: "0 0 0 5px", width: "200px" }}
                      >
                        <option value="NEAR">NEAR</option>
                        <option value="CHEDDAR">CHEDDAR</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }}
                >
                  {nft?.sale ? (
                    <button className="purple" onClick={(e) => navigate("/")}>
                      Return
                    </button>
                  ) : (
                    <button
                      className="purple"
                      onClick={(e) => onCreateAuction()}
                    >
                      Create
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" style={{ width: "250px" }} />
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
