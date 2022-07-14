use crate::*;
/// callbacks from FT Contracts

trait FungibleTokenReceiver {
    fn ft_on_transfer(&mut self, sender_id: AccountId, amount: U128, msg: String) -> PromiseOrValue<U128>;
}

#[near_bindgen]
impl FungibleTokenReceiver for Contract {
    fn ft_on_transfer(&mut self, sender_id: AccountId, amount: U128, msg: String) -> PromiseOrValue<U128> {
        let PurchaseArgs {
            nft_contract_id,
            token_id,
        } = near_sdk::serde_json::from_str(&msg).expect("Invalid PurchaseArgs");

        let contract_and_token_id = format!("{}{}{}", nft_contract_id, DELIMETER, token_id);
        let sale = self
            .sales
            .get(&contract_and_token_id)
            .expect("No sale in ft_on_transfer");
        
        assert_ne!(sale.owner_id, sender_id, "Cannot buy your own sale.");

        let ft_token = env::predecessor_account_id();
        assert_eq!(sale.ft_token_type, ft_token, "Cannot pay offer with this token.");

        let price = sale.price;

        assert!(amount.0 > 0, "Amount must be greater than 0");
        assert!(amount.0 >= price, "Amount must be greater than reserve price");

        self.add_bid(
            contract_and_token_id,
            amount.0,
            ft_token,
            sender_id,
        );

        PromiseOrValue::Value(U128(0))
    }
}
