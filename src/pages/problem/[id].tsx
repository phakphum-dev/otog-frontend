import Editor from '@monaco-editor/react'
import produce from 'immer'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react'
import { toast } from 'react-hot-toast'
import { FaLightbulb, FaPencilAlt, FaPlus, FaTrash } from 'react-icons/fa'

import { getProblem, keyProblem, useProblem } from '../../problem/queries'

import { updateProblemExamples } from '@src/admin/queries/problem'
import { withSession } from '@src/api/withSession'
import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { API_HOST } from '@src/config'
import { useUserData } from '@src/context/UserContext'
import { useClipboard } from '@src/hooks/useClipboard'
import { useDisclosure } from '@src/hooks/useDisclosure'
import { onErrorToast } from '@src/hooks/useErrorToast'
import { useMutation } from '@src/hooks/useMutation'
import { CopyIcon } from '@src/icons/CopyIcon'
import { Problem, Testcase } from '@src/problem/types'
import { getLatestProblemSubmission } from '@src/submission/queries'
import { submitProblem } from '@src/submission/submit/queries'
import { SubmissionWithSourceCode } from '@src/submission/types'
import { Button } from '@src/ui/Button'
import { IconButton } from '@src/ui/IconButton'
import { Select } from '@src/ui/Input'
import { Link } from '@src/ui/Link'
import { Table, Td, Th, Tr } from '@src/ui/Table'
import { ONE_SECOND } from '@src/utils/time'

const defaultValue = `#include <iostream>

using namespace std;

int main() {
    return 0;
}`

const extension: Record<string, string> = {
  cpp: '.cpp',
  c: '.c',
  python: '.py',
}

export interface WriteSolutionPageProps {
  submission: SubmissionWithSourceCode | null
}

export default function WriteSolutionPage(props: WriteSolutionPageProps) {
  const { submission } = props
  const router = useRouter()
  const id = Number(router.query.id)
  const { data: problem } = useProblem(id)
  if (!problem) {
    return null
  }
  return (
    <PageContainer maxSize="md">
      <Head>
        <title>Problem {id} | OTOG</title>
      </Head>
      <div className="flex flex-col gap-2">
        <TitleLayout>
          <Title icon={<FaLightbulb />} id="problem-name">
            {problem.id} {problem.name}
          </Title>
          <div className="flex flex-col items-end">
            <Link isExternal href={`${API_HOST}problem/doc/${problem.id}`}>
              [ดาวน์โหลด]
            </Link>
            <div className="whitespace-nowrap text-sm">
              (<span id="time-limit">{problem.timeLimit / ONE_SECOND}</span>{' '}
              วินาที <span id="memory-limit">{problem.memoryLimit}</span> MB)
            </div>
          </div>
        </TitleLayout>
        <EditorForm
          problem={problem}
          submission={submission}
          key={problem.id}
        />
        <ExampleTable problemId={id} examples={problem.examples ?? []} />
      </div>
    </PageContainer>
  )
}

export const getServerSideProps = withSession<WriteSolutionPageProps>(
  async (session, context) => {
    const id = Number(context.query.id)
    if (Number.isNaN(id)) {
      return { notFound: true }
    }
    const problem = getProblem(id)
    const submission = session ? getLatestProblemSubmission(id) : null
    return {
      props: {
        submission: await submission,
        fallback: {
          [keyProblem(id)]: await problem,
        },
      },
    }
  }
)

function EditorForm(props: {
  problem: Problem
  submission?: SubmissionWithSourceCode | null
}) {
  const { problem, submission } = props
  const router = useRouter()
  const [language, setLanguage] = useState<string>(
    submission?.language ?? 'cpp'
  )
  const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value)
  }

  const [value, setValue] = useState<string | undefined>(
    submission?.sourceCode ?? defaultValue
  )
  const onEditorChange = (value: string | undefined) => {
    setValue(value)
  }
  const submitProblemMutation = useMutation(submitProblem)
  const onSubmit = async () => {
    if (!value) return
    const blob = new Blob([value])
    const file = new File([blob], `${problem.id}${extension[language]}`)
    try {
      await submitProblemMutation(problem.id, file, language)
      router.push('/submission')
    } catch (e) {
      onErrorToast(e)
    }
  }

  return (
    <>
      <Editor
        className="overflow-hidden rounded-md"
        height="75vh"
        language={language}
        theme="vs-dark"
        value={value}
        onChange={onEditorChange}
      />

      <div className="mt-2 grid grid-cols-3">
        <Select onChange={onChange} value={language}>
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="python">Python</option>
        </Select>
        <div className="flex-1" />
        <Button onClick={onSubmit}>ส่ง</Button>
      </div>
    </>
  )
}

type ExampleTableProps = {
  examples: Testcase[]
  problemId: number
}
const ExampleTable = ({ examples, problemId }: ExampleTableProps) => {
  const { isAdmin } = useUserData()
  const { isOpen: isEditing, onOpen, onClose } = useDisclosure()
  const [testcases, setTestcases] = useState(examples)

  const { data: problem, mutate } = useProblem(problemId)
  const updateProblemExamplesMutation = useMutation(updateProblemExamples)

  const onAddEmptyExample = () => {
    setTestcases(
      produce((tests) => {
        tests.push({ input: '', output: '' })
      })
    )
  }

  const onEditOpen = () => {
    onOpen()
    if (testcases.length === 0) {
      onAddEmptyExample()
    }
  }

  const onSave = async () => {
    onClose()
    try {
      mutate({ ...problem!, examples: testcases }, false)
      const updatedProblem = await updateProblemExamplesMutation(
        problemId,
        testcases
      )
      if (updatedProblem) {
        setTestcases(updatedProblem.examples)
      }
    } catch (e: unknown) {
      onErrorToast(e)
      setTestcases(examples)
    }
  }
  if (!isAdmin && examples.length === 0) {
    return null
  }
  const onCancel = () => {
    onClose()
    setTestcases(examples)
  }

  return (
    <div className="mt-6 flex flex-col gap-2">
      <h3 className="text-xl font-bold">ตัวอย่าง</h3>
      <div className="group/table relative">
        <Table variant="rounded" className="table-fixed" id="example-table">
          <thead>
            <Tr className="bg-gray-50 dark:bg-slate-800">
              <Th className="border-l">Input</Th>
              <Th className="border-x">Output</Th>
            </Tr>
          </thead>
          <tbody>
            {isEditing
              ? testcases.map((test, index) => (
                  <EditTestcase
                    {...test}
                    row={index}
                    key={index}
                    setTestcases={setTestcases}
                  />
                ))
              : examples.map((test, index) => (
                  <ExampleRow {...test} key={index} />
                ))}
          </tbody>
        </Table>
        {isAdmin && !isEditing && (
          <IconButton
            className="invisible absolute right-0 top-0 -translate-y-1/2 translate-x-1/2 group-hover/table:visible"
            size="sm"
            rounded
            icon={<FaPencilAlt />}
            onClick={onEditOpen}
          />
        )}
        {isEditing && (
          <IconButton
            className="invisible absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 group-hover/table:visible"
            size="xs"
            rounded
            icon={<FaPlus />}
            onClick={onAddEmptyExample}
          />
        )}
      </div>
      {isEditing && (
        <div className="mt-2 flex w-full flex-row-reverse gap-2">
          <Button colorScheme="green" onClick={onSave}>
            บันทึก
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            ยกเลิก
          </Button>
        </div>
      )}
    </div>
  )
}

type ExampleRowType = {
  input: string
  output: string
}

const ExampleRow = ({ input, output }: ExampleRowType) => {
  const { onCopy: onInputCopy, hasCopied: inputCopied } = useClipboard(input)
  const { onCopy: onOutputCopy, hasCopied: outputCopied } = useClipboard(output)

  useEffect(() => {
    if (inputCopied) {
      toast.success('คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว')
    }
  }, [inputCopied])
  useEffect(() => {
    if (outputCopied) {
      toast.success('คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว')
    }
  }, [outputCopied])
  return (
    <Tr>
      <Td className="group/input relative border-l p-0 align-top">
        <IconButton
          onClick={onInputCopy}
          icon={<CopyIcon />}
          size="sm"
          className="invisible absolute right-2 top-2 group-hover/input:visible"
        />
        <div className="overflow-x-auto px-6 py-4 pr-12">
          <code className="whitespace-pre" id="input">
            {input}
          </code>
        </div>
      </Td>
      <Td className="group/output relative border-x p-0 align-top">
        <IconButton
          onClick={onOutputCopy}
          icon={<CopyIcon />}
          size="sm"
          className="invisible absolute right-2 top-2 group-hover/output:visible"
        />
        <div className="overflow-x-auto px-6 py-4 pr-12">
          <code className="whitespace-pre" id="output">
            {output}
          </code>
        </div>
      </Td>
    </Tr>
  )
}

type EditExampleRowType = {
  input: string
  output: string
  row: number
  setTestcases: Dispatch<SetStateAction<Testcase[]>>
}

const EditTestcase = ({
  input,
  output,
  row,
  setTestcases,
}: EditExampleRowType) => {
  const onInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTestcases(
      produce((tests) => {
        tests[row].input = e.target.value
      })
    )
  }
  const onOutputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTestcases(
      produce((tests) => {
        tests[row].output = e.target.value
      })
    )
  }
  const onRemove = () => {
    setTestcases(
      produce((tests) => {
        tests.splice(row, 1)
      })
    )
  }
  return (
    <Tr className="group/testcase relative">
      <Td className="relative border-x p-0 align-top">
        <code>
          <textarea
            className="w-full whitespace-pre bg-inherit px-6 py-4"
            id="input"
            value={input}
            onChange={onInputChange}
          />
        </code>
      </Td>
      <Td className="relative border-x p-0 align-top">
        <code>
          <textarea
            className="w-full whitespace-pre bg-inherit px-6 py-4"
            id="output"
            value={output}
            onChange={onOutputChange}
          />
        </code>
        <IconButton
          icon={<FaTrash />}
          size="xs"
          rounded
          className="invisible absolute right-0 top-1/2 float-right -translate-y-1/2 translate-x-1/2 group-hover/testcase:visible"
          onClick={onRemove}
        />
      </Td>
    </Tr>
  )
}
