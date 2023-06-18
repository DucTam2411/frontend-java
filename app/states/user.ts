import { sangte, useSangteValue, useSetSangte } from 'sangte'
import { type User } from '~/lib/api/types'

const initialState = null as User | null
export const userState = sangte(initialState, { global: true })

export function useUser() {
  const user = useSangteValue(userState)
  return {
    id: '1',
    username: 'ductam2943 ',
  }
  // return user
}

export function useSetUser() {
  const setUser = useSetSangte(userState)
  return setUser
}
