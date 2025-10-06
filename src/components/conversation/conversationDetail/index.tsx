import { UseConversation } from "../../../context/conversation"
import Column from "../../column"

export const ConversationDetail = ()=> {
  const {selectedConversation} = UseConversation()

  return (
    <Column>
      {
        selectedConversation?.messages.map(m=>{
          return (
            <div key={m.id}>
              {m.content}
            </div>
          )
        })
      }
    </Column>
  )
}