import { fetchClient } from '../client'
import { type GetBookmarksResult, type Bookmark } from './types'

export async function createBookmark(
  itemId: number,
  controller?: AbortController,
) {
  const response = await fetchClient.post<Bookmark>(
    '/api/bookmarks',
    { itemId },
    {
      signal: controller?.signal,
    },
  )
  return response.data
}

export async function deleteBookmark(
  itemId: number,
  controller?: AbortController,
) {
  const response = await fetchClient.delete('/api/bookmarks', {
    signal: controller?.signal,
    params: { itemId },
  })
  return response.data
}

export async function getBookmarks(userId: string) {
  // const response = await fetchClient.get<GetBookmarksResult>('/api/bookmarks', {
  //   params: { cursor },
  // })
  const response = await fetch(
    `http://localhost:8080/posts/search/findByUserLikedPostContaining?userId=${userId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )

  const data = await response.json()
  console.log(
    '🚀 TAM ~ file: bookmark.ts:34 ~ getBookmarks ~ response:',
    // response.data,
    userId,
  )
  return data
}
