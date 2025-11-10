import { UseConversation } from "../../../context/conversation"
import { MessageType, SenderType, type MessageDTO } from "../../../data/dto/message"
import type { FieldConfig } from "../../../interfaces/components/form"
import Column from "../../column"
import Row from "../../row"
import GenericForm from "../../form"
import { ConversationType, type ConversationDTO } from "../../../data/dto/conversation"
import { UseAuth } from "../../../context/user"
import type { UserDTO } from "../../../data/dto/user"
import conversationApi from "../../../services/api/conversation.api"
import { useCallback, useEffect, useState } from "react"
import { InfiniteScroll } from "../../infinite-scroll"
import { MessageItem } from "../../message"
import { UseSSE } from "../../../context/sse"
import Text from "../../text"

export const ConversationDetail = () => {
  const { selectedConversation } = UseConversation()
  const [loading, setLoading] = useState<boolean>(false)
  const [messages, setMessages] = useState<MessageDTO[]>([])
  const [hasMore, setHasMore] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)

  const { user } = UseAuth()
  const { newMessage } = UseSSE()

  const fields: FieldConfig<Partial<MessageDTO>>[] = [
    { name: 'content', type: 'text', label: '' }
  ]

  const initialValues: Partial<MessageDTO> = { content: '' }

  const getUserMembersName = (conv: Partial<ConversationDTO> | null) : string =>{
    if(!conv) return ''
    switch (conv.type) {
      case ConversationType.AI_CHAT:
        return 'IA'
    
      default:

        return selectedConversation?.members?.filter(m=>m.user?.id !== user?.id).map(c=>c.user?.lastName).join(',') ?? ''
    }
  }

  const handleSubmit = (content: string | undefined) => {
    if (!content || !selectedConversation || !user) return

    setLoading(true)

    const newMsg: MessageDTO = {
      content,
      conversation: selectedConversation as ConversationDTO,
      sender: SenderType.USER,
      type: MessageType.TEXT,
      user: user as UserDTO
    }

    if (selectedConversation.type === ConversationType.AI_CHAT) {
      setMessages(prev => [newMsg, ...prev])
    }

    conversationApi.sendMessage(newMsg)
      .then(() => fetchMessages(selectedConversation.id!))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const fetchMessages = useCallback(async (conversationId: string) => {
    setLoading(true)
    const res = await conversationApi.getAllMessage({
      conversationId,
      page: 1,
      limit: 20
    }).finally(() => setLoading(false))

    setMessages(res.messages)
    setHasMore(res.pagination.hasMore)
    setPage(1); //réinitialise la pagination
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !selectedConversation) return

    const nextPage = page + 1
    setLoading(true)

    const res = await conversationApi.getAllMessage({
      conversationId: selectedConversation.id!,
      page: nextPage,
      limit: 20
    }).finally(() => setLoading(false))

    setMessages(prev => [...prev, ...res.messages])
    setHasMore(res.pagination.hasMore)
    setPage(nextPage)
  }, [page, hasMore, loading, selectedConversation?.id])

  useEffect(() => {
    if (!selectedConversation?.id) return
    fetchMessages(selectedConversation.id)
  }, [selectedConversation?.id, fetchMessages])

  useEffect(() => {
    if (newMessage > 0 && selectedConversation?.id) {
      fetchMessages(selectedConversation.id)
    }
  }, [newMessage, selectedConversation?.id, fetchMessages])

  return (
    <Column>
      <Row>
        <Text variant="Headline">Messages avec {getUserMembersName(selectedConversation)}</Text>
      </Row>
      <Column style={{ height: "80vh", gap: 8 }}>
        <InfiniteScroll
          items={messages}
          hasMore={hasMore}
          loadMore={loadMore}
          renderItem={(c) => <div key={c.id}><MessageItem message={c} /></div>}
          loading={loading}
          direction="top"
        />
      </Column>
      <Row style={{ justifyContent: "flex-end", marginTop:16 }}>
        {loading && <p>loading...</p>}
        <GenericForm
          fields={fields}
          initialValues={initialValues}
          onSubmit={(res) => handleSubmit(res.content)}
          style={{ display: "flex", gap: 8 }}
        />
      </Row>
    </Column>
  )
}