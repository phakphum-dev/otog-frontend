import Editor from '@monaco-editor/react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { parseCookies } from 'nookies'
import { ChangeEvent, useState } from 'react'
import { FaLightbulb } from 'react-icons/fa'

import { Button } from '@chakra-ui/button'
import {
  Link,
  SimpleGrid,
  Spacer,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/layout'
import { Select } from '@chakra-ui/select'
import { Tooltip } from '@chakra-ui/tooltip'

import { API_HOST, getServerSideFetch } from '@src/api'
import { useHttp } from '@src/api/HttpProvider'
import { PageContainer } from '@src/components/PageContainer'
import { Title, TitleLayout } from '@src/components/Title'
import { useErrorToast } from '@src/hooks/useError'
import { Problem } from '@src/hooks/useProblem'
import { SubmissionWithSourceCode } from '@src/hooks/useSubmission'
import { ONE_SECOND } from '@src/hooks/useTimer'

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
  problem: Problem
}

export default function WriteSolutionPage(props: WriteSolutionPageProps) {
  const { problem } = props
  const router = useRouter()
  const id = Number(router.query.id)

  return (
    <PageContainer maxSize="md">
      <Head>
        <title>Problem {id} | OTOG</title>
      </Head>
      <Stack>
        <TitleLayout>
          <Tooltip label={problem.name} hasArrow placement="top">
            <Title icon={FaLightbulb} noOfLines={1}>
              {problem.name}
            </Title>
          </Tooltip>
          <VStack align="flex-end" spacing={0}>
            <Link isExternal href={`${API_HOST}problem/doc/${problem.id}`}>
              [ดาวน์โหลด]
            </Link>
            <Text fontSize="sm" whiteSpace="nowrap">
              ({problem.timeLimit / ONE_SECOND} วินาที {problem.memoryLimit} MB)
            </Text>
          </VStack>
        </TitleLayout>
        <EditorForm {...props} />
      </Stack>
    </PageContainer>
  )
}

function EditorForm(props: WriteSolutionPageProps) {
  const { submission, problem } = props
  const router = useRouter()
  const [language, setLanguage] = useState<string>(
    submission?.language ?? 'cpp'
  )
  const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value)
  }
  const http = useHttp()
  const { onError } = useErrorToast()

  const [value, setValue] = useState<string | undefined>(
    submission?.sourceCode ?? defaultValue
  )
  const onEditorChange = (value: string | undefined) => {
    setValue(value)
  }
  const onSubmit = async () => {
    if (!value) return
    const blob = new Blob([value])
    const file = new File([blob], `${problem.id}${extension[language]}`)

    const formData = new FormData()
    formData.append('sourceCode', file)
    formData.append('language', language)
    try {
      await http.post(`submission/problem/${problem.id}`, formData)
      router.push('/submission')
    } catch (e: any) {
      onError(e)
    }
  }

  return (
    <>
      <Editor
        height="75vh"
        language={language}
        theme="vs-dark"
        value={value}
        onChange={onEditorChange}
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
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = Number(context.query.id)
  if (Number.isNaN(id)) {
    return { notFound: true }
  }
  const { accessToken = null } = parseCookies(context)
  return getServerSideFetch<WriteSolutionPageProps>(context, async (api) => ({
    problem: await api.get(`problem/${id}`),
    submission: accessToken
      ? await api.get(`submission/problem/${id}/latest`)
      : null,
  }))
}
