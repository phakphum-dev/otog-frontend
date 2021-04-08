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
  Heading,
  HStack,
  Link,
  Spacer,
  Stack,
  Text,
} from '@chakra-ui/layout'
import { Select } from '@chakra-ui/select'
import { Spinner } from '@chakra-ui/spinner'
import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/table'
import { Collapse } from '@chakra-ui/transition'
import Editor from '@monaco-editor/react'
import { API_HOST } from '@src/utils/api'
import { Problem } from '@src/utils/api/Problem'
import { SubmissionWithProblem, useSubmission } from '@src/utils/api/Submission'
import {
  isGraded,
  isGrading,
  useStatusColor,
} from '@src/utils/hooks/useStatusColor'

import { CodeModal, ErrorModal } from './CodeModal'
import { FileInput } from './FileInput'
import { OrangeButton } from './OrangeButton'

const defaultValue = `#include <iostream>

using namespace std;

int main() {
    return 0;
}`

export interface TaskCardProps {
  problem: Problem
  // contestId: number
}

export function TaskCard(props: TaskCardProps) {
  const { problem } = props
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true })
  const { data: submission } = useSubmission(14241)
  const { isOpen: isEditorOpen, onToggle: onEditorToggle } = useDisclosure()

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
              <Link
                href={`${API_HOST}problem/doc/${problem.id}`}
                target="_blank"
                color="otog"
              >
                [ดาวน์โหลด]
              </Link>
              <Text fontSize="sm">
                ({problem.timeLimit / 1000} วินาที {problem.memoryLimit} MB)
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
            <Editor
              height="60vh"
              language="cpp"
              theme="vs-dark"
              defaultValue={defaultValue}
            />
          </Collapse>
          <Stack
            direction={{ base: isEditorOpen ? 'row' : 'column', sm: 'row' }}
            spacing={{ base: 2, sm: 8 }}
          >
            <Select name="language" size="sm" flex={1}>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="python">Python</option>
            </Select>
            {isEditorOpen ? (
              <>
                <Spacer />
                <Box flex={1}>
                  <OrangeButton size="sm" width="100%">
                    ส่ง
                  </OrangeButton>
                </Box>
              </>
            ) : (
              <HStack justify="flex-end">
                <FileInput size="sm" />
                <OrangeButton size="sm">ส่ง</OrangeButton>
              </HStack>
            )}
          </Stack>
          <Collapse in={!!submission}>
            {submission && <TaskSubmissionTable submission={submission} />}
          </Collapse>
        </Stack>
      </Collapse>
    </Box>
  )
}

export interface TaskSubmissionTableProps {
  submission: SubmissionWithProblem
}

export function TaskSubmissionTable(props: TaskSubmissionTableProps) {
  const { submission } = props
  const bg = useStatusColor(submission)

  const {
    isOpen: isErrorOpen,
    onOpen: onErrorOpen,
    onClose: onErrorClose,
  } = useDisclosure()

  const {
    isOpen: isCodeOpen,
    onOpen: onCodeOpen,
    onClose: onCodeClose,
  } = useDisclosure()

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
              <Button variant="ghost" onClick={onCodeOpen} px={1} size="sm">
                ล่าสุด
              </Button>
              <CodeModal
                submissionId={submission.id}
                isOpen={isCodeOpen}
                onClose={onCodeClose}
              />
            </Td>
            <Td>
              {submission.errmsg ? (
                <>
                  <Button px={1} variant="ghost" onClick={onErrorOpen}>
                    {submission.result}
                  </Button>
                  <ErrorModal
                    isOpen={isErrorOpen}
                    onClose={onErrorClose}
                    submission={submission}
                  />
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
