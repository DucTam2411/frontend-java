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
import { useBookmarkManager } from '~/hooks/useBookmarkManager'
import BookmarkButton from '../system/BookmarkButton'
import { useItemOverrideById } from '~/states/itemOverride'
import { media } from '~/lib/media'
import { useNavigate } from '@remix-run/react'
import { useOpenDialog } from '~/states/dialog'
import { deleteItem } from '~/lib/api/items'
import Button from '../system/Button'
import MarkdownIt from 'markdown-it'
import { useMemo, useState } from 'react'
import { markdownStyles } from '~/lib/styles'

interface Props {
  item: Post
  isMyItem: boolean
  userLikedPost: string[]
}

function ItemViewer({ item, isMyItem, userLikedPost }: Props) {
  const { id, thumbnail, publisher, author, title, body, user, createdAt } =
    item
  console.log('🚀 TAM ~ file: ItemViewer.tsx:31 ~ ItemViewer ~ item:', item)

  const itemOverride = useItemOverrideById(id)
  const dateDistance = useDateDistance(createdAt)

  const likes = 0 as number
  const isBookmarked = itemOverride?.isBookmarked ?? item.isBookmarked

  const { unlike } = useLikeManager()
  const { create, remove } = useBookmarkManager()
  const openLoginDialog = useOpenLoginDialog()
  const currentUser = useUser()

  const [isLiked, setIsLiked] = useState(
    userLikedPost.toString().includes(currentUser.username.toString().trim()),
  )

  const [likedUser, setLikedUser] = useState(userLikedPost)

  const itemStats = '' as any

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

  const toggleLike = async () => {
    if (!currentUser) {
      openLoginDialog('like')
      return
    }
    if (isLiked) {
      const chicken = (
        JSON.stringify(
          likedUser
            .filter((item) => item !== currentUser.username.trim())
            .map((item) => item as any),
        ) as any
      ).replaceAll('"', "'")

      console.log('chicken', chicken)

      // unlike(id, itemStats)
      const res = await fetch(`http://localhost:8080/posts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userLikedPost: (
            JSON.stringify(
              likedUser
                .filter((item) => item !== currentUser.username.trim())
                .map((item) => item as any),
            ) as any
          ).replaceAll('"', "'"),
        }),
      })

      const newLikedUser = likedUser.filter(
        (item) => item !== currentUser.username.trim(),
      )
      setLikedUser(newLikedUser)
      setIsLiked(false)

      const data = await res.json()
      console.log(
        '🚀 TAM ~ file: CommentEditor.tsx:95 ~ handleSubmit ~ res:',
        res.status,
        data,
      )

      if (data) {
        setIsLiked(false)
      }
    } else {
      // like(id, itemStats)
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
      const chicken22 = (
        JSON.stringify([...likedUser, currentUser.username.trim()]) as any
      ).replaceAll('"', "'")
      console.log('chicken', chicken22.replaceAll('"', "'"))

      setLikedUser([...likedUser, currentUser.username.trim()])
      setIsLiked(true)
      const data = await res.json()
      console.log(
        '🚀 TAM ~ file: CommentEditor.tsx:95 ~ handleSubmit ~ res:',
        res.status,
        data,
      )

      if (data) {
        setIsLiked(true)
      }
    }
  }

  const openDialog = useOpenDialog()
  const navigate = useNavigate()
  const onClickDelete = () => {
    openDialog({
      title: 'Confirm',
      description: 'Are you sure you want to delete?',
      mode: 'YESNO',
      cancelText: 'NO',
      confirmText: 'YES',
      async onConfirm() {
        // alert('gg')
        /** @todo: show fullscreen spinner on loading */
        const res = await deleteItem(item.id)
        console.log('🚀 TAM ~ file: ItemViewer.tsx:102 ~ onConfirm ~ res:', res)

        navigate('/')
      },
    })
  }

  const onClickModify = () => {
    navigate(`/write/edit?itemId=${item.id}`)
  }

  const html = useMemo(() => {
    return MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    }).render(body)
  }, [body])

  return (
    <Block>
      {thumbnail ? (
        <a href={`http://${item.link}`}>
          <Thumbnail src={thumbnail} />
        </a>
      ) : null}
      <Content>
        <ItemHead>
          <ItemInfo>
            <Publisher>
              {publisher?.favicon ? (
                <img src={publisher?.favicon} alt="favicon" />
              ) : (
                <Globe />
              )}
              {author ? `${author.name} · ` : ''}
              {publisher?.name}
            </Publisher>
            <Title>
              <a href={item.link}>{title}</a>
            </Title>
          </ItemInfo>
          <Button variant="primary" className="error" onClick={onClickDelete}>
            Delete
          </Button>
          <Button variant="secondary" href={`http://${item.link}`}>
            Visit
          </Button>
        </ItemHead>
        {isMyItem ? (
          <MyItemActions
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
          >
            <TextButton onClick={onClickModify}>Modify</TextButton>
            <TextButton onClick={onClickDelete}>Delete</TextButton>
          </MyItemActions>
        ) : null}
        <Body dangerouslySetInnerHTML={{ __html: html }} />

        <AnimatePresence initial={false}>
          {likes === 0 ? null : (
            <LikesCount
              key="likes"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 26, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {likes.toLocaleString()} likes
            </LikesCount>
          )}
        </AnimatePresence>
        <Footer>
          <IconButtons>
            <LikeButton isLiked={isLiked as any} onClick={toggleLike} />
            <BookmarkButton isActive={isBookmarked} onClick={toggleBookmark} />
          </IconButtons>
          <UserInfo>
            by <b>{user.username}</b> · {dateDistance}
          </UserInfo>
        </Footer>
      </Content>
    </Block>
  )
}

const Block = styled.div`
  display: flex;
  flex-direction: column;
  & > a {
    display: block;
  }

  .error {
    background-color: red !important;
  }
`
const Thumbnail = styled.img`
  width: 100%;
  height: auto;
  max-height: 80vh;
  object-fit: cover;
  border-radius: 0px;
  ${media.tablet} {
    border-radius: 12px;
  }
`

const Content = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${colors.gray0};
  ${media.tablet} {
    padding-left: 0;
    padding-right: 0;
  }
`

const MyItemActions = styled.div`
  color: ${colors.gray2};
  font-size: 14px;

  gap: 8px;
  display: none;
  margin-left: -4px;
  gap: 4px;
  margin-top: 0px;
  ${media.mobile} {
    display: flex;
  }
`

const TextButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  &:hover {
    text-decoration: underline;
    color: ${colors.gray3};
  }
`

const Publisher = styled.div`
  display: flex;
  color: ${colors.gray3};
  font-size: 14px;
  margin-bottom: 8px;
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

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 0;
  color: ${colors.gray5};
  line-height: 1.5;
  a {
    color: inherit;
    text-decoration: none;
    &:hover {
      color: ${colors.gray2};
    }
  }
`

const Body = styled.div`
  margin-top: 16px;
  margin-bottom: 32px;
  font-size: 14px;
  line-height: 1.5;
  color: ${colors.gray4};

  word-break: keep-all;
  ${media.tablet} {
    font-size: 16px;
  }

  ${markdownStyles}
`

const LikesCount = styled(motion.div)`
  font-size: 12px;
  font-weight: 600;
  color: ${colors.gray4};
  line-height: 1.5;
  height: 26px;
  display: flex;
`

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const UserInfo = styled.div`
  color: ${colors.gray2};
  font-size: 14px;
`

const ItemHead = styled.div`
  display: flex;
  word-break: break-word;
  gap: 16px;
  & > button {
    flex-shrink: 0;
  }
`

const ItemInfo = styled.div`
  flex: 1;
`

const IconButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export default ItemViewer
