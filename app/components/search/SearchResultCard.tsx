import { Link } from '@remix-run/react'
import styled from '@emotion/styled'
import { Post, type SearchResultItem } from '~/lib/api/types'
import { colors } from '~/lib/colors'
import { Globe } from '../vectors'

interface Props {
  item: SearchResultItem
}

function SearchResultCard({ item }: Props) {
  const { publisher, author, highlight, likes } = item
  console.log(
    '🚀 TAM ~ file: SearchResultCard.tsx:13 ~ SearchResultCard ~ author:',
    item,
  )
  const postItem = item as any as Post
  const link = `/items/${item.id}`
  return (
    <Block to={link}>
      <Publisher>
        {publisher?.favicon ? (
          <img src={publisher.favicon} alt="favicon" />
        ) : (
          <Globe />
        )}
        {author ? `${author.name} · ` : ''}
        {publisher?.name ?? 'chicken'}
      </Publisher>
      {/** @todo: Secure this code **/}
      <h3
        dangerouslySetInnerHTML={{
          __html: postItem?.title ?? 'this is an title',
        }}
      ></h3>
      <p
        dangerouslySetInnerHTML={{
          __html: postItem?.body ?? 'this is an long body',
        }}
      ></p>
      {likes > 0 ? (
        <LikesCount>좋아요 {likes.toLocaleString()}개</LikesCount>
      ) : null}
    </Block>
  )
}

const Block = styled(Link)`
  text-decoration: none;
  h3 {
    margin-top: 0;
    margin-bottom: 0;
    font-weight: 400;
    font-size: 16px;
    color: ${colors.gray4};
    line-height: 1.5;
    font-weight: 500;
  }
  em {
    color: ${colors.gray5};
    font-style: normal;
    font-weight: 800;
  }
  p {
    line-height: 1.5;
    font-size: 14px;
    margin-top: 8px;
    margin-bottom: 8px;
    color: ${colors.gray3};
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-height: 84px;
  }
`

const Publisher = styled.div`
  display: flex;
  color: ${colors.gray3};
  font-size: 14px;
  margin-bottom: 4px;
  line-height: 1.5;
  align-items: center;
  img,
  svg {
    display: block;
    margin-right: 8px;
    display: block;
    width: 16px;
    height: 16px;
  }
`

const LikesCount = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${colors.gray4};
  line-height: 1.5;
  display: flex;
`
export default SearchResultCard
