import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import {
  Search, Plus, Play, Square, ChevronDown, ChevronRight, Flag, CalendarClock,
  Inbox, GripVertical, MoreHorizontal, ArrowDownUp, User,
} from "lucide-react"
import { useProject } from "../../context/project/useProject"
import {
  IssueStatus, IssueType, type IssueDTO, type CreateIssueRequestDTO, type UpdateIssueRequestDTO
} from "../../data/dto/issue"
import { SprintStatus, type SprintDTO } from "../../data/dto/sprint"
import Row from "../../components/row"
import { Avatar } from "../../components/avatar"
import { TypeIcon } from "../../components/issue/TypeIcon"
import { ISSUE_TYPE_META } from "../../components/issue/meta"
import { PriorityIcon } from "../../components/issue/PriorityIcon"
import { IssueLabel } from "../../components/issue/IssueLabel"
import { Points } from "../../components/issue/Points"
import { IssueForm } from "../../components/issue/IssueForm"

const STATUS_LABEL: Record<IssueStatus, string> = {
  [IssueStatus.TODO]: 'À faire',
  [IssueStatus.IN_PROGRESS]: 'En cours',
  [IssueStatus.IN_REVIEW]: 'En révision',
  [IssueStatus.DONE]: 'Terminé',
  [IssueStatus.CANCELLED]: 'Annulé',
}

const formatDate = (iso?: string | null) => iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : null

const BacklogIssueRow = ({ issue, isLast, onClick }: { issue: IssueDTO; isLast: boolean; onClick?: () => void }) => (
  <div
    onClick={onClick}
    style={{
      padding: '8px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
      transition: 'background 100ms cubic-bezier(.4,0,.2,1)',
      cursor: 'pointer',
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface2)'}
    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
  >
    <GripVertical size={14} color="var(--color-text-tertiary)" />
    <TypeIcon type={issue.type} size={12} />
    <span style={{
      fontSize: 12, fontFamily: 'var(--font-mono)',
      color: 'var(--color-text-tertiary)', fontWeight: 500, minWidth: 70,
    }}>{issue.key}</span>
    <span style={{
      fontSize: 13, color: 'var(--color-text)', fontWeight: 500, flex: 1,
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    }}>{issue.title}</span>
    <Row style={{ gap: 4 }}>
      {(issue.labels ?? []).slice(0, 2).map((l) => <IssueLabel key={l.id} label={l} />)}
    </Row>
    <PriorityIcon priority={issue.priority} size={14} />
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
      background: 'var(--color-surface2)',
      border: '1px solid var(--color-border)',
      color: 'var(--color-text-secondary)',
      minWidth: 80, textAlign: 'center',
    }}>{STATUS_LABEL[issue.status]}</span>
    {issue.storyPoints != null && <Points value={issue.storyPoints} />}
    <div style={{ width: 32, display: 'flex', justifyContent: 'flex-end' }}>
      {issue.assignee ? <Avatar user={issue.assignee} size={24} /> : (
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          border: '1.5px dashed var(--color-border-strong)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-text-tertiary)',
        }}>
          <User size={12} />
        </div>
      )}
    </div>
    <button style={{ color: 'var(--color-text-tertiary)', padding: 4 }}>
      <MoreHorizontal size={14} />
    </button>
  </div>
)

type SprintWithIssues = SprintDTO & { issues: IssueDTO[] }

const SprintSection = ({
  sprint, issues, defaultOpen, onCreateIssue, onStart, onClose, onEditIssue,
}: { 
  sprint: SprintWithIssues; 
  issues: IssueDTO[]; 
  defaultOpen: boolean; 
  onCreateIssue: () => void;
  onStart: () => void;
  onClose: () => void;
  onEditIssue: (issue: IssueDTO) => void;
}) => {
  const [open, setOpen] = useState(defaultOpen)
  const totalPoints = issues.reduce((s, i) => s + (i.storyPoints ?? 0), 0)
  const donePoints = issues.filter((i) => i.status === IssueStatus.DONE).reduce((s, i) => s + (i.storyPoints ?? 0), 0)
  const inProgress = issues.filter((i) => i.status === IssueStatus.IN_PROGRESS || i.status === IssueStatus.IN_REVIEW).length
  const todo = issues.filter((i) => i.status === IssueStatus.TODO).length
  const done = issues.filter((i) => i.status === IssueStatus.DONE).length
  const isActive = sprint.status === SprintStatus.ACTIVE
  const n = issues.length || 1

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 14, overflow: 'hidden',
      boxShadow: 'var(--shadow-xs)',
    }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          textAlign: 'left',
          cursor: 'pointer',
          background: isActive ? 'linear-gradient(90deg, rgba(16,185,129,0.06), transparent 60%)' : 'transparent',
        }}
      >
        {open ? <ChevronDown size={16} color="var(--color-text-tertiary)" /> : <ChevronRight size={16} color="var(--color-text-tertiary)" />}
        {isActive
          ? <Flag size={18} color="var(--color-primary)" strokeWidth={2.4} />
          : <CalendarClock size={18} color="var(--color-text-tertiary)" strokeWidth={2.4} />
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          <Row style={{ alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>{sprint.name}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
              padding: '2px 8px', borderRadius: 4,
              background: isActive ? 'var(--color-primary50)' : 'var(--color-surface2)',
              color: isActive ? 'var(--color-primary-hover)' : 'var(--color-text-secondary)',
              border: isActive ? 'none' : '1px solid var(--color-border)',
              textTransform: 'uppercase',
            }}>{isActive ? '● Actif' : sprint.status === SprintStatus.PLANNED ? 'Planifié' : 'Clos'}</span>
            {(sprint.startDate || sprint.endDate) && (
              <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                {formatDate(sprint.startDate)} → {formatDate(sprint.endDate)}
              </span>
            )}
          </Row>
          {sprint.goal && (
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{sprint.goal}</div>
          )}
        </div>

        {issues.length > 0 && (
          <Row style={{ alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', height: 8, width: 200, borderRadius: 4, overflow: 'hidden', background: 'var(--color-surface2)' }}>
              <div style={{ width: `${(todo / n) * 100}%`, background: '#cbd5e1' }} title={`${todo} à faire`} />
              <div style={{ width: `${(inProgress / n) * 100}%`, background: 'var(--color-secondary)' }} title={`${inProgress} en cours`} />
              <div style={{ width: `${(done / n) * 100}%`, background: 'var(--color-primary)' }} title={`${done} terminés`} />
            </div>
            <Row style={{ gap: 6, fontSize: 11, fontWeight: 700 }}>
              <SwatchCount color="#cbd5e1" n={todo} />
              <SwatchCount color="var(--color-secondary)" n={inProgress} />
              <SwatchCount color="var(--color-primary)" n={done} />
            </Row>
          </Row>
        )}

        <div style={{
          padding: '4px 10px', borderRadius: 6,
          background: 'var(--color-surface2)', border: '1px solid var(--color-border)',
          fontSize: 12, fontWeight: 700, color: 'var(--color-text)',
          minWidth: 70, textAlign: 'center',
        }}>
          {donePoints}<span style={{ color: 'var(--color-text-tertiary)' }}> / {totalPoints} pts</span>
        </div>

        {isActive ? (
          <button 
            onClick={(e) => { e.stopPropagation(); onClose() }}
            style={btnSecondaryStyle}
          >
            <Square size={14} />Terminer
          </button>
        ) : sprint.status === SprintStatus.PLANNED ? (
          <button 
            onClick={(e) => { e.stopPropagation(); onStart() }}
            style={btnPrimaryStyle}
          >
            <Play size={14} />Lancer
          </button>
        ) : null}
      </div>

      {open && (
        <div style={{ borderTop: '1px solid var(--color-border)' }}>
          {issues.map((issue, i) => (
            <BacklogIssueRow 
              key={issue.id} 
              issue={issue} 
              isLast={i === issues.length - 1} 
              onClick={() => onEditIssue(issue)}
            />
          ))}
          {issues.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 12 }}>
              Aucune issue dans ce sprint
            </div>
          )}
          <button 
            onClick={onCreateIssue}
            style={{
            padding: '10px 16px', width: '100%',
            display: 'flex', alignItems: 'center', gap: 8,
            color: 'var(--color-text-tertiary)', fontSize: 13, fontWeight: 600,
            borderTop: '1px solid var(--color-border)',
          }}>
            <Plus size={14} /> Créer une issue
          </button>
        </div>
      )}
    </div>
  )
}

const SwatchCount = ({ color, n }: { color: string; n: number }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--color-text-secondary)' }}>
    <span style={{ width: 8, height: 8, borderRadius: 2, background: color }} />{n}
  </span>
)

const BacklogPanel = ({ 
  issues, 
  defaultOpen, 
  onCreateIssue, 
  onCreateSprint,
  onEditIssue,
}: { 
  issues: IssueDTO[]; 
  defaultOpen: boolean; 
  onCreateIssue: () => void;
  onCreateSprint: () => void;
  onEditIssue: (issue: IssueDTO) => void;
}) => {
  const [open, setOpen] = useState(defaultOpen)
  const totalPoints = issues.reduce((s, i) => s + (i.storyPoints ?? 0), 0)
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 14, overflow: 'hidden',
      boxShadow: 'var(--shadow-xs)',
    }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', cursor: 'pointer' }}
      >
        {open ? <ChevronDown size={16} color="var(--color-text-tertiary)" /> : <ChevronRight size={16} color="var(--color-text-tertiary)" />}
        <Inbox size={18} color="var(--color-text-tertiary)" strokeWidth={2.4} />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Backlog</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginLeft: 8 }}>
            {issues.length} issues · {totalPoints} pts à planifier
          </span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onCreateSprint() }}
          style={btnSecondaryStyle}
        >
          <Plus size={14} />Créer un sprint
        </button>
      </div>
      {open && (
        <div style={{ borderTop: '1px solid var(--color-border)' }}>
          {issues.map((issue, i) => (
            <BacklogIssueRow 
              key={issue.id} 
              issue={issue} 
              isLast={i === issues.length - 1} 
              onClick={() => onEditIssue(issue)}
            />
          ))}
          {issues.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 13 }}>
              Aucune issue dans le backlog
            </div>
          )}
          <button 
            onClick={onCreateIssue}
            style={{
            padding: '10px 16px', width: '100%',
            display: 'flex', alignItems: 'center', gap: 8,
            color: 'var(--color-text-tertiary)', fontSize: 13, fontWeight: 600,
            borderTop: '1px solid var(--color-border)',
          }}>
            <Plus size={14} /> Créer une issue
          </button>
        </div>
      )}
    </div>
  )
}

const Backlog = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const { 
    backlogIssues, sprints, fetchBacklog, fetchProjectData, 
    createIssue, updateIssue, createSprint, startSprint, closeSprint 
  } = useProject()
  const [searchQ, setSearchQ] = useState('')
  const [typeFilter, setTypeFilter] = useState<IssueType | null>(null)
  const [modalData, setModalData] = useState<{ open: boolean; sprintId?: string | null; issue?: IssueDTO }>({ open: false })

  const handleCreateOrUpdate = async (data: CreateIssueRequestDTO | UpdateIssueRequestDTO) => {
    if (modalData.issue) {
      await updateIssue(modalData.issue.id, data as UpdateIssueRequestDTO)
    } else {
      await createIssue(data as CreateIssueRequestDTO)
    }
    
    if (projectId) {
      await fetchBacklog(projectId)
    }
    setModalData({ open: false })
  }

  const handleCreateSprint = async () => {
    if (projectId) {
      await createSprint(projectId)
    }
  }

  useEffect(() => {
    if (projectId) {
      fetchProjectData(projectId)
      fetchBacklog(projectId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const filter = (i: IssueDTO) => {
    const q = searchQ.toLowerCase()
    const hitText = !q || i.title.toLowerCase().includes(q) || i.key.toLowerCase().includes(q)
    const hitType = !typeFilter || i.type === typeFilter
    return hitText && hitType
  }

  return (
    <div style={{ height: 'calc(100vh - 60px)', overflowY: 'auto' }}>
      {/* Toolbar */}
      <div style={{
        padding: '16px 24px 0',
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          height: 36, padding: '0 12px', width: 300,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)', borderRadius: 8,
        }}>
          <Search size={14} color="var(--color-text-tertiary)" />
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Rechercher dans le backlog…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--color-text)' }}
          />
        </div>

        <div style={{
          display: 'flex', gap: 4, padding: 4,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)', borderRadius: 10,
        }}>
          {(Object.entries(ISSUE_TYPE_META) as Array<[IssueType, typeof ISSUE_TYPE_META[IssueType]]>).map(([key, meta]) => {
            const active = typeFilter === key
            return (
              <button
                key={key}
                onClick={() => setTypeFilter(active ? null : key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 10px', borderRadius: 6,
                  background: active ? 'var(--color-primary50)' : 'transparent',
                  color: active ? 'var(--color-primary-hover)' : 'var(--color-text-secondary)',
                  fontSize: 12, fontWeight: 600,
                }}
              >
                <TypeIcon type={key} size={10} /> {meta.label}
              </button>
            )
          })}
        </div>

        <span style={{ flex: 1 }} />
        <button style={btnSecondaryStyle}><ArrowDownUp size={14} />Trier</button>
        <button 
          onClick={() => setModalData({ open: true })}
          style={btnPrimaryStyle}
        >
          <Plus size={14} />Issue rapide
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {sprints.map((sprint) => (
          <SprintSection
            key={sprint.id}
            sprint={sprint}
            issues={sprint.issues.filter(filter)}
            defaultOpen={sprint.status === SprintStatus.ACTIVE}
            onCreateIssue={() => setModalData({ open: true, sprintId: sprint.id })}
            onStart={() => sprint.id && startSprint(sprint.id)}
            onClose={() => sprint.id && closeSprint(sprint.id)}
            onEditIssue={(issue) => setModalData({ open: true, issue })}
          />
        ))}
        <BacklogPanel 
          issues={backlogIssues.filter(filter)} 
          defaultOpen={true} 
          onCreateIssue={() => setModalData({ open: true })} 
          onCreateSprint={handleCreateSprint}
          onEditIssue={(issue) => setModalData({ open: true, issue })}
        />
      </div>

      {modalData.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--color-surface)', borderRadius: 12, width: 400 }}>
            <IssueForm 
              projectId={projectId!} 
              sprintId={modalData.sprintId} 
              initialData={modalData.issue}
              onSubmit={handleCreateOrUpdate} 
              onCancel={() => setModalData({ open: false })} 
            />
          </div>
        </div>
      )}
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

export default Backlog
