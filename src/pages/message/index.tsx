import { useState, useCallback, useEffect } from "react"
import {
  Phone, Video, Info, Search, PenSquare, Paperclip, Image as ImageIcon,
  Smile, Send, Users, Sparkles, BellOff,
} from "lucide-react"
import { UseConversation } from "../../context/conversation"
import { UseAuth } from "../../context/user"
import { UseSSE } from "../../context/sse"
import { ConversationType, type ConversationDTO } from "../../data/dto/conversation"
import { MessageType, SenderType, type MessageDTO } from "../../data/dto/message"
import type { UserDTO } from "../../data/dto/user"
import conversationApi from "../../services/api/conversation.api"
import { Avatar } from "../../components/avatar"
import { InfiniteScroll } from "../../components/infinite-scroll"
import CreateConversationModal from "../../components/conversation/createConversation"

const conversationDisplay = (c: Partial<ConversationDTO> | null) => {
  if (!c) return { name: '', user: null as Partial<UserDTO> | null }
  if (c.title) return { name: c.title, user: null }
  const owner = c.owner
  return {
    name: owner ? `${owner.firstName ?? ''} ${owner.lastName ?? ''}`.trim() : 'Conversation',
    user: owner ?? null,
  }
}

const ConversationRow = ({
  conv, active, onClick,
}: { conv: Partial<ConversationDTO>; active: boolean; onClick: () => void }) => {
  const display = conversationDisplay(conv)
  const isGroup = conv.type === ConversationType.GROUP
  const isAI = conv.type === ConversationType.AI_CHAT

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '10px 12px',
        display: 'flex', gap: 10, textAlign: 'left',
        borderRadius: 10,
        background: active ? 'var(--color-primary50)' : 'transparent',
        marginBottom: 2,
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        {isAI ? (
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Sparkles size={18} color="white" /></div>
        ) : isGroup ? (
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'var(--color-surface2)',
            border: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-text-secondary)',
          }}><Users size={18} /></div>
        ) : (
          <Avatar user={display.user ?? undefined} size={40} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 700, fontSize: 13, color: 'var(--color-text)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{display.name}</div>
        <div style={{
          fontSize: 12, color: 'var(--color-text-tertiary)',
          marginTop: 2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {isAI ? 'Assistant IA' : isGroup ? 'Conversation de groupe' : 'Conversation directe'}
        </div>
      </div>
    </button>
  )
}

const MessageBubble = ({
  msg, prev, currentUserId,
}: { msg: MessageDTO; prev?: MessageDTO; currentUserId?: string }) => {
  const mine = msg.user?.id === currentUserId
  const sameSenderAsPrev = prev
    && (prev.user?.id === msg.user?.id)
    && ((prev.user?.id === currentUserId) === mine)
  return (
    <div style={{
      display: 'flex',
      flexDirection: mine ? 'row-reverse' : 'row',
      gap: 8,
      marginTop: sameSenderAsPrev ? 2 : 12,
      alignItems: 'flex-end',
    }}>
      <div style={{ width: 28, flexShrink: 0 }}>
        {!sameSenderAsPrev && !mine && <Avatar user={msg.user} size={28} />}
      </div>
      <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
        <div style={{
          padding: '8px 14px',
          background: mine ? 'var(--color-primary)' : 'var(--color-surface2)',
          color: mine ? 'white' : 'var(--color-text)',
          borderRadius: 16,
          borderBottomRightRadius: mine ? 4 : 16,
          borderBottomLeftRadius: mine ? 16 : 4,
          fontSize: 14, lineHeight: 1.45,
          border: mine ? 'none' : '1px solid var(--color-border)',
          whiteSpace: 'pre-wrap',
        }}>
          {msg.content}
        </div>
      </div>
    </div>
  )
}

const Composer = ({ onSend }: { onSend: (text: string) => void }) => {
  const [text, setText] = useState('')
  const submit = () => { if (text.trim()) { onSend(text); setText('') } }
  return (
    <div style={{
      padding: '12px 16px',
      borderTop: '1px solid var(--color-border)',
      background: 'var(--color-surface)',
      display: 'flex', alignItems: 'flex-end', gap: 8,
      flexShrink: 0,
    }}>
      <IconBtn><Paperclip size={18} /></IconBtn>
      <IconBtn><ImageIcon size={18} /></IconBtn>
      <div style={{
        flex: 1,
        background: 'var(--color-surface2)',
        border: '1px solid var(--color-border)',
        borderRadius: 22,
        padding: '8px 14px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
          placeholder="Écrire un message…"
          style={{
            flex: 1, border: 'none', outline: 'none',
            background: 'transparent', fontSize: 14, color: 'var(--color-text)',
          }}
        />
        <Smile size={18} color="var(--color-text-tertiary)" />
      </div>
      <button
        onClick={submit}
        disabled={!text}
        style={{
          width: 38, height: 38, borderRadius: '50%',
          background: text ? 'var(--color-primary)' : 'var(--color-surface2)',
          color: text ? 'white' : 'var(--color-text-tertiary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Send size={16} />
      </button>
    </div>
  )
}

const IconBtn = ({ children }: { children: React.ReactNode }) => (
  <button style={{
    width: 36, height: 36, borderRadius: 8,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--color-text-secondary)',
  }}>{children}</button>
)

const MessagePage = () => {
  const { conversations, selectedConversation, selectConversation, loadPage, hasMore, loading, pushConversation } = UseConversation()
  const { user } = UseAuth()
  const { newMessage } = UseSSE()

  const [messages, setMessages] = useState<MessageDTO[]>([])
  const [msgsHasMore, setMsgsHasMore] = useState(false)
  const [msgsLoading, setMsgsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)

  const fetchMessages = useCallback(async (conversationId: string) => {
    setMsgsLoading(true)
    try {
      const res = await conversationApi.getAllMessage({ conversationId, page: 1, limit: 20 })
      setMessages(res.messages)
      setMsgsHasMore(res.pagination.hasMore)
      setPage(1)
    } finally {
      setMsgsLoading(false)
    }
  }, [])

  const loadMoreMessages = useCallback(async () => {
    if (!selectedConversation?.id || msgsLoading) return
    setMsgsLoading(true)
    try {
      const next = page + 1
      const { messages: fetched, pagination } = await conversationApi.getAllMessage({
        conversationId: selectedConversation.id, page: next, limit: 20,
      })
      setMessages((prev) => [...prev, ...fetched])
      setMsgsHasMore(pagination.hasMore)
      setPage(next)
    } finally {
      setMsgsLoading(false)
    }
  }, [selectedConversation?.id, page, msgsLoading])

  useEffect(() => {
    if (selectedConversation?.id) fetchMessages(selectedConversation.id)
  }, [selectedConversation, fetchMessages])

  useEffect(() => {
    if (newMessage > 0 && selectedConversation?.id) fetchMessages(selectedConversation.id)
  }, [newMessage, selectedConversation?.id, fetchMessages])

  const handleSend = async (content: string) => {
    if (!selectedConversation || !user) return
    const newMsg: MessageDTO = {
      content,
      conversation: selectedConversation as ConversationDTO,
      sender: SenderType.USER,
      type: MessageType.TEXT,
      user,
    }
    if (selectedConversation.type === ConversationType.AI_CHAT) {
      setMessages((prev) => [newMsg, ...prev])
    }
    await conversationApi.sendMessage(newMsg)
    if (selectedConversation.id) fetchMessages(selectedConversation.id)
  }

  const filteredConvs = conversations.filter((c) => {
    if (!search) return true
    return conversationDisplay(c).name.toLowerCase().includes(search.toLowerCase())
  })

  const display = conversationDisplay(selectedConversation)
  const isGroup = selectedConversation?.type === ConversationType.GROUP
  const isAI = selectedConversation?.type === ConversationType.AI_CHAT

  return (
    <>
      <div style={{ height: 'calc(100vh - 0px)', display: 'flex', overflow: 'hidden' }}>
        {/* Left: conversations list */}
        <aside style={{
          width: 320, flexShrink: 0,
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '16px 16px 12px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.3, color: 'var(--color-text)' }}>Messages</div>
              <button onClick={() => setCreateOpen(true)} style={{
                width: 32, height: 32, borderRadius: 8,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-text-secondary)',
              }} title="Nouvelle conversation">
                <PenSquare size={16} />
              </button>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              height: 36, padding: '0 12px', width: '100%',
              background: 'var(--color-surface2)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
            }}>
              <Search size={14} color="var(--color-text-tertiary)" />
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher…"
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  background: 'transparent', fontSize: 13, color: 'var(--color-text)',
                }}
              />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 12px' }}>
            <InfiniteScroll
              items={filteredConvs}
              hasMore={hasMore}
              loading={loading}
              loadMore={loadPage}
              renderItem={(c) => (
                <ConversationRow
                  key={c.id} conv={c}
                  active={selectedConversation?.id === c.id}
                  onClick={() => selectConversation(c)}
                />
              )}
            />
          </div>
        </aside>

        {/* Center: thread */}
        <section style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {selectedConversation ? (
            <>
              <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--color-surface)',
                flexShrink: 0,
              }}>
                {isAI ? (
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><Sparkles size={18} color="white" /></div>
                ) : isGroup ? (
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: 'var(--color-surface2)', border: '1px solid var(--color-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-text-secondary)',
                  }}><Users size={16} /></div>
                ) : (
                  <Avatar user={display.user ?? undefined} size={38} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>{display.name}</div>
                </div>
                <IconBtn><Phone size={16} /></IconBtn>
                <IconBtn><Video size={16} /></IconBtn>
                <IconBtn><Info size={16} /></IconBtn>
              </div>

              <div style={{
                flex: 1, overflowY: 'auto',
                padding: '16px 20px',
                display: 'flex', flexDirection: 'column',
              }}>
                <InfiniteScroll
                  items={messages}
                  hasMore={msgsHasMore}
                  loading={msgsLoading}
                  loadMore={loadMoreMessages}
                  direction="top"
                  renderItem={(m, i) => (
                    <MessageBubble
                      key={m.id ?? i}
                      msg={m}
                      prev={messages[i - 1]}
                      currentUserId={user?.id}
                    />
                  )}
                />
              </div>

              <Composer onSend={handleSend} />
            </>
          ) : (
            <div style={{
              flex: 1, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-tertiary)',
              fontSize: 14,
            }}>
              Sélectionnez une conversation
            </div>
          )}
        </section>

        {/* Right: info */}
        {selectedConversation && (
          <aside style={{
            width: 280, flexShrink: 0,
            borderLeft: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            overflowY: 'auto',
          }}>
            <div style={{ padding: '24px 16px', textAlign: 'center', borderBottom: '1px solid var(--color-border)' }}>
              {isAI ? (
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px',
                }}><Sparkles size={28} color="white" /></div>
              ) : isGroup ? (
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'var(--color-surface2)', border: '1px solid var(--color-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px',
                  color: 'var(--color-text-secondary)',
                }}><Users size={28} /></div>
              ) : (
                <div style={{ marginBottom: 12 }}>
                  <Avatar user={display.user ?? undefined} size={72} />
                </div>
              )}
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>{display.name}</div>
            </div>

            <div style={{ padding: 16, borderTop: '1px solid var(--color-border)' }}>
              <button style={{
                width: '100%', padding: '8px 12px',
                display: 'flex', alignItems: 'center', gap: 10,
                borderRadius: 8, fontSize: 13, fontWeight: 600,
                color: 'var(--color-error)',
              }}>
                <BellOff size={14} />Mettre en sourdine
              </button>
            </div>
          </aside>
        )}
      </div>

      {createOpen && (
        <CreateConversationModal
          open={createOpen}
          oncClose={() => setCreateOpen(false)}
          onFinished={() => { pushConversation(); setCreateOpen(false) }}
        />
      )}
    </>
  )
}

export default MessagePage
