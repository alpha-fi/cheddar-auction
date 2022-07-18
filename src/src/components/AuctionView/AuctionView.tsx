import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { useNavigate} from "react-router-dom"
import BN from 'bn.js'
import useTenkNear from "../../hooks/useTenkNear"
import useAuctionNear from "../../hooks/useAuctionNear";
import {Token} from "../../near/contracts/tenk/index"
import {Bid, Sale, SaleView} from "../../near/contracts/auction/index"
import css from "../NFTDetail/NFTDetail.module.css"
import { DELIMETER } from "../NFTs/NFTs";
import { FT_CONTRACT_ACCOUNT } from "../Constants/Contracts"

interface TokenSale {
    token: Token;
    sale?: SaleView;
}

export const AuctionView = () => {
    const enum NFT_STATUS {
        ONAUCTION,
        SALED,
        CANCELLED,
    }
    const navigate = useNavigate();

    const { nftid } = useParams<{ nftid: string }>();
    const { Tenk } = useTenkNear();
    const { Auction } = useAuctionNear();

    const [nft, setNFT] = useState<TokenSale>();
    const [loading, setLoading] = useState<boolean>(false);
    const [claimable, setClaimable] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<string>();
    const [status, setStatus] = useState<NFT_STATUS>(NFT_STATUS.ONAUCTION);

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
        const nowTime = new Date().getTime();
        if(status == NFT_STATUS.ONAUCTION && nft?.sale)
        {
            const end_at = nft.sale.end_at;
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

            if(nft.sale.bids) {
                var claim = nft.sale.bids[0].owner_id == Tenk?.account.accountId && remaining < 0;
                setClaimable(claim);
            }
        }
    }

    const getSaleForNFT = async(nftid: string) => {
        const nft_contract_token = Auction?.nft_contract_id! + DELIMETER + nftid;
        const args = {nft_contract_token: nft_contract_token};
        console.log("args", args);
        const res: Sale = await Auction?.account.viewFunction(Auction.contractId, "get_sale", args, );
        console.log(res);
        return res;
    }

    const acceptBid = async() => {
        const args = {
            token_id: nft?.token.token_id!
        };
        const options = {
            gas: new BN("200000000000000")
        }
        setLoading(true);
        setStatus(NFT_STATUS.SALED);
 
        const res = await Auction?.accept_offer(args, options).then(() => {
                console.log("ACCEPTED");
                setLoading(false);
                navigate("/")
            }
        ).catch((error) => {
            console.log(error);
        });
        console.log(res);
    }

    const cancelAuction =async () => {
        setLoading(true);
        const args = {
            token_id: nft?.token.token_id!
        };
        const options = {
            gas: new BN("200000000000000"),
            attachedDeposit: new BN("1")
        }

        setStatus(NFT_STATUS.CANCELLED);

        const res = await Auction?.remove_sale(args, options).then(() => {
            console.log("CANCELLED");
            setLoading(false);
            navigate("/");
        }).catch((error) => {
            console.log(error);
        });
        console.log(res);
    }

    const claimNFT = async() => {
        const args = {
            token_id: nft?.token.token_id!
        };
        const options = {
            gas: new BN("200000000000000")
        }
        
        setLoading(true);
        setStatus(NFT_STATUS.SALED);
 
        const res = await Auction?.claim_nft(args, options).then(() => {
                console.log("ACCEPTED");
                setLoading(false);
                navigate("/")
            }
        ).catch((error) => {
            console.log(error);
        });
        console.log(res);
    }

    return (
        Auction?.account ?
        <>
            <div>
                <div>
                    <div className={css.nft_container}>
                        <div className={css.nft_token}>
                            <img alt="NFT" src={"https://bafybeibghcllcmurku7lxyg4wgxn2zsu5qqk7h4r6bmyhpztmyd564cx54.ipfs.nftstorage.link/" + nft?.token.metadata?.media}/>
                        </div>
                        <div className={css.nft_token}>
                            <b className="title" style={{"padding": "10% 0", "fontSize": "18px"}}>Create Auction</b><br/><br/>

                            <b className="title">Token ID: {nft?.token.token_id}</b><br/>
                            <b className="title">Description: {nft?.token.metadata?.description}</b><br/>
                            {
                                nft?.sale && !loading && status == NFT_STATUS.ONAUCTION && (<>
                                    <b className="title">Initial Price: {(nft?.sale.price).toFixed(3)}</b> {nft.sale?.ft_token_type == "near" ? "NEAR" : "CHEDDAR"}<br/>
                                    <b className="title">Remaining: {timeLeft}</b><br/><br/>
                                </>)
                            }
                            

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

                            {
                                status == NFT_STATUS.ONAUCTION && !nft?.sale && (
                                    <>
                                        <b className="title">SALED</b><br/>
                                        <button className="secondary" onClick={e=> navigate("/")}>RETURN</button><br/>
                                    </>
                                )
                            }
                            
                            {nft?.sale && nft.token.owner_id == Tenk?.account.accountId &&
                                <>
                                    {nft.sale.bids && <><br/><button className="secondary" onClick={e=> acceptBid()}>Accept Bid</button><br/></>}
                                    <button className="secondary" onClick={e=> cancelAuction()}>Cancel Auction</button>
                                </>
                            }
                            {
                                claimable && 
                                <>
                                    <button className="secondary" onClick={e=> claimNFT()}>Claim NFT</button>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </> :
        <>
            <div style={{width: "100%", minHeight: "450px"}}>
                <div className="dlion">
                    <div>
                        <div style={{display: "flex", justifyContent: "center"}}>
                            Not Connected to Wallet
                        </div>
                    </div>
                </div>
            </div>        
        </>
        
    )   
}