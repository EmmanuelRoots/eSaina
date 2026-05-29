import { useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import {
  Search, Filter, Eye, Sparkles, Flag, Square, Plus, EyeOff,
} from "lucide-react"
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCorners, useDroppable,
  type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useProject } from "../../context/project/useProject"
import { IssueStatus, type IssueDTO, type CreateIssueRequestDTO, type UpdateIssueRequestDTO } from "../../data/dto/issue"
import { SprintStatus } from "../../data/dto/sprint"
import Column from "../../components/column"
import Row from "../../components/row"
import { Avatar } from "../../components/avatar"
import { IssueCard } from "../../components/issue/IssueCard"
import { IssueForm } from "../../components/issue/IssueForm"

const ALL_COLUMNS: Array<{ status: IssueStatus; label: string; accent: string }> = [
  { status: IssueStatus.TODO,        label: 'À faire',     accent: '#94a3b8' },
  { status: IssueStatus.IN_PROGRESS, label: 'En cours',    accent: '#3b82f6' },
  { status: IssueStatus.IN_REVIEW,   label: 'En révision', accent: '#f59e0b' },
  { status: IssueStatus.DONE,        label: 'Terminé',     accent: '#10b981' },
  { status: IssueStatus.CANCELLED,   label: 'Annulé',      accent: '#ef4444' },
]

const DEFAULT_VISIBLE: IssueStatus[] = [
  IssueStatus.TODO,
  IssueStatus.IN_PROGRESS,
  IssueStatus.IN_REVIEW,
  IssueStatus.DONE,
]

const storageKey = (projectId: string) => `board-columns-${projectId}`

const daysBetween = (a: string, b: string) =>
  Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000))

const Board = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const {
    boardIssues, fetchBoard, fetchProjectData, currentProject, sprints, fetchBacklog,
    createIssue, updateIssue, moveIssue,
  } = useProject()
  const [searchQ, setSearchQ] = useState('')
  const [activeAssignee, setActiveAssignee] = useState<string | null>(null)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [modalData, setModalData] = useState<{ open: boolean; status?: IssueStatus; issue?: IssueDTO }>({ open: false })
  const [showAddMenu, setShowAddMenu] = useState(false)
  const addMenuRef = useRef<HTMLDivElement>(null)

  const [visibleStatuses, setVisibleStatuses] = useState<IssueStatus[]>(() => {
    if (!projectId) return DEFAULT_VISIBLE
    try {
      const stored = localStorage.getItem(storageKey(projectId))
      if (stored) return JSON.parse(stored) as IssueStatus[]
    } catch {}
    return DEFAULT_VISIBLE
  })

  const visibleColumns = ALL_COLUMNS.filter((c) => visibleStatuses.includes(c.status))
  const hiddenColumns = ALL_COLUMNS.filter((c) => !visibleStatuses.includes(c.status))

  const persistColumns = (next: IssueStatus[]) => {
    if (projectId) localStorage.setItem(storageKey(projectId), JSON.stringify(next))
    setVisibleStatuses(next)
  }

  const addColumn = (status: IssueStatus) => {
    persistColumns([...visibleStatuses, status])
    setShowAddMenu(false)
  }

  const removeColumn = (status: IssueStatus) => {
    persistColumns(visibleStatuses.filter((s) => s !== status))
  }

  // Close add-column dropdown when clicking outside
  useEffect(() => {
    if (!showAddMenu) return
    const handler = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setShowAddMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showAddMenu])

  useEffect(() => {
    if (projectId) {
      fetchProjectData(projectId)
      fetchBoard(projectId)
      fetchBacklog(projectId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const activeSprint = sprints.find((s) => s.status === SprintStatus.ACTIVE)

  const matchesFilter = (issue: IssueDTO) => {
    const q = searchQ.toLowerCase()
    const hitText = !q || issue.title.toLowerCase().includes(q) || issue.key.toLowerCase().includes(q)
    const hitAssignee = !activeAssignee || issue.assignee?.id === activeAssignee
    return hitText && hitAssignee
  }

  const teamMembers = useMemo(() => {
    const map = new Map<string, IssueDTO['assignee']>()
    Object.values(boardIssues).flat().forEach((i) => {
      if (i.assignee?.id) map.set(i.assignee.id, i.assignee)
    })
    return Array.from(map.values()).filter(Boolean) as NonNullable<IssueDTO['assignee']>[]
  }, [boardIssues])

  const sprintProgress = activeSprint?.startDate && activeSprint?.endDate
    ? (() => {
        const total = daysBetween(activeSprint.startDate, activeSprint.endDate)
        const elapsed = daysBetween(activeSprint.startDate, new Date().toISOString())
        const left = Math.max(0, total - elapsed)
        const pct = total > 0 ? Math.min(100, Math.round((elapsed / total) * 100)) : 0
        return { total, left, pct }
      })()
    : null

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  // Search all loaded board issues, not just visible columns
  const findIssueById = (id: string): { issue: IssueDTO; status: IssueStatus; index: number } | null => {
    for (const [status, list] of Object.entries(boardIssues)) {
      const idx = list.findIndex((i) => i.id === id)
      if (idx !== -1) return { issue: list[idx], status: status as IssueStatus, index: idx }
    }
    return null
  }

  const activeIssue = activeDragId ? findIssueById(activeDragId)?.issue ?? null : null

  const handleDragStart = (e: DragStartEvent) => {
    setActiveDragId(String(e.active.id))
  }

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveDragId(null)
    const { active, over } = e
    if (!over) return
    const sourceInfo = findIssueById(String(active.id))
    if (!sourceInfo) return

    const overId = String(over.id)
    let toStatus: IssueStatus | null = null
    let toIndex = 0

    if (overId.startsWith('col:')) {
      toStatus = overId.slice(4) as IssueStatus
      toIndex = (boardIssues[toStatus] ?? []).length
    } else {
      const overInfo = findIssueById(overId)
      if (!overInfo) return
      toStatus = overInfo.status
      toIndex = overInfo.index
      if (sourceInfo.status === toStatus && sourceInfo.index < toIndex) {
        toIndex -= 1
      }
    }

    if (!toStatus) return
    if (toStatus === sourceInfo.status && toIndex === sourceInfo.index) return

    moveIssue(sourceInfo.issue.id, sourceInfo.status, toStatus, toIndex)
  }

  const handleCreateOrUpdate = async (data: CreateIssueRequestDTO | UpdateIssueRequestDTO) => {
    if (modalData.issue) {
      await updateIssue(modalData.issue.id, data as UpdateIssueRequestDTO)
    } else {
      await createIssue({
        ...(data as CreateIssueRequestDTO),
        sprintId: activeSprint?.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: modalData.status,
      } as any)
    }
    if (projectId) fetchBoard(projectId)
    setModalData({ open: false })
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners}
      onDragStart={handleDragStart} onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDragId(null)}
    >
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
          display: 'flex', gap: 16, alignItems: 'flex-start',
        }}>
          {visibleColumns.map((col) => {
            const issues = (boardIssues[col.status] ?? []).filter(matchesFilter)
            return (
              <BoardColumn
                key={col.status}
                status={col.status}
                label={col.label}
                accent={col.accent}
                issues={issues}
                onAskCreate={() => setModalData({ open: true, status: col.status })}
                onEditIssue={(issue) => setModalData({ open: true, issue, status: col.status })}
                onRemove={() => removeColumn(col.status)}
              />
            )
          })}

          {/* Add column button */}
          {hiddenColumns.length > 0 && (
            <div ref={addMenuRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button
                onClick={() => setShowAddMenu((v) => !v)}
                style={{
                  width: 200, height: 46, borderRadius: 12,
                  border: '1.5px dashed var(--color-border-strong)',
                  background: showAddMenu ? 'var(--color-surface2)' : 'transparent',
                  color: 'var(--color-text-tertiary)', fontSize: 12, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  cursor: 'pointer', transition: 'all 120ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface2)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
                onMouseLeave={(e) => { if (!showAddMenu) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-tertiary)' } }}
              >
                <Plus size={14} /> Ajouter une colonne
              </button>

              {showAddMenu && (
                <div style={{
                  position: 'absolute', top: 54, left: 0, zIndex: 50,
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10, padding: 6,
                  minWidth: 200,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--color-text-tertiary)', padding: '4px 8px 8px' }}>
                    Colonnes masquées
                  </div>
                  {hiddenColumns.map((col) => (
                    <button
                      key={col.status}
                      onClick={() => addColumn(col.status)}
                      style={{
                        width: '100%', padding: '8px 10px', borderRadius: 7,
                        display: 'flex', alignItems: 'center', gap: 10,
                        fontSize: 13, fontWeight: 500, color: 'var(--color-text)',
                        background: 'transparent', textAlign: 'left',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface2)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: col.accent, flexShrink: 0 }} />
                      {col.label}
                      <span style={{
                        marginLeft: 'auto', fontSize: 11, fontWeight: 600,
                        color: 'var(--color-text-tertiary)',
                        background: 'var(--color-surface2)', border: '1px solid var(--color-border)',
                        padding: '1px 6px', borderRadius: 8,
                      }}>
                        {(boardIssues[col.status] ?? []).length}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {!currentProject && (
          <div style={{ padding: 24, color: 'var(--color-text-secondary)' }}>Chargement du projet…</div>
        )}
      </Column>

      {modalData.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--color-surface)', borderRadius: 12, width: 400 }}>
            <IssueForm
              projectId={projectId!}
              initialData={modalData.issue}
              onSubmit={handleCreateOrUpdate}
              onCancel={() => setModalData({ open: false })}
            />
          </div>
        </div>
      )}

      <DragOverlay>
        {activeIssue ? <IssueCard issue={activeIssue} style={{ cursor: 'grabbing' }} /> : null}
      </DragOverlay>
    </DndContext>
  )
}

type BoardColumnProps = {
  status: IssueStatus
  label: string
  accent: string
  issues: IssueDTO[]
  onAskCreate: () => void
  onEditIssue: (issue: IssueDTO) => void
  onRemove: () => void
}

const BoardColumn = ({
  status, label, accent, issues, onAskCreate, onEditIssue, onRemove,
}: BoardColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: `col:${status}` })

  return (
    <div ref={setNodeRef} style={{
      background: isOver ? 'var(--color-primary50)' : 'var(--color-surface2)',
      border: `1px solid ${isOver ? 'var(--color-primary)' : 'var(--color-border)'}`,
      borderRadius: 14,
      padding: '4px 12px 12px',
      display: 'flex', flexDirection: 'column',
      width: 280, flexShrink: 0,
      transition: 'background 120ms, border-color 120ms',
    }}>
      <Row style={{ alignItems: 'center', justifyContent: 'space-between', padding: '10px 4px 12px' }}>
        <Row style={{ alignItems: 'center', gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: accent }} />
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--color-text-secondary)' }}>{label}</span>
          <span style={{
            fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)',
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            padding: '1px 7px', borderRadius: 10,
          }}>{issues.length}</span>
        </Row>
        <Row style={{ gap: 2 }}>
          <IconBtn onClick={onAskCreate} title="Ajouter une issue"><Plus size={16} /></IconBtn>
          <IconBtn onClick={onRemove} title="Masquer la colonne"><EyeOff size={15} /></IconBtn>
        </Row>
      </Row>

      <div style={{
        flex: 1, overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 10,
        paddingRight: 2,
      }}>
        <SortableContext items={issues.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {issues.map((issue) => (
            <SortableIssueCard key={issue.id} issue={issue} onEdit={() => onEditIssue(issue)} />
          ))}
        </SortableContext>

        {issues.length === 0 && (
          <div style={{
            border: '1.5px dashed var(--color-border-strong)',
            borderRadius: 10, padding: '24px 12px',
            textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 12,
          }}>Déposer ici</div>
        )}

        <button
          onClick={onAskCreate}
          style={{
            marginTop: 4, padding: '10px 12px', borderRadius: 8,
            color: 'var(--color-text-tertiary)', fontSize: 12, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'all 120ms cubic-bezier(.4,0,.2,1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-surface)'
            e.currentTarget.style.color = 'var(--color-text-secondary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--color-text-tertiary)'
          }}
        >
          <Plus size={14} /> Créer une issue
        </button>
      </div>
    </div>
  )
}

const SortableIssueCard = ({ issue, onEdit }: { issue: IssueDTO; onEdit: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: issue.id })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <IssueCard issue={issue} onClick={onEdit} />
    </div>
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

const IconBtn = ({
  children, onClick, title,
}: { children: React.ReactNode; onClick?: () => void; title?: string }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      width: 26, height: 26,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 8, color: 'var(--color-text-secondary)', background: 'transparent',
    }}
  >{children}</button>
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
