import { useQuery } from "react-query";
import { Bid, Sale } from "../near/contracts/auction/index";
import { TenkContract, Token } from "../near/contracts/tenk";
import { AuctionContract } from "../near/contracts/auction";
import {
  AUCTION_CONTRACT_ACCOUNT,
  TENK_CONTRACT_ACCOUNT,
} from "../components/Constants/Contracts";
import { DELIMETER, TokenSale } from "../components";

const getSaleForNFT = async (nftid: string, auction: AuctionContract) => {
  const nft_contract_token = TENK_CONTRACT_ACCOUNT + DELIMETER + nftid;
  const args = { nft_contract_token: nft_contract_token };

  const res: Sale = await auction?.account.viewFunction(
    AUCTION_CONTRACT_ACCOUNT,
    "get_sale",
    args
  );

  return res;
};

const getAuctions = async (
  tenk: TenkContract | undefined,
  auction: AuctionContract | undefined
) => {
  const token_sales: TokenSale[] = [];
  if (tenk?.account.accountId && auction) {
    const args = {
      account_id: tenk.account.accountId,
      from_index: "0",
      limit: 50,
    };
    const res: Token[] = await tenk.account.viewFunction(
      tenk.contractId,
      "nft_tokens_for_owner",
      args
    );
    const contractMetadata = await tenk?.account.viewFunction(
      TENK_CONTRACT_ACCOUNT,
      "nft_metadata"
    );
    if (res) {
      for (let i = 0; i < res.length; i++) {
        const sale: Sale = await getSaleForNFT(res[i].token_id, auction);
        const bids: Bid[] = sale.bids
          ? new Map<string, Bid[]>(Object.entries(sale.bids)).get(
              sale.ft_token_type
            ) || []
          : [];

        const token_sale = {
          token: res[i],
          sale: {
            ...sale,
            bids_length: bids.length,
            last_bid_price:
              bids.length > 0
                ? (
                    parseInt(bids[bids.length - 1].price) / Math.pow(10, 24)
                  ).toFixed(2)
                : undefined,
          },
          nftsName: contractMetadata.name,
        };
        token_sales.push(token_sale);
      }
    }
  }
  return token_sales;
};

export const useUserNFTs = (
  tenk: TenkContract | undefined,
  auction: AuctionContract | undefined
) => {
  return useQuery(["UserNFTs"], () => getAuctions(tenk, auction), {
    refetchInterval: 30000,
    notifyOnChangePropsExclusions: ["isStale", "isRefetching", "isFetching"],
  });
};
