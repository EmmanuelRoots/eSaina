import { useState } from "react"
import { UseAuth } from "../../../../context/user"
import { ReactionType, type CommentDTO, type ReactionDTO } from "../../../../data/dto/post"
import { getTimeBetweenTwoDate } from "../../../../services/utils/date.utils"
import Column from "../../../column"
import Row from "../../../row"
import Text from "../../../text"
import { styles } from "../../styles"
import { InputComment } from "../inputComment"
import postApi from "../../../../services/api/post.api"
import { ThumbsUp } from "lucide-react"

type CommentNodeProps = {
  node : CommentDTO,
  depth : number
}

export const CommentNode = ({node, depth}:CommentNodeProps)=>{
  const {user} = UseAuth()
  const [showRep, setShowRep] = useState<boolean>(false)
  const [replies, setReplies] = useState<CommentDTO[]>(node.replies ?? [])
  const [reactions, setReactions] = useState<ReactionDTO[]>(node.reactions ?? [])
  const [myReaction, setMyReaction] = useState<ReactionDTO | undefined>(reactions.find(r=>r.user?.id === user?.id) ?? undefined)
  const pad = depth * 1.5;
  const handlePublish = (commentText:string)=>{
    console.log({node});
    
    const newComment:Partial<CommentDTO> = {
      content:commentText,
      post:node.post,
      parent:node
    }
    postApi.createComment(newComment).then(res=>{
      console.log({res});
      setReplies(prev=>[res.data, ...prev])
    })
  }

  const isLikedByMe = (reactions:ReactionDTO[])=> {
    if(!reactions.length)return false

    return reactions.some(r=>r.id === myReaction?.id)
  }
  const [liked, setLiked] = useState<boolean>(isLikedByMe(node.reactions?? []))
  
  

  const deleteMyReaction = ()=>{
    const newReactions = reactions.filter(r=>r.id !== myReaction?.id)
    console.log({newReactions});
    
    setReactions(newReactions)
  }

  const handleLiked = ()=> {
      if(!liked){ //onliking
        const newReactions:Partial<ReactionDTO> = {
          comment : node,
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
      <Row gap={16} style={{marginLeft:`${pad}rem`}}>
        <Row>
          <img src={node.author.pdpUrl} width={40} height={40} style={{borderRadius:'50%'}}/>
        </Row>
        <Column style={{flex:1}}>
          <Column style={{...styles.commentBubble}} gap={8}>
            <Text variant="subtitle3">{user?.firstName +' '+ user?.lastName}</Text>
            <Text variant="body2">{node.content}</Text>
          </Column>
          <Row style={{padding:'0.5rem', justifyContent:'space-between'}}>
            <Row gap={12}>
              <button style={styles.commentAction} onClick={handleLiked}><Text color={liked ? 'likedText' : 'secondaryText'} variant="body2" style={{fontWeight:600}}>J'aime</Text></button>
              <button style={styles.commentAction}><Text color="secondaryText" variant="body2" style={{fontWeight:600}} onClick={()=>setShowRep(prev=>!prev)}>Répondre</Text></button>
              <Text variant="body2" color="secondaryText">{getTimeBetweenTwoDate(node.createdAt)}</Text>
            </Row>
            <Row gap={8} style={{alignItems:'center'}}>
              <Text variant="body2">{node.replies?.length && node.replies?.length >1 ? `${node.replies?.length} réponses` : `${node.replies?.length} réponse`}</Text>
              {
                reactions.length && (
                  <Row style={{alignItems:'center'}} gap={8}>
                    <Row style={styles.likesIcon}>
                      <ThumbsUp size={12} color="white" fill="white" />
                    </Row>
                    <Text>{reactions.length}</Text>
                  </Row>
                )
              }
            </Row>
          </Row>
        </Column>
      </Row>
      {
        showRep && (replies?.map(n=><CommentNode key={n.id} depth={depth+1} node={n}/>))
      }
      {
        showRep && (<Row style={{marginLeft:`${pad+1}rem`}}><InputComment onPublish={handlePublish}/></Row>)
      }
    </>
  )
}