import { GetServerSideProps } from 'next'

// for flashing ssr fix

export const getServerSideProps: GetServerSideProps<{
  colorModeCookie: string
}> = async ({ req }) => {
  return {
    props: {
      colorModeCookie: req.headers.cookie ?? '',
    },
  }
}
