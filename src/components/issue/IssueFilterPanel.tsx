/**
 * Panneau de filtres multi-critères pour les issues.
 *
 * Exposé par ce module :
 *  - IssueFilterState    : type de l'état de filtrage
 *  - DEFAULT_FILTERS     : état vide (aucun filtre actif)
 *  - countActiveFilters  : nombre de filtres actifs (pour le badge)
 *  - applyIssueFilters   : prédicat à appliquer sur chaque IssueDTO
 *  - IssueFilterPanel    : composant bouton + dropdown
 *
 * Utilisé par les vues Board et Backlog.
 */
import { useRef, useState, useEffect } from "react"
import { SlidersHorizontal, X, Check } from "lucide-react"
import {
  IssueType, IssuePriority,
  type IssueLabelDTO, type IssueDTO,
} from "../../data/dto/issue"
import type { UserDTO } from "../../data/dto/user"
import { TypeIcon } from "./TypeIcon"
import { PriorityIcon } from "./PriorityIcon"
import { Avatar } from "../avatar"
import { ISSUE_TYPE_META, PRIORITY_META } from "./meta"

/** État complet des filtres actifs. Les tableaux vides = filtre désactivé. */
export interface IssueFilterState {
  types: IssueType[]
  priorities: IssuePriority[]
  /** IDs des assignés ; chaîne vide '' = issues non assignées. */
  assigneeIds: string[]
  labelIds: string[]
  /** null = tous, 'yes' = avec points, 'no' = sans points. */
  hasPoints: 'yes' | 'no' | null
}

/** Valeur initiale : aucun filtre actif. */
export const DEFAULT_FILTERS: IssueFilterState = {
  types: [],
  priorities: [],
  assigneeIds: [],
  labelIds: [],
  hasPoints: null,
}

/**
 * Retourne le nombre de critères de filtre actifs (hors recherche textuelle).
 * Utilisé pour afficher le badge sur le bouton Filtres.
 */
export const countActiveFilters = (f: IssueFilterState): number =>
  f.types.length +
  f.priorities.length +
  f.assigneeIds.length +
  f.labelIds.length +
  (f.hasPoints ? 1 : 0)

/**
 * Prédicat de filtrage à appliquer sur chaque issue.
 *
 * @param issue   - Issue à évaluer.
 * @param filters - État courant des filtres.
 * @param searchQ - Texte de recherche libre (testé sur titre et clé).
 * @returns true si l'issue satisfait tous les critères actifs.
 */
export const applyIssueFilters = (
  issue: IssueDTO,
  filters: IssueFilterState,
  searchQ: string,
): boolean => {
  const q = searchQ.trim().toLowerCase()
  if (q && !issue.title.toLowerCase().includes(q) && !issue.key.toLowerCase().includes(q)) return false
  if (filters.types.length && !filters.types.includes(issue.type)) return false
  if (filters.priorities.length && !filters.priorities.includes(issue.priority)) return false
  if (filters.assigneeIds.length) {
    const aid = issue.assigneeId || issue.assignee?.id || null
    if (!filters.assigneeIds.includes(aid ?? '')) return false
  }
  if (filters.labelIds.length) {
    const labelIds = (issue.labels ?? []).map(l => l.id)
    if (!filters.labelIds.some(id => labelIds.includes(id))) return false
  }
  if (filters.hasPoints === 'yes' && !(issue.storyPoints != null && issue.storyPoints > 0)) return false
  if (filters.hasPoints === 'no' && issue.storyPoints != null && issue.storyPoints > 0) return false
  return true
}

interface IssueFilterPanelProps {
  filters: IssueFilterState
  onChange: (f: IssueFilterState) => void
  /** Membres de l'équipe disponibles pour le filtre « Assigné ». */
  teamMembers: Partial<UserDTO>[]
  /** Tous les labels présents dans les issues courantes. */
  allLabels: IssueLabelDTO[]
}

/**
 * Bouton « Filtres » avec dropdown multi-critères.
 * Affiche un badge numérique avec le nombre de filtres actifs.
 *
 * @param filters     - État courant des filtres.
 * @param onChange    - Callback appelé à chaque modification.
 * @param teamMembers - Membres disponibles pour le filtre assigné.
 * @param allLabels   - Labels disponibles pour le filtre labels.
 */
export const IssueFilterPanel = ({
  filters, onChange, teamMembers, allLabels,
}: IssueFilterPanelProps) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const count = countActiveFilters(filters)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  /* Helpers de toggle pour chaque champ tableau */
  const toggleType = (k: IssueType) =>
    onChange({ ...filters, types: filters.types.includes(k) ? filters.types.filter(x => x !== k) : [...filters.types, k] })

  const togglePriority = (k: IssuePriority) =>
    onChange({ ...filters, priorities: filters.priorities.includes(k) ? filters.priorities.filter(x => x !== k) : [...filters.priorities, k] })

  const toggleAssignee = (id: string) =>
    onChange({ ...filters, assigneeIds: filters.assigneeIds.includes(id) ? filters.assigneeIds.filter(x => x !== id) : [...filters.assigneeIds, id] })

  const toggleLabel = (id: string) =>
    onChange({ ...filters, labelIds: filters.labelIds.includes(id) ? filters.labelIds.filter(x => x !== id) : [...filters.labelIds, id] })

  const reset = () => onChange(DEFAULT_FILTERS)

  const isActive = open || count > 0

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      {/* Bouton déclencheur */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '0 12px', height: 36, borderRadius: 8,
          fontSize: 12, fontWeight: 600,
          background: isActive ? 'var(--color-primary50)' : 'var(--color-surface)',
          color: isActive ? 'var(--color-primary-hover)' : 'var(--color-text)',
          border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
          transition: 'all 120ms',
          cursor: 'pointer',
        }}
      >
        <SlidersHorizontal size={14} />
        Filtres
        {count > 0 && (
          <span style={{
            minWidth: 18, height: 18, borderRadius: 9,
            background: 'var(--color-primary)', color: 'white',
            fontSize: 10, fontWeight: 800,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px',
          }}>{count}</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 42, left: 0, zIndex: 80,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          padding: '12px 14px',
          width: 310,
          boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          {/* En-tête */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: 0.8, color: 'var(--color-text)',
            }}>Filtres</span>
            {count > 0 && (
              <button
                onClick={reset}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 11, fontWeight: 600,
                  color: 'var(--color-text-secondary)', cursor: 'pointer',
                }}
              >
                <X size={12} />Réinitialiser ({count})
              </button>
            )}
          </div>

          <FilterSep />

          {/* Type */}
          <FilterSection label="Type">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(Object.entries(ISSUE_TYPE_META) as [IssueType, typeof ISSUE_TYPE_META[IssueType]][]).map(([k, meta]) => (
                <ChipBtn
                  key={k}
                  active={filters.types.includes(k)}
                  color={meta.color}
                  onClick={() => toggleType(k)}
                >
                  <TypeIcon type={k} size={11} />
                  {meta.label}
                </ChipBtn>
              ))}
            </div>
          </FilterSection>

          <FilterSep />

          {/* Priorité */}
          <FilterSection label="Priorité">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(Object.entries(PRIORITY_META) as [IssuePriority, typeof PRIORITY_META[IssuePriority]][]).map(([k, meta]) => (
                <ChipBtn
                  key={k}
                  active={filters.priorities.includes(k)}
                  color={meta.color}
                  onClick={() => togglePriority(k)}
                >
                  <PriorityIcon priority={k} size={12} />
                  {meta.label}
                </ChipBtn>
              ))}
            </div>
          </FilterSection>

          {teamMembers.length > 0 && (
            <>
              <FilterSep />
              {/* Assigné */}
              <FilterSection label="Assigné">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 150, overflowY: 'auto' }}>
                  <AssigneeRow
                    id=""
                    label="Non assigné"
                    active={filters.assigneeIds.includes('')}
                    onClick={() => toggleAssignee('')}
                  />
                  {teamMembers.map(m => (
                    <AssigneeRow
                      key={m.id}
                      id={m.id ?? ''}
                      label={[m.firstName, m.lastName].filter(Boolean).join(' ') || m.email || ''}
                      user={m}
                      active={filters.assigneeIds.includes(m.id ?? '')}
                      onClick={() => toggleAssignee(m.id ?? '')}
                    />
                  ))}
                </div>
              </FilterSection>
            </>
          )}

          {allLabels.length > 0 && (
            <>
              <FilterSep />
              {/* Labels */}
              <FilterSection label="Labels">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {allLabels.map(l => {
                    const active = filters.labelIds.includes(l.id)
                    return (
                      <button
                        key={l.id}
                        onClick={() => toggleLabel(l.id)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '3px 9px', borderRadius: 12,
                          fontSize: 11, fontWeight: 600,
                          background: active ? `${l.color}20` : 'var(--color-surface2)',
                          color: active ? l.color : 'var(--color-text-secondary)',
                          border: `1.5px solid ${active ? l.color : 'var(--color-border)'}`,
                          cursor: 'pointer', transition: 'all 100ms',
                        }}
                      >
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: l.color, flexShrink: 0,
                        }} />
                        {l.name}
                        {active && <Check size={10} />}
                      </button>
                    )
                  })}
                </div>
              </FilterSection>
            </>
          )}

          <FilterSep />

          {/* Story points */}
          <FilterSection label="Story points">
            <div style={{ display: 'flex', gap: 6 }}>
              {(['yes', 'no', null] as const).map(v => {
                const active = filters.hasPoints === v
                return (
                  <button
                    key={String(v)}
                    onClick={() => onChange({ ...filters, hasPoints: active ? null : v })}
                    style={{
                      flex: 1, padding: '5px 6px', borderRadius: 6,
                      fontSize: 11, fontWeight: 600,
                      background: active ? 'var(--color-primary50)' : 'var(--color-surface2)',
                      color: active ? 'var(--color-primary-hover)' : 'var(--color-text-secondary)',
                      border: `1.5px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      cursor: 'pointer', transition: 'all 100ms',
                    }}
                  >
                    {v === 'yes' ? 'Avec pts' : v === 'no' ? 'Sans pts' : 'Tous'}
                  </button>
                )
              })}
            </div>
          </FilterSection>
        </div>
      )}
    </div>
  )
}

/* --- Sous-composants internes --- */

const FilterSep = () => (
  <div style={{ height: 1, background: 'var(--color-border)', margin: '0 -2px' }} />
)

const FilterSection = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <span style={{
      fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: 0.8, color: 'var(--color-text-tertiary)',
    }}>{label}</span>
    {children}
  </div>
)

const ChipBtn = ({
  active, color, onClick, children,
}: { active: boolean; color: string; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 6,
      fontSize: 11, fontWeight: 600,
      background: active ? `${color}18` : 'var(--color-surface2)',
      color: active ? color : 'var(--color-text-secondary)',
      border: `1.5px solid ${active ? color : 'var(--color-border)'}`,
      cursor: 'pointer', transition: 'all 100ms',
    }}
  >
    {children}
    {active && <Check size={10} color={color} />}
  </button>
)

const AssigneeRow = ({
  label, user, active, onClick,
}: {
  id: string
  label: string
  user?: Partial<UserDTO>
  active: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--color-surface2)' }}
    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
    style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '5px 8px', borderRadius: 7,
      background: active ? 'var(--color-primary50)' : 'transparent',
      color: active ? 'var(--color-primary-hover)' : 'var(--color-text)',
      fontSize: 12, fontWeight: active ? 600 : 500,
      width: '100%', textAlign: 'left',
      border: `1.5px solid ${active ? 'var(--color-primary)' : 'transparent'}`,
      cursor: 'pointer', transition: 'all 100ms',
    }}
  >
    {user ? (
      <Avatar user={user} size={22} />
    ) : (
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        border: '1.5px dashed var(--color-border-strong)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, color: 'var(--color-text-tertiary)', flexShrink: 0,
      }}>?</div>
    )}
    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
    {active && <Check size={12} color="var(--color-primary)" />}
  </button>
)
