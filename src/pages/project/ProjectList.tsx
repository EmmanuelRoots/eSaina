import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Plus, LayoutGrid, List, Star, FolderKanban, Ticket } from "lucide-react"
import projectApi from "../../services/api/project.api"
import type { ProjectDTO } from "../../data/dto/project"
import Modal from "../../components/modal"
import ProjectForm from './ProjectForm.tsx';
import { AvatarStack } from "../../components/avatar"

// Stable color per project key
const PROJECT_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4']
const colorFor = (key: string) => {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return PROJECT_COLORS[h % PROJECT_COLORS.length]
}

// Local stars persist between sessions (no backend yet)
const STAR_KEY = 'esaina.starred-projects'
const loadStars = (): Set<string> => {
  try { return new Set(JSON.parse(localStorage.getItem(STAR_KEY) ?? '[]')) }
  catch { return new Set() }
}
const saveStars = (s: Set<string>) => localStorage.setItem(STAR_KEY, JSON.stringify([...s]))

type CardProps = {
  project: ProjectDTO
  starred: boolean
  onToggleStar: () => void
  onOpen: () => void
}

const ProjectCard = ({ project, starred, onToggleStar, onOpen }: CardProps) => {
  const color = colorFor(project.key)
  const memberUsers = (project.members ?? []).map((m) => m.user).filter(Boolean)

  return (
    <div
      onClick={onOpen}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 14,
        padding: 18, cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 14,
        boxShadow: 'var(--shadow-xs)',
        transition: 'all 180ms cubic-bezier(.4,0,.2,1)',
        position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)'
        e.currentTarget.style.boxShadow = 'var(--shadow-xs)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: color, color: 'white',
          fontWeight: 800, fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          letterSpacing: 0.4,
          boxShadow: `0 4px 12px ${color}40`,
        }}>{project.key}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>{project.name}</div>
          <div style={{
            fontSize: 11, color: 'var(--color-text-tertiary)',
            fontFamily: 'var(--font-mono)', fontWeight: 500,
          }}>{project.key}</div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleStar() }}
          style={{ color: starred ? '#f59e0b' : 'var(--color-text-tertiary)' }}
          title={starred ? 'Retirer des favoris' : 'Mettre en favori'}
        >
          <Star size={16} strokeWidth={2.2} fill={starred ? '#f59e0b' : 'none'} />
        </button>
      </div>

      <div style={{
        fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5,
        textWrap: 'pretty', minHeight: 36,
      }}>
        {project.description || 'Pas de description'}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 4, borderTop: '1px solid var(--color-border)',
      }}>
        <AvatarStack users={memberUsers} size={24} max={4} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 600,
        }}>
          <Ticket size={13} color="var(--color-text-tertiary)" />
          {project.issueCounter ?? 0} tickets
        </div>
      </div>
    </div>
  )
}

const ProjectList = () => {
  const [projects, setProjects] = useState<ProjectDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [stars, setStars] = useState<Set<string>>(loadStars)
  const navigate = useNavigate()

  const fetchProjects = async () => {
    setLoading(true)
    const data = await projectApi.getMyProjects()
    setProjects(data)
    setLoading(false)
  }

  useEffect(() => { fetchProjects() }, [])

  const handleProjectCreated = () => {
    setIsModalOpen(false)
    fetchProjects()
  }

  const toggleStar = (id: string) => {
    const next = new Set(stars)
    if (next.has(id)) next.delete(id); else next.add(id)
    setStars(next)
    saveStars(next)
  }

  if (loading && projects.length === 0) {
    return <div style={{ padding: 24, color: 'var(--color-text-secondary)' }}>Chargement des projets…</div>
  }

  const filtered = projects.filter((p) =>
    !searchQ
    || p.name.toLowerCase().includes(searchQ.toLowerCase())
    || p.key.toLowerCase().includes(searchQ.toLowerCase())
  )

  const starred = filtered.filter((p) => stars.has(p.id))
  const others = filtered.filter((p) => !stars.has(p.id))

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
    gap: 16,
  }

  return (
    <div style={{ height: 'calc(100vh - 60px)', overflowY: 'auto' }}>
      {/* Toolbar */}
      <div style={{ padding: '16px 24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          height: 36, padding: '0 12px', width: 340,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)', borderRadius: 8,
        }}>
          <Search size={14} color="var(--color-text-tertiary)" />
          <input
            value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Rechercher un projet…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--color-text)' }}
          />
        </div>
        <span style={{ flex: 1 }} />
        <div style={{
          display: 'flex', gap: 2, padding: 3,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)', borderRadius: 8,
        }}>
          <button
            onClick={() => setViewMode('grid')}
            style={iconBtnStyle(viewMode === 'grid')}
            title="Grille"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={iconBtnStyle(viewMode === 'list')}
            title="Liste"
          >
            <List size={16} />
          </button>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 36, padding: '0 14px', borderRadius: 8,
            background: 'var(--color-primary)', color: 'white',
            border: '1px solid var(--color-primary)',
            fontWeight: 600, fontSize: 13,
          }}
        >
          <Plus size={16} />Nouveau projet
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ProjectForm onSuccess={handleProjectCreated} />
      </Modal>

      {/* Sections */}
      <div style={{ padding: '24px 24px 40px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        {starred.length > 0 && (
          <section>
            <SectionHeader icon={<Star size={14} color="#f59e0b" fill="#f59e0b" />} label="Favoris" count={starred.length} />
            <div style={gridStyle}>
              {starred.map((p) => (
                <ProjectCard
                  key={p.id} project={p}
                  starred={true}
                  onToggleStar={() => toggleStar(p.id)}
                  onOpen={() => navigate(`/projects/${p.id}/board`)}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <SectionHeader
            icon={<FolderKanban size={14} color="var(--color-text-tertiary)" />}
            label="Tous les projets" count={others.length}
          />
          <div style={gridStyle}>
            {others.map((p) => (
              <ProjectCard
                key={p.id} project={p}
                starred={false}
                onToggleStar={() => toggleStar(p.id)}
                onOpen={() => navigate(`/projects/${p.id}/board`)}
              />
            ))}
          </div>
          {others.length === 0 && starred.length === 0 && (
            <div style={{
              padding: 48, textAlign: 'center', color: 'var(--color-text-tertiary)',
              border: '1.5px dashed var(--color-border)', borderRadius: 14,
            }}>
              Aucun projet ne correspond à votre recherche.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

const SectionHeader = ({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
    {icon}
    <span style={{
      fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: 0.8, color: 'var(--color-text-secondary)',
    }}>{label}</span>
    <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600 }}>{count}</span>
  </div>
)

const iconBtnStyle = (active: boolean): React.CSSProperties => ({
  width: 32, height: 32,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  borderRadius: 6,
  background: active ? 'var(--color-primary50)' : 'transparent',
  color: active ? 'var(--color-primary-hover)' : 'var(--color-text-secondary)',
})

export default ProjectList
