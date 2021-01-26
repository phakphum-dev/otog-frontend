import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'

import {
  Avatar,
  Box,
  Container,
  Heading,
  HStack,
  Link,
  Menu,
  MenuItem,
  MenuButton,
  MenuList,
  Spacer,
  Button,
  IconButton,
  useDisclosure,
  useBreakpointValue,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { ChevronDownIcon, HamburgerIcon } from '@chakra-ui/icons'

export function NavBar() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const isMobile = useBreakpointValue({ base: true, md: false }) as boolean
  const btnRef = useRef(null)

  const { pathname } = useRouter()
  useEffect(() => {
    onClose()
  }, [isMobile, pathname])

  const bg = useColorModeValue('white', 'gray.800')

  const { isLogin } = { isLogin: false }

  return (
    <>
      <Box bg="transparend" h={14} w="100%" />
      <Box
        zIndex={10}
        position="fixed"
        py={2}
        h={14}
        top={0}
        left={0}
        w="100%"
        bg={bg}
        boxShadow="base"
      >
        <Container>
          <HStack align="start">
            <Heading size="md" p={2}>
              <Link as={NextLink} href="/">
                OTOG
              </Link>
            </Heading>
            <Spacer />
            <IconButton
              display={{ md: 'none' }}
              variant="ghost"
              aria-label="Open menu"
              p={2}
              onClick={onOpen}
              icon={<HamburgerIcon />}
              ref={btnRef}
            />
            <HStack hidden={isMobile} spacing={8} p={2}>
              <Link as={NextLink} href="/problem">
                โจทย์
              </Link>
              <Link as={NextLink} href="/submission">
                ผลตรวจ
              </Link>
              <Link as={NextLink} href="/contest">
                แข่งขัน
              </Link>
              {isLogin ? (
                <Menu>
                  <MenuButton
                    as={Button}
                    variant="link"
                    rightIcon={<ChevronDownIcon />}
                  >
                    <Avatar size="xs" />
                  </MenuButton>
                  <MenuList>
                    <NextLink href="/profile">
                      <MenuItem>โปรไฟล์</MenuItem>
                    </NextLink>
                    <MenuItem color="red.500">ออกจากระบบ</MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <Link as={NextLink} href="/login">
                  เข้าสู่ระบบ
                </Link>
              )}
            </HStack>
          </HStack>
        </Container>
      </Box>
      <Drawer
        isOpen={isMobile && isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay>
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerBody>
              <VStack spacing={8} p={2} align="flex-start">
                <Avatar size="xs" />
                <Link as={NextLink} href="/problem">
                  โจทย์
                </Link>
                <Link as={NextLink} href="/submission">
                  ผลตรวจ
                </Link>
                <Link as={NextLink} href="/contest">
                  แข่งขัน
                </Link>
                <Link as={NextLink} href="/profile">
                  โปรไฟล์
                </Link>
                <Link color="red.500">ออกจากระบบ</Link>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    </>
  )
}
