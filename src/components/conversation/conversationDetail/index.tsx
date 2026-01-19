import { UseConversation } from '../../../context/conversation'
import {
  MessageType,
  SenderType,
  type MessageDTO,
} from '../../../data/dto/message'
import Column from '../../column'
import {
  ConversationType,
  type ConversationDTO,
} from '../../../data/dto/conversation'
import { UseAuth } from '../../../context/user'
import type { UserDTO } from '../../../data/dto/user'
import conversationApi from '../../../services/api/conversation.api'
import { useCallback, useEffect, useState, useRef } from 'react'
import { InfiniteScroll } from '../../infinite-scroll'
import { MessageItem } from '../../message'
import { UseSSE } from '../../../context/sse'
import { Paperclip, Send, Smile } from 'lucide-react'
import { useTheme } from '../../../hooks/theme'

export const ConversationDetail = () => {
  const { selectedConversation } = UseConversation()
  const [loading, setLoading] = useState<boolean>(false)
  const [messages, setMessages] = useState<MessageDTO[]>([])
  const [hasMore, setHasMore] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const { user } = UseAuth()
  const { newMessage } = UseSSE()
  const { theme, colors } = useTheme()
  const isDark = theme === 'dark'
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    if (!inputValue.trim()) return

    const content = inputValue
    setInputValue('')

    // Optimistic update
    const newMessageObj: MessageDTO = {
      content: content,
      conversation: selectedConversation as ConversationDTO,
      sender: SenderType.USER,
      type: MessageType.TEXT,
      user: user as UserDTO,
      id: Math.random().toString(), // Temporary ID
    }

    if (selectedConversation?.type === ConversationType.AI_CHAT) {
      setMessages(prev => [newMessageObj, ...prev])
    }

    // setLoading(true) // Don't block UI for sending
    conversationApi
      .sendMessage(newMessageObj)
      .then(res => {
        console.log({ res })
        fetchMessages(selectedConversation?.id ?? '')
      })
      .catch(err => {
        console.error(err)
      })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const loadMore = useCallback(async () => {
    setPage(prev => prev + 1)
    const realPage = page + 1
    console.log('--- call this ---', loading)

    if (loading) return { items: [], hasMore }

    setLoading(true)
    console.log({ page })

    const { messages: fetched, pagination } = await conversationApi
      .getAllMessage({
        conversationId: selectedConversation?.id,
        page: realPage,
        limit: 20,
      })
      .finally(() => setLoading(false))
    setMessages(prev => [...prev, ...fetched])

    setHasMore(pagination.hasMore)
  }, [])

  const fetchMessages = useCallback(async (conversationId: string) => {
    setLoading(true)
    const res = await conversationApi
      .getAllMessage({ conversationId: conversationId, page: page, limit: 20 })
      .finally(() => setLoading(false))
    setMessages(res.messages)
    setHasMore(res.pagination.hasMore)
  }, [])

  useEffect(() => {
    console.log('there is a new message', { newMessage })
    if (newMessage > 0) {
      fetchMessages(selectedConversation?.id || '')
    }
  }, [newMessage])

  useEffect(() => {
    fetchMessages(selectedConversation?.id || '')
  }, [selectedConversation])

  return (
    <Column gap={10} style={{ height: '100%', position: 'relative' }}>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <InfiniteScroll
          items={messages}
          hasMore={hasMore}
          loadMore={loadMore}
          renderItem={c => (
            <div key={c.id} style={{ padding: '4px 24px' }}>
              <MessageItem message={c} />
            </div>
          )}
          loading={loading}
          direction="top"
        />
      </div>

      <div style={{ padding: '16px 24px 24px' }}>
        <div
          style={{
            background: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)',
            borderRadius: '24px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            transition: 'all 0.2s ease',
            boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div
            style={{
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              color: colors.secondaryText,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Paperclip size={20} />
          </div>

          <input
            ref={inputRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: colors.default,
              fontSize: '0.95rem',
              padding: '8px 0',
            }}
          />

          <div
            style={{
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              color: colors.secondaryText,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Smile size={20} />
          </div>

          <div
            onClick={() => handleSubmit()}
            style={{
              cursor: 'pointer',
              padding: '10px',
              borderRadius: '50%',
              background: inputValue.trim() ? colors.primary : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
              color: inputValue.trim() ? '#fff' : colors.secondaryText,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              transform: inputValue.trim() ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <Send size={18} />
          </div>
        </div>
      </div>
    </Column>
  )
}
