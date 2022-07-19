import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import BN from 'bn.js';
import useTenkNear from "../../hooks/useTenkNear"
import useAuctionNear from "../../hooks/useAuctionNear";
import {Token} from "../../near/contracts/tenk/index"
import {Bid, Sale, SaleView} from "../../near/contracts/auction/index"
import css from "../NFTDetail/NFTDetail.module.css"
import { DELIMETER } from "../NFTs/NFTs";
import * as nearAPI from 'near-api-js';
import { nft_tokens } from "../NFTs/NFTs.module.css";
import { FT_CONTRACT_ACCOUNT } from "../Constants/Contracts";
const {
	utils: { format: { parseNearAmount } },
} = nearAPI;

interface TokenSale {
    token: Token;
    sale?: SaleView;
}

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
                const sale = await getSaleForNFT(token.token_id);
                if(sale.bids)
                {
                    console.log('bids: ', JSON.stringify(sale.bids));
                    let bids = new Map(Object.entries(sale.bids));
                    const sale_view: SaleView = {
                        bids: bids.get(sale.ft_token_type),
                        created_at: sale.created_at,
                        end_at: sale.end_at,
                        price: sale.price / Math.pow(10, 24),
                        ft_token_type: sale.ft_token_type
                    }

                    const token_sale = {
                        token: token,
                        sale: sale_view
                    }
                    setNFT(token_sale);
                    console.log(nft);                    
                }
                else setNFT({token: token});
            }
        }
        getNFTs();
    }, [Tenk])

    var interval = 1000; // ms
    setTimeout(step, interval);

    function step() {
        // const nowTime = (new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)).getTime();
        const nowTime = new Date().getTime();
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
        let current_price = nft?.sale?.price;
        if(nft?.sale?.bids)
            current_price = parseInt(nft.sale.bids[nft.sale.bids.length - 1].price);
        
        if((price * Math.pow(10, 24)) <= current_price!)
        {
            console.log("You can place a bid with less price that current auction price.");
            console.log(price, current_price);
        }
        else {
            if(nft?.sale?.ft_token_type == "near")
            {
                const args = {token_id: nft.token.token_id, offer_price: price * Math.pow(10, 24)};
                const bid_price = parseNearAmount(price.toString());
                const options = {
                    gas: new BN("30000000000000"),
                    attachedDeposit: new BN(bid_price!)
                };
    
                const res = await Auction?.offer(args, options);
    
                console.log(res);
            } else {
                const args = {token_id: nft?.token.token_id!, amount: parseNearAmount(price.toString())!};
                const options = {
                    gas: new BN("50000000000000"),
                    attachedDeposit: new BN(1)
                }
    
                const res = await Auction?.offer_cheddar(args, options);
            }
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
                            <>
                                <b className="title" style={{"padding": "10% 0", "fontSize": "18px"}}>Place Bid</b><br/><br/>
                                <b className="title">Token ID: {nft?.token.token_id}</b><br/>
                                <b className="title">Owner: {nft?.token?.owner_id}</b><br/>
                                <b className="title">Description: {nft?.token.metadata?.description}</b><br/>
                                <b className="title">Initial Price: {(nft?.sale?.price)?.toFixed(3)} {nft?.sale?.ft_token_type == "near" ? "NEAR": "CHEDDAR"}</b><br/>
                                <b className="title">Remaining: {timeLeft}</b><br/><br/>

                                {
                                    nft?.sale?.bids && 
                                    <>
                                        <b className="title" style={{"padding": "10% 0", "fontSize": "18px"}}>Bids</b><br/>
                                        {nft.sale.bids.map(bid => {
                                            return (
                                                <>
                                                    <b className="title">Bid Owner: {bid.owner_id}</b><br/>
                                                    <b className="title">Bid Price: {(parseInt(bid.price) / Math.pow(10, 24)).toFixed(3)} {nft.sale?.ft_token_type == "near" ? "NEAR" : "CHEDDAR"}</b><br/><br/>
                                                </>
                                            )
                                        })}
                                    </>
                                }


                                <br/><b className="title">Price</b><br/>
                                <input type="number" value={price.toString()} onChange={e => setPrice(parseFloat(e.target.value))}/><br/><br/>

                                {timeLeft != "Ended" && Auction?.account.accountId && nft?.token?.owner_id != Auction.account.accountId && (
                                    <button className="secondary" onClick={e => placeBid()}>Place Bid</button>
                                )}
                                {
                                    !Auction?.account.accountId && <button className="secondary" onClick={signIn}>Connect Wallet</button>
                                }                            
                            </>
                        </div>
                    </div>
                </div>
            </div>
        </>         
    )   
}