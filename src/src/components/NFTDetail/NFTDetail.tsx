import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useTenkNear from "../../hooks/useTenkNear";
import { Token } from "../../near/contracts/tenk/index";
import css from "./NFTDetail.module.css";
import Spinner from "../Spinner/Spinner";

type Props = {
  show: { name: string; nftid: string; loading: boolean };
  setShow: React.Dispatch<
    React.SetStateAction<{ name: string; nftid: string; loading: boolean }>
  >;
};

export const NFTDetail = ({ show, setShow }: Props) => {
  const { Tenk } = useTenkNear();

  const [nft, setNFT] = useState<Token>();
  // const [auction, setAuction] = useState<
  const method = "nft_token";

  const { nftid } = show; //useParams<{ nftid: string }>();

  useEffect(() => {
    const getNFTs = async () => {
      const args = {
        token_id: nftid,
      };
      const res: Token = await Tenk?.account.viewFunction(
        Tenk.contractId,
        method,
        args
      );
      if (res) {
        setNFT(res);
        console.log(res);
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

  return (
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
              nft?.metadata?.media
            }
          />
        </div>
        <div className={css.nft_description}>
          <b className="title">Detail of NFT</b>
          <br />
          <br />
          <b className="title">Token ID: {nft?.token_id}</b>
          <br />
          <b className="title">Owner: {nft?.owner_id}</b>
          <br />
          <b className="title">Title: {nft?.metadata?.title}</b>
          <br />
          <b className="title">Description: {nft?.metadata?.description}</b>
        </div>
      </div>
    </div>
  );
};
