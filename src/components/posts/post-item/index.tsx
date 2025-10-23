import { useState, type HTMLAttributes } from "react"

import { ReactionType, type PostDTO, type ReactionDTO } from "../../../data/dto/post"
import { Card, CardBody, CardFooter, CardHeader } from "../../card"
import Row from "../../row"
import { Globe, MessageCircle, ThumbsUp } from "lucide-react"
import Text from "../../text"
import Column from "../../column"
import { getTimeBetweenTwoDate } from "../../../services/utils/date.utils"
import { UseAuth } from "../../../context/user"
import postApi from "../../../services/api/post.api"
import Comments from "../comment"

type PostItemProps = HTMLAttributes<HTMLDivElement> & {
  post : PostDTO
}

const PostItem = ({post, ...rest}:PostItemProps)=>{
  const {user} = UseAuth()
  const [reactions, setReactions] = useState<ReactionDTO[]>(post.reactions ?? [])
  const [myReaction, setMyReaction] = useState<ReactionDTO | undefined>(reactions.find(r=>r.user?.id === user?.id) ?? undefined)
  const [showComments, setShowComments] = useState<boolean>(false)
  const isLikedByMe = (reactions:ReactionDTO[])=> {
    if(!reactions.length)return false

    return reactions.some(r=>r.id === myReaction?.id)
  }
  const [liked, setLiked] = useState<boolean>(isLikedByMe(post.reactions))
  
  

  const deleteMyReaction = ()=>{
    const newReactions = reactions.filter(r=>r.id !== myReaction?.id)
    console.log({newReactions});
    
    setReactions(newReactions)
  }


  const handleLiked = ()=> {
    
    if(!liked){ //onliking
      const newReactions:Partial<ReactionDTO> = {
        post,
        type : ReactionType.LIKE
      } 
      postApi.addRecation(newReactions).then(res=>{
        setReactions(prev=>[...prev, res])
      })
    }else { //on disliking
      deleteMyReaction()
      if(myReaction?.id){
        postApi.deleteReaction(myReaction?.id).finally(()=>{
          setMyReaction(undefined)
        })
      }
      
    }
    setLiked(prev=>!prev)
  }
  

  return (
    <>
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
        <Row style={styles.postStat}>
          <Row style={{alignItems:'center'}} gap={8}>
            <Row style={styles.likesIcon}>
              <ThumbsUp size={12} color="white" fill="white" />
            </Row>
            <Text>{reactions.length}</Text>
          </Row>
        </Row>
        <CardFooter style={{borderRadius: '0 0 8px 8px'}}>
          <Row>
            <button
                onClick={handleLiked}
                style={{
                  ...styles.postActionButton,
                  color: '#65676b'
                }}
              >
                <ThumbsUp size={20} fill={liked ? "#1877f2" : "none"} />
                <Text color={liked ? 'likedText' : 'secondaryText'}>J'aime</Text>
            </button>
            <button
              onClick={()=> setShowComments(prev=>!prev)}
              style={styles.postActionButton}
            >
              <MessageCircle size={20} />
              <Text>Commenter</Text>
            </button>
          </Row>
        </CardFooter>
        {showComments && <Comments comments={post.comments}/>}
      </Card>
      
    </>
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
  likesIcon : {
    backgroundColor:'#1877f2', 
    width:'20px', 
    height:'20px', 
    justifyContent:'center', 
    alignItems:'center',
    borderRadius : '50%'
  },
  postStat : {
    padding : '1%'
  }
} satisfies { [key: string]: React.CSSProperties }

export default PostItem