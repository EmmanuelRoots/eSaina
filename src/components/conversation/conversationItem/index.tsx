import { BotMessageSquare } from "lucide-react"
import { UseConversation } from "../../../context/conversation"
import {ConversationType, type ConversationDTO } from "../../../data/dto/conversation"
import { Card, CardBody } from "../../card"
import Row from "../../row"
import Text from "../../text"
import { UseAuth } from "../../../context/user"

type ConvItemProps = {
  conversation : Partial<ConversationDTO>,
}

export const ConversationItem = ({conversation}:ConvItemProps)=>{
  const {selectConversation} = UseConversation()
  const {user} = UseAuth()


  const getRender = (conversation:Partial<ConversationDTO>)=>{
    switch (conversation.type) {
      case ConversationType.AI_CHAT:
        return (
          <Row style={{alignItems:'center'}} gap={8}>
            <BotMessageSquare />
            <Text variant="body">{conversation.title}</Text>
          </Row>
        )

      default:
        if(conversation.title?.length){
          return <Text variant="body">{conversation.title}</Text>
        }else {
          const member = conversation.members?.find(m=>m.user?.id !== user?.id)

          return (
            <Row style={{alignItems:'center'}} gap={8}>
              <img src={member?.user?.pdpUrl} height={40} width={40} style={{borderRadius: '50%'}}/>
              <Text variant="body">{conversation?.owner?.lastName}</Text>
            </Row>
          )
        }
    }
  }
  

  return (
    <Row onClick={()=>selectConversation(conversation)} style={{cursor:'pointer'}}>
      <Card style={{flex:1}}>
        <CardBody style={{padding:'4%'}}>
          {
            getRender(conversation)
          }
        </CardBody>
      </Card>
    </Row>
  )
}