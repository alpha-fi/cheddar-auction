import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import React, { useEffect, useMemo, useState } from "react"
import BN from 'bn.js';
import useTenkNear from "../../hooks/useTenkNear"
import useAuctionNear from "../../hooks/useAuctionNear";
import {Token} from "../../near/contracts/tenk/index"
import {Sale} from "../../near/contracts/auction/index"
import css from "../NFTDetail/NFTDetail.module.css"
import { u64 } from "../../near/contracts/auction/helper";

export const AuctionCreate = () => {
    const { nftid } = useParams<{ nftid: string }>()
    const { Tenk } = useTenkNear();
    const { Auction } = useAuctionNear();

    const ft_cheddar = 'token-v3.cheddar.testnet';
    const [nft, setNFT] = useState<Token>();
    const [price, setPrice] = useState<number>(1);
    const [ft, setFT] = useState<string>('NEAR');
    const [endtime, setEndTime] = useState<string>((new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)).toJSON().slice(0,19));


    const onCreateAuction = async() => {
        const endTime = Math.round(new Date(endtime).getTime()) as u64;
        var nowTime = (new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)).getTime() as u64;
        const period: u64 = endTime - nowTime;

        console.log(nowTime, endTime, period);

        if(period <= 0) {console.log("failed to set endTime!"); return;}
        if(price <= 0) {console.log("invalid price!"); return;}

        const args = {
            token_id: parseInt(nft?.token_id!),
            account_id: Auction?.contractId!,
            period: period,
            price: price,// * Math.pow(10, 24): price,
            token_type: ft == "NEAR" ? "near" : ft_cheddar
        }

        const options = {
            gas: new BN("30000000000000"),
            attachedDeposit: new BN("10000000000000000000000")
        }
        
        await Auction?.create_auction(args, options);
        console.log("auction created");
    }


    useEffect(() => {
        const getNFTs = async() => {
            const args = {
                token_id: nftid,
            };
            const res: Token = await Tenk?.account.viewFunction(Tenk.contractId, "nft_token", args);
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
                        <input type="number" value={price.toString()} onChange={e => setPrice(parseFloat(e.target.value))}/><br/>
                        
                        <b className="title">Auction Finish Time</b><br/>
                        <input type="datetime-local" value={endtime} onChange={e => setEndTime(e.target.value)}/><br/>

                        <b className="title">FT Type</b><br/>
                        <select onChange={e => setFT(e.target.value)}>
                            <option value="NEAR">NEAR</option>
                            <option value="CHEDDAR">CHEDDAR</option>
                        </select><br/><br/>

                        <button className="secondary" onClick={e=> onCreateAuction()}>Create</button>
                    </div>
                </div>
            </div>
        </div>
    )   
}