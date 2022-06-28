import tenk_topLevelSchema from "./contracts/tenk/index.schema.json";
import auction_topLevelSchema from "./contracts/auction/auction.schema.json";
import { JSONSchema7 } from "json-schema";
import { Contract } from "near-api-js";

export type tenk_MethodName = keyof typeof tenk_topLevelSchema.definitions
export type auction_MethodName = keyof typeof auction_topLevelSchema.definitions;
export type Schema = { schema: { $ref: string } & JSONSchema7 }

export enum ContractType {
  TENK_CONTRACT,
  AUCTION_CONTACT
}

function hasContractMethodProperty(obj: {}): obj is {contractMethod: "change" | "view"} {
  return 'contractMethod' in obj
}

function hasContractMethodTenk(m: tenk_MethodName, equalTo?: "change" | "view"): boolean {
    const def = tenk_topLevelSchema.definitions[m];
    
    const hasField = hasContractMethodProperty(def)
    if (!hasField) return false
    if (!equalTo) return true
    return def.contractMethod === equalTo
}

function hasContractMethodAuction(m: auction_MethodName, equalTo?: "change" | "view"): boolean {
  const def_auction = auction_topLevelSchema.definitions[m];
    
  const hasField = hasContractMethodProperty(def_auction)
  if (!hasField) return false
  if (!equalTo) return true
  return def_auction.contractMethod === equalTo
}

export const tenk_changeMethods = Object.keys(tenk_topLevelSchema.definitions).filter(m =>
  hasContractMethodTenk(m as tenk_MethodName, "change" ) &&
    !['New', 'NewDefaultMeta'].includes(m)
) as tenk_MethodName[]

export const auction_changeMethods = Object.keys(auction_topLevelSchema.definitions).filter( m => 
  hasContractMethodAuction(m as auction_MethodName, "change" ) &&
  !['New', 'NewDefaultMeta'].includes(m)
) as auction_MethodName[]

export const tenk_viewMethods = Object.keys(tenk_topLevelSchema.definitions).filter(m =>
  hasContractMethodTenk(m as tenk_MethodName, "view")
) as tenk_MethodName[]

export const auction_viewMethods = Object.keys(auction_topLevelSchema.definitions).filter(m => 
  hasContractMethodAuction(m as auction_MethodName, "view")
) as auction_MethodName[]

export const tenk_methods = Object.keys(tenk_topLevelSchema.definitions).filter(
  m => hasContractMethodTenk(m as tenk_MethodName)
).reduce(
  (all, methodName) => ({ ...all,
    [methodName]: {
      schema: {
        $ref: `#/definitions/${methodName}`,
        ...tenk_topLevelSchema,
      }
    }
  }),
  {} as Record<tenk_MethodName, Schema>
)

export const auction_methods = Object.keys(auction_topLevelSchema.definitions).filter(
  m => hasContractMethodAuction(m as auction_MethodName)
).reduce(
  (all, methodName) => ({ ...all,
    [methodName]: {
      schema: {
        $ref: `#/definitions/${methodName}`,
        ...auction_topLevelSchema,
      }
    }
  }),
  {} as Record<auction_MethodName, Schema>
)

export function getMethod(m?: string | null, contractType?: "tenk" | "auction"): Schema | undefined {
  console.log("parameters", m, contractType, tenk_methods, auction_methods);

  if (!m) return undefined
  if(contractType == "tenk")
  {
    if (!hasContractMethodTenk(m as tenk_MethodName)) return undefined
    return tenk_methods[m as tenk_MethodName]
  } else {
    if (!hasContractMethodAuction(m as auction_MethodName)) return undefined
    return auction_methods[m as auction_MethodName]
  }
}

type MethodDefinition = {
  additionalProperties?: boolean
  contractMethod?: "view" | "change"
  properties?: {
    args: {
      additionalProperties: boolean
      properties: Record<string, JSONSchema7>
      required?: string[]
      type?: string
    }
    options?: {
      additionalProperties: boolean
      properties: Record<string, JSONSchema7>
      required?: string[]
      type?: string
    }
  },
  required?: string[]
  type?: string
}

export function getDefinition(m?: string, contractType?: "tenk" | "auction"): MethodDefinition | undefined {
  if (!m) return undefined
  if(contractType == "tenk")
  {
    const def = tenk_topLevelSchema.definitions[m as tenk_MethodName]
    if (!def) return undefined
    if (!hasContractMethodProperty(def)) return undefined
    return def as MethodDefinition
  }
  else {
    const def = auction_topLevelSchema.definitions[m as auction_MethodName]
    if (!def) return undefined
    if (!hasContractMethodProperty(def)) return undefined
    return def as MethodDefinition
  }
}