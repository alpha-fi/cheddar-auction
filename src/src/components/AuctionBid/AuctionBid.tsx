import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import BN from 'bn.js';
import useTenkNear from "../../hooks/useTenkNear"
import useAuctionNear from "../../hooks/useAuctionNear";
import {Token} from "../../near/contracts/tenk/index"
import {Bid, Sale} from "../../near/contracts/auction/index"
import css from "../NFTDetail/NFTDetail.module.css"
import { DELIMETER, TokenSale } from "../NFTs/NFTs";
import * as nearAPI from 'near-api-js';
import { nft_tokens } from "../NFTs/NFTs.module.css";
const {
	utils: { format: { parseNearAmount } },
} = nearAPI;

export const AuctionBid = () => {
    const { nftid } = useParams<{ nftid: string }>()
    const { Tenk } = useTenkNear();
    const { Auction, signIn } = useAuctionNear();

    const [nft, setNFT] = useState<TokenSale>();
    const [price, setPrice] = useState<number>(1);
    const [timeLeft, setTimeLeft] = useState<string>();

    useEffect(() => {
        const getNFTs = async() => {
            const args = {
                token_id: nftid,
            };
            const token: Token = await Tenk?.account.viewFunction(Tenk.contractId, "nft_token", args);
            if(token) {
                let sale = await getSaleForNFT(token.token_id);

                if(sale)
                {
                    if(sale.token_type == "near"){
                        sale.price = sale.price / Math.pow(10, 24);
                    }
                }
                const token_sale = {
                    token: token,
                    sale: sale
                }
                setNFT(token_sale);
                console.log(token_sale);
            }
        }
        getNFTs();
    }, [Tenk])

    var interval = 1000; // ms
    setTimeout(step, interval);

    function step() {
        const nowTime = (new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)).getTime();

        const end_at = nft?.sale?.end_at;
        if(end_at) {
            const remaining = parseInt(end_at) - nowTime;
        
            let left = "Ended"
            if(remaining > 0){
                const days = Math.floor((remaining / (1000 * 60 * 60 * 24)));
                const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((remaining / 1000 / 60) % 60);
                const seconds =  Math.floor((remaining / 1000) % 60);
        
                if(days > 0) left = days + "Days " + hours + " Hours " + minutes + " Minutes " + seconds + " Seconds";
                else left = hours + " Hours " + minutes + " Minutes " + seconds + " Seconds";
            }
            setTimeLeft(left);
        }
    }

    const getSaleForNFT = async(nftid: string) => {
        const nft_contract_token = Auction?.nft_contract_id! + DELIMETER + nftid;
        const args = {nft_contract_token: nft_contract_token};
        console.log("args", args);
        const res: Sale = await Auction?.account.viewFunction(Auction.contractId, "get_sale", args, );
        return res;
    }



    const placeBid = async() => {
        if(nft?.sale?.token_type == "near")
        {
            const args = {token_id: nft.token.token_id};
            const bid_price = parseNearAmount(price.toString());
            const options = {
                gas: new BN("30000000000000"),
                attachedDeposit: new BN(bid_price!)
            };

            const res = await Auction?.offer(args, options);

            console.log(res);
        } else {
            const args = {token_id: nft?.token.token_id!, amount: price};
            const options = {
                gas: new BN("30000000000000"),
                attachedDeposit: new BN(1)
            }

            const res = await Auction?.offer_cheddar(args, options);
        }
    }

    return (
        <>
            <div>
                <div>
                    <div className={css.nft_container}>
                        <div className={css.nft_token}>
                            <img alt="NFT" src={"https://bafybeibghcllcmurku7lxyg4wgxn2zsu5qqk7h4r6bmyhpztmyd564cx54.ipfs.nftstorage.link/" + nft?.token.metadata?.media}/>
                        </div>
                        <div className={css.nft_token}>
                            <b className="title" style={{"padding": "10% 0"}}>Place Bid</b><br/><br/>

                            <b className="title">Token ID: {nft?.token.token_id}</b><br/>
                            <b className="title">Owner: {nft?.sale?.owner_id}</b><br/>
                            <b className="title">Description: {nft?.token.metadata?.description}</b><br/>
                            <b className="title">Initial Price: {nft?.sale?.price} {nft?.sale?.token_type == "near" ? "NEAR": "CHEDDAR"}</b><br/>
                            <b className="title">Remaining: {timeLeft}</b><br/><br/>

                            {
                                nft?.sale?.bids ?
                                <>
                                    <b className="title">Bids</b><br/>
                                    <b className="title">Bid Owner: {(new Map(Object.entries(nft.sale.bids))).get("near").owner_id}</b><br/>
                                    <b className="title">Bid Price: {nft.sale.token_type == "near" ? ((new Map(Object.entries(nft.sale.bids))).get("near").price) / Math.pow(10, 24) + "NEAR" : ((new Map(Object.entries(nft.sale.bids))).get("near").price) / Math.pow(10, 24) + "CHEDDAR"}</b><br/>
                                </> :
                                <>
                                    <b className="title">No Bids</b><br/><br/>
                                </>
                            }


                            <br/><b className="title">Price</b><br/>
                            <input type="number" value={price.toString()} onChange={e => setPrice(parseFloat(e.target.value))}/><br/><br/>
                            
                            {timeLeft != "Ended" && Auction?.account.accountId && nft?.sale?.owner_id != Auction.account.accountId && (
                                <button className="secondary" onClick={e => placeBid()}>Place Bid</button>
                            )}
                            {
                                !Auction?.account.accountId && <button className="secondary" onClick={signIn}>Connect Wallet</button>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>         
    )   
}