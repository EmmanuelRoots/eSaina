import conversationApi from "../../services/api/conversation.api"
import Row from "../row";
import { InfiniteScroll } from "../infinite-scroll";

export const Conversations = ()=> {
  
  const loadPage = async (page: number) => {
    const res = await conversationApi.getAllConversation({ page, limit: 20 });
    return { items: res.conversations, hasMore: res.pagination.hasMore };
  };
  

  return (
    <Row>
      <InfiniteScroll
        loadPage={loadPage}
        renderItem={(c) => <div key={c.id}>{c.title}</div>}
      />
    </Row>
  )
}