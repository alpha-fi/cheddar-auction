import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import React, { useEffect, useMemo, useState } from "react"
import BN from 'bn.js';
import useAuctionNear from "../../hooks/useAuctionNear";
import css from "../NFTDetail/NFTDetail.module.css"

import * as nearAPI from 'near-api-js';
const {
	utils: { format: { parseNearAmount } },
} = nearAPI;

export const Storage = () => {
    const { Auction } = useAuctionNear();
    const [balance, setBalance] = useState<string>('0');
    const [amount, setAmount] = useState<number>(1);

    const deposit = async() => {
        if(amount <= 0) {
            console.log("invalid deposit amount");
            return;
        }
        if(Auction?.account)
        {
            try{
                const args = {account_id: Auction?.account.accountId!};
                const deposit_amount = parseNearAmount(amount.toString());
                const options = {
                    gas: new BN("30000000000000"),
                    attachedDeposit: new BN(deposit_amount!)
                };
                await Auction?.storage_deposit(args, options);
                console.log("Successfully deposited");
                getStorageBalance();
            } catch(error) {
                console.log(error);
            }
        }
    }

    const claim = async() => {
        try{

            const options = {
                gas: new BN("30000000000000"),
                attachedDeposit: new BN(1)
            };
            await Auction?.storage_withdraw(options);
            console.log("Successfully deposited");
            getStorageBalance();
        }catch(error){
            console.log(error);
        }
    }

    const getStorageBalance = async() => {
        const args = {account_id: Auction?.account.accountId!};
        const balance = await Auction?.storage_balance_of(args);
        balance && setBalance((parseInt(balance) / Math.pow(10, 24)).toFixed(2));
    }

    useEffect(() => {
        getStorageBalance();
    }, [Auction])

    return (
        <div>
            <div>
                <div className={css.nft_container}>
                    <div className={css.nft_token}>
                        <b className="title" style={{"padding": "10% 0"}}>Manage Deposit Storage</b><br/><br/>

                        <b className="title">Deposit Storage Balance: {balance} NEAR</b>
                        <button className="secondary" onClick={e=> claim()}>Claim</button><br/><br/>

                        <b className="title">Deposit Amount</b>
                        <input type="number" value={amount.toString()} onChange={e => setAmount(parseFloat(e.target.value))}/>
                        <button className="secondary" onClick={e=> deposit()}>Deposit</button>
                    </div>
                </div>
            </div>
        </div>
    )   
}