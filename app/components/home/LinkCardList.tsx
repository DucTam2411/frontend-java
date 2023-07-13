import styled from '@emotion/styled'
import { type Post } from '~/lib/api/types'
import { media } from '~/lib/media'
import LinkCard from './LinkCard'
import { getUserLikeList } from '~/hooks/useLikeManager'

interface Props {
  items: Post[]
}

function LinkCardList({ items }: Props) {
  console.log('TAM POSTS - THIS IS ITEMS', items)
  return (
    <List>
      {items.length &&
        items
          .filter((item) => item && item?.thumbnail !== undefined)
          .map((item) => (
            <LinkCard
              key={item?.id}
              item={item}
              userLikedPost={getUserLikeList((item as any).userLikedPost)}
            />
          ))}
    </List>
  )
}

const List = styled.div`
  /* display: flex;
  flex-direction: column; */
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  ${media.tablet} {
    grid-template-columns: repeat(2, 1fr);
  }
  ${media.wide} {
    grid-template-columns: repeat(3, 1fr);
    margin-left: auto;
    margin-right: auto;
  }
  gap: 48px;
`

export default LinkCardList
