import * as nearAPI from 'near-api-js';

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
   async storage_deposit(args: {}, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.storage_depositRaw(args, options));
  }

  storage_depositRaw(args: {}, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "storage_deposit", args, ...options});
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
      token_id: args.token_id,
      account_id: args.account_id,
      msg: JSON.stringify({ period, token_type, price, nft_contract_id })
    }

    return providers.getTransactionLastResult(await this.create_auctionRaw(new_arg, options));
  }

  create_auctionRaw(args: {
    token_id: u32;
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
    // const attached = options.attachedDeposit as BN;
    // const options_new = {
    //   gas: options?.gas,
    //   attachedDeposit: attached.mul(new BN(Math.pow(10, 24))),
    //   walletMeta: '',
    //   walletCallbackUrl: ''
    // }
    return providers.getTransactionLastResult(await this.offerRaw(args_new, options));
  }

  offerRaw(args: {}, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "offer", args, ...options});
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
}

export interface Sale {
  owner_id: AccountId;
  approval_id: u64,
  nft_contract_id: AccountId,
  token_id: TokenId,
  price: u64,
  created_at: U128,
  end_at: U128,
  token_type: string
}