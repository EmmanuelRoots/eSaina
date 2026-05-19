import type { CSSProperties } from "react"
import type { UserDTO } from "../../data/dto/user"

// Stable color per user based on a hash of their id
const COLORS = [
  '#8b5cf6', '#10b981', '#3b82f6', '#f59e0b',
  '#ec4899', '#06b6d4', '#f97316', '#a855f7',
]

const colorFor = (user: Partial<UserDTO>): string => {
  const id = user.id || user.email || `${user.firstName ?? ''}${user.lastName ?? ''}`
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return COLORS[h % COLORS.length]
}

const initialsFor = (user: Partial<UserDTO>): string => {
  const f = user.firstName?.[0] ?? ''
  const l = user.lastName?.[0] ?? ''
  return (f + l).toUpperCase() || '?'
}

type AvatarProps = {
  user?: Partial<UserDTO> | null
  size?: number
  ring?: string
  style?: CSSProperties
}

export const Avatar = ({ user, size = 28, ring, style }: AvatarProps) => {
  if (!user) {
    return (
      <div
        title="Non assigné"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: '1.5px dashed var(--color-border-strong)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-tertiary)',
          fontSize: size * 0.42,
          flexShrink: 0,
          ...style,
        }}
      >
        ?
      </div>
    )
  }

  if (user.pdpUrl) {
    return (
      <img
        src={user.pdpUrl}
        alt={`${user.firstName ?? ''} ${user.lastName ?? ''}`}
        title={`${user.firstName ?? ''} ${user.lastName ?? ''}`}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          boxShadow: ring ? `0 0 0 2px ${ring}` : 'none',
          flexShrink: 0,
          ...style,
        }}
      />
    )
  }

  return (
    <div
      title={`${user.firstName ?? ''} ${user.lastName ?? ''}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: colorFor(user),
        color: 'white',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size * 0.42,
        letterSpacing: 0.2,
        boxShadow: ring ? `0 0 0 2px ${ring}` : 'none',
        flexShrink: 0,
        ...style,
      }}
    >
      {initialsFor(user)}
    </div>
  )
}

type AvatarStackProps = {
  users?: Array<Partial<UserDTO> | undefined | null>
  size?: number
  max?: number
}

export const AvatarStack = ({ users = [], size = 24, max = 3 }: AvatarStackProps) => {
  const present = users.filter(Boolean) as Partial<UserDTO>[]
  const shown = present.slice(0, max)
  const extra = present.length - shown.length

  if (present.length === 0) {
    return <Avatar size={size} />
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      {shown.map((u, i) => (
        <div key={u.id ?? i} style={{ marginLeft: i === 0 ? 0 : -size * 0.3 }}>
          <Avatar user={u} size={size} ring="var(--color-surface)" />
        </div>
      ))}
      {extra > 0 && (
        <div
          style={{
            marginLeft: -size * 0.3,
            width: size,
            height: size,
            borderRadius: '50%',
            background: 'var(--color-surface2)',
            color: 'var(--color-text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: size * 0.4,
            boxShadow: '0 0 0 2px var(--color-surface)',
          }}
        >
          +{extra}
        </div>
      )}
    </div>
  )
}
