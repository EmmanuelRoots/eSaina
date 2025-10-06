import { UseConversation } from "../../../context/conversation"
import {type ConversationDTO, ConversationType } from "../../../data/dto/conversation"
import { Card, CardBody } from "../../card"
import Row from "../../row"

type ConvItemProps = {
  conversation : ConversationDTO,
}

export const ConversationItem = ({conversation}:ConvItemProps)=>{
  const {selectConversation} = UseConversation()
  const isIACHat = conversation.type === ConversationType.AI_CHAT
  

  return (
    <Row onClick={()=>selectConversation(conversation)}>
      <Card style={{flex:1}}>
        <CardBody>
          {
            isIACHat ? (
              <p>{conversation.title}</p>
            ) :
            (
              <p>{conversation.messages[0].user.firstName +' '+ conversation.messages[0].user.firstName}</p>
            )
          }
        </CardBody>
      </Card>
    </Row>
  )
}