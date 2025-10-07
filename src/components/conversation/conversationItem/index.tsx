import { UseConversation } from "../../../context/conversation"
import {type ConversationDTO, ConversationType } from "../../../data/dto/conversation"
import { Card, CardBody } from "../../card"
import Row from "../../row"
import Text from "../../text"

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
              <Text variant="body">{conversation.title}</Text>
            ) :
            (
              <Text variant="body">{conversation.messages[0].user.firstName +' '+ conversation.messages[0].user.firstName}</Text>
            )
          }
        </CardBody>
      </Card>
    </Row>
  )
}