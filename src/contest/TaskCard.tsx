import Editor from '@monaco-editor/react'
import { ChangeEvent, FormEvent, memo, useState } from 'react'

import { CodeModal, ErrorModal } from '../components/Code'
import { FileInput } from '../components/FileInput'
import { submitContestProblem } from './queries'

import { Button, IconButton } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CloseIcon,
  EditIcon,
} from '@chakra-ui/icons'
import {
  Badge,
  Box,
  Divider,
  HStack,
  Heading,
  Link,
  Spacer,
  Stack,
  Text,
} from '@chakra-ui/layout'
import { Select } from '@chakra-ui/select'
import { Spinner } from '@chakra-ui/spinner'
import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/table'
import { Collapse } from '@chakra-ui/transition'

import { API_HOST, OFFLINE_MODE } from '@src/config'
import { useLoading } from '@src/hooks/useLoading'
import { useMutation } from '@src/hooks/useMutation'
import { Problem } from '@src/problem/types'
import { SubmissionWithProblem } from '@src/submission/types'
import { useProblemSubmission } from '@src/submission/useSubmission'
import { useDropFile } from '@src/submit/useDropFile'
import { isGraded, isGrading, useStatusColor } from '@src/theme/useStatusColor'
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
  const { data: submission } = useProblemSubmission(problem.id)

  return (
    <Box rounded="lg" boxShadow="sm" borderWidth="1px">
      <Button
        p={{ base: 2, sm: 6 }}
        justifyContent="space-between"
        borderBottomRadius={isOpen ? 0 : 'md'}
        variant="ghost"
        width="100%"
        onClick={onToggle}
        rightIcon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
      >
        <HStack>
          <Heading as="h3" size="md">
            {problem.name}
          </Heading>
          {submission?.status === 'accept' && (
            <Badge colorScheme="green">Solved</Badge>
          )}
        </HStack>
      </Button>
      <Collapse in={isOpen}>
        <Divider />
        <Stack p={{ base: 2, sm: 6 }} pt={{ sm: 4 }} spacing={4}>
          <HStack>
            <Box flex={1}>
              <Link isExternal href={`${API_HOST}problem/doc/${problem.id}`}>
                [ดาวน์โหลด]
              </Link>
              <Text fontSize="sm">
                ({problem.timeLimit / ONE_SECOND} วินาที {problem.memoryLimit}{' '}
                MB)
              </Text>
            </Box>
            <IconButton
              aria-label="toggle-code-editor"
              icon={isEditorOpen ? <CloseIcon /> : <EditIcon />}
              size="sm"
              variant="ghost"
              onClick={onEditorToggle}
            />
          </HStack>
          <Collapse in={isEditorOpen}>
            <ContestEditorForm {...props} />
          </Collapse>
          <Collapse in={!isEditorOpen}>
            <ContestFileForm {...props} />
          </Collapse>
          <Collapse in={!!submission}>
            {submission && <TaskSubmissionTable submission={submission} />}
          </Collapse>
        </Stack>
      </Collapse>
    </Box>
  )
})

export type ContestFileFormProps = TaskCardProps

export const ContestFileForm = (props: ContestFileFormProps) => {
  const { problem, contestId } = props

  const { mutate } = useProblemSubmission(problem.id)

  const { file, fileInputProps, resetFile, getRootProps } = useDropFile()
  const { isLoading, onLoad, onLoaded } = useLoading()
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
      <Stack direction={{ base: 'column', sm: 'row' }} spacing={2}>
        <Select name="language" size="sm" flex={1}>
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="python" disabled={OFFLINE_MODE}>
            Python
          </option>
        </Select>
        <Spacer />
        <HStack justify="flex-end" {...getRootProps()}>
          <FileInput
            required
            name="sourceCode"
            accept=".c,.cpp,.py"
            variant="sm"
            {...fileInputProps}
          />
          <Button variant="otog" size="sm" type="submit">
            ส่ง
          </Button>
        </HStack>
      </Stack>
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
  const { mutate } = useProblemSubmission(problem.id)

  const [language, setLanguage] = useState<string>('cpp')
  const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value)
  }

  const [value, setValue] = useState<string | undefined>(defaultValue)
  const onEditorChange = (value: string | undefined) => {
    setValue(value)
  }

  const submitContestProblemMutataion = useMutation(submitContestProblem)
  const { isLoading, onLoad, onLoaded } = useLoading()
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
    <Stack>
      <Editor
        height="60vh"
        language={language}
        theme="vs-dark"
        value={value}
        onChange={onEditorChange}
      />
      <Stack direction="row" spacing={{ base: 2, sm: 8 }}>
        <Select name="language" size="sm" flex={1} onChange={onSelectChange}>
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="python" disabled={OFFLINE_MODE}>
            Python
          </option>
        </Select>
        <Spacer />
        <Box flex={1}>
          <Button variant="otog" size="sm" width="100%" onClick={onSubmit}>
            ส่ง
          </Button>
        </Box>
      </Stack>
    </Stack>
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
    <Box overflowX="auto">
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
                variant="ghost"
                px={1}
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
                    px={1}
                    variant="ghost"
                    onClick={errorDisclosure.onOpen}
                    size="sm"
                  >
                    {submission.result}
                  </Button>
                  <ErrorModal submission={submission} {...errorDisclosure} />
                </>
              ) : isGrading(submission) ? (
                <HStack>
                  <Spinner size="xs" />
                  <Text>{submission.result}</Text>
                </HStack>
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
    </Box>
  )
}
