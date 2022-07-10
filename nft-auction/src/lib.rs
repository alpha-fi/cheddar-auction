use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedMap, UnorderedSet};
use near_sdk::json_types::{ValidAccountId, U128, U64};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    assert_one_yocto, env, ext_contract, near_bindgen, AccountId, Balance, Gas, PanicOnDefault,
    Promise, PromiseOrValue, CryptoHash, BorshStorageKey,
};
use near_contract_standards::non_fungible_token::TokenId;
use std::cmp::min;
use std::collections::HashMap;

use crate::external::*;
use crate::internal::*;
use crate::sale::*;
use near_sdk::env::STORAGE_PRICE_PER_BYTE;

mod external;
mod ft_callbacks;
mod internal;
mod nft_callbacks;
mod sale;
mod sale_views;

near_sdk::setup_alloc!();

// TODO check seller supports storage_deposit at ft_token_id they want to post sale in

const GAS_FOR_FT_TRANSFER: Gas = 5_000_000_000_000;
/// greedy max Tgas for resolve_purchase
const GAS_FOR_ROYALTIES: Gas = 115_000_000_000_000;
const GAS_FOR_NFT_TRANSFER: Gas = 15_000_000_000_000;
const BID_HISTORY_LENGTH_DEFAULT: u8 = 1;
const NO_DEPOSIT: Balance = 0;
const STORAGE_PER_SALE: u128 = 1000 * STORAGE_PRICE_PER_BYTE;
const FIVE_MINS : u64 = 5 * 60 * 1000;
static DELIMETER: &str = "||";

pub type TokenType = Option<String>;
pub type FungibleTokenId = AccountId;
pub type ContractAndTokenId = String;
// TODO: Capital U128
pub type Payout = HashMap<AccountId, U128>;
#[derive(Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct StorageBalanceBounds {
    pub min: U128,
    pub max: Option<U128>,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub owner_id: AccountId,
    pub sales: UnorderedMap<ContractAndTokenId, Sale>,
    pub by_owner_id: LookupMap<AccountId, UnorderedSet<ContractAndTokenId>>,
    pub by_nft_contract_id: LookupMap<AccountId, UnorderedSet<TokenId>>,
    pub ft_token_ids: UnorderedSet<AccountId>,
    // pub storage_deposits: LookupMap<AccountId, Balance>,
    pub bid_history_length: u8,
}

/// Helper structure to for keys of the persistent collections.
#[derive(BorshStorageKey, BorshSerialize)]
pub enum StorageKey {
    Sales,
    ByOwnerId,
    ByOwnerIdInner { account_id_hash: CryptoHash },
    ByNFTContractId,
    ByNFTContractIdInner { account_id_hash: CryptoHash },
    ByNFTTokenType,
    ByNFTTokenTypeInner { token_type_hash: CryptoHash },
    FTTokenIds,
    StorageDeposits,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new(owner_id: ValidAccountId, bid_history_length:Option<u8>) -> Self {
        let mut this = Self {
            owner_id: owner_id.into(),
            sales: UnorderedMap::new(StorageKey::Sales),
            by_owner_id: LookupMap::new(StorageKey::ByOwnerId),
            by_nft_contract_id: LookupMap::new(StorageKey::ByNFTContractId),
            ft_token_ids: UnorderedSet::new(StorageKey::FTTokenIds),
            // storage_deposits: LookupMap::new(StorageKey::StorageDeposits),
            bid_history_length: bid_history_length.unwrap_or(BID_HISTORY_LENGTH_DEFAULT),
        };
        // support NEAR by default
        this.ft_token_ids.insert(&"near".to_string());
        this.ft_token_ids.insert(&"token-v3.cheddar.testnet".to_string());

        this
    }
}
