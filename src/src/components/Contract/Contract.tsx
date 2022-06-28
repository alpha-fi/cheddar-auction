import { Form, Layout, NotFound } from ".."

export function Contract() {
  let errorMessage: string | null = null

  return (
    <Layout>
      {errorMessage
        ? <NotFound>{errorMessage}</NotFound>
        : <Form />
      }
    </Layout>
  )
}