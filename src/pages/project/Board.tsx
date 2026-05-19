import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
  Search, Filter, Eye, Sparkles, Flag, Square, Plus, MoreHorizontal,
} from "lucide-react"
import { useProject } from "../../context/project/useProject"
import { IssueStatus, type IssueDTO } from "../../data/dto/issue"
import { SprintStatus } from "../../data/dto/sprint"
import Column from "../../components/column"
import Row from "../../components/row"
import { Avatar } from "../../components/avatar"
import { IssueCard } from "../../components/issue/IssueCard"

const COLUMNS: Array<{ status: IssueStatus; label: string; accent: string }> = [
  { status: IssueStatus.TODO,        label: 'À faire',     accent: '#94a3b8' },
  { status: IssueStatus.IN_PROGRESS, label: 'En cours',    accent: '#3b82f6' },
  { status: IssueStatus.IN_REVIEW,   label: 'En révision', accent: '#f59e0b' },
  { status: IssueStatus.DONE,        label: 'Terminé',     accent: '#10b981' },
]

const daysBetween = (a: string, b: string) =>
  Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000))

const Board = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const { boardIssues, fetchBoard, fetchProjectData, currentProject, sprints, fetchBacklog } = useProject()
  const [searchQ, setSearchQ] = useState('')
  const [activeAssignee, setActiveAssignee] = useState<string | null>(null)

  useEffect(() => {
    if (projectId) {
      fetchProjectData(projectId)
      fetchBoard(projectId)
      fetchBacklog(projectId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const activeSprint = sprints.find((s) => s.status === SprintStatus.ACTIVE)

  // Filter applied to each status bucket
  const matchesFilter = (issue: IssueDTO) => {
    const q = searchQ.toLowerCase()
    const hitText = !q || issue.title.toLowerCase().includes(q) || issue.key.toLowerCase().includes(q)
    const hitAssignee = !activeAssignee || issue.assignee?.id === activeAssignee
    return hitText && hitAssignee
  }

  const teamMembers = (() => {
    const map = new Map<string, IssueDTO['assignee']>()
    Object.values(boardIssues).flat().forEach((i) => {
      if (i.assignee?.id) map.set(i.assignee.id, i.assignee)
    })
    return Array.from(map.values()).filter(Boolean) as NonNullable<IssueDTO['assignee']>[]
  })()

  const sprintProgress = activeSprint?.startDate && activeSprint?.endDate
    ? (() => {
        const total = daysBetween(activeSprint.startDate, activeSprint.endDate)
        const elapsed = daysBetween(activeSprint.startDate, new Date().toISOString())
        const left = Math.max(0, total - elapsed)
        const pct = total > 0 ? Math.min(100, Math.round((elapsed / total) * 100)) : 0
        return { total, left, pct }
      })()
    : null

  return (
    <Column style={{ height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      {/* Sprint banner */}
      {activeSprint && (
        <div style={{
          margin: '16px 24px 0',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 14,
          padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: 20,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
            flexShrink: 0,
          }}>
            <Flag size={20} strokeWidth={2.4} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Row style={{ alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.2, color: 'var(--color-text)' }}>{activeSprint.name}</span>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
                padding: '2px 8px', borderRadius: 4,
                background: 'var(--color-primary50)', color: 'var(--color-primary-hover)',
                textTransform: 'uppercase',
              }}>● Actif</span>
            </Row>
            {activeSprint.goal && (
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{activeSprint.goal}</div>
            )}
          </div>

          {sprintProgress && (
            <Row style={{ alignItems: 'center', gap: 24 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700 }}>Reste</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>
                  {sprintProgress.left} <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)' }}>jours</span>
                </div>
              </div>
              <div style={{ width: 1, height: 32, background: 'var(--color-border)' }} />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700 }}>Progression</div>
                <Row style={{ alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 100, height: 6, background: 'var(--color-surface2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))', width: `${sprintProgress.pct}%` }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>{sprintProgress.pct}%</span>
                </Row>
              </div>
              <button style={btnSecondaryStyle}>
                <Square size={14} />Terminer le sprint
              </button>
            </Row>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div style={{
        margin: '16px 24px 0',
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      }}>
        <SearchInput value={searchQ} onChange={setSearchQ} placeholder="Rechercher dans le tableau…" />

        <Row style={{ alignItems: 'center' }}>
          {teamMembers.map((m, i) => (
            <button
              key={m.id ?? i}
              onClick={() => setActiveAssignee(activeAssignee === m.id ? null : (m.id ?? null))}
              title={`${m.firstName ?? ''} ${m.lastName ?? ''}`}
              style={{
                marginLeft: i === 0 ? 0 : -6,
                opacity: activeAssignee && activeAssignee !== m.id ? 0.35 : 1,
                transition: 'all 150ms cubic-bezier(.4,0,.2,1)',
              }}
            >
              <Avatar user={m} size={30} ring={activeAssignee === m.id ? 'var(--color-primary)' : 'var(--color-surface)'} />
            </button>
          ))}
        </Row>
        {activeAssignee && (
          <button onClick={() => setActiveAssignee(null)} style={{ fontSize: 12, color: 'var(--color-text-secondary)', textDecoration: 'underline' }}>Effacer</button>
        )}

        <span style={{ flex: 1 }} />

        <button style={btnSecondaryStyle}><Filter size={14} />Filtres</button>
        <button style={btnSecondaryStyle}><Eye size={14} />Vue</button>
        <button style={btnPrimaryStyle}><Sparkles size={14} />Insights IA</button>
      </div>

      {/* Columns */}
      <div style={{
        flex: 1, margin: '16px 24px 24px',
        overflowX: 'auto', overflowY: 'hidden',
        display: 'grid',
        gridTemplateColumns: `repeat(${COLUMNS.length}, minmax(280px, 1fr))`,
        gap: 16,
      }}>
        {COLUMNS.map((col) => {
          const issues = (boardIssues[col.status] ?? []).filter(matchesFilter)
          return (
            <div key={col.status} style={{
              background: 'var(--color-surface2)',
              border: '1px solid var(--color-border)',
              borderRadius: 14,
              padding: '4px 12px 12px',
              display: 'flex', flexDirection: 'column',
              minWidth: 0, overflow: 'hidden',
            }}>
              <Row style={{ alignItems: 'center', justifyContent: 'space-between', padding: '10px 4px 12px' }}>
                <Row style={{ alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: col.accent }} />
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--color-text-secondary)' }}>{col.label}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)',
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    padding: '1px 7px', borderRadius: 10,
                  }}>{issues.length}</span>
                </Row>
                <Row style={{ gap: 2 }}>
                  <IconBtn><Plus size={16} /></IconBtn>
                  <IconBtn><MoreHorizontal size={16} /></IconBtn>
                </Row>
              </Row>

              <div style={{
                flex: 1, overflowY: 'auto',
                display: 'flex', flexDirection: 'column', gap: 10,
                paddingRight: 2,
              }}>
                {issues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
                {issues.length === 0 && (
                  <div style={{
                    border: '1.5px dashed var(--color-border-strong)',
                    borderRadius: 10, padding: '24px 12px',
                    textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 12,
                  }}>Déposer ici</div>
                )}

                <button style={{
                  marginTop: 4, padding: '10px 12px', borderRadius: 8,
                  color: 'var(--color-text-tertiary)', fontSize: 12, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 120ms cubic-bezier(.4,0,.2,1)',
                }}>
                  <Plus size={14} /> Créer une issue
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {!currentProject && (
        <div style={{ padding: 24, color: 'var(--color-text-secondary)' }}>Chargement du projet…</div>
      )}
    </Column>
  )
}

const btnSecondaryStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  padding: '0 12px', height: 30, borderRadius: 8, fontSize: 12, fontWeight: 600,
  background: 'var(--color-surface)', color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
}

const btnPrimaryStyle: React.CSSProperties = {
  ...btnSecondaryStyle,
  background: 'var(--color-primary)', color: 'white',
  border: '1px solid var(--color-primary)',
}

const IconBtn = ({ children }: { children: React.ReactNode }) => (
  <button style={{
    width: 26, height: 26,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 8, color: 'var(--color-text-secondary)', background: 'transparent',
  }}>{children}</button>
)

const SearchInput = ({ value, onChange, placeholder }: { value: string; onChange: (s: string) => void; placeholder?: string }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8,
    height: 36, padding: '0 12px', width: 280,
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)', borderRadius: 8,
  }}>
    <Search size={14} color="var(--color-text-tertiary)" />
    <input
      value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--color-text)' }}
    />
  </div>
)

export default Board
