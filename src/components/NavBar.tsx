import NextLink from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useRef } from 'react'

import {
  Avatar,
  Box,
  Heading,
  HStack,
  Image,
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
  ButtonProps,
  forwardRef,
  Text,
} from '@chakra-ui/react'
import { ChevronDownIcon, HamburgerIcon } from '@chakra-ui/icons'
import { ToggleColorModeButton } from './ToggleColorModeButton'
import { PageContainer } from './PageContainer'
import { useAuth } from '@src/utils/api/AuthProvider'

const entries = [
  { href: '/problem', title: 'โจทย์' },
  { href: '/submission', title: 'ผลตรวจ' },
  { href: '/contest', title: 'แข่งขัน' },
]

function isActive(href: string, pathname: string) {
  return href.slice(1) === pathname.split('/')[1]
}

export function NavBar() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef(null)

  const isMobile = useBreakpointValue({ base: true, md: false }) as boolean

  const { pathname } = useRouter()
  useEffect(() => {
    onClose()
  }, [isMobile, pathname])

  const bg = useColorModeValue('white', 'gray.800')

  const { isAuthenticated, user, logout } = useAuth()

  const navItems = useMemo(
    () =>
      entries.map((entry) => ({
        ...entry,
        active: isActive(entry.href, pathname),
      })),
    [pathname]
  )

  const headerColor = useColorModeValue('gray.600', 'gray.300')
  const activeColor = useColorModeValue('gray.700', 'white')

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
        <PageContainer>
          <HStack>
            <NextLink href="/">
              <Button
                variant="link"
                color={headerColor}
                _hover={{ color: activeColor }}
              >
                <HStack cursor="pointer">
                  <Image src="logo196.png" boxSize={8} my={1} />
                  <Heading size="md" py={2}>
                    <Box
                      display={{ base: 'none', md: 'inline-block', xl: 'none' }}
                    >
                      OTOG
                    </Box>
                    <Box display={{ base: 'none', xl: 'inline-block' }}>
                      One Tambon One Grader
                    </Box>
                  </Heading>
                </HStack>
              </Button>
            </NextLink>
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
              {navItems.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
              {isAuthenticated ? (
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
                    <MenuItem color="red.500" onClick={logout}>
                      ออกจากระบบ
                    </MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <NavItem href="/login" title="เข้าสู่ระบบ" />
              )}
            </HStack>
            <ToggleColorModeButton
              variant="link"
              display={{ base: 'none', md: 'inline-flex' }}
            />
          </HStack>
        </PageContainer>
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
              <VStack mt={2} mr={6} spacing={3} align="flex-start">
                {isAuthenticated && (
                  <NextLink href="/profile" passHref>
                    <DrawerButton>
                      <HStack py={2}>
                        <Avatar size="xs" />
                        <Text isTruncated>{user?.showName}</Text>
                      </HStack>
                    </DrawerButton>
                  </NextLink>
                )}
                {navItems.map((item) => (
                  <DrawerItem key={item.href} {...item} />
                ))}
                {isAuthenticated ? (
                  <DrawerButton color="red.500" onClick={logout}>
                    ออกจากระบบ
                  </DrawerButton>
                ) : (
                  <DrawerItem href="/login" title="เข้าสู่ระบบ" />
                )}
                <ToggleColorModeButton />
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    </>
  )
}
interface ItemProps extends ButtonProps {
  active?: boolean
  href: string
  title: string
}

function NavItem(props: ItemProps) {
  const { pathname } = useRouter()
  const { href, title, active = isActive(href, pathname), ...rest } = props

  const color = useColorModeValue('gray.500', 'gray.400')
  const activeColor = useColorModeValue('gray.700', 'white')

  return (
    <NextLink href={href} key={href}>
      <Button
        variant="link"
        fontWeight="normal"
        color={active ? activeColor : color}
        textDecor={active ? 'underline' : undefined}
        _hover={{ color: activeColor }}
        {...rest}
      >
        {title}
      </Button>
    </NextLink>
  )
}

function DrawerItem(props: ItemProps) {
  const { pathname } = useRouter()
  const { href, title, active = isActive(href, pathname), ...rest } = props

  const color = useColorModeValue('gray.500', 'gray.400')
  const activeColor = useColorModeValue('gray.700', 'white')

  return (
    <NextLink href={href} key={href} passHref>
      <DrawerButton
        {...rest}
        fontWeight="normal"
        color={active ? activeColor : color}
        textDecor={active ? 'underline' : undefined}
      >
        {title}
      </DrawerButton>
    </NextLink>
  )
}

const DrawerButton = forwardRef(
  (props: ButtonProps, ref: React.ForwardedRef<HTMLButtonElement>) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        justifyContent="flex-start"
        fontWeight="normal"
        width="100%"
        px={2}
        {...props}
      />
    )
  }
)
