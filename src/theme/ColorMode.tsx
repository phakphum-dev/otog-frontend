import { GetServerSideProps } from 'next'

// for flashing ssr fix

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  return {
    props: {
      colorModeCookie: req.headers.cookie ?? '',
    },
  }
}
