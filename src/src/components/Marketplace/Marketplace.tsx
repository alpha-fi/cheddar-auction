import { useEffect, useState } from "react";
import css from "../NFTs/NFTs.module.css";
import useTenkNear from "../../hooks/useTenkNear";
import useAuctionNear from "../../hooks/useAuctionNear";
import NFTModal from "../NFTModal/NFTModal";
import { useSaleNFTs } from "../../hooks/useSaleNFTs";
import Spinner from "../Spinner/Spinner";
import { TokenSale } from "../NFTs/NFTs";
import { useQuery, UseQueryResult } from "react-query";
import { keyframes, styled } from "@stitches/react";

const ONE_DAY = 1000 * 60 * 60 * 24;

const contentShow = keyframes({
  "0%": { opacity: 0 },
  "100%": { opacity: 1 },
});

const StyledContent = styled("div", {
  "@media (prefers-reduced-motion: no-preference)": {
    animation: `${contentShow} 3000ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
  },
  "&:focus": { outline: "none" },
});

export type ShowModal = {
  name: string;
  nft: TokenSale | null;
  loading: boolean;
};

export type TimeLeft = { left: string; endDate: string };

type Props = {
  saleNFTsQuery: UseQueryResult<TokenSale[], unknown>;
};

export const Marketplace = ({ saleNFTsQuery }: Props) => {
  const [showModal, setShowModal] = useState<ShowModal>({
    name: "",
    nft: null,
    loading: false,
  });

  const { Tenk } = useTenkNear();

  const { data: nfts = [] } = saleNFTsQuery;

  const [timeLeft, setTimeLeft] = useState<TimeLeft[]>([]);

  useEffect(() => {
    const timeoutId = setTimeout(step, 1000);
    return () => {
      clearTimeout(timeoutId);
    };
  });

  useEffect(() => {
    step();
  }, []);

  function step() {
    // const nowTime = (new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)).getTime();
    const nowTime = new Date().getTime();
    const lefts: TimeLeft[] = [];
    for (let i = 0; i < nfts?.length!; i++) {
      const end_at = nfts![i].sale?.end_at;
      if (end_at) {
        const remaining = parseInt(end_at) - nowTime;
        const splitDate = new Date(end_at).toString().split(" ");
        const endDay = splitDate[0];
        const splitHour = splitDate[4].split(":");
        const isPM = parseInt(splitHour[0]) > 12;
        const endHour = `${isPM ? parseInt(splitHour[0]) - 12 : splitHour[0]}:${
          splitHour[1]
        }`;
        const endDate = `${endDay}, ${endHour} ${isPM ? "PM" : "AM"}`;

        let left = "Ended";
        if (remaining > 0) {
          const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
          const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((remaining / 1000 / 60) % 60);
          const seconds = Math.floor((remaining / 1000) % 60);

          if (days > 0) {
            left = `${days}D ${hours > 0 ? hours + "H" : ""}`;
          } else if (hours > 0) {
            left = `${hours}H ${minutes > 0 ? minutes + "m" : ""}`;
          } else if (minutes > 0) {
            left = `${minutes}m ${seconds > 0 ? seconds + "s" : ""}`;
          } else {
            left = `${seconds} Seconds`;
          }
        }
        lefts.push({ left, endDate });
      }
    }
    setTimeLeft(lefts);
  }

  const handleOnClick = (name: string, nft: TokenSale) => {
    setShowModal({ name, nft, loading: true });
    saleNFTsQuery.refetch();
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
      {saleNFTsQuery.isLoading && <Spinner />}
      <div className="container">
        <div className="dlion">
          <div className={css.nft_tokens}>
            <>
              {timeLeft.length > 0 &&
                nfts.map((nft, index) => {
                  return (
                    <StyledContent key={nft.token.token_id}>
                      <div
                        className={css.nft_token}
                        id={"marketcard" + nft.token.token_id}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              textAlign: "center",
                              background: "#FFD26288",
                              marginBottom: "10px",
                            }}
                          >
                            <p>
                              {nft.nftsName} {nft.token.token_id}
                            </p>
                          </div>
                          <img
                            alt="NFT"
                            onLoad={() => {
                              document
                                .getElementById(
                                  "marketcard" + nft.token.token_id
                                )
                                ?.setAttribute("style", "display: inherit");
                            }}
                            src={
                              "https://bafybeibghcllcmurku7lxyg4wgxn2zsu5qqk7h4r6bmyhpztmyd564cx54.ipfs.nftstorage.link/" +
                              nft.token.metadata?.media
                            }
                            onClick={(e) => handleOnClick("NFTDetail", nft)}
                          />
                        </div>
                        <div className={css.nft_token_info}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "16px",
                              lineHeight: "10px",
                            }}
                          >
                            <div>
                              {timeLeft && (
                                <p>
                                  Time Left{" "}
                                  {timeLeft[index]
                                    ? timeLeft[index].left
                                    : ": loading..."}
                                </p>
                              )}
                            </div>
                            <div>
                              {timeLeft && (
                                <p>
                                  {nft.sale?.bids &&
                                    `${nft.sale.bids_length} ${
                                      nft.sale.bids_length === 1
                                        ? "Bid"
                                        : "Bids"
                                    }`}
                                </p>
                              )}
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "14px",
                            }}
                          >
                            <div>
                              {timeLeft && (
                                <p>
                                  {timeLeft[index] &&
                                    `(${timeLeft[index].endDate})`}
                                </p>
                              )}
                            </div>
                            <div>
                              {timeLeft && nft.sale?.last_bid_price && (
                                <p>
                                  {`${nft.sale?.last_bid_price} ${
                                    nft.sale?.ft_token_type == "near"
                                      ? "$NEAR"
                                      : "$CHEDDAR"
                                  }`}
                                </p>
                              )}
                              {timeLeft &&
                                !nft.sale?.last_bid_price &&
                                nft.sale?.price && (
                                  <p>
                                    {`${(
                                      nft.sale.price / Math.pow(10, 24)
                                    ).toFixed(2)} ${
                                      nft.sale?.ft_token_type == "near"
                                        ? "$NEAR"
                                        : "$CHEDDAR"
                                    }`}
                                  </p>
                                )}
                            </div>
                          </div>
                          {timeLeft &&
                            timeLeft[index].left != "Ended" &&
                            nft.token.owner_id != Tenk?.account.accountId && (
                              <button
                                className="purple"
                                style={{ marginTop: "5px" }}
                                onClick={() => handleOnClick("AuctionBid", nft)}
                              >
                                Place Bid
                              </button>
                            )}
                          {timeLeft &&
                            nft.token.owner_id === Tenk?.account.accountId && (
                              <button
                                className="purple"
                                style={{ marginTop: "5px" }}
                                onClick={() =>
                                  handleOnClick("AuctionView", nft)
                                }
                              >
                                My Auction
                              </button>
                            )}
                          {timeLeft &&
                            timeLeft[index].left == "Ended" &&
                            nft.token.owner_id != Tenk?.account.accountId && (
                              <button
                                className="purple"
                                style={{ marginTop: "5px" }}
                                onClick={() =>
                                  handleOnClick("AuctionView", nft)
                                }
                              >
                                View Auction
                              </button>
                            )}
                        </div>
                      </div>
                    </StyledContent>
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
