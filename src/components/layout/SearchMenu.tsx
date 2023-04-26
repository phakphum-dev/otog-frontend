import isHotkey from 'is-hotkey'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { FaHashtag, FaSearch } from 'react-icons/fa'
import scrollIntoView from 'scroll-into-view-if-needed'

import { useDisclosure } from '@src/hooks/useDisclosure'
import { useProblems } from '@src/problem/queries'
import { Input } from '@src/ui/Input'
import { Modal, ModalContent, ModalOverlay } from '@src/ui/Modal'

export const SearchMenu = () => {
  const { isOpen, onClose, onToggle } = useDisclosure()
  const { data: problems } = useProblems()
  const [value, setValue] = useState('')
  const eventRef = useRef<'mouse' | 'keyboard'>()

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (isHotkey('mod+k', event)) {
        event.preventDefault()
        onToggle()
      }
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [onToggle])

  const router = useRouter()
  useEffect(() => {
    router.events.on('routeChangeComplete', onClose)
    return () => {
      router.events.off('routeChangeComplete', onClose)
    }
  }, [router, onClose])

  const results = useMemo(() => {
    if (!problems) return []
    const text = value.trim()
    const number = Number(text)
    if (Number.isInteger(number)) {
      return problems.filter((problem) => problem.id === number)
    }
    return problems.filter(
      (problem) => problem.name.toLowerCase().search(text.toLowerCase()) !== -1
    )
  }, [value, problems])

  const [active, setActive] = useState(0)
  useEffect(() => {
    setActive(0)
  }, [value])

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLInputElement>) => {
      eventRef.current = 'keyboard'
      if (isHotkey('arrowdown', e)) {
        e.preventDefault()
        if (active + 1 < results.length) {
          setActive(active + 1)
        } else {
          setActive(0)
        }
      } else if (isHotkey('arrowup', e)) {
        e.preventDefault()
        if (active - 1 >= 0) {
          setActive(active - 1)
        } else {
          setActive(results.length - 1)
        }
      } else if (isHotkey('Enter', e) && results.length > 0) {
        e.preventDefault()
        router.push(`/problem/${results[active].id}`)
      }
    },
    [active, results, router]
  )

  const inputRef = useCallback(
    (node: HTMLInputElement | null) => {
      if (isOpen && node) {
        node.select()
      }
    },
    [isOpen]
  )

  const menuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!menuRef.current || eventRef.current === 'mouse') return
    const node = menuRef.current?.firstChild?.childNodes[active] as Element
    if (!node) return
    scrollIntoView(node, {
      scrollMode: 'if-needed',
      block: 'nearest',
      inline: 'nearest',
      boundary: menuRef.current,
      behavior: 'smooth',
    })
  }, [active])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <div className="relative flex px-6 py-2">
          <FaSearch className="absolute top-1/2 -translate-y-1/2 fill-slate-500" />
          <Input
            ref={inputRef}
            className="pl-8"
            variant="unstyled"
            type="lg"
            onKeyDown={onKeyDown}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        {results.length > 0 && (
          <>
            <hr />
            <div
              className="max-h-[468px] p-4"
              style={{ overflow: 'overlay' }}
              ref={menuRef}
            >
              <ul className="flex flex-col gap-2">
                {results.map((problem, index) => {
                  const selected = active === index
                  return (
                    <NextLink href={`/problem/${problem.id}`} key={problem.id}>
                      <li
                        role="option"
                        className=":bg-orange-400 flex flex-row items-center gap-6 rounded-md bg-gray-100 px-6 py-4 active:bg-orange-400 dark:bg-gray-600 dark:active:bg-orange-600"
                        data-active={selected}
                        onMouseEnter={() => {
                          eventRef.current = 'mouse'
                          setActive(index)
                        }}
                      >
                        <FaHashtag
                          className="fill-gray-400 active:fill-white dark:fill-gray-500 active:dark:fill-white"
                          data-active={selected}
                        />
                        <div className="flex flex-col">
                          <p
                            className="text-sm font-semibold text-gray-500 active:text-white dark:text-gray-400 active:dark:text-white"
                            data-active={selected}
                          >
                            {problem.id}
                          </p>
                          <p
                            className="text-md font-semibold active:text-white"
                            data-active={selected}
                          >
                            {problem.name}
                          </p>
                        </div>
                      </li>
                    </NextLink>
                  )
                })}
              </ul>
            </div>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
