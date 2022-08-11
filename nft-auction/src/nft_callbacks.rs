use crate::*;
/// approval callbacks from NFT Contracts

/// should check auction duration
const EXTENSION_DURATION : u64 = 15 * 60 * 1000; //15 minutes
const MAX_DURATION: u64 = 1000 * 60 * 60 * 24 * 1000; // 1000 days



#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct SaleArgs {
    pub price: u128,
    pub period: u64,
    pub token_type: TokenType,
    pub nft_contract_id: AccountId
}

trait NonFungibleTokenApprovalsReceiver {
    fn nft_on_approve(
        &mut self,
        token_id: TokenId,
        owner_id: ValidAccountId,
        approval_id: u64,
        msg: String,
    );
}

#[near_bindgen]
impl NonFungibleTokenApprovalsReceiver for Contract {
    /// where we add the sale because we know nft owner can only call nft_approve

    fn nft_on_approve(
        &mut self,
        token_id: TokenId,
        owner_id: ValidAccountId,
        approval_id: u64,
        msg: String,
    ) {
        // enforce cross contract call and owner_id is signer
        let SaleArgs { period, token_type, price, nft_contract_id } = 
            near_sdk::serde_json::from_str(&msg).expect("Not valid SaleArgs");
        
        assert!(nft_contract_id == env::predecessor_account_id());

        let signer_id = env::signer_account_id();
        assert_ne!(
            nft_contract_id.to_string(),
            signer_id.as_ref(),
            "nft_on_approve should only be called via cross-contract call"
        );
        assert_eq!(
            owner_id.as_ref(),
            &signer_id,
            "owner_id should be signer_id"
        );
        assert!(
            period > EXTENSION_DURATION,
            "auction period must be more then {} milliSeconds", EXTENSION_DURATION
        );
        assert!(
            period < MAX_DURATION,
            "auction period must be less then {} milliSeconds", MAX_DURATION
        );
        assert!(
            price > 0,
            "price must be bigger than zero"
        );

        let created_at = env::block_timestamp() / 1000000;
        let end_at = created_at + period;

        if let Some(token_type) = token_type {
            if !self.ft_token_ids.contains(&token_type) {
                env::panic(
                    format!("Token {} not supported by this market", token_type).as_bytes(),
                );
            }

            let contract_and_token_id = format!("{}{}{}", nft_contract_id, DELIMETER, token_id);
            let price_real = price * 1_000_000_000_000_000_000_000_000;

            self.sales.insert(
                &contract_and_token_id,
                &Sale {
                    owner_id: owner_id.clone().into(),
                    approval_id,
                    nft_contract_id: nft_contract_id.to_string(),
                    token_id: token_id.clone(),
                    price: price_real,
                    created_at: U64(created_at),
                    end_at,
                    ft_token_type: token_type,
                    bids: HashMap::new(),
                },
            );
    
            // extra for views
    
            let mut by_owner_id = self.by_owner_id.get(owner_id.as_ref()).unwrap_or_else(|| {
                UnorderedSet::new(
                    StorageKey::ByOwnerIdInner {
                        account_id_hash: hash_account_id(owner_id.as_ref()),
                    }
                    .try_to_vec()
                    .unwrap(),
                )
            });
    
            // let owner_occupied_storage = u128::from(by_owner_id.len()) * STORAGE_PER_SALE;
            // assert!(
            //     owner_paid_storage > owner_occupied_storage,
            //     "User has more sales than storage paid"
            // );
            by_owner_id.insert(&contract_and_token_id);
            self.by_owner_id.insert(owner_id.as_ref(), &by_owner_id);
    
            let mut by_nft_contract_id = self.by_nft_contract_id.get(&nft_contract_id).unwrap_or_else(|| {
                    UnorderedSet::new(
                        StorageKey::ByNFTContractIdInner {
                            account_id_hash: hash_account_id(&nft_contract_id),
                        }
                        .try_to_vec()
                        .unwrap(),
                    )
                });
            by_nft_contract_id.insert(&contract_and_token_id);
            self.by_nft_contract_id
                .insert(&nft_contract_id, &by_nft_contract_id);
        } else {
            env::panic(
                ("Token type need to be specified.").as_bytes(),
            );
        }
    }
}
