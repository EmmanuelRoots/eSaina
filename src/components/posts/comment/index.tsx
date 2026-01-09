import { useEffect, useState, type HtmlHTMLAttributes } from 'react'
import { Card, CardBody } from '../../card'
import type { CommentDTO, PostDTO } from '../../../data/dto/post'
import { InputComment } from './inputComment'
import postApi from '../../../services/api/post.api'
import { CommentNode } from './commentNode'
import Column from '../../column'

type CommentsProps = HtmlHTMLAttributes<HTMLDivElement> & {
  post: PostDTO
}
const Comments = ({ post, ...rest }: CommentsProps) => {
  console.log({ post })
  const [loading, setLoading] = useState<boolean>(false)
  const [comments, setComments] = useState<CommentDTO[]>([])
  useEffect(() => {
    setLoading(true)
    if (post.id) {
      postApi
        .getComments(post.id)
        .then(res => {
          console.log({ res })
          setComments(res.data)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [post.id])

  const handlePublish = (commentText: string) => {
    const newComment: Partial<CommentDTO> = {
      content: commentText,
      post,
    }
    postApi.createComment(newComment).then(res => {
      console.log({ res })
      setComments(prev => [res.data, ...prev])
    })
  }

  return (
    <Card {...rest} style={{ border: 'none', borderRadius: '0 0 8px 8px' }}>
      <CardBody>
        <Column gap={16} style={{ maxHeight: '40vh', overflowY: 'auto' }}>
          {loading ? (
            <p>Loading...</p>
          ) : (
            comments.map(c => <CommentNode key={c.id} node={c} depth={0} />)
          )}
        </Column>
      </CardBody>
      <InputComment onPublish={handlePublish} />
    </Card>
  )
}

export default Comments
