import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useTenkNear from "../../hooks/useTenkNear";
import { Token } from "../../near/contracts/tenk/index";
import css from "./NFTDetail.module.css";
import Spinner from "../Spinner/Spinner";
import { ShowModal } from "../Marketplace/Marketplace";

type Props = {
  show: ShowModal;
  setShow: React.Dispatch<React.SetStateAction<ShowModal>>;
};

export const NFTDetail = ({ show, setShow }: Props) => {
  const { Tenk } = useTenkNear();

  const [nft, setNFT] = useState<Token>();

  useEffect(() => {
    const getNFTs = async () => {
      if (show.nft) {
        setNFT(show.nft.token);
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
