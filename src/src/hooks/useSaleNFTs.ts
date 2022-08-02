import { useQuery } from "react-query";
import { Sale } from "../near/contracts/auction/index";
import { TenkContract } from "../near/contracts/tenk";
import { AuctionContract } from "../near/contracts/auction";
import {
  AUCTION_CONTRACT_ACCOUNT,
  TENK_CONTRACT_ACCOUNT,
} from "../components/Constants/Contracts";
import { TokenSale } from "../components";

const getNFT = async (nftid: string, tenk: TenkContract) => {
  const args = { token_id: nftid };
  const res: Sale = await tenk?.account.viewFunction(
    tenk.contractId,
    "nft_token",
    args
  );
  return res;
};

const getAuctions = async (
  tenk: TenkContract | undefined,
  auction: AuctionContract | undefined
) => {
  const token_sales: TokenSale[] = [];
  if (tenk && auction) {
    const args = {
      nft_contract_id: TENK_CONTRACT_ACCOUNT,
      from_index: "0",
      limit: 50,
    };

    const res = await auction.account.viewFunction(
      AUCTION_CONTRACT_ACCOUNT,
      "get_sales_by_nft_contract_id",
      args
    );
    if (res) {
      for (let i = 0; i < res.length; i++) {
        const nft = await getNFT(res[i].token_id, tenk);
        const token_sale = {
          sale: res[i],
          token: nft,
        };
        token_sales.push(token_sale);
      }
    }
  }
  return token_sales;
};

export const useSaleNFTs = (
  tenk: TenkContract | undefined,
  auction: AuctionContract | undefined
) => {
  return useQuery(["SaleNFTs"], () => getAuctions(tenk, auction), {
    refetchInterval: 30000,
    cacheTime: 0,
    notifyOnChangePropsExclusions: ["isStale", "isRefetching", "isFetching"],
  });
};
