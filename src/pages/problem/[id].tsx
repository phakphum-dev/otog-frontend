import { PageContainer } from '@src/components/PageContainer'
import { Title } from '@src/components/Title'
import { useRouter } from 'next/router'
import { FaLightbulb } from 'react-icons/fa'
import Editor, { useMonaco } from '@monaco-editor/react'
import { Button } from '@chakra-ui/button'
import { useHttp } from '@src/utils/api/HttpProvider'
import { useToastError } from '@src/utils/hooks/useError'
import {
  Link,
  SimpleGrid,
  Spacer,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/layout'
import { useProblem } from '@src/utils/api/Problem'
import { Select } from '@chakra-ui/select'
import { ChangeEvent, useState } from 'react'
import { API_HOST, getServerSideFetch, getCookies } from '@src/utils/api'
import { GetServerSideProps } from 'next'
import { SubmissionWithSourceCode } from '@src/utils/api/Submission'

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
  initialData: SubmissionWithSourceCode | null
}

export default function WriteSolutionPage(props: WriteSolutionPageProps) {
  const { initialData: submission } = props
  const router = useRouter()
  const { id } = router.query
  const { data: problem } = useProblem(id as string)
  const [language, setLanguage] = useState<string>(
    submission?.language ?? 'cpp'
  )
  const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value)
  }

  const monaco = useMonaco()
  const http = useHttp()
  const { onError } = useToastError()
  const onSubmit = async () => {
    const value = monaco?.editor.getModels()[0].getValue()
    if (value && problem) {
      const blob = new Blob([value])
      const file = new File([blob], `${problem.id}${extension[language]}`)

      const formData = new FormData()
      formData.append('sourceCode', file)
      formData.append('language', language)
      try {
        await http.post(`submission/problem/${id}`, formData)
        router.push('/submission')
      } catch (e) {
        onError(e)
      }
    }
  }

  return (
    <PageContainer dense>
      <Stack spacing={4}>
        <Stack direction="row" justify="space-between" align="flex-end">
          <Title mb={1} icon={FaLightbulb}>
            {problem?.name}
          </Title>
          {problem && (
            <VStack align="flex-end" spacing={0}>
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
            </VStack>
          )}
        </Stack>

        <Editor
          height="75vh"
          language={language}
          theme="vs-dark"
          defaultValue={submission?.sourceCode ?? defaultValue}
        />

        <SimpleGrid columns={3} alignItems="flex-end" mt={2}>
          <Select onChange={onChange} value={language}>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="python">Python</option>
          </Select>
          <Spacer />
          <Button onClick={onSubmit}>ส่ง</Button>
        </SimpleGrid>
      </Stack>
    </PageContainer>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { accessToken = null } = getCookies(context)
  if (accessToken) {
    const id = context.query.id
    return getServerSideFetch<SubmissionWithSourceCode | null>(
      `submission/problem/${id}/latest`,
      context
    )
  }
  return {
    redirect: {
      permanent: false,
      destination: '/submission/all',
    },
  }
}
