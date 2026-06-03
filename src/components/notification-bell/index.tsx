/**
 * Composant NotificationBell.
 *
 * Rôle : affiche une cloche avec un badge de notifications non lues.
 * Au clic, ouvre un dropdown listant les notifications persistées
 * (chargées + enrichies en temps réel par le SSEProvider).
 *
 * Actions disponibles :
 * - Cliquer sur une notification → marque comme lue + ouvre le lien si présent.
 * - "Tout marquer comme lu" → appelle markAllAsRead du contexte SSE.
 *
 * Dépendances : UseSSE (storedNotifications, unreadCount, markAsRead, markAllAsRead).
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  CheckCheck,
  GitPullRequestArrow,
  MessageSquareMore,
  RefreshCw,
  Ticket,
} from 'lucide-react'
import { UseSSE } from '../../context/sse'
import { NotificationType } from '../../data/dto/notification'
import type { StoredNotificationDTO } from '../../data/dto/notification'

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Icône associée au type de notification. */
const NotifIcon = ({ type }: { type: NotificationType }) => {
  const size = 15
  const color = 'var(--color-primary)'
  switch (type) {
    case NotificationType.ISSUE_ASSIGNED:
      return <GitPullRequestArrow size={size} color={color} />
    case NotificationType.ISSUE_STATUS_CHANGED:
      return <RefreshCw size={size} color={color} />
    case NotificationType.ISSUE_COMMENTED:
      return <MessageSquareMore size={size} color={color} />
    case NotificationType.ISSUE_UPDATED:
      return <Ticket size={size} color={color} />
    default:
      return <Bell size={size} color={color} />
  }
}

/** Formate une date ISO en texte relatif court (ex. "il y a 5 min"). */
const relativeTime = (iso: string): string => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return "à l'instant"
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`
  return `il y a ${Math.floor(diff / 86400)} j`
}

/**
 * Calcule la route cible d'une notification selon son type et ses données.
 * Retourne null si le type ne correspond à aucune navigation connue.
 */
const getNavigationPath = (notif: StoredNotificationDTO): string | null => {
  const data = notif.data
  switch (notif.type) {
    case NotificationType.ISSUE_ASSIGNED:
      // Ouvre directement le ticket en modal dans la vue tableau
      if (data?.projectId && data?.issueId) return `/projects/${data.projectId}/board?issue=${data.issueId}`
      return null
    case NotificationType.ISSUE_STATUS_CHANGED:
    case NotificationType.ISSUE_COMMENTED:
    case NotificationType.ISSUE_UPDATED:
      if (data?.projectId) return `/projects/${data.projectId}/backlog`
      return null
    case NotificationType.NEW_MESSAGE:
    case NotificationType.NEW_CONVERSATION:
      return '/message'
    case NotificationType.NEW_POST:
      return '/'
    default:
      return null
  }
}

// ── Composant principal ───────────────────────────────────────────────────────

/**
 * Cloche de notifications avec badge et dropdown.
 *
 * @remarks Ferme automatiquement le dropdown au clic à l'extérieur.
 */
export const NotificationBell = () => {
  const { storedNotifications, unreadCount, markAsRead, markAllAsRead } = UseSSE()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  /** Ferme le dropdown si le clic se produit en dehors du composant. */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNotifClick = async (notif: StoredNotificationDTO) => {
    if (!notif.read) {
      await markAsRead(notif.id)
    }
    const path = getNavigationPath(notif)
    if (path) {
      setOpen(false)
      navigate(path)
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* ── Bouton cloche ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        title="Notifications"
        style={{
          position: 'relative',
          width: 36,
          height: 36,
          borderRadius: 8,
          border: '1px solid var(--color-border)',
          background: open ? 'var(--color-surface2)' : 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.15s',
        }}
      >
        <Bell size={18} color="var(--color-text-secondary)" strokeWidth={2} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 4,
            right: 4,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            background: 'var(--color-primary)',
            color: 'white',
            fontSize: 10,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 3px',
            lineHeight: 1,
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: 340,
          maxHeight: 480,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* En-tête */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)' }}>
              Notifications{unreadCount > 0 && ` (${unreadCount})`}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                title="Tout marquer comme lu"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-primary)',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '4px 8px',
                  borderRadius: 6,
                }}
              >
                <CheckCheck size={14} />
                Tout lire
              </button>
            )}
          </div>

          {/* Liste */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {storedNotifications.length === 0 ? (
              <div style={{
                padding: 32,
                textAlign: 'center',
                color: 'var(--color-text-tertiary)',
                fontSize: 13,
              }}>
                Aucune notification
              </div>
            ) : (
              storedNotifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    background: notif.read ? 'transparent' : 'var(--color-primary-10, rgba(99,102,241,0.06))',
                    border: 'none',
                    borderBottom: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.1s',
                  }}
                >
                  {/* Icône type */}
                  <div style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: 'var(--color-surface2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 1,
                  }}>
                    <NotifIcon type={notif.type} />
                  </div>

                  {/* Contenu */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: notif.read ? 500 : 700,
                      fontSize: 13,
                      color: 'var(--color-text)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {notif.title}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: 'var(--color-text-secondary)',
                      marginTop: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {notif.message}
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: 'var(--color-text-tertiary)',
                      marginTop: 4,
                    }}>
                      {relativeTime(notif.createdAt)}
                    </div>
                  </div>

                  {/* Point non lu */}
                  {!notif.read && (
                    <div style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: 'var(--color-primary)',
                      flexShrink: 0,
                      marginTop: 6,
                    }} />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
