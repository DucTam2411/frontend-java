import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { deleteComment } from '~/lib/api/items'
import { useCommentsQuery } from './query/useCommentsQuery'
import { useItemId } from './useItemId'

export function useDeleteComment() {
  const itemId = useItemId()
  const queryClient = useQueryClient()

  return useCallback(
    async (commentId: string) => {
      if (!itemId) return
      await deleteComment({
        commentId,
        itemId,
      })
      queryClient.invalidateQueries(useCommentsQuery.extractKey(itemId))
    },
    [itemId, queryClient],
  )
}
