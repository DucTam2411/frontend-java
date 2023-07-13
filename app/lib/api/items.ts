import { fetchClient } from '../client'
import {
  type Post,
  type GetItemsResult,
  type LikeItemResult,
  type PostComment,
  type LikeCommentResult,
  type UnlikeCommentResult,
  type ListMode,
} from './types'
import qs from 'qs'

export async function createItem(params: CreateItemParams) {
  const parsedParams = {
    ...params,
    user: 'http://localhost:8080/users/44c96da8-02c6-11ee-be56-0242ac120002',
    author:
      'http://localhost:8080/authors/5ea35caa-2565-4781-a01a-e9292eeaaf2f',
  }
  const response = await fetchClient.post<Post>('/posts', parsedParams)
  const request1 = response.data
  return request1
}

export async function getItems({
  mode,
  cursor,
  startDate,
  endDate,
}: {
  mode: ListMode
  cursor?: number
  startDate?: string
  endDate?: string
}) {
  const response = await fetchClient.get<GetItemsResult>(
    '/posts'.concat(
      qs.stringify(
        { mode, cursor, startDate, endDate },
        {
          addQueryPrefix: true,
        },
      ) + '&sort=-createdAt',
    ),
  )

  return response.data
}

export async function getItem(itemId: string) {
  const response = await fetchClient.get<Post>(
    `/posts/${itemId}?projection=postWithAuthor`,
  )
  return response.data
}

export async function likeItem(itemId: number, controller?: AbortController) {
  const response = await fetchClient.post<LikeItemResult>(
    `/posts/${itemId}/likes`,
    {},
    {
      signal: controller?.signal,
    },
  )
  return response.data
}

export async function unlikeItem(itemId: number, controller?: AbortController) {
  const response = await fetchClient.delete<LikeItemResult>(
    ` /posts/${itemId}/likes`,
    {
      signal: controller?.signal,
    },
  )
  return response.data
}

export async function updateItem({
  itemId,
  title,
  body,
}: {
  itemId: number
  title: string
  body: string
}) {
  const response = await fetchClient.patch<Post>(`/posts/${itemId}`, {
    title,
    body,
    tags: [],
  })
  return response.data
}

interface CreateItemParams {
  link: string
  title: string
  body: string
  thumbnail: string
}

export async function deleteItem(itemId: number) {
  const res = fetch(`http://localhost:8080/posts/${itemId}`, {
    method: 'DELETE',
  })

  return res
}

export async function getComments(itemId: string) {
  const response = await fetchClient.get<PostComment[]>(
    `/posts/${itemId}/comments`,
  )
  return response.data
}

export async function createComment({
  itemId,
  text,
  parentCommentId,
}: {
  itemId: string
  parentCommentId?: string
  text: string
}) {
  const res = await fetch('http://localhost:8080/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: text,
      post: `http://localhost:8080/posts/${itemId}`,
      user: 'http://localhost:8080/users/44c96da8-02c6-11ee-be56-0242ac120002',
    }),
  })
  const data = await res.json()
  console.log(
    '🚀 TAM ~ file: CommentEditor.tsx:95 ~ handleSubmit ~ res:',
    res.status,
    data,
  )

  return data
}

export async function likeComment({
  itemId,
  commentId,
  controller,
}: {
  itemId: number
  commentId: number
  controller?: AbortController
}) {
  const response = await fetchClient.post<LikeCommentResult>(
    `/posts/${itemId}/comments/${commentId}/likes`,
    {},
    {
      signal: controller?.signal,
    },
  )
  return response.data
}

export async function unlikeComment({
  itemId,
  commentId,
  controller,
}: {
  itemId: number
  commentId: number
  controller?: AbortController
}) {
  const response = await fetchClient.delete<UnlikeCommentResult>(
    `/posts/${itemId}/comments/${commentId}/likes`,
    {
      signal: controller?.signal,
    },
  )
  return response.data
}

export async function deleteComment({
  itemId,
  commentId,
}: {
  itemId: string
  commentId: string
}) {
  const res = await fetch(`http://localhost:8080/comments/${commentId}`, {
    method: 'DELETE',
  })
  const data = await res.json()

  console.log(
    '🚀 TAM ~ file: CommentEditor.tsx:95 ~ handleSubmit ~ res:',
    res.status,
    data,
    commentId,
  )

  return data
}

export async function editComment({
  itemId,
  text,
  commentId,
}: {
  itemId: string
  commentId?: string
  text: string
}) {
  const res = await fetch(`http://localhost:8080/comments/${commentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: text,
    }),
  })
  const data = await res.json()

  console.log(
    '🚀 TAM ~ file: CommentEditor.tsx:95 ~ handleSubmit ~ res:',
    res.status,
    data,
  )

  return data
}
