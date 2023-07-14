import type { MetaFunction } from '@remix-run/node'
import { json, type LoaderFunction, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import styled from '@emotion/styled'
import LinkCardList from '~/components/home/LinkCardList'
import TabLayout from '~/components/layouts/TabLayout'
import EmptyList from '~/components/system/EmptyList'
import { useInfiniteScroll } from '~/hooks/useInfiniteScroll'
import { getBookmarks } from '~/lib/api/bookmark'
import { type GetBookmarksResult } from '~/lib/api/types'
import { withCookie } from '~/lib/client'
import { media } from '~/lib/media'
import { useUser } from '~/states/user'

export const meta: MetaFunction = () => {
  return { title: 'Favorite', robots: 'noindex' }
}

export default function Bookmarks() {
  const initialData = useLoaderData<GetBookmarksResult>()
  const ref = useRef<HTMLDivElement>(null)

  // const { data, hasNextPage, fetchNextPage } = useInfiniteQuery(
  //   ['bookmarks'],
  //   ({ pageParam }) => getBookmarks(pageParam),
  //   {
  //     initialData: {
  //       pageParams: [undefined],
  //       pages: [initialData],
  //     },
  //     getNextPageParam: (lastPage) => {
  //       if (!lastPage.pageInfo.hasNextPage) return undefined
  //       return lastPage.pageInfo.nextOffset
  //     },
  //   },
  // )

  // useInfiniteScroll(ref, fetchNextPage)
  const user = useUser()
  const { data } = useInfiniteQuery(['bookmarks'], ({ pageParam }) =>
    getBookmarks(user.username),
  ) as any

  console.log('🚀 TAM ~ file: bookmarks.tsx:43 ~ Bookmarks ~ data:', data)

  let items = data ? data.pages[0]._embedded.posts : []
  items = items.map((item: any) => ({ ...item, liked: true }))

  const mappedItems = items.map((post: any) => {
    if ((post as any).userLikedPost) {
      const listLikedUser: string[] =
        JSON.parse((post as any).userLikedPost?.replaceAll("'", '"')) ?? []
      // []

      if (listLikedUser.includes(user.username.trim())) {
        return {
          ...post,
          isLiked: true,
        }
      }
    }
    return post
  })

  console.log('🚀 TAM ~ file: bookmarks.tsx:49 ~ Bookmarks ~ items:', items)
  return (
    <StyledTabLayout>
      {mappedItems?.length === 0 ? (
        <EmptyList
          message={`You don't have any bookmarks.\nTry bookmarking a link that you want to see again later`}
        />
      ) : null}
      <Content>
        {mappedItems ? <LinkCardList items={mappedItems} /> : null}
        <div ref={ref} />
      </Content>
    </StyledTabLayout>
  )
}

const StyledTabLayout = styled(TabLayout)`
  padding-top: 16px;
  padding-left: 16px;
  padding-right: 16px;
  padding-bottom: 16px;
`

const Content = styled.div`
  position: relative;
  ${media.wide} {
    width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }
`
