import { UseConversation } from "../../../context/conversation"
import Column from "../../column"

export const ConversationDetail = ()=> {
  const {selectedConversation} = UseConversation()

  return (
    <Column>
      {
        selectedConversation?.messages.map(m=>{
          return (
            <div>
              {m.content}
            </div>
          )
        })
      }
    </Column>
  )
}