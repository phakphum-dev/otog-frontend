import isHotkey from 'is-hotkey'
import { KeyboardEvent, ReactElement, useMemo } from 'react'
import {
  FaAngleLeft,
  FaAngleRight,
  FaBold,
  FaCode,
  FaEye,
  FaEyeSlash,
  FaItalic,
  FaLink,
  FaPlus,
  FaUnderline,
} from 'react-icons/fa'
import { MdLooks3, MdLooks4, MdLooksOne, MdLooksTwo } from 'react-icons/md'
import {
  BaseEditor,
  Descendant,
  Editor,
  Element as SlateElement,
  Transforms,
  createEditor,
} from 'slate'
import { HistoryEditor, withHistory } from 'slate-history'
import {
  Editable,
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  useSlate,
  withReact,
} from 'slate-react'

import { HEIGHT } from './constants'
import { useAnnouncementContext } from './useAnnouncementContext'

import { ButtonGroup } from '@src/ui/ButtonGroup'
import { IconButton } from '@src/ui/IconButton'
import { Link } from '@src/ui/Link'

type CustomText = {
  text: string
  link?: boolean
  bold?: boolean
  code?: boolean
  italic?: boolean
  underline?: boolean
}
type CustomElement = {
  type:
    | 'paragraph'
    | 'block-quote'
    | 'bulleted-list'
    | 'heading-one'
    | 'heading-two'
    | 'heading-three'
    | 'heading-four'
    | 'list-item'
    | 'numbered-list'
  children: CustomText[]
}

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor
    Element: CustomElement
    Text: CustomText
  }
}
const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if (leaf.link) {
    children = (
      <Link href={leaf.text} isExternal>
        {children}
      </Link>
    )
  }
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }
  if (leaf.code) {
    children = (
      <code className="text-inherit bg-transparent dark:bg-alpha-black-300">
        {children}
      </code>
    )
  }
  if (leaf.italic) {
    children = <em>{children}</em>
  }
  if (leaf.underline) {
    children = <u>{children}</u>
  }
  return <span {...attributes}>{children}</span>
}

const Element = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case 'block-quote':
      return (
        <p className="pl-2.5 border-l-2 border-gray-300" {...attributes}>
          {children}
        </p>
      )
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>
    case 'heading-one':
      return (
        <p className="text-4xl" {...attributes}>
          {children}
        </p>
      )
    case 'heading-two':
      return (
        <p className="text-3xl" {...attributes}>
          {children}
        </p>
      )
    case 'heading-three':
      return (
        <p className="text-2xl" {...attributes}>
          {children}
        </p>
      )
    case 'heading-four':
      return (
        <p className="text-xl" {...attributes}>
          {children}
        </p>
      )
    case 'list-item':
      return <li {...attributes}>{children}</li>
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>
    default:
      return <p {...attributes}>{children}</p>
  }
}

const HOTKEYS: Record<string, string> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
}

const toggleMark = (editor: Editor, format: string) => {
  if (isMarkActive(editor, format)) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isMarkActive = (editor: Editor, format: string) => {
  const marks = Editor.marks(editor) as Record<string, boolean>
  return marks ? marks[format] === true : false
}

const LIST_TYPES = ['numbered-list', 'bulleted-list']
const toggleBlock = (editor: Editor, format: CustomElement['type']) => {
  const isActive = isBlockActive(editor, format)
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: (n) => SlateElement.isElement(n) && LIST_TYPES.includes(n.type),
    split: true,
  })
  Transforms.setNodes(editor, {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  })
  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

const isBlockActive = (editor: Editor, format: string) => {
  const [match] = Array.from(
    Editor.nodes(editor, {
      match: (n) => SlateElement.isElement(n) && n.type === format,
    })
  )
  return !!match
}

interface MarkButtonProps {
  format: string
  icon: ReactElement
  className?: string
}

const MarkButton = ({ format, icon, className }: MarkButtonProps) => {
  const editor = useSlate()
  return (
    <IconButton
      className={className}
      size="sm"
      variant="outline"
      isActive={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
      icon={icon}
      aria-label={format}
    />
  )
}

interface BlockButtonProps {
  format: CustomElement['type']
  icon: ReactElement
  className?: string
}

const BlockButton = ({ format, icon, className }: BlockButtonProps) => {
  const editor = useSlate()
  return (
    <IconButton
      className={className}
      size="sm"
      variant="outline"
      isActive={isBlockActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
      icon={icon}
      aria-label={format}
    />
  )
}

export const AnnouncementEditor = () => {
  const {
    currentAnnouncement,
    onChange,
    nextIndex,
    prevIndex,
    insertIndex,
    toggleShow,
  } = useAnnouncementContext()
  const editor = useMemo(() => withReact(withHistory(createEditor())), [])
  editor.children = currentAnnouncement.value
  const handleHotkey = (event: KeyboardEvent<HTMLDivElement>) => {
    for (const hotkey in HOTKEYS) {
      if (isHotkey(hotkey, event)) {
        event.preventDefault()
        const mark = HOTKEYS[hotkey]
        toggleMark(editor, mark)
      }
    }
    if (isHotkey('shift+return', event)) {
      event.preventDefault()
      editor.insertText('\n')
    }
  }
  return (
    <div className="flex flex-col gap-2 py-4">
      <Slate
        editor={editor}
        value={currentAnnouncement.value}
        onChange={onChange}
      >
        <div className="flex gap-2 justify-between">
          <div className="flex gap-2">
            <ButtonGroup isAttached>
              <MarkButton format="bold" icon={<FaBold />} />
              <MarkButton format="italic" icon={<FaItalic />} />
              <MarkButton format="underline" icon={<FaUnderline />} />
              <MarkButton format="link" icon={<FaLink />} />
              <MarkButton format="code" icon={<FaCode />} />
            </ButtonGroup>
            <ButtonGroup isAttached>
              <BlockButton format="heading-one" icon={<MdLooksOne />} />
              <BlockButton format="heading-two" icon={<MdLooksTwo />} />
              <BlockButton format="heading-three" icon={<MdLooks3 />} />
              <BlockButton format="heading-four" icon={<MdLooks4 />} />
              {/* <BlockButton format="block-quote" icon={<FaQuoteLeft />} />
            <BlockButton format="numbered-list" icon={<FaListOl />} />
          <BlockButton format="bulleted-list" icon={<FaListUl />} /> */}
            </ButtonGroup>
          </div>
          <div className="flex gap-2">
            <IconButton
              size="sm"
              icon={currentAnnouncement.show ? <FaEye /> : <FaEyeSlash />}
              aria-label="toggle visibillity"
              variant="outline"
              onClick={toggleShow}
            />
            <ButtonGroup isAttached>
              <IconButton
                size="sm"
                icon={<FaAngleLeft />}
                aria-label="previous"
                variant="outline"
                onClick={prevIndex}
              />
              <IconButton
                size="sm"
                icon={<FaAngleRight />}
                aria-label="next"
                variant="outline"
                onClick={nextIndex}
              />
            </ButtonGroup>
            <IconButton
              size="sm"
              icon={<FaPlus />}
              aria-label="add new announcement"
              variant="outline"
              onClick={insertIndex}
            />
          </div>
        </div>
        <hr />
        <div
          className="flex flex-col gap-2 justify-center w-full overflow-hidden text-center"
          style={{ height: HEIGHT }}
        >
          <Editable
            placeholder="Enter announcement…"
            renderElement={Element}
            renderLeaf={Leaf}
            onKeyDown={handleHotkey}
            autoFocus
          />
        </div>
      </Slate>
    </div>
  )
}

interface ReadonlyEditorProps {
  value: Descendant[]
}
export const ReadonlyEditor = ({ value }: ReadonlyEditorProps) => {
  const editor = useMemo(() => withReact(createEditor()), [])
  editor.children = value
  return (
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    <Slate editor={editor} value={value} onChange={() => {}}>
      <Editable readOnly renderElement={Element} renderLeaf={Leaf} />
    </Slate>
  )
}
