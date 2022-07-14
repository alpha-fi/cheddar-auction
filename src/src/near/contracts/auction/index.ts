import * as nearAPI from 'near-api-js';
import { FT_CONTRACT_ACCOUNT } from '../../../components/Constants/Contracts';
import {
  Account,
  transactions,
  providers,
  DEFAULT_FUNCTION_CALL_GAS,
  u8,
  i8,
  u16,
  i16,
  u32,
  i32,
  u64,
  i64,
  f32,
  f64,
  BN,
  ChangeMethodOptions,
  ViewFunctionOptions,
} from './helper';


import {
  TimestampMs,
  AccountId,
  Balance,
  U128
} from '../tenk/index';


const {
	utils: { format: { parseNearAmount } },
} = nearAPI;

export type FTType = string;
export type TokenId = string;

export class AuctionContract {
  
  constructor(public account: Account, public readonly contractId: string, public readonly nft_contract_id: string){}

  /**
  * End public deposit storage, if no storage cant create auction.
  * @allow ["::owner"]
  */
   async storage_deposit(args: {account_id: AccountId}, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.storage_depositRaw(args, options));
  }

  storage_depositRaw(args: {}, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "storage_deposit", args, ...options});
  }

  /**
  * End public deposit storage, if no storage cant create auction.
  * @allow ["::owner"]
  */
  async storage_withdraw(args: {}, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.storage_depositRaw(args, options));
  }

  storage_withdrawRaw(args: {}, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "storage_withdraw", args, ...options});
  }

  /**
  * End public deposit storage, if no storage cant create auction.
  * @allow ["::owner"]
  */
  async create_auction(args : {
    token_id: u32;
    account_id: AccountId;
    period: u32;
    price: u32;
    token_type: FTType;
  }, options?: ChangeMethodOptions): Promise<boolean> {

    const period = args.period;
    const token_type = args.token_type;
    const price = args.price;
    const nft_contract_id = this.nft_contract_id;

    const new_arg = {
      token_id: args.token_id.toString(),
      account_id: args.account_id,
      msg: JSON.stringify({ period, token_type, price, nft_contract_id })
    }

    return providers.getTransactionLastResult(await this.create_auctionRaw(new_arg, options));
  }

  create_auctionRaw(args: {
    token_id: string;
    account_id: AccountId;
    msg?: string;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.nft_contract_id, methodName: "nft_approve", args, ...options});
  }

  /**
  * End public place offer to auction, attached Amount is price of offer
  * @allow ["::owner"]
  */
   async offer(args: {token_id: TokenId}, options: ChangeMethodOptions): Promise<boolean> {
    const args_new = {token_id: args.token_id, nft_contract_id: this.nft_contract_id};
    return providers.getTransactionLastResult(await this.offerRaw(args_new, options));
  }

  offerRaw(args: {}, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "offer", args, ...options});
  }

    /**
  * End public place offer to auction, attached Amount is price of offer
  * @allow ["::owner"]
  */
  async offer_cheddar(args: {token_id: TokenId, amount: string}, options: ChangeMethodOptions): Promise<boolean> {
    const nft_contract_id = this.nft_contract_id;
    const token_id = args.token_id;
    const args_new = {receiver_id: this.contractId, amount:args.amount.toString(), msg: JSON.stringify({nft_contract_id, token_id})};
    console.log("arg_new: ", args_new);
    return providers.getTransactionLastResult(await this.offer_cheddarRaw(args_new, options));
  }

  offer_cheddarRaw(args: {}, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: FT_CONTRACT_ACCOUNT, methodName: "ft_transfer_call", args, ...options});
  }

    /**
  * End public accept offer to auction
  * @allow ["::owner"]
  */
  async accept_offer(args: {token_id: TokenId}, options: ChangeMethodOptions): Promise<boolean> {
    const args_new = {token_id: args.token_id, nft_contract_id: this.nft_contract_id};
    return providers.getTransactionLastResult(await this.accept_offerRaw(args_new, options));
  }

  accept_offerRaw(args: {}, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "accept_offer", args, ...options});
  }

   /**
  * End public accept offer to auction
  * @allow ["::owner"]
  */
  async claim_nft(args: {token_id: TokenId}, options: ChangeMethodOptions): Promise<boolean> {
    const args_new = {token_id: args.token_id, nft_contract_id: this.nft_contract_id};
    return providers.getTransactionLastResult(await this.claim_nftRaw(args_new, options));
  }

  claim_nftRaw(args: {}, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "claim_nft", args, ...options});
  }

      /**
  * End public accept offer to auction
  * @allow ["::owner"]
  */
  async remove_sale(args: {token_id: TokenId}, options: ChangeMethodOptions): Promise<boolean> {
    const args_new = {token_id: args.token_id, nft_contract_id: this.nft_contract_id};
    return providers.getTransactionLastResult(await this.remove_saleRaw(args_new, options));
  }

  remove_saleRaw(args: {}, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "remove_sale", args, ...options});
  }

  get_supply_sales(args: {}, options?: ViewFunctionOptions): Promise<u64> {
    return this.account.viewFunction(this.contractId, "get_supply_sales", args, options);
  }

  get_sales_by_owner_id(args: {
    account_id: AccountId,
    from_index: U128,
    limit: u64
  }, options?: ViewFunctionOptions): Promise<Sale[]>{
    return this.account.viewFunction(this.contractId, "get_sales_by_owner_id", args, options);
  }

  get_sale(args: {nft_contract_token: string}, options?: ViewFunctionOptions): Promise<Sale>{
    return this.account.viewFunction(this.contractId, "get_sale", args, options);
  }

  get_sales_by_nft_contract_id(args: {from_index: string, limit: u64}, options?: ViewFunctionOptions): Promise<Sale[]>{
    const new_args = {
      nft_contract_id: this.nft_contract_id,
      form_index: args.from_index,
      limit: args.limit
    }
    return this.account.viewFunction(this.contractId, "get_sales_by_nft_contract_id", new_args, options)
  }

  storage_balance_of(args: {account_id: AccountId}, options?: ViewFunctionOptions): Promise<U128>{
    return this.account.viewFunction(this.contractId, "storage_balance_of", args, options);
  }
}

export interface Sale {
  owner_id: AccountId;
  approval_id: u64,
  nft_contract_id: AccountId,
  token_id: TokenId,
  price: u64,
  created_at: U128,
  end_at: U128,
  ft_token_type: string,
  bids?: Map<String, Bid[]>
}

export interface SaleView {
  bid_count?: Number,
  bids?: Bid[],
  created_at: U128,
  price: u64,
  end_at: U128,
  ft_token_type: string
}

export interface Bid{
  owner_id: AccountId,
  price: U128
}