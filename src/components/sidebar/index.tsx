import { useNavigate, useLocation, useParams } from "react-router-dom"
import {
  Newspaper, MessageSquare, Columns3, List, Map, BarChart3, FolderKanban,
  ChevronsUpDown, Settings, PanelLeftOpen, PanelLeftClose, ShieldCheck,
  type LucideIcon,
} from "lucide-react"
import { UseAuth } from "../../context/user"
import { useProject } from "../../context/project"
import { Avatar } from "../avatar"
import './index.css'

type NavItem = {
  id: string
  label: string
  Icon: LucideIcon
  path: string
  badge?: number
  soon?: boolean
}

type Section = { label?: string; items: NavItem[] }

type Props = {
  collapsed: boolean
  onToggle: () => void
}

export const Sidebar = ({ collapsed, onToggle }: Props) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = UseAuth()
  const { currentProject } = useProject()
  const { projectId } = useParams<{ projectId: string }>()

  const projectScope = projectId ?? currentProject?.id

  const sections: Section[] = [
    {
      items: [
        { id: 'actu',     label: 'Actualité', Icon: Newspaper,      path: '/' },
        { id: 'message',  label: 'Messages',  Icon: MessageSquare, path: '/message' },
      ],
    },
    {
      label: 'Projet courant',
      items: projectScope
        ? [
            { id: 'board',   label: 'Tableau', Icon: Columns3,    path: `/projects/${projectScope}/board` },
            { id: 'backlog', label: 'Backlog', Icon: List,        path: `/projects/${projectScope}/backlog` },
            { id: 'roadmap', label: 'Roadmap', Icon: Map,         path: '#', soon: true },
            { id: 'reports', label: 'Rapports',Icon: BarChart3,   path: '#', soon: true },
          ]
        : [],
    },
    {
      items: [
        { id: 'projects', label: 'Tous les projets', Icon: FolderKanban, path: '/projects' },
      ],
    },
  ]

  // Add Admin section for Super Admins
  if (user?.role?.name === "SUPER_ADMIN") {
    sections.push({
      label: 'Administration',
      items: [
        { id: 'roles', label: 'Gestion des rôles', Icon: ShieldCheck, path: '/admin/roles' },
      ],
    })
  }

  const width = collapsed ? 64 : 240

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <aside className="sidebar" style={{ width, minWidth: width }}>
      {/* Brand */}
      <div className="sidebar-brand" style={{
        padding: collapsed ? 0 : '0 16px',
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="sidebar-logo">e</div>
          {!collapsed && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: -0.2, color: 'var(--color-text)' }}>eSaina</div>
              <div style={{
                fontSize: 10, color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 600,
              }}>Workspace</div>
            </div>
          )}
        </div>
      </div>

      {/* Active project chip */}
      {!collapsed && currentProject && (
        <div style={{ padding: '12px 12px 4px' }}>
          <button
            onClick={() => navigate('/projects')}
            style={{
              width: '100%', padding: '10px 12px',
              background: 'var(--color-surface2)',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', gap: 10,
              textAlign: 'left', cursor: 'pointer',
            }}
            title="Changer de projet"
          >
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'var(--color-primary)',
              color: 'white', fontWeight: 800, fontSize: 11,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>{currentProject.key}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontWeight: 600, fontSize: 13,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                color: 'var(--color-text)',
              }}>{currentProject.name}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{currentProject.key}</div>
            </div>
            <ChevronsUpDown size={14} color="var(--color-text-tertiary)" />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="sidebar-nav">
        {sections.map((sec, si) => (
          sec.items.length > 0 && (
            <div key={si} style={{ marginTop: si === 0 ? 4 : 16 }}>
              {!collapsed && sec.label && (
                <div className="sidebar-section-label">{sec.label}</div>
              )}
              {sec.items.map((item) => {
                const active = isActive(item.path)
                const cls = ['sidebar-item', active ? 'active' : '', collapsed ? 'collapsed' : ''].filter(Boolean).join(' ')
                return (
                  <button
                    key={item.id}
                    onClick={() => !item.soon && navigate(item.path)}
                    disabled={item.soon}
                    className={cls}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.Icon size={17} strokeWidth={active ? 2.4 : 2} />
                    {!collapsed && <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="sidebar-badge">{item.badge}</span>
                    )}
                    {!collapsed && item.soon && (
                      <span className="sidebar-soon">bientôt</span>
                    )}
                  </button>
                )
              })}
            </div>
          )
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer" style={{ flexDirection: collapsed ? 'column' : 'row' }}>
        <button
          className="sidebar-toggle"
          onClick={onToggle}
          title={collapsed ? 'Déplier' : 'Replier'}
          style={{ width: collapsed ? 40 : 36 }}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
        {!collapsed && user && (
          <button
            className="sidebar-toggle"
            onClick={logout}
            style={{
              flex: 1, height: 36, padding: '0 10px', width: 'auto',
              gap: 10, justifyContent: 'flex-start',
            }}
            title="Déconnexion"
          >
            <Avatar user={user} size={24} />
            <span style={{
              fontSize: 13, fontWeight: 600, flex: 1, textAlign: 'left',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              color: 'var(--color-text)',
            }}>{user.firstName} {user.lastName}</span>
            <Settings size={14} color="var(--color-text-tertiary)" />
          </button>
        )}
      </div>
    </aside>
  )
}
