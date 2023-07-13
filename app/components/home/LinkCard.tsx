import { Link } from '@remix-run/react'
import { AnimatePresence, motion } from 'framer-motion'
import styled from '@emotion/styled'
import { useUser } from '~/states/user'
import { useDateDistance } from '~/hooks/useDateDistance'
import { useLikeManager } from '~/hooks/useLikeManager'
import { useOpenLoginDialog } from '~/hooks/useOpenLoginDialog'
import { type Post } from '~/lib/api/types'
import { colors } from '~/lib/colors'
import LikeButton from '../system/LikeButton'
import { Globe } from '../vectors'
import BookmarkButton from '../system/BookmarkButton'
import { useBookmarkManager } from '~/hooks/useBookmarkManager'
import { media } from '~/lib/media'
import { useItemOverrideById } from '~/states/itemOverride'
import removeMd from 'remove-markdown'
import { css } from '@emotion/react'
import { useEffect, useState } from 'react'

interface Props {
  item: Post
  userLikedPost: string[]
}

function LinkCard({ item, userLikedPost }: Props) {
  const { thumbnail, title, publisher, body, author, createdAt, id } = item
  const user = {
    id: 111,
    username: 'ductam2944',
  }
  const itemOverride = useItemOverrideById(id)
  const dateDistance = useDateDistance(createdAt)
  const { like, unlike } = useLikeManager()
  const currentUser = useUser()
  const { create, remove } = useBookmarkManager()

  const [isLiked, setIsLiked] = useState(itemOverride?.isLiked ?? item.isLiked)
  const likes = item.like ?? 0
  console.log(
    '🚀 TAM ~ file: LinkCard.tsx:37 ~ LinkCard ~ item:',
    userLikedPost,
  )
  const commentsCount = (item as any).comments.length
  const [likedUser, setLikedUser] = useState(userLikedPost)

  console.log('🚀 TAM ~ file: LinkCard.tsx:38 ~ LinkCard ~ item:', item)
  const isBookmarked = itemOverride?.isBookmarked ?? item.isBookmarked

  const openLoginDialog = useOpenLoginDialog()

  const toggleLike = async () => {
    if (!currentUser) {
      openLoginDialog('like')
      return
    }
    if (isLiked) {
      // unlike(id, itemStats)
      const res = await fetch(`http://localhost:8080/posts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userLikedPost: (
            JSON.stringify(
              userLikedPost
                .filter((item) => item !== currentUser.username.trim())
                .map((item) => item as any),
            ) as any
          ).replaceAll('"', "'"),
        }),
      })
      const newList = likedUser.filter(
        (item) => item !== currentUser.username.trim(),
      )
      console.log(
        '🚀 TAM ~ file: LinkCard.tsx:76 ~ toggleLike ~ likedUser:',
        newList,
        likedUser,
      )

      setLikedUser(newList)

      setIsLiked(false)
    } else {
      // like(id, itemStats)
      const isExist = likedUser.find(
        (item) => item.trim() === currentUser.username.trim(),
      )
      console.log(
        '🚀 TAM ~ file: LinkCard.tsx:78 ~ toggleLike ~ userLikedPost:',
        userLikedPost,
      )

      if (isExist) {
        return
      }

      const res = await fetch(`http://localhost:8080/posts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userLikedPost: (
            JSON.stringify([...likedUser, currentUser.username.trim()]) as any
          ).replaceAll('"', "'"),
        }),
      })

      setLikedUser([...likedUser, currentUser.username.trim()])
      setIsLiked(true)
    }
  }

  const toggleBookmark = () => {
    if (!currentUser) {
      openLoginDialog('bookmark')
      return
    }
    if (isBookmarked) {
      remove(id)
    } else {
      create(id)
    }
  }

  const link = `/items/${item.id}`
  const counter = (userLikedPost.length ?? 0) + (isLiked ? 1 : 0)

  return (
    <Block>
      <StyledLink to={link} prefetch="intent">
        {thumbnail ? <Thumbnail src={thumbnail} alt={title} /> : null}
        <Publisher>
          {publisher?.favicon ? (
            <img src={publisher?.favicon} alt="favicon" />
          ) : (
            <Globe />
          )}
          {author ? `${author.name} · ` : ''}
          {publisher?.name}
        </Publisher>
        <h3>{title}</h3>
        <p>{removeMd(body)}</p>
      </StyledLink>
      <Spacer />
      <LikeCountWrapper>
        <AnimatePresence initial={false}>
          {likes === 0 ? null : (
            <LikesCount
              key="likes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {isLiked && 'liked'}
            </LikesCount>
          )}
        </AnimatePresence>
        {commentsCount === 0 ? null : (
          <CommentCount>
            {commentsCount?.toLocaleString()} comments
          </CommentCount>
        )}
      </LikeCountWrapper>

      <Footer>
        <IconButtons>
          <LikeButton isLiked={isLiked} onClick={toggleLike} />
          <BookmarkButton isActive={isBookmarked} onClick={toggleBookmark} />
        </IconButtons>
        <UserInfo>
          by <b>{user.username}</b> · {dateDistance}
        </UserInfo>
      </Footer>
    </Block>
  )
}

const StyledLink = styled(Link)`
  display: flex;
  flex-direction: column;
  text-decoration: none;
`

const Block = styled.div`
  display: flex;
  flex-direction: column;

  h3 {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.5;
    color: ${colors.gray5};
  }
  p {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 14px;
    line-height: 1.5;
    color: ${colors.gray4};
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-height: 84px;
  }
`

const Thumbnail = styled.img`
  width: 100%;
  /* max-height: 40vh;
  ${media.tablet} {
    aspect-ratio: 1200/630;
  } */
  aspect-ratio: 1200/630;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 0 3px rgb(0 0 0 / 15%);
  display: block;
  margin-bottom: 16px;
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

const countStyle = css`
  font-size: 12px;
  font-weight: 600;
  color: ${colors.gray4};
  line-height: 1.5;
  height: 26px;
  display: flex;
`

const LikesCount = styled(motion.div)`
  ${countStyle};
`

const CommentCount = styled.div`
  ${countStyle};
`

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const LikeCountWrapper = styled.div`
  height: 26px;
  display: flex;
  gap: 12px;
`

const UserInfo = styled.div`
  color: ${colors.gray2};
  font-size: 14px;
`

const IconButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const Spacer = styled.div`
  flex: 1;
`

export default LinkCard
