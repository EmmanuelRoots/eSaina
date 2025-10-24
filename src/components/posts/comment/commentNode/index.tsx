import { useState } from "react"
import { UseAuth } from "../../../../context/user"
import type { CommentDTO } from "../../../../data/dto/post"
import { getTimeBetweenTwoDate } from "../../../../services/utils/date.utils"
import Column from "../../../column"
import Row from "../../../row"
import Text from "../../../text"
import { styles } from "../../styles"
import { InputComment } from "../inputComment"
import postApi from "../../../../services/api/post.api"

type CommentNodeProps = {
  node : CommentDTO,
  depth : number
}

export const CommentNode = ({node, depth}:CommentNodeProps)=>{
  const {user} = UseAuth()
  const [showRep, setShowRep] = useState<boolean>(false)
  const [replies, setReplies] = useState<CommentDTO[]>(node.replies ?? [])
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
              <button style={styles.commentAction}><Text color="secondaryText" variant="body2" style={{fontWeight:600}}>J'aime</Text></button>
              <button style={styles.commentAction}><Text color="secondaryText" variant="body2" style={{fontWeight:600}} onClick={()=>setShowRep(prev=>!prev)}>Répondre</Text></button>
              <Text variant="body2" color="secondaryText">{getTimeBetweenTwoDate(node.createdAt)}</Text>
            </Row>
            <Row>
              <Text variant="body2">{node.replies?.length && node.replies?.length >1 ? `${node.replies?.length} réponses` : `${node.replies?.length} réponse`}</Text>
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