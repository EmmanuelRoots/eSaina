import type { HTMLAttributes } from "react"

import type { PostDTO } from "../../../data/dto/post"
import { Card, CardBody, CardFooter, CardHeader } from "../../card"
import Row from "../../row"
import { Globe, MessageCircle, ThumbsUp } from "lucide-react"
import Text from "../../text"
import Column from "../../column"
import { getTimeBetweenTwoDate } from "../../../services/utils/date.utils"

type PostItemProps = HTMLAttributes<HTMLDivElement> & {
  post : PostDTO
}

const PostItem = ({post, ...rest}:PostItemProps)=>{

  return (
    <Card {...rest}>
      <CardHeader>
        <Row style={{alignItems:'center', gap: 8}}>
          <img src={post.author.pdpUrl} style={styles.avatar}/>
          <Column>
            <Text variant="subtitle1">{post.author.lastName} {post.author.firstName}</Text>
            <Row style={styles.timestamp}>
              <Text variant="caption">{getTimeBetweenTwoDate(post.createdAt)}</Text>
              <span style={styles.dot}>·</span>
              <Globe size={12} />
            </Row>
          </Column>
        </Row>
      </CardHeader>
      <CardBody>
        <Text>{post.content}</Text>
      </CardBody>
      <CardFooter>
        <Row>
          <button
              onClick={() => ()=>{/** */}}
              style={{
                ...styles.postActionButton,
                // color: post.liked ? '#1877f2' : '#65676b'
              }}
            >
              <ThumbsUp size={20} fill="#1877f2" />
              <Text>J'aime</Text>
          </button>
          <button
            onClick={() => {/** */}}
            style={styles.postActionButton}
          >
            <MessageCircle size={20} />
            <Text>Commenter</Text>
          </button>
        </Row>
      </CardFooter>
    </Card>
  )
}

const styles = {
  postActionButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    color: '#65676b',
    transition: 'background-color 0.2s'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%'
  },
  timestamp: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#65676b',
    marginTop: '2px'
  },
  dot: {
    margin: '0 2px'
  },
} satisfies { [key: string]: React.CSSProperties }

export default PostItem