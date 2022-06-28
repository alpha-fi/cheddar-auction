import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import React, { useEffect, useMemo, useState } from "react"
import useTenkNear from "../../hooks/useTenkNear"
import useAuctionNear from "../../hooks/useAuctionNear";
import {Token} from "../../near/contracts/tenk/index"
import {Sale} from "../../near/contracts/auction/index"
import css from "../NFTDetail/NFTDetail.module.css"

export const CreateAuction = () => {
    const { Tenk } = useTenkNear();
    const { Auction } = useAuctionNear();

    const [nft, setNFT] = useState<Token>();
    // const [auction, setAuction] = useState<
    const method = "nft_token";

    const { nftid } = useParams<{ nftid: string }>()

    useEffect(() => {
        const getNFTs = async() => {
            const args = {
                token_id: nftid,
            };
            const res: Token = await Tenk?.account.viewFunction(Tenk.contractId, method, args);
            if(res) {
                setNFT(res);
                console.log(nft);
            }
        }
        getNFTs();
    }, [Tenk])

    return (
        <div>
            <div>
                <div className={css.nft_container}>
                    <div className={css.nft_token}>
                        <img alt="NFT" src={"https://bafybeibghcllcmurku7lxyg4wgxn2zsu5qqk7h4r6bmyhpztmyd564cx54.ipfs.nftstorage.link/" + nft?.metadata?.media}/>
                    </div>
                    <div className={css.nft_token}>
                        <b className="title" style={{"padding": "10% 0"}}>Create Auction</b><br/><br/>

                        <b className="title">Token ID: {nft?.token_id}</b><br/>
                        <b className="title">Description: {nft?.metadata?.description}</b><br/><br/>
                        
                        <b className="title">Price</b><br/>
                        <input type="number"/><br/>
                        
                        <b className="title">Auction Finish Time</b><br/>
                        <input type="datetime-local"/><br/>

                        <b className="title">FT Type</b><br/>
                        <select>
                            <option value="NEAR">NEAR</option>
                            <option value="CHEDDAR">CHEDDAR</option>
                        </select><br/><br/>

                        <button className="secondary" onClick={e=> console.log("create auction")}>Create</button>
                    </div>
                </div>
            </div>
        </div>
    )   
}