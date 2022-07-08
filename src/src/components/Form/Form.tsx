import React, { useEffect, useMemo, useState } from "react";
import { withTheme } from "@rjsf/core";
import snake from "to-snake-case";
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import useTenkNear from "../../hooks/useTenkNear"
import useAuctionNear from "../../hooks/useAuctionNear";
import { SelectorTenk, SelectorAuction } from ".."
import { getMethod, getDefinition, ContractType } from "../../near/methods"

import css from "./form.module.css"

type Data = Record<string, any>

type FormData = {
  args: Data
  options?: Data
}

type WrappedFormData = {
  formData?: FormData
}

const FormComponent = withTheme({})

const Display: React.FC<React.PropsWithChildren<{
  result?: string
  error?: string
}>> = ({ result, error }) => {
  if (!result && !error) return null

  return (
    <>
      <strong style={{ paddingBottom: 5 }}>
        {result ? "Result" : "Error"}:
      </strong>
      <pre className={error && css.error}>
        <code className={css.result}>
          {result ?? error}
        </code>
      </pre>
    </>
  )
}

function encodeData(formData: FormData): { data: string } {
  const data = encodeURIComponent(JSON.stringify(formData))
  return { data }
}

const decodeDataCache: [string | undefined, FormData | undefined] = [undefined, undefined]

/**
 * Parse URL search params for `data` param and decode it using `decodeURIComponent` and `JSON.parse`.
 * @param searchParams URLSearchParams object from `useSearchParams` from `react-router-dom`
 * @returns value of decoded `data` param with exact same object identity as long as param has not changed. This allows using it in React effect dependencies without infinite loops.
 */
function decodeData(searchParams: URLSearchParams): undefined | FormData {
  const entries = Object.fromEntries(searchParams.entries())
  const { data } = entries ?? '{}' as { data?: string }
  if (!data) return undefined
  if (decodeDataCache[0] === data) return decodeDataCache[1]
  decodeDataCache[0] = data
  decodeDataCache[1] = JSON.parse(decodeURIComponent(data))
  return decodeDataCache[1]
}

function allFilled(formData?: FormData, required?: string[]) {
  if (!required) return true
  if (!formData) return false
  return required.reduce(
    (acc, field) => acc && ![undefined, null, ''].includes(formData.args[field]),
    true
  )
}

export function Form() {
  const { Tenk } = useTenkNear()
  const { Auction } = useAuctionNear();
  const { contractType, method } = useParams<{ contractType: string, method: string }>()
  const [tenk_method, setTenkMethod] = useState<string>('Tenk Method')
  const [auction_method, setAuctionMethod] = useState<string>('Auction Method')
  const [searchParams, setSearchParams] = useSearchParams()
  const formData = decodeData(searchParams)
  const [liveValidate, setLiveValidate] = useState<boolean>(false)
  const [result, setResult] = useState<any>()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<any>()
  const schema = contractType == "tenk" ? method && getMethod(method, "tenk")?.schema : method && getMethod(method, "auction")?.schema;
  const navigateRaw = useNavigate()

  // console.log("contractType", contractType);
  // console.log("tenk", Tenk);
  // console.log("auction", Auction);
  // console.log("schema", schema);
  console.log("searchParams", searchParams);

  const setFormData = useMemo(() => ({ formData: newFormData }: WrappedFormData) => {
    setSearchParams(
      newFormData ? encodeData(newFormData) : '',
      { replace: true }
    )
  }, [setSearchParams])

  const navigate = useMemo(() => (path: string) => {
    setResult(undefined)
    setError(undefined)
    navigateRaw(path)
  }, [navigateRaw])


  const onSubmit = useMemo(() => async ({ formData }: WrappedFormData) => {
    setLoading(true)
    setError(undefined)
    try {
        // @ts-expect-error can't see final method name
        const res = contractType == "tenk" ? await Tenk[snake(method)](formData?.args, formData?.options): await Auction[snake(method)](formData?.args, formData?.options);
        console.log("res", res);
        setResult(JSON.stringify(res, null, 2));
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? JSON.stringify(e.message, null, 2)
          : JSON.stringify(e)
      )
    } finally {
      setLoading(false)
    }
  }, [Tenk, Auction, method])

  // at first load, auto-submit if required arguments are fill in
  useEffect(() => {
    const def = contractType == "tenk" ? getDefinition(method, "tenk") : getDefinition(method, "auction"); 
    if (def?.contractMethod === 'view' && allFilled(formData, def?.properties?.args?.required)) {
      setTimeout(() => onSubmit({ formData }), 100)
    }
  }, [method]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="columns">
        <label>
          Tenk Contract
        </label>
        <SelectorTenk
          value={contractType == "tenk" ? method && snake(method) : "tenk_method"}
          onSelected={newMethod => {
            if (method !== newMethod) {
              navigate(`/tenk/${newMethod}`);
            }
          }}
        />
        <label>
          <input
            type="checkbox"
            onChange={e => setLiveValidate(e.target.checked)}
          />
          Live Validation
        </label>
      </div>

      <div className="columns">
        <label>
          Auction Contract
        </label>
        <SelectorAuction
          value={contractType == "auction" ? method && snake(method) : "auction_method"}
          onSelected={newMethod => {
            if (method !== newMethod) {
              navigate(`/marketplace/auction/${newMethod}`);
            }
          }}
        />
        <label>
          <input
            type="checkbox"
            onChange={e => setLiveValidate(e.target.checked)}
          />
          Live Validation
        </label>
      </div>
      {schema && (
        <div className="columns" style={{ alignItems: 'flex-start' }}>
          <FormComponent
            key={contractType == "tenk" ? tenk_method : auction_method /* re-initialize form when method changes */}
            liveValidate={liveValidate}
            schema={schema}
            formData={formData}
            onChange={setFormData}
            onSubmit={onSubmit}
          />
          <div>
            {loading
              ? <div className={css.loader} />
              : <Display result={result} error={error} />
            }
          </div>
        </div>
      )}
    </>
  );
}