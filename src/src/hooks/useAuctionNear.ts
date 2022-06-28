import { useParams } from "react-router-dom"
import { AUCTION_CONTRACT_STORAGE_NAME, TENK_CONTRACT_STORAGE_NAME } from "../components"
import { AuctionContractInterface, init_auction, UnknownNetworkError } from "../near"

export default function useAuctionNear(): Partial<AuctionContractInterface> {
  const auction_contract = window.localStorage.getItem(AUCTION_CONTRACT_STORAGE_NAME);
  const tenk_contract = window.localStorage.getItem(TENK_CONTRACT_STORAGE_NAME);
  if (!auction_contract || !tenk_contract) return {}

  try {
    return init_auction()
  } catch (e: unknown) {
    if (e instanceof UnknownNetworkError) {
      console.log("Unknown network!");
    }
    throw e
  }
}