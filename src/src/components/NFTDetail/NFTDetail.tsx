import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useTenkNear from "../../hooks/useTenkNear";
import { Token } from "../../near/contracts/tenk/index";
import css from "./NFTDetail.module.css";
import Spinner from "../Spinner/Spinner";
import { ShowModal } from "../Marketplace/Marketplace";
import { TokenSale } from "../NFTs/NFTs";

type Props = {
  show: ShowModal;
  setShow: React.Dispatch<React.SetStateAction<ShowModal>>;
};

export const NFTDetail = ({ show, setShow }: Props) => {
  const { Tenk } = useTenkNear();

  const [nft, setNFT] = useState<TokenSale>();

  useEffect(() => {
    const getNFTs = async () => {
      if (show.nft) {
        setNFT({ token: show.nft.token, nftsName: show.nft.nftsName });
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
  console.log(nft);

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
              nft?.token.metadata?.media
            }
          />
        </div>
        <div className={css.nft_description}>
          <div>
            <div>
              <p style={{ fontSize: "22px" }}>DETAIL OF NFT</p>
            </div>

            <div>
              <div>
                <p>
                  Name: {nft?.nftsName} {nft?.token.token_id}
                </p>
              </div>

              <div>
                <p>Owner: {nft?.token.owner_id}</p>
              </div>
              {nft?.token.metadata?.title && (
                <div>
                  <p>Title: {nft?.token.metadata?.title}</p>
                </div>
              )}
              {nft?.token.metadata?.description && (
                <div>
                  <p>Description: {nft?.token.metadata?.description}</p>
                </div>
              )}
            </div>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
};
