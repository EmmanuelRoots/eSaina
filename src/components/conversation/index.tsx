import { InfiniteScroll } from "../infinite-scroll";
import { UseConversation } from "../../context/conversation";
import { ConversationItem } from "./conversationItem";

export const Conversations = ()=> {
  const {loadPage,conversations, page, hasMore, loading} = UseConversation()
  console.log({loading});
  
  

  return (
      <InfiniteScroll
        items={conversations}
        loadMore={loadPage}
        renderItem={(c) => <ConversationItem key={c.id} conversation={c}/>}
        page={page}
        hasMore={hasMore}
        loading= {loading}
      />
  )
}