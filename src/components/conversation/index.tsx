import { InfiniteScroll } from "../infinite-scroll";
import { UseConversation } from "../../context/conversation";
import { ConversationItem } from "./conversationItem";

export const Conversations = ()=> {
  const {loadPage} = UseConversation()

  return (
      <InfiniteScroll
        loadPage={loadPage}
        renderItem={(c) => <ConversationItem key={c.id} conversation={c}/>}
      />
  )
}