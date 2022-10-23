import Image from 'next/image'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { ForwardedRef, useEffect, useRef, useState } from 'react'

import Logo from '../../../public/logo512.png'
import { ToggleColorModeButton } from '../ToggleColorModeButton'
import { PageContainer } from './PageContainer'

import { ChevronDownIcon, HamburgerIcon } from '@chakra-ui/icons'
import {
  Avatar,
  Box,
  Button,
  ButtonProps,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Text,
  VStack,
  forwardRef,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'

import { OFFLINE_MODE } from '@src/config'
import { useAuth } from '@src/context/AuthContext'
import { useUserProfilePic } from '@src/profile/useProfilePic'

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

const defaultOptions: ColorOptions = {
  normal: {
    light: 'gray.500',
    dark: 'gray.400',
  },
  active: {
    light: 'gray.800',
    dark: 'white',
  },
}

function useActiveColor(href: string, options: ColorOptions = defaultOptions) {
  const normalColor = useColorModeValue(
    options?.normal.light,
    options?.normal.dark
  )
  const activeColor = useColorModeValue(
    options?.active.light,
    options?.active.dark
  )
  const { pathname } = useRouter()
  const isActive = href.split('/')[1] === pathname.split('/')[1]
  const color = isActive ? activeColor : normalColor
  return { color, normalColor, activeColor, isActive }
}

export const NavBar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef(null)

  const isMobile = useBreakpointValue({ base: true, md: false }) as boolean

  const { pathname } = useRouter()
  useEffect(() => {
    onClose()
  }, [isMobile, pathname, onClose])

  const bg = useColorModeValue('white', 'gray.800')
  const color = useColorModeValue('gray.800', 'white')

  const { isAuthenticated, user, logout, isAdmin } = useAuth()
  const { url } = useUserProfilePic(true)

  const entries =
    !OFFLINE_MODE || isAdmin
      ? [
          { href: '/problem', title: 'โจทย์' },
          {
            href: isAdmin ? '/submission/all' : '/submission',
            title: 'ผลตรวจ',
          },

          { href: '/contest', title: 'แข่งขัน' },
        ]
      : []

  return (
    <>
      <Box
        zIndex={50}
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
          <Flex>
            <NextLink href={isAdmin ? '/admin/contest' : '/'} passHref>
              <Button as="a" variant="link" color={color} _hover={{ color }}>
                <HStack cursor="pointer">
                  <Image src={Logo} width={32} height={32} />
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
            <HStack hidden={isMobile} spacing={4}>
              {entries.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
              {user ? (
                <AvatarMenu />
              ) : (
                <NavItem href="/login" title="เข้าสู่ระบบ" />
              )}
              <ToggleColorModeButton
                variant="link"
                display={{ base: 'none', md: 'inline-flex' }}
              />
            </HStack>
          </Flex>
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
                {user && (
                  <NextLink href={`/profile/${user.id}`} passHref>
                    <DrawerButton as="a">
                      <HStack py={2}>
                        <Avatar size="xs" src={url} />
                        <Text isTruncated> {user.showName}</Text>
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
      <Box bg="transparend" h={14} w="100%" />
    </>
  )
}
interface ItemProps extends ButtonProps {
  active?: boolean
  href: string
  title: string
}

const NavItem = (props: ItemProps) => {
  const { href, title, ...rest } = props
  const { color, activeColor } = useActiveColor(href)
  return (
    <NextLink href={href} passHref>
      <Button
        as="a"
        p={2}
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

const DrawerItem = (props: ItemProps) => {
  const { href, title, ...rest } = props
  const { color } = useActiveColor(href)
  return (
    <NextLink href={href} passHref>
      <DrawerButton {...rest} as="a" fontWeight="normal" color={color}>
        {title}
      </DrawerButton>
    </NextLink>
  )
}

const DrawerButton = forwardRef(
  (props: ButtonProps, ref: ForwardedRef<HTMLButtonElement>) => {
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

const AvatarMenu = () => {
  const { user, isAdmin, logout } = useAuth()
  const { url } = useUserProfilePic(true)
  const [isClient, setClient] = useState(false)
  useEffect(() => {
    setClient(true)
  }, [])
  return (
    <Menu>
      {OFFLINE_MODE && !isAdmin && <Text p={2}>สวัสดี {user?.showName}</Text>}
      <MenuButton as={Button} variant="link" rightIcon={<ChevronDownIcon />}>
        <Avatar size="xs" src={url} />
      </MenuButton>
      {/* fix render menulist on ssr */}
      {isClient && (
        <MenuList>
          {!OFFLINE_MODE && (
            <NextLink href={`/profile/${user?.id}`} passHref>
              <MenuItem as="a">โปรไฟล์</MenuItem>
            </NextLink>
          )}
          <MenuItem color="red.500" onClick={logout}>
            ออกจากระบบ
          </MenuItem>
        </MenuList>
      )}
    </Menu>
  )
}
