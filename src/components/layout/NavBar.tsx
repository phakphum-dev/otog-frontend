import clsx from 'clsx'
import Image from 'next/image'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { forwardRef, useEffect, useRef } from 'react'

import Logo from '../../../public/logo512.png'
import { Avatar } from '../Avatar'
import { ToggleColorModeButton } from '../ToggleColorModeButton'
import { PageContainer } from './PageContainer'

import { ChevronDownIcon, HamburgerIcon } from '@chakra-ui/icons'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useBreakpointValue,
} from '@chakra-ui/react'

import { OFFLINE_MODE } from '@src/config'
import { useAuth } from '@src/context/AuthContext'
import { useDisclosure } from '@src/hooks/useDisclosure'
import { useUserProfilePic } from '@src/profile/useProfilePic'
import { Button, ButtonProps } from '@src/ui/Button'
import { IconButton } from '@src/ui/IconButton'
import { Link, LinkProps } from '@src/ui/Link'

function usePathActive(href: string) {
  const { pathname } = useRouter()
  return href.split('/')[1] === pathname.split('/')[1]
}

export const NavBar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef(null)

  const isMobile = useBreakpointValue({ base: true, md: false }) as boolean

  const { pathname } = useRouter()
  useEffect(() => {
    onClose()
  }, [isMobile, pathname, onClose])

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
      <div className="z-50 fixed py-2 h-14 top-0 left-0 w-full bg-white dark:bg-gray-800 shadow-md">
        <PageContainer>
          <div className="flex">
            <NextLink href={isAdmin ? '/admin/contest' : '/'} passHref>
              <Link className="text-gray-800 dark:text-white flex items-center gap-2">
                <Image src={Logo} width={32} height={32} />
                <div className="font-bold text-xl">
                  <div className="hidden md:inline-block xl:hidden">OTOG</div>
                  <div className="hidden xl:inline-block">
                    One Tambon One Grader
                  </div>
                </div>
              </Link>
            </NextLink>
            <div className="flex-1" />
            <IconButton
              className="md:hidden p-2"
              variant="ghost"
              aria-label="Open menu"
              onClick={onOpen}
              icon={<HamburgerIcon />}
              ref={btnRef}
            />
            <div className={clsx('flex gap-4', isMobile && 'hidden')}>
              {entries.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
              {user ? (
                <AvatarMenu />
              ) : (
                <NavItem href="/login" title="เข้าสู่ระบบ" />
              )}
              <ToggleColorModeButton
                variant="ghost"
                className="hidden md:inline-flex"
              />
            </div>
          </div>
        </PageContainer>
      </div>
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
              <div className="flex flex-col mt-2 mr-6 gap-3 items-start">
                {user && (
                  <NextLink href={`/profile/${user.id}`} passHref>
                    <DrawerButton as="a">
                      <div className="flex items-center gap-2 py-2">
                        <Avatar src={url} name={user.showName} />
                        <div className="line-clamp-1"> {user.showName}</div>
                      </div>
                    </DrawerButton>
                  </NextLink>
                )}
                {entries.map((item) => (
                  <DrawerItem key={item.href} {...item} />
                ))}
                {isAuthenticated ? (
                  <DrawerButton className="!text-red-500" onClick={logout}>
                    ออกจากระบบ
                  </DrawerButton>
                ) : (
                  <DrawerItem href="/login" title="เข้าสู่ระบบ" />
                )}
                <ToggleColorModeButton />
              </div>
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
      <div className="h-14 w-full bg-transparent" />
    </>
  )
}
interface ItemProps {
  active?: boolean
  href: string
  title: string
}

const NavItem = (props: ItemProps & LinkProps) => {
  const { href, title, ...rest } = props
  const isActive = usePathActive(href)
  return (
    <NextLink href={href} passHref>
      <Link
        variant="nav"
        className="p-2 font-normal !no-underline"
        isActive={isActive}
        {...rest}
      >
        {title}
      </Link>
    </NextLink>
  )
}

const DrawerItem = forwardRef<HTMLButtonElement, ItemProps & ButtonProps>(
  (props, ref) => {
    const { href, title, active, ...rest } = props
    const isActive = usePathActive(href) || active
    return (
      <NextLink href={href} passHref>
        <DrawerButton
          as="a"
          className={
            isActive
              ? 'text-gray-800 dark:text-white'
              : 'text-gray-500 dark:text-gray-400'
          }
          {...rest}
          ref={ref}
        >
          {title}
        </DrawerButton>
      </NextLink>
    )
  }
)

const DrawerButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <Button
        variant="ghost"
        fullWidth
        className={clsx('!px-2 !justify-start font-normal', className)}
        {...props}
        ref={ref}
      />
    )
  }
)

const AvatarMenu = () => {
  const { user, isAdmin, logout } = useAuth()
  const { url } = useUserProfilePic(true)
  return (
    <Menu isLazy>
      {OFFLINE_MODE && !isAdmin && (
        <div className="p-2">สวัสดี {user?.showName}</div>
      )}
      <MenuButton
        as={Button}
        className="!px-2"
        variant="ghost"
        rightIcon={<ChevronDownIcon />}
      >
        <Avatar src={url} name={user!.showName} />
      </MenuButton>
      {/* fix render menulist on ssr */}
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
    </Menu>
  )
}
