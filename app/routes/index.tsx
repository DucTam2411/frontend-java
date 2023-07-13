import type { MetaFunction } from '@remix-run/node'
import { json, type LoaderFunction } from '@remix-run/node'
import { useCatch, useLoaderData, useSearchParams } from '@remix-run/react'
import { format } from 'date-fns'
import QueryString from 'qs'

import styled from '@emotion/styled'
import { useEffect, useMemo, useRef, useState } from 'react'
import LinkCardList from '~/components/home/LinkCardList'
import ListModeSelector from '~/components/home/ListModeSelector'
import WeekSelector from '~/components/home/WeekSelector'
import TabLayout from '~/components/layouts/TabLayout'
import EmptyList from '~/components/system/EmptyList'
import { getItems } from '~/lib/api/items'
import type { Post } from '~/lib/api/types'
import { type GetItemsResult, type ListMode } from '~/lib/api/types'
import { waitIfNeeded, withCookie } from '~/lib/client'
import { media } from '~/lib/media'
import { parseUrlParams } from '~/lib/parseUrlParams'
import { getWeekRangeFromDate } from '~/lib/week'
import { useUser } from '~/states/user'

export const loader: LoaderFunction = async ({ request }) => {
  try {
    await waitIfNeeded(request)
    const { mode, start, end } = parseUrlParams<{
      mode?: string
      start?: string
      end?: string
    }>(request.url)
    const fallbackedMode = mode ?? 'trending'

    const range = mode === 'past' ? getWeekRangeFromDate(new Date()) : undefined
    const startDate = start ?? range?.[0]
    const endDate = end ?? range?.[1]
    const list = await withCookie(
      () =>
        getItems({
          mode: fallbackedMode as any,
          startDate,
          endDate,
        }),
      request,
    )

    return json(list, {
      headers: {
        'Cache-Control': 'private, max-age=5',
      },
    })
  } catch (e: any) {
    throw json(
      {
        message: e?.message,
        name: e?.name,
      },
      { status: 500 },
    )
  }
}

export const meta: MetaFunction = ({ params, location }) => {
  const info = (() => {
    const query = QueryString.parse(location.search, {
      ignoreQueryPrefix: true,
    })

    if (query.mode === 'recent') {
      return {
        title: 'Daily - Recent',
        description: 'Daily news',
      }
    }
    if (query.mode === 'past') {
      const { start, end } = query
      const range = getWeekRangeFromDate(new Date())
      const startDate = (start as string) ?? range?.[0]
      const endDate = (end as string) ?? range?.[1]

      const formattedStart = format(new Date(startDate), 'yyyy년 MM월 dd일')
      const formattedEnd = format(new Date(endDate), 'yyyy년 MM월 dd일')

      return {
        title: `Daily - from (${formattedStart} ~ ${formattedEnd})`,
        description: `${formattedStart} ~ ${formattedEnd} to.`,
      }
    }

    return {
      title: 'Daily',
      description:
        '개발, IT, 디자인, 스타트업 관련 유익하고 재미있는 소식들을 벨트렌즈에서 확인하세요.',
    }
  })()

  return {
    ...info,
    'og:title': info.title,
    'og:description': info.description,
    'twitter:card': 'summary_large_image',
    'twitter:title': info.title,
    'twitter:description': info.description,
    'twitter:site': '@veltrends',
    'twitter:image': 'https://veltrends.com/og-image.png',
  }
}

export default function Index() {
  const initialData: any = useLoaderData<GetItemsResult>()
  console.log(
    '🚀 TAM ~ file: index.tsx:111 ~ Index ~ initialData:',
    initialData._embedded.posts,
  )

  const [searchParams, setSearchParams] = useSearchParams()
  const [mode, setMode] = useState<ListMode>(
    (searchParams.get('mode') as any) ?? 'trending',
  )

  const currentUser = useUser()
  console.log('POST THIS IS CURRENT USER', currentUser, 'chicken')

  const defaultDateRange = useMemo(() => getWeekRangeFromDate(new Date()), [])
  const startDate = searchParams.get('start')
  const endDate = searchParams.get('end')
  const [dateRange, setDateRange] = useState(
    startDate && endDate ? [startDate, endDate] : defaultDateRange,
  )
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mode === 'past') {
      setDateRange(
        startDate && endDate ? [startDate, endDate] : defaultDateRange,
      )
    }
  }, [startDate, endDate, mode, defaultDateRange])

  useEffect(() => {
    const nextMode = (searchParams.get('mode') as ListMode) ?? 'trending'
    if (nextMode !== mode) {
      setMode(nextMode)
    }
  }, [mode, searchParams])

  const onSelectMode = (mode: ListMode) => {
    setSearchParams({ mode })
  }
  const items = initialData._embedded.posts
  let mappedItems = items.map((post: Post) => {
    if ((post as any).userLikedPost) {
      const listLikedUser: string[] =
        JSON.parse((post as any).userLikedPost?.replaceAll("'", '"')) ?? []

      if (listLikedUser.includes(currentUser.username.trim())) {
        return {
          ...post,
          isLiked: true,
        }
      }
    }
    return post
  }) as Post[]

  if (mode === 'trending') {
    mappedItems = mappedItems.sort(
      (item1, item2) =>
        (item2.comments.length ?? 0) - (item1.comments.length ?? 0),
    )
  } else {
    mappedItems = mappedItems.sort((item1, item2) =>
      item2.createdAt > item1.createdAt ? 1 : 0,
    )
  }
  return (
    <StyledTabLayout>
      <Content>
        <ListModeSelector mode={mode} onSelectMode={onSelectMode} />

        {mode === 'past' && <WeekSelector dateRange={dateRange} />}
        {items && items.length ? (
          <LinkCardList items={mappedItems as any as Post[]} />
        ) : null}
        <div ref={ref} />
      </Content>
      {items?.length === 0 ? <EmptyList /> : null}
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
  ${media.wide} {
    width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }
`

export function CatchBoundary() {
  const caught = useCatch()
  console.log(caught.data)

  return (
    <div>
      <h1>Caught</h1>
      <p>Status: {caught.status}</p>
      <p></p>
      <pre>
        <code>{JSON.stringify(caught.data, null, 2)}</code>
      </pre>
    </div>
  )
}
