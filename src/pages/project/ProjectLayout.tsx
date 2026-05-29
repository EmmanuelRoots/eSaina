import { Outlet, useNavigate, useParams, useLocation } from "react-router-dom"
import { useEffect } from "react"
import { Columns3, List, ChevronRight, Map, Timer } from "lucide-react"
import { useProject } from "../../context/project"

const ProjectLayout = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { currentProject, fetchProjectData } = useProject()

  useEffect(() => {
    if (projectId) fetchProjectData(projectId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const tabs = [
    { label: 'Tableau',  path: 'board',   Icon: Columns3 },
    { label: 'Backlog',  path: 'backlog', Icon: List },
    { label: 'Roadmap',  path: 'roadmap', Icon: Map,   soon: true },
    { label: 'Tempo',    path: 'tempo',   Icon: Timer },
  ]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '0 24px',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', gap: 12,
        height: 60, flexShrink: 0,
      }}>
        <nav style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500,
        }}>
          <button
            onClick={() => navigate('/projects')}
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: 13, fontWeight: 500, padding: '4px 6px',
              borderRadius: 6,
              transition: 'color 120ms cubic-bezier(.4,0,.2,1), background 120ms cubic-bezier(.4,0,.2,1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-text)'
              e.currentTarget.style.background = 'var(--color-surface2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-secondary)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            Projets
          </button>
          <ChevronRight size={14} color="var(--color-text-tertiary)" />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-text)', fontWeight: 700 }}>
            {currentProject?.name ?? 'Chargement…'}
          </span>
        </nav>

        <span style={{ flex: 1 }} />

        <div style={{ display: 'flex', gap: 4 }}>
          {tabs.map((tab) => {
            const isActive = location.pathname.includes(`/${tab.path}`)
            return (
              <button
                key={tab.path}
                onClick={() => !tab.soon && navigate(`/projects/${projectId}/${tab.path}`)}
                disabled={tab.soon}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 8,
                  background: isActive ? 'var(--color-primary50)' : 'transparent',
                  color: isActive ? 'var(--color-primary-hover)' : 'var(--color-text-secondary)',
                  fontWeight: isActive ? 600 : 500, fontSize: 13,
                  opacity: tab.soon ? 0.5 : 1,
                  cursor: tab.soon ? 'not-allowed' : 'pointer',
                  transition: 'all 120ms cubic-bezier(.4,0,.2,1)',
                }}
              >
                <tab.Icon size={14} strokeWidth={isActive ? 2.4 : 2} />
                {tab.label}
                {tab.soon && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, color: 'var(--color-text-tertiary)',
                    textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 4,
                  }}>bientôt</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Outlet />
      </div>
    </div>
  )
}

export default ProjectLayout
