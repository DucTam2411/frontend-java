import { fetchClient } from '../client'
import {
  type Post,
  type GetItemsResult,
  type LikeItemResult,
  type Comment,
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
  console.log('🚀 TAM ~ file: items.ts:30 ~ fetchClient:', fetchClient.baseUrl)

  const response = await fetchClient.get<GetItemsResult>(
    '/posts'.concat(
      qs.stringify(
        { mode, cursor, startDate, endDate },
        {
          addQueryPrefix: true,
        },
      ),
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
    `/posts/${itemId}/likes`,
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
  return fetchClient.delete(`/posts/${itemId}`)
}

export async function getComments(itemId: string) {
  const response = await fetchClient.get<Comment[]>(`/posts/${itemId}/comments`)
  return response.data
}

export async function createComment({
  itemId,
  text,
  parentCommentId,
}: {
  itemId: number
  parentCommentId?: number
  text: string
}) {
  const response = await fetchClient.post<Comment>(
    `/posts/${itemId}/comments`,
    {
      itemId,
      parentCommentId,
      text,
    },
  )
  return response.data
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
  const response = await fetchClient.delete(
    `/posts/${itemId}/comments/${commentId}`,
  )
  return response.data
}

export async function editComment({
  itemId,
  text,
  commentId,
}: {
  itemId: number
  commentId?: number
  text: string
}) {
  const response = await fetchClient.patch<Comment>(
    `/posts/${itemId}/comments/${commentId}`,
    {
      itemId,
      text,
    },
  )
  return response.data
}
