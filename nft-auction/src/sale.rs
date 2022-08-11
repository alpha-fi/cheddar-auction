use crate::*;
use near_sdk::promise_result_as_success;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct Bid {
    pub owner_id: AccountId,
    pub price: U128,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Sale {
    pub owner_id: AccountId,
    pub approval_id: u64,
    pub nft_contract_id: String,
    pub token_id: String,
    pub price: u128,
    pub bids: HashMap<FungibleTokenId, Vec<Bid>>,
    pub created_at: U64,
    pub end_at: u64,
    pub ft_token_type: AccountId
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct PurchaseArgs {
    pub nft_contract_id: ValidAccountId,
    pub token_id: TokenId,
}

#[near_bindgen]
impl Contract {
    /// for add sale see: nft_callbacks.rs

    /// TODO remove without redirect to wallet? panic reverts
    #[payable]
    pub fn remove_sale(&mut self, nft_contract_id: ValidAccountId, token_id: String) {
        assert_one_yocto();
        let sale = self.internal_remove_sale(nft_contract_id.into(), token_id);
        
        let owner_id = env::predecessor_account_id();
        assert_eq!(owner_id, sale.owner_id, "Must be sale owner");
        
        // let now = env::block_timestamp() / 1000000;
        // assert!(sale.end_at > now, "Auction is finished already, you cant remove sale.");

        self.refund_all_bids(sale.bids);
    }

    #[payable]
    pub fn offer(&mut self, nft_contract_id: ValidAccountId, token_id: String) {
        let contract_id: AccountId = nft_contract_id.into();
        let contract_and_token_id = format!("{}{}{}", contract_id, DELIMETER, token_id);
        let sale = self.sales.get(&contract_and_token_id).expect("No sale");

        let buyer_id = env::predecessor_account_id();
        assert_ne!(sale.owner_id, buyer_id, "Cannot bid on your own sale.");

        let ft_token_type = sale.ft_token_type.clone();
        assert_eq!(ft_token_type, "near", "Cannot pay offer with near.");

        let deposit = env::attached_deposit();
        assert!(deposit >= sale.price, "Deposit amount must be bigger than reserve price");

        self.add_bid(
            contract_and_token_id,
            deposit,
            ft_token_type,
            buyer_id,
        );
    }

    #[private]
    pub fn add_bid(
        &mut self,
        contract_and_token_id: ContractAndTokenId,
        price: Balance,
        ft_token_type: AccountId,
        buyer_id: AccountId,
    ) {
        let mut sale = self.sales.get(&contract_and_token_id).expect("No sale");
        let now = env::block_timestamp() / 1000000;
        assert!(sale.end_at > now, "auction is finished already");
        if (sale.end_at - FIVE_MINS) < now {
            sale.end_at = now + FIVE_MINS;
        }

        // store a bid and refund any current bid lower
        let new_bid = Bid {
            owner_id: buyer_id,
            price: U128(price),
        };

        assert_eq!(sale.ft_token_type, ft_token_type, "Need to pay with : {}", sale.ft_token_type);

        let bids = sale.bids.entry(ft_token_type.clone()).or_insert_with(Vec::new);

        if !bids.is_empty() {
            let current_bid = bids[bids.len()-1].clone();
            assert!(
                price > current_bid.price.0,
                "Can't pay less than or equal to current bid price: {}",
                current_bid.price.0
            );

            if bids.len() + 1 > self.bid_history_length as usize {
                bids.remove(0);
            }
            // refund previous bid
            self.refund_bid(
                ft_token_type, 
                current_bid.owner_id.clone(), 
                current_bid.price
            );
        }

        bids.push(new_bid);
        
        self.sales.insert(&contract_and_token_id, &sale);
    }

    pub fn accept_offer(
        &mut self,
        nft_contract_id: ValidAccountId,
        token_id: AccountId,
    ) {
        let contract_id: AccountId = nft_contract_id.into();
        let contract_and_token_id = format!("{}{}{}", contract_id.clone(), DELIMETER, token_id.clone());
        // remove bid before proceeding to process purchase
        let sale = self.sales.get(&contract_and_token_id).expect("No sale");
        let ft_token_type = sale.ft_token_type.clone();

        let bids = sale.bids.get(&ft_token_type).expect("No bids");
        let bid = &bids[bids.len()-1];

        let seller_id = env::predecessor_account_id();

        assert_eq!(sale.owner_id.clone(), seller_id.clone(), "Must be owner");
        
        // panics at `self.internal_remove_sale` and reverts above if predecessor is not sale.owner_id
        self.process_purchase(
            contract_id,
            token_id,
            ft_token_type.into(),
            bid.price,
            bid.owner_id.clone(),
            sale
        );
    }

    pub fn claim_nft(
        &mut self,
        nft_contract_id: ValidAccountId,
        token_id: AccountId,
    ) {
        let contract_id: AccountId = nft_contract_id.into();
        let contract_and_token_id = format!("{}{}{}", contract_id.clone(), DELIMETER, token_id.clone());
        // remove bid before proceeding to process purchase
        let sale = self.sales.get(&contract_and_token_id).expect("No sale");
        let ft_token_type = sale.ft_token_type.clone();

        let bids = sale.bids.get(&ft_token_type).expect("No bids");
        let bid = &bids[bids.len()-1];

        let buyer_id = env::predecessor_account_id();
        assert_eq!(bid.owner_id.clone(), buyer_id.clone(), "Only winner can claim nft");

        let now = env::block_timestamp() / 1000000;
        assert!(sale.end_at < now, "Auction is not finished yet");

        // panics at `self.internal_remove_sale` and reverts above if predecessor is not sale.owner_id
        self.process_purchase(
            contract_id,
            token_id,
            ft_token_type.into(),
            bid.price,
            bid.owner_id.clone(),
            sale
        );
    }

    #[private]
    pub fn process_purchase(
        &mut self,
        nft_contract_id: AccountId,
        token_id: String,
        ft_token_type: AccountId,
        price: U128,
        buyer_id: AccountId,
        sale: Sale
    ) -> Promise {
        // let sale = self.internal_remove_sale(nft_contract_id.clone(), token_id.clone());
        ext_contract::nft_transfer_payout(
            buyer_id.clone(),
            token_id,
            sale.approval_id,
            "payout from market".to_string(),
            price,
			10,
            &nft_contract_id,
            1,
            GAS_FOR_NFT_TRANSFER,
        )
        .then(ext_self::resolve_purchase(
            ft_token_type,
            buyer_id,
            sale,
            price,
            &env::current_account_id(),
            NO_DEPOSIT,
            GAS_FOR_ROYALTIES,
        ))
    }

    /// self callback

    #[private]
    pub fn resolve_purchase(
        &mut self,
        ft_token_type: AccountId,
        buyer_id: AccountId,
        sale: Sale,
        price: U128,
    ) -> U128 {
        // checking for payout information
        let payout_option = promise_result_as_success().and_then(|value| {
            // None means a bad payout from bad NFT contract
            near_sdk::serde_json::from_slice::<PayoutResult>(&value)
                .ok()
                .and_then(|payout| {
                    if payout.payout.len() > 10 || payout.payout.is_empty() {
                        near_sdk::log!("Cannot have more than 10 payouts and sale.bids refunds");
                        None
                    } else {
                        let mut remainder = price.0;
                        for &value in payout.payout.values() {
                            remainder = remainder.checked_sub(value.0)?;
                        }
                        if remainder <= 1 {
                            Some(payout)
                        } else {
                            None
                        }
                    }
                })
        });

        // is payout option valid?
        let payout = if let Some(payout_option) = payout_option {
            payout_option
        } else {
            if ft_token_type == "near" {
                Promise::new(buyer_id).transfer(u128::from(price));
            }
            //Remove from sales
            self.internal_remove_sale(sale.nft_contract_id.clone(), sale.token_id.clone());
            // Add to saled
            // self.sales.insert(&contract_and_token_id, &sale_);
            // leave function and return all FTs in ft_resolve_transfer
            return price;
        };

        // NEAR payouts
        if ft_token_type == "near" {
            for (receiver_id, amount) in payout.payout {
                Promise::new(receiver_id).transfer(amount.0);
            }

        } else {
            // FT payouts
            for (receiver_id, amount) in payout.payout {
                ext_contract::ft_transfer(
                    receiver_id,
                    amount,
                    None,
                    &ft_token_type,
                    1,
                    GAS_FOR_FT_TRANSFER,
                );
            }
        }

        //Remove from sales
        self.internal_remove_sale(sale.nft_contract_id.clone(), sale.token_id.clone());
        return price;
    }

    /// refund the last bid of each token type, don't update sale because it's already been removed
    fn refund_bid(&mut self, bid_ft: AccountId, owner_id: AccountId, price: U128) {
        if bid_ft.as_str() == "near" {
            Promise::new(owner_id).transfer(u128::from(price));
        } else {
            ext_contract::ft_transfer(owner_id, price, None, &bid_ft, 1, GAS_FOR_FT_TRANSFER);
        }
    }

    fn refund_all_bids(
        &mut self,
        bids: HashMap<FungibleTokenId, Vec<Bid>>,
    ) {
        for (bid_ft, bid_vec) in bids {
            for bid in bid_vec.iter(){
                self.refund_bid(
                    bid_ft.clone(), 
                    bid.owner_id.clone(), 
                    bid.price
                )
            }
        }
    }
}

/// self call

#[ext_contract(ext_self)]
trait ExtSelf {
    fn resolve_purchase(
        &mut self,
        ft_token_type: AccountId,
        buyer_id: AccountId,
        sale: Sale,
        price: U128,
    ) -> Promise;
}
