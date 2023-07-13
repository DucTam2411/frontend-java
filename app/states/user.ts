import { useState } from 'react'
import { sangte, useSangteValue, useSetSangte } from 'sangte'
import { type User } from '~/lib/api/types'

const initialState = null as User | null
export const userState = sangte(initialState, { global: true })

export function useUser() {
  const [author, setAuthor] = useState({
    id: '5ea35caa-2565-4781-a01a-e9292eeaaf2f',
    name: 'japper aitjor',
  })
  const updateAuthor = (name: string) => {
    setAuthor({
      id: author.id,
      name,
    })
  }
  // const user = useSangteValue(userState)
  return {
    id: '44c96da8-02c6-11ee-be56-0242ac120002',
    username: 'ductam2943 ',
    author,
    setAuthor: updateAuthor,
  }
  // return user
}

export function useSetUser() {
  const setUser = useSetSangte(userState)
  return setUser
}
