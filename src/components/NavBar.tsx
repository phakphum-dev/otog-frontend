import { Box, Container, Flex, Link, Stack } from '@chakra-ui/react'
import { ToggleColorModeButton } from './ToggleColorModeButton'
import NextLink from 'next/link'

export const NavBar = () => {
  return (
    <>
      <Box bg="transparend" h={14} w="100%" />
      <Box position="fixed" my={2} h={10} top={0} left={0} w="100%">
        <Container>
          <Flex justify="space-between" align="center">
            <Link as={NextLink} href="/">
              OTOG
            </Link>
            <Stack direction="row" spacing={8} align="center">
              <Link as={NextLink} href="/problem">
                โจทย์
              </Link>
              <ToggleColorModeButton />
            </Stack>
          </Flex>
        </Container>
      </Box>
    </>
  )
}
