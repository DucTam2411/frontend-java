import styled from '@emotion/styled'
import type { User } from '~/lib/api/types'
import { type PostComment } from '~/lib/api/types'
import { media } from '~/lib/media'
import CommentItem from './CommentItem'
import WriteComment from './WriteComment'

interface Props {
  comments: PostComment[]
  setComments: (comments: PostComment[]) => void
  user: User
}
function CommentList({ comments, setComments, user }: Props) {
  function deleteCommentFunc(commentId: string) {
    const temComments = comments.filter((c) => c.id !== commentId)
    setComments(temComments)
  }

  function addNewComment(comment: PostComment) {
    console.log(
      '🚀 TAM ~ file: CommentList.tsx:18 ~ addNewComment ~ comment:',
      comment,
    )
    const newComment: PostComment = {
      ...comment,
      likes: 0,
      subcommentsCount: 0,
      user,
      mentionUser: null,
      isLiked: false,
      isDeleted: false,
    }
    setComments([newComment, ...comments])
  }

  return (
    <Block>
      <CommentTitle>
        {' '}
        {comments?.length?.toLocaleString()} comments
      </CommentTitle>
      <WriteComment addNewComment={addNewComment} />
      <List>
        {comments.map((comment) => (
          <CommentItem
            comment={comment}
            key={comment.id}
            deleteCommentProps={deleteCommentFunc}
          />
        ))}
      </List>
    </Block>
  )
}

const Block = styled.div`
  padding: 16px;
  ${media.tablet} {
    padding-left: 0;
    padding-right: 0;
  }
`

const CommentTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
`

const List = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 24px;
`

export default CommentList
