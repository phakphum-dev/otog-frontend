import {
  FloatingPortal,
  Placement,
  offset,
  useFloating,
  useHover,
} from '@floating-ui/react'
import { Transition } from '@headlessui/react'
import {
  Fragment,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  cloneElement,
  isValidElement,
  useState,
} from 'react'

export type TooltipProps = PropsWithChildren<{
  label?: ReactNode
  placement?: Placement
  shouldWrapChildren?: boolean
}>

export const Tooltip = (props: TooltipProps) => {
  const {
    label,
    children,
    placement = 'top',
    shouldWrapChildren = false,
  } = props
  const [open, setOpen] = useState(false)
  const { x, y, refs, strategy, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    middleware: [offset(4)],
  })
  useHover(context, { move: false })

  return (
    <>
      {!isValidElement(children) || shouldWrapChildren ? (
        <div ref={refs.setReference}>{children}</div>
      ) : (
        cloneElement(children as ReactElement, { ref: refs.setReference })
      )}
      <FloatingPortal>
        <Transition
          as={Fragment}
          show={open}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <div
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
            }}
            className="max-w-xs origin-bottom rounded-sm bg-gray-700 px-2 py-0.5 text-sm font-medium text-alpha-white-900 shadow-md dark:bg-gray-300 dark:text-gray-900"
          >
            {label}
          </div>
        </Transition>
      </FloatingPortal>
    </>
  )
}
