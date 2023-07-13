import { useQuery } from '@tanstack/react-query'
import { getComments } from '~/lib/api/items'
import { type UseQueryOptionsOf } from '~/lib/type'

export function useCommentsQuery(
  itemId: string,
  options: UseQueryOptionsOf<typeof getComments> = {},
) {
  return useQuery(
    extractKey(itemId),
    () => getComments(itemId.toString()),
    options,
  )
}

const extractKey = (itemId: string) => ['comments', itemId]

useCommentsQuery.extractKey = extractKey
