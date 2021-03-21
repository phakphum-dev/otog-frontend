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

interface ColorOptions {
  normal: {
    light: string
    dark: string
  }
  active: {
    light: string
    dark: string
  }
}

function useActiveColor(href: string, options?: ColorOptions) {
  const normalColor = useColorModeValue(
    options?.normal.light ?? 'gray.500',
    options?.normal.dark ?? 'gray.400'
  )
  const activeColor = useColorModeValue(
    options?.active.light ?? 'gray.800',
    options?.active.dark ?? 'white'
  )
  const { pathname } = useRouter()
  const isActive = href.slice(1) === pathname.split('/')[1]
  const color = isActive ? activeColor : normalColor
  return { color, normalColor, activeColor, isActive }
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

  const { color, activeColor } = useActiveColor('/', {
    normal: { light: 'gray.600', dark: 'gray.300' },
    active: { light: 'gray.700', dark: 'white' },
  })

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
                color={color}
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
              {entries.map((item) => (
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
                {entries.map((item) => (
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
  const { href, title, ...rest } = props
  const { color, activeColor } = useActiveColor(href)
  return (
    <NextLink href={href} key={href}>
      <Button
        variant="link"
        fontWeight="normal"
        color={color}
        _hover={{ color: activeColor }}
        {...rest}
      >
        {title}
      </Button>
    </NextLink>
  )
}

function DrawerItem(props: ItemProps) {
  const { href, title, ...rest } = props
  const { color } = useActiveColor(href)
  return (
    <NextLink href={href} key={href} passHref>
      <DrawerButton {...rest} fontWeight="normal" color={color}>
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
