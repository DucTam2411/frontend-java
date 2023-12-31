import { useCallback, useRef } from 'react'
import { likeItem, unlikeItem } from '~/lib/api/items'
import { useItemOverrideSetter } from '~/states/itemOverride'

type ItemStats = {
  like: number
  commentsCount: number
}
export const getUserLikeList = (userLikedString: any) => {
  const userLiked = userLikedString
    ? (JSON.parse(
        userLikedString.replaceAll("'", '"').toLowerCase(),
      ) as string[])
    : []
  return userLiked
}
export function useLikeManager() {
  const set = useItemOverrideSetter()
  const abortControllers = useRef(new Map<number, AbortController>()).current

  const like = useCallback(
    async (
      id: number,
      initialStats: ItemStats = {
        like: 0,
        commentsCount: 0,
      },
    ) => {
      const prevController = abortControllers.get(id)

      try {
        prevController?.abort()
        set(id, {
          itemStats: { ...initialStats, likes: initialStats.like + 1 },
          isLiked: true,
        })
        const controller = new AbortController()
        abortControllers.set(id, controller)
        const result = await likeItem(id, controller)
        abortControllers.delete(id)
        set(id, {
          itemStats: result.itemStats,
          isLiked: true,
        })
      } catch (e) {
        /* @todo: handle eror */
        console.error(e)
      }
    },
    [set, abortControllers],
  )
  const unlike = useCallback(
    async (id: number, initialStats: ItemStats) => {
      const prevController = abortControllers.get(id)

      try {
        prevController?.abort()
        set(id, {
          itemStats: { ...initialStats, likes: initialStats.like - 1 },
          isLiked: false,
        })
        const controller = new AbortController()
        abortControllers.set(id, controller)
        const result = await unlikeItem(id, controller)
        abortControllers.delete(id)
        set(id, {
          itemStats: result.itemStats,
          isLiked: false,
        })
      } catch (e) {
        /* @todo: handle eror */
        console.error(e)
      }
    },
    [set, abortControllers],
  )

  return { like, unlike }
}
