import { useState } from "react"
import {
  Globe, MoreHorizontal, ThumbsUp, MessageCircle, Share2,
  Image as ImageIcon, Smile, AtSign, Hash, Send,
  Plus, TrendingUp, Sparkles,
} from "lucide-react"
import { Avatar } from "../../components/avatar"
import type { PostDTO, ReactionType, SalonDTO } from "../../data/dto/post"
import { ReactionType as RT } from "../../data/dto/post"
import { UseAuth } from "../../context/user"

const REACTION_META: Record<ReactionType, { emoji: string; color: string }> = {
  [RT.LIKE]:  { emoji: '👍', color: '#3b82f6' },
  [RT.LOVE]:  { emoji: '❤️', color: '#ef4444' },
  [RT.HAHA]:  { emoji: '😂', color: '#f59e0b' },
  [RT.WOW]:   { emoji: '😮', color: '#f59e0b' },
  [RT.SAD]:   { emoji: '😢', color: '#3b82f6' },
  [RT.ANGRY]: { emoji: '😡', color: '#ef4444' },
}

const formatRelative = (iso?: string): string => {
  if (!iso) return ''
  const d = new Date(iso)
  const diffMs = Date.now() - d.getTime()
  const min = Math.round(diffMs / 60000)
  if (min < 1) return "à l'instant"
  if (min < 60) return `il y a ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `il y a ${h} h`
  const days = Math.round(h / 24)
  if (days < 7) return `il y a ${days} j`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

type PostItemProps = { post: PostDTO }

export const NewPostItem = ({ post }: PostItemProps) => {
  const { user } = UseAuth()
  const myReactionInit = post.reactions.find((r) => r.user.id === user?.id)?.type ?? null
  const [myReaction, setMyReaction] = useState<ReactionType | null>(myReactionInit)
  const [picker, setPicker] = useState(false)

  // Group counts
  const grouped: Partial<Record<ReactionType, number>> = {}
  post.reactions.forEach((r) => {
    if (r.user.id === user?.id) return
    grouped[r.type] = (grouped[r.type] ?? 0) + 1
  })
  if (myReaction) grouped[myReaction] = (grouped[myReaction] ?? 0) + 1
  const total = Object.values(grouped).reduce<number>((a, b) => a + (b ?? 0), 0)

  const toggle = (t: ReactionType) => {
    setMyReaction((prev) => (prev === t ? null : t))
    setPicker(false)
    // TODO: wire postApi.addReaction / deleteReaction
  }

  const salonColor = '#10b981' // fallback; you can map per-salon if desired

  return (
    <article style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: 'var(--shadow-xs)',
      flexShrink: 0,
    }}>
      <header style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar user={post.author} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)' }}>
              {post.author.firstName} {post.author.lastName}
            </span>
            {post.salon?.title && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                background: `${salonColor}1a`, color: salonColor,
                textTransform: 'uppercase', letterSpacing: 0.6,
              }}>#{post.salon.title}</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
            <span>{formatRelative(post.createdAt)}</span>
            <span>·</span>
            <Globe size={11} />
          </div>
        </div>
        <button style={{ color: 'var(--color-text-secondary)', padding: 6 }}>
          <MoreHorizontal size={16} />
        </button>
      </header>

      <div style={{ padding: '0 16px 14px' }}>
        <p style={{
          fontSize: 14, color: 'var(--color-text)',
          lineHeight: 1.55, whiteSpace: 'pre-wrap', textWrap: 'pretty',
        }}>{post.content}</p>
      </div>

      {(total > 0 || post.comments.length > 0) && (
        <div style={{
          padding: '8px 16px', display: 'flex', alignItems: 'center',
          fontSize: 12, color: 'var(--color-text-secondary)',
          borderTop: '1px solid var(--color-border)',
        }}>
          {total > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ display: 'flex' }}>
                {Object.entries(grouped).slice(0, 3).map(([type], i) => (
                  <span key={type} style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: REACTION_META[type as ReactionType].color, color: 'white',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, marginLeft: i === 0 ? 0 : -6,
                    border: '2px solid var(--color-surface)',
                  }}>{REACTION_META[type as ReactionType].emoji}</span>
                ))}
              </div>
              <span>{total}</span>
            </div>
          )}
          <span style={{ flex: 1 }} />
          {post.comments.length > 0 && <span>{post.comments.length} commentaires</span>}
        </div>
      )}

      <div style={{
        padding: '4px 8px', display: 'flex',
        borderTop: '1px solid var(--color-border)', position: 'relative',
      }}>
        <button
          onClick={() => toggle(myReaction ?? RT.LIKE)}
          onMouseEnter={() => setPicker(true)}
          onMouseLeave={() => setPicker(false)}
          style={{
            flex: 1, padding: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            borderRadius: 8, fontWeight: 600, fontSize: 13,
            color: myReaction ? REACTION_META[myReaction].color : 'var(--color-text-secondary)',
          }}
        >
          {myReaction
            ? <span style={{ fontSize: 18 }}>{REACTION_META[myReaction].emoji}</span>
            : <ThumbsUp size={18} />
          }
          <span>{myReaction ? myReaction.charAt(0) + myReaction.slice(1).toLowerCase() : "Réagir"}</span>

          {picker && (
            <div style={{
              position: 'absolute', bottom: '100%', left: 12, marginBottom: 8,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 999, padding: '6px 10px',
              display: 'flex', gap: 6, boxShadow: 'var(--shadow-lg)',
              zIndex: 10,
            }}>
              {(Object.keys(REACTION_META) as ReactionType[]).map((t) => (
                <button
                  key={t}
                  onClick={(e) => { e.stopPropagation(); toggle(t) }}
                  style={{ width: 36, height: 36, borderRadius: '50%', fontSize: 22 }}
                >{REACTION_META[t].emoji}</button>
              ))}
            </div>
          )}
        </button>
        <button style={actionBtn}>
          <MessageCircle size={18} /><span>Commenter</span>
        </button>
        <button style={actionBtn}>
          <Share2 size={18} /><span>Partager</span>
        </button>
      </div>
    </article>
  )
}

const actionBtn: React.CSSProperties = {
  flex: 1, padding: 10,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  borderRadius: 8, fontWeight: 600, fontSize: 13,
  color: 'var(--color-text-secondary)',
}

type ComposeProps = { onCreate?: (text: string) => void }

export const ComposeBox = ({ onCreate }: ComposeProps) => {
  const { user } = UseAuth()
  const [text, setText] = useState('')
  const [focused, setFocused] = useState(false)

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 14, padding: 14,
      boxShadow: 'var(--shadow-xs)',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Avatar user={user ?? undefined} size={40} />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={`Quoi de neuf, ${user?.firstName ?? ''} ?`}
          rows={focused || text ? 3 : 1}
          style={{
            flex: 1, border: 'none', outline: 'none',
            background: 'var(--color-surface2)',
            borderRadius: 10, padding: '10px 14px',
            fontFamily: 'inherit', fontSize: 14,
            color: 'var(--color-text)',
            resize: 'none',
            transition: 'all 200ms cubic-bezier(.4,0,.2,1)',
          }}
        />
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        paddingTop: 10, marginTop: 10,
        borderTop: '1px solid var(--color-border)',
      }}>
        <IconBtn><ImageIcon size={16} /></IconBtn>
        <IconBtn><Smile size={16} /></IconBtn>
        <IconBtn><AtSign size={16} /></IconBtn>
        <IconBtn><Hash size={16} /></IconBtn>
        <span style={{ flex: 1 }} />
        <button
          onClick={() => { if (text) { onCreate?.(text); setText('') } }}
          disabled={!text}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '0 14px', height: 32, borderRadius: 8,
            background: 'var(--color-primary)', color: 'white',
            fontWeight: 600, fontSize: 13,
            opacity: text ? 1 : 0.5,
          }}
        >
          <Send size={14} />Publier
        </button>
      </div>
    </div>
  )
}

const IconBtn = ({ children }: { children: React.ReactNode }) => (
  <button style={{
    width: 32, height: 32,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 8, color: 'var(--color-text-secondary)',
  }}>{children}</button>
)

type SalonListProps = {
  salons: SalonDTO[]
  activeId?: string
  onSelect?: (s: SalonDTO) => void
}

export const SalonList = ({ salons = [], activeId, onSelect }: SalonListProps) => (
  <aside style={{
    width: 280, flexShrink: 0,
    borderLeft: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    padding: '20px 16px',
    overflowY: 'auto',
  }}>
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)',
        textTransform: 'uppercase', letterSpacing: 1.2, padding: '0 10px 8px',
      }}>Salons</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {salons.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect?.(s)}
            style={{
              width: '100%', padding: '8px 10px',
              display: 'flex', alignItems: 'center', gap: 10,
              borderRadius: 8, textAlign: 'left',
              background: s.id === activeId ? 'var(--color-surface2)' : 'transparent',
            }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--color-primary)', flexShrink: 0,
            }} />
            <span style={{
              flex: 1, fontSize: 13,
              fontWeight: s.id === activeId ? 600 : 500,
              color: s.id === activeId ? 'var(--color-text)' : 'var(--color-text-secondary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{s.title ?? 'Sans titre'}</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{s.members?.length ?? 0}</span>
          </button>
        ))}
      </div>
      <button style={{
        width: '100%', marginTop: 8, padding: '8px 10px',
        display: 'flex', alignItems: 'center', gap: 8,
        borderRadius: 8, fontSize: 12, fontWeight: 600,
        color: 'var(--color-text-tertiary)',
      }}>
        <Plus size={14} /> Nouveau salon
      </button>
    </div>

    <div>
      <div style={{
        fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)',
        textTransform: 'uppercase', letterSpacing: 1.2, padding: '0 10px 8px',
      }}>Tendances</div>
      {['#react19', '#sprint24', '#design-system', '#sse-bug'].map((tag) => (
        <button key={tag} style={{
          width: '100%', padding: '8px 10px',
          display: 'flex', alignItems: 'center', gap: 8,
          borderRadius: 8, textAlign: 'left',
          fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)',
        }}>
          <TrendingUp size={13} color="var(--color-text-tertiary)" />
          <span>{tag}</span>
        </button>
      ))}
    </div>
  </aside>
)

export const EmptyTrail = () => (
  <div style={{
    padding: 20, textAlign: 'center', fontSize: 12,
    color: 'var(--color-text-tertiary)',
  }}>
    <Sparkles size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
    Vous êtes à jour
  </div>
)
