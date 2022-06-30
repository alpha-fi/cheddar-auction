import { useParams } from "react-router-dom"
import { AUCTION_CONTRACT_STORAGE_NAME, TENK_CONTRACT_STORAGE_NAME } from "../components"
import { AuctionContractInterface, init_auction, UnknownNetworkError } from "../near"

export default function useAuctionNear(): Partial<AuctionContractInterface> {
  try {
    return init_auction()
  } catch (e: unknown) {
    if (e instanceof UnknownNetworkError) {
      console.log("Unknown network!");
    }
    throw e
  }
}