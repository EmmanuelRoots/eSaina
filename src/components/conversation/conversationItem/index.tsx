import { UseConversation } from "../../../context/conversation"
import {type ConversationDTO } from "../../../data/dto/conversation"
import { Card, CardBody } from "../../card"
import Row from "../../row"
import Text from "../../text"

type ConvItemProps = {
  conversation : Partial<ConversationDTO>,
}

export const ConversationItem = ({conversation}:ConvItemProps)=>{
  const {selectConversation} = UseConversation()

  const getRender = (conversation:Partial<ConversationDTO>)=>{
    if(conversation.title?.length){
      return <Text variant="body">{conversation.title}</Text>
    }else {
      return <Text variant="body">{conversation?.owner?.lastName}</Text>
    }
  }
  

  return (
    <Row onClick={()=>selectConversation(conversation)}>
      <Card style={{flex:1}}>
        <CardBody>
          {
            getRender(conversation)
          }
        </CardBody>
      </Card>
    </Row>
  )
}