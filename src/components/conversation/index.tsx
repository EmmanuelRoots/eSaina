import { InfiniteScroll } from '../infinite-scroll'
import { UseConversation } from '../../context/conversation'
import { ConversationItem } from './conversationItem'
import Column from '../column'

export const Conversations = () => {
  const { loadPage, conversations, hasMore, loading } = UseConversation()

  return (
    <Column style={{ height: '80vh' }}>
      <InfiniteScroll
        items={conversations}
        loadMore={loadPage}
        renderItem={c => <ConversationItem key={c.id} conversation={c} />}
        hasMore={hasMore}
        loading={loading}
      />
    </Column>
  )
}
