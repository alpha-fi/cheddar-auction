import { useQuery } from "react-query";
import { Bid, Sale } from "../near/contracts/auction/index";
import { TenkContract, Token } from "../near/contracts/tenk";
import { AuctionContract } from "../near/contracts/auction";
import {
  AUCTION_CONTRACT_ACCOUNT,
  TENK_CONTRACT_ACCOUNT,
} from "../components/Constants/Contracts";
import { TokenSale } from "../components";

const getNFT = async (nftid: string, tenk: TenkContract) => {
  const args = { token_id: nftid };
  let res: Token = await tenk.account.viewFunction(
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

    const contractMetadata = await tenk?.account.viewFunction(
      TENK_CONTRACT_ACCOUNT,
      "nft_metadata"
    );
    if (res) {
      for (let i = 0; i < res.length; i++) {
        const bids: Bid[] =
          new Map<string, Bid[]>(Object.entries(res[i].bids)).get(
            res[i].ft_token_type
          ) || [];

        if (parseFloat(res[i].end_at) > Date.now()) {
          const nft = await getNFT(res[i].token_id, tenk);

          const token_sale = {
            sale: {
              ...res[i],
              bids_length: bids.length,
              last_bid_price:
                bids.length > 0
                  ? (
                      parseInt(bids[bids.length - 1].price) / Math.pow(10, 24)
                    ).toFixed(2)
                  : undefined,
            },
            token: nft,
            nftsName: contractMetadata.name,
          };
          token_sales.push(token_sale);
        }
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
    notifyOnChangePropsExclusions: ["isStale", "isRefetching", "isFetching"],
  });
};
