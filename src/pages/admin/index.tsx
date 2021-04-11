import { Button, ButtonGroup, IconButton } from '@chakra-ui/button'
import { FormControl, FormHelperText, FormLabel } from '@chakra-ui/form-control'
import { useDisclosure } from '@chakra-ui/hooks'
import { Input } from '@chakra-ui/input'
import { Flex, Stack, Text } from '@chakra-ui/layout'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal'
import { Select } from '@chakra-ui/select'
import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/table'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/tabs'
import { DatePicker } from '@src/components/DatePick'
import { PageContainer } from '@src/components/PageContainer'

import { Title } from '@src/components/Title'
import { getServerSideCookies } from '@src/utils/api'
import { getUserData } from '@src/utils/api/AuthProvider'
import { useContests } from '@src/utils/api/Contest'
import { useProblems } from '@src/utils/api/Problem'
import { GetServerSideProps } from 'next'
import { parseCookies } from 'nookies'
import { useState } from 'react'
import {
  FaEye,
  FaPencilAlt,
  FaPlusCircle,
  FaSync,
  FaTools,
  FaTrash,
} from 'react-icons/fa'

export default function AdminHomePage() {
  const { data: problems } = useProblems()
  const { data: contests } = useContests()
  const { isOpen, onClose, onOpen } = useDisclosure()
  return (
    <PageContainer dense>
      <Flex dir="row" justify="space-between" align="baseline">
        <Title icon={FaTools}>GOTO System</Title>
        <Text>ขี้เกียจทำหลายหน้า</Text>
      </Flex>
      <Tabs isFitted variant="enclosed">
        <TabList mb="1em">
          <Tab>Contest</Tab>
          <Tab>Problem</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Modal onClose={onClose} isOpen={isOpen} size="sm">
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>สร้างการแข่งขัน</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <CreateContestForm />
                </ModalBody>
                <ModalFooter>
                  <Button colorScheme="green" onClick={onClose} disabled>
                    สร้าง
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
            <Button
              colorScheme="green"
              leftIcon={<FaPlusCircle />}
              size="lg"
              onClick={onOpen}
            >
              เพิ่มการแข่งขัน
            </Button>
            <Table>
              <Thead>
                <Tr>
                  <Th>#</Th>
                  <Th>ชื่อ</Th>
                  <Th>แก้ไข</Th>
                </Tr>
              </Thead>
              <Tbody>
                {/* {problems?.map((problem) => (
                  <Tr key={problem.id}>
                    <Td>{problem.id}</Td>
                    <Td>{problem.name}</Td>
                    <Td>
                      <IconButton
                        icon={<FaEye />}
                        aria-label="open-or-close"
                        disabled={true}
                      />
                    </Td>
                  </Tr>
                ))} */}
              </Tbody>
            </Table>
          </TabPanel>
          <TabPanel>
            <Table>
              <Thead>
                <Tr>
                  <Th>#</Th>
                  <Th>ชื่อ</Th>
                  <Th>แก้ไข</Th>
                </Tr>
              </Thead>
              <Tbody>
                {/* {problems?.map((problem) => (
                  <Tr key={problem.id}>
                    <Td>{problem.id}</Td>
                    <Td>{problem.name}</Td>
                    <Td>
                      <ButtonGroup isAttached>
                        <IconButton
                          icon={<FaPencilAlt />}
                          aria-label="config"
                          disabled
                        />
                        <IconButton
                          icon={<FaEye />}
                          aria-label="open-or-close"
                          disabled
                        />
                        <IconButton
                          icon={<FaSync />}
                          aria-label="config"
                          disabled
                        />
                        <IconButton
                          icon={<FaTrash />}
                          aria-label="config"
                          disabled
                        />
                      </ButtonGroup>
                    </Td>
                  </Tr>
                ))} */}
              </Tbody>
            </Table>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </PageContainer>
  )
}

function CreateContestForm() {
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date())
  return (
    <form>
      <Stack>
        <FormControl>
          <FormLabel>ชื่อการแข่งขัน</FormLabel>
          <Input placeholder="การแข่งขัน" />
        </FormControl>
        <FormControl>
          <FormLabel>การเรท</FormLabel>
          <Select>
            <option value="unrated">Unrated</option>
            <option value="rated">Rated</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>โหมด</FormLabel>
          <Select>
            <option value="classic">Classic</option>
            <option value="acm">ACM</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>เวลาเริ่ม</FormLabel>
          <DatePicker
            selectedDate={startDate}
            onChange={(date: Date) => {
              setStartDate(date)
              if (endDate < date) setEndDate(date)
            }}
          />
        </FormControl>
        <FormControl>
          <FormLabel>เวลาจบ</FormLabel>
          <DatePicker
            selectedDate={endDate}
            onChange={(date: Date) => {
              if (date < startDate) setStartDate(date)
              setEndDate(date)
            }}
          />
        </FormControl>
      </Stack>
    </form>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { accessToken = null } = parseCookies(context)
  const userData = getUserData(accessToken)
  if (userData?.role === 'admin') {
    return getServerSideCookies(context)
  }
  return {
    notFound: true,
  }
}
