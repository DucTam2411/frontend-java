import { sangte, useSangteActions, useSangteValue } from 'sangte'

interface CommentLike {
  isLiked: boolean
  likes: number
}

type CommentLikeState = Record<string, CommentLike | undefined>

const initialState: CommentLikeState = {}

export const commentLikeState = sangte(initialState, (prev) => ({
  set(commentId: string, commentLike: CommentLike) {
    prev[commentId] = commentLike
  },
}))

export function useCommentLikeValue() {
  return useSangteValue(commentLikeState)
}

export function useCommentLikeById(commentId: string) {
  const commentLike = useSangteValue(
    commentLikeState,
    (state) => state[commentId],
  )
  return commentLike
}

export function useCommentLikeSetter() {
  const { set } = useSangteActions(commentLikeState)
  return set
}
