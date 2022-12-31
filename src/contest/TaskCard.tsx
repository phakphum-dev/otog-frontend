import Editor from '@monaco-editor/react'
import clsx from 'clsx'
import { ChangeEvent, FormEvent, memo, useState } from 'react'

import { CodeModal, ErrorModal } from '../components/Code'
import { FileInput } from '../components/FileInput'
import { submitContestProblem } from './queries'

import {
  ChevronDownIcon,
  ChevronUpIcon,
  CloseIcon,
  EditIcon,
} from '@chakra-ui/icons'
import { Divider } from '@chakra-ui/layout'
import { Spinner } from '@chakra-ui/spinner'
import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/table'
import { Collapse } from '@chakra-ui/transition'

import { API_HOST, OFFLINE_MODE } from '@src/config'
import { useDisclosure } from '@src/hooks/useDisclosure'
import { useMutation } from '@src/hooks/useMutation'
import { Problem } from '@src/problem/types'
import { useLatestProblemSubmission } from '@src/submission/queries'
import { useDropFile } from '@src/submission/submit/useDropFile'
import { SubmissionWithProblem } from '@src/submission/types'
import { isGraded, isGrading, useStatusColor } from '@src/theme/useStatusColor'
import { Button } from '@src/ui/Button'
import { IconButton } from '@src/ui/IconButton'
import { Select } from '@src/ui/Input'
import { Link } from '@src/ui/Link'
import { ONE_SECOND } from '@src/utils/time'

const defaultValue = `#include <iostream>

using namespace std;

int main() {
    return 0;
}`

export interface TaskCardProps {
  problem: Problem
  contestId: number
}

export const TaskCard = memo((props: TaskCardProps) => {
  const { problem } = props
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true })
  const { isOpen: isEditorOpen, onToggle: onEditorToggle } = useDisclosure()
  const { data: submission } = useLatestProblemSubmission(problem.id)

  return (
    <div className="rounded-lg shadow-sm border">
      <Button
        className={clsx(
          '!p-2 sm:!p-6 justify-between',
          isOpen && 'rounded-b-none'
        )}
        fullWidth
        variant="ghost"
        onClick={onToggle}
        rightIcon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-xl">{problem.name}</h3>
          {submission?.status === 'accept' && (
            <div className="inline-flex px-1 uppercase text-xs rounded-sm font-bold text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-500/16">
              Solved
            </div>
          )}
        </div>
      </Button>
      <Collapse in={isOpen}>
        <Divider />
        <div className="flex flex-col gap-4 p-2 sm:p-6 sm:pt-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Link isExternal href={`${API_HOST}problem/doc/${problem.id}`}>
                [ดาวน์โหลด]
              </Link>
              <div className="text-sm">
                ({problem.timeLimit / ONE_SECOND} วินาที {problem.memoryLimit}{' '}
                MB)
              </div>
            </div>
            <IconButton
              aria-label="toggle-code-editor"
              icon={isEditorOpen ? <CloseIcon /> : <EditIcon />}
              size="sm"
              variant="ghost"
              onClick={onEditorToggle}
            />
          </div>
          <Collapse in={isEditorOpen}>
            <ContestEditorForm {...props} />
          </Collapse>
          <Collapse in={!isEditorOpen}>
            <ContestFileForm {...props} />
          </Collapse>
          <Collapse in={!!submission}>
            {submission && <TaskSubmissionTable submission={submission} />}
          </Collapse>
        </div>
      </Collapse>
    </div>
  )
})

export type ContestFileFormProps = TaskCardProps

export const ContestFileForm = (props: ContestFileFormProps) => {
  const { problem, contestId } = props

  const { mutate } = useLatestProblemSubmission(problem.id)

  const { file, fileInputProps, resetFile, getRootProps } = useDropFile()
  const {
    isOpen: isLoading,
    onOpen: onLoad,
    onClose: onLoaded,
  } = useDisclosure()
  const submitContestProblemMutataion = useMutation(submitContestProblem)
  const onFileSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLoading || !file) return
    try {
      onLoad()
      const language = new FormData(e.currentTarget).get('language') as string
      await submitContestProblemMutataion(problem.id, contestId, file, language)
      mutate()
      resetFile()
    } finally {
      onLoaded()
    }
  }
  return (
    <form onSubmit={onFileSubmit}>
      <div className="flex flex-col sm:flex-row gap-2">
        <Select name="language" variant="sm" className="flex-1">
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="python" disabled={OFFLINE_MODE}>
            Python
          </option>
        </Select>
        <div className="flex-1" />
        <div
          className="flex gap-2 justify-end flex-1 sm:flex-initial sm:w-64"
          {...getRootProps()}
        >
          <FileInput
            required
            name="sourceCode"
            accept=".c,.cpp,.py"
            variant="sm"
            {...fileInputProps}
          />
          <Button colorScheme="otog" size="sm" type="submit">
            ส่ง
          </Button>
        </div>
      </div>
    </form>
  )
}

const extension: Record<string, string> = {
  cpp: '.cpp',
  c: '.c',
  python: '.py',
}

export type ContestEditorFormProps = TaskCardProps

export const ContestEditorForm = (props: ContestEditorFormProps) => {
  const { problem, contestId } = props
  const { mutate } = useLatestProblemSubmission(problem.id)

  const [language, setLanguage] = useState<string>('cpp')
  const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value)
  }

  const [value, setValue] = useState<string | undefined>(defaultValue)
  const onEditorChange = (value: string | undefined) => {
    setValue(value)
  }

  const submitContestProblemMutataion = useMutation(submitContestProblem)
  const {
    isOpen: isLoading,
    onOpen: onLoad,
    onClose: onLoaded,
  } = useDisclosure()
  const onSubmit = async () => {
    if (isLoading || !value) return
    try {
      onLoad()
      const blob = new Blob([value])
      const file = new File([blob], `${problem.id}${extension[language]}`)
      await submitContestProblemMutataion(problem.id, contestId, file, language)
      mutate()
    } finally {
      onLoaded()
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Editor
        height="60vh"
        language={language}
        theme="vs-dark"
        value={value}
        onChange={onEditorChange}
      />
      <div className="flex gap-2 sm:gap-8">
        <Select
          name="language"
          variant="sm"
          className="flex-1"
          onChange={onSelectChange}
        >
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="python" disabled={OFFLINE_MODE}>
            Python
          </option>
        </Select>
        <div className="flex-1" />
        <Button
          className="flex-1"
          colorScheme="otog"
          size="sm"
          onClick={onSubmit}
        >
          ส่ง
        </Button>
      </div>
    </div>
  )
}

export interface TaskSubmissionTableProps {
  submission: SubmissionWithProblem
}

export const TaskSubmissionTable = (props: TaskSubmissionTableProps) => {
  const { submission } = props
  const bg = useStatusColor(submission)

  const errorDisclosure = useDisclosure()
  const codeDisclosure = useDisclosure()

  return (
    <div className="overflow-x-auto">
      <Table size="sm">
        <Thead>
          <Tr>
            <Th px={5}>#</Th>
            <Th>ผลตรวจ</Th>
            <Th>เวลารวม</Th>
            <Th>คะแนน</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr bg={bg}>
            <Td>
              <Button
                className="!px-1"
                variant="ghost"
                size="sm"
                onClick={codeDisclosure.onOpen}
              >
                ล่าสุด
              </Button>
              <CodeModal submissionId={submission.id} {...codeDisclosure} />
            </Td>
            <Td>
              {submission.errmsg ? (
                <>
                  <Button
                    className="!px-1"
                    variant="ghost"
                    onClick={errorDisclosure.onOpen}
                    size="sm"
                  >
                    {submission.result}
                  </Button>
                  <ErrorModal submission={submission} {...errorDisclosure} />
                </>
              ) : isGrading(submission) ? (
                <div className="flex gap-2">
                  <Spinner size="xs" />
                  <div>{submission.result}</div>
                </div>
              ) : isGraded(submission) ? (
                <code>{submission.result}</code>
              ) : (
                submission.result
              )}
            </Td>
            <Td>{submission.timeUsed / 1000} s</Td>
            <Td>{submission.score}</Td>
          </Tr>
        </Tbody>
      </Table>
    </div>
  )
}
