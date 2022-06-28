import { useParams } from "react-router-dom"
// import { TENK_CONTRACT_STORAGE_NAME } from "../components"
import { ContractInterface, init, UnknownNetworkError } from "../near"

export default function useTenkNear(): Partial<ContractInterface> {
  // const { contract } = useParams<{contract: string }>()
  // const tenk_contract = window.localStorage.getItem(TENK_CONTRACT_STORAGE_NAME);

  // if (!tenk_contract) return {}

  try {
    return init()
  } catch (e: unknown) {
    if (e instanceof UnknownNetworkError) {
      console.log("Unknown network!");
    }
    throw e
  }
}