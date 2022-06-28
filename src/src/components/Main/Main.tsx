import { init, init_auction } from "../../near"
import css from "./Main.module.css"
import { Form, Layout, NotFound } from ".."

export function Main() {
//   const { contract } = useParams<{ contract: string }>()

  let errorMessage: string | null = null

  try {
    init();
    init_auction();
  } catch (e: unknown) {
    if (e instanceof Error) {
      errorMessage = e.message
    } else {
      errorMessage = String(e)
    }
  }

  return (
    <Layout>
      {/* {errorMessage
        ? <NotFound>{errorMessage}</NotFound>
        : <Form />
      } */}
      <div style={{display: "table-column"}}>
        <button className={css.secondary}>Auctions</button>
        <button className={css.secondary}>My NFTs</button>
      </div>
    </Layout>
  )
}