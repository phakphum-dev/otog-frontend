import Error from './_error'

export default function Custom404() {
  return <Error statusCode={404} title="Page not found" />
}
