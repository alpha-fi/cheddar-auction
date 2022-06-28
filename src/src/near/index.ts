import * as naj from "near-api-js"
import { AUCTION_CONTRACT_ACCOUNT, TENK_CONTRACT_ACCOUNT } from "../components/Constants/Contracts"
import { AuctionContract } from "./contracts/auction"
import { TenkContract } from "./contracts/tenk"

// TODO: remove pending https://github.com/near/near-api-js/issues/757
import { Buffer } from "buffer"
if (typeof window !== "undefined") window.Buffer = Buffer
if (typeof global !== "undefined") global.Buffer = Buffer

const mainnetConfig = {
  networkId: "mainnet",
  nodeUrl: "https://rpc.mainnet.near.org",
  walletUrl: "https://wallet.near.org",
  helperUrl: "https://helper.mainnet.near.org",
} as const

const testnetConfig = {
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
} as const

export class UnknownNetworkError extends Error {
  constructor(contract: string) {
    super(
      `Don't know what network settings to use for contract "${contract}". ` +
      `Expected name to end in 'testnet' or 'near'.`
    )
    this.name = 'UnknownNetworkError'
  }
}

type ContractName = string

export interface ContractInterface {
  tenk_contract: string,
  config: typeof testnetConfig | typeof mainnetConfig
  near: naj.Near
  wallet: naj.WalletConnection
  signIn: () => void
  signOut: () => void
  Tenk: TenkContract
}

export interface AuctionContractInterface {
  auction_contract: string,
  config: typeof testnetConfig | typeof mainnetConfig
  near: naj.Near
  wallet: naj.WalletConnection
  signIn: () => void
  signOut: () => void
  Auction: AuctionContract
}

const cache: Record<ContractName, ContractInterface> = {}
const cache_auction: Record<ContractName, AuctionContractInterface> = {}

/**
 * Get config, NEAR object, wallet connection, and signIn function given a
 * contract account name/id.
 *
 * Memoizes return values so that same object references are always returned for
 * a given contract, so React won't rerender needlessly.
 *
 * @param contract Contract account id/name to sign in against
 */
export function init(): ContractInterface {
  const tenk_contract = TENK_CONTRACT_ACCOUNT;
  if (cache[tenk_contract]) return cache[tenk_contract]

  const config = /near$/.test(tenk_contract)
    ? mainnetConfig
    : /testnet$/.test(tenk_contract)
    ? testnetConfig
    : undefined

  if (!config) throw new UnknownNetworkError(tenk_contract)

  const near = new naj.Near({
    ...config,
    keyStore: typeof window === "undefined"
      ? new naj.keyStores.InMemoryKeyStore()
      : new naj.keyStores.BrowserLocalStorageKeyStore()
  })

  const wallet = new naj.WalletConnection(near)

  function signIn() {
    wallet.requestSignIn({ contractId: tenk_contract })
  }

  function signOut() {
    wallet.signOut()
    window.location.replace(window.location.origin + window.location.pathname)
  }

  const Tenk = new TenkContract(wallet.account(), tenk_contract)

  cache[tenk_contract] = { tenk_contract, config, near, wallet, signIn, signOut, Tenk }

  return cache[tenk_contract]
}

export function init_auction(): AuctionContractInterface {
  const auction_contract = AUCTION_CONTRACT_ACCOUNT;
  const tenk_contract = TENK_CONTRACT_ACCOUNT;
  if (cache_auction[auction_contract]) return cache_auction[auction_contract]

  const config = /near$/.test(auction_contract)
    ? mainnetConfig
    : /testnet$/.test(auction_contract)
    ? testnetConfig
    : undefined

  if (!config) throw new UnknownNetworkError(auction_contract)

  const near = new naj.Near({
    ...config,
    keyStore: typeof window === "undefined"
      ? new naj.keyStores.InMemoryKeyStore()
      : new naj.keyStores.BrowserLocalStorageKeyStore()
  })

  const wallet = new naj.WalletConnection(near)

  function signIn() {
    wallet.requestSignIn({ contractId: auction_contract })
  }

  function signOut() {
    wallet.signOut()
    window.location.replace(window.location.origin + window.location.pathname)
  }

  const Auction = new AuctionContract(wallet.account(), auction_contract, tenk_contract)

  cache_auction[auction_contract] = { auction_contract, config, near, wallet, signIn, signOut, Auction }

  return cache_auction[auction_contract]
}