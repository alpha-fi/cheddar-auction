import * as React from "react"
import { Layout } from ".."
import { init, init_auction } from "../../near"
import { Link, useNavigate } from "react-router-dom";
import css from "../Form/form.module.css"
export const TENK_CONTRACT_STORAGE_NAME = "Tenk_storage_name";
export const AUCTION_CONTRACT_STORAGE_NAME= "Auction_storage_name";

export function Home() {
  const [tenk, setTenk] = React.useState<string>()
  const [auction, setAuction] = React.useState<string>();
  const [error, setError] = React.useState<string>();
  const navigate = useNavigate();

  return (
    <Layout>
      <h2>Inspect a contract</h2>
      <form onSubmit={e => {
        e.preventDefault()

        if (!tenk || !auction) return

        try {
          // console.log("here");
          // window.localStorage.setItem(TENK_CONTRACT_STORAGE_NAME, tenk);
          // window.localStorage.setItem(AUCTION_CONTRACT_STORAGE_NAME, auction);

          init();
          init_auction();
          
          navigate("main");
        } catch (e: unknown) {
          if (e instanceof Error) {
            setError(e.message)
          } else {
            setError(String(e))
          }
        }
      }}>
        <label>
          Enter a contract name:
          <br />
          <div className="column">
            <label>Tenk Contract Address</label>
            <input value={tenk} onChange={e => setTenk(e.target.value)} />
            <label>Auction Contract Address</label>
            <input value={auction} onChange={e => setAuction(e.target.value)} />
            <button>Click</button>
          </div>

          {error && (
            <div style={{ backgroundColor: "var(--bg-red)" }}>{error}</div>
          )}
        </label>
      </form>
    </Layout>
  )
}