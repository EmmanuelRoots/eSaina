/**
 * Page Tempo — deux onglets :
 *   1. "Feuille de temps" : grille hebdomadaire des pointages par membre (JIRA Tempo).
 *   2. "Analytiques"     : tableau de bord des métriques (charts Recharts, inchangé).
 *
 * Place dans le flux : route privée /projects/:projectId/tempo,
 * rendu dans ProjectLayout > Outlet.
 *
 * Dépendances : Recharts, analyticsApi, worklogApi, useParams, useAuth.
 */

import { useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import analyticsApi, { type ProjectAnalyticsData } from "../../services/api/analytics.api"
import worklogApi from "../../services/api/worklog.api"
import { formatDuration } from "../../components/issue/WorkLogModal"
import type { WorkLogDTO } from "../../data/dto/worklog"
import WorkLogModal from "../../components/issue/WorkLogModal"

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------

const COLORS = {
  primary: "#6366f1",
  primaryLight: "#a5b4fc",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  purple: "#a855f7",
  pink: "#ec4899",
}

const TYPE_COLORS: Record<string, string> = {
  STORY: COLORS.info,
  TASK: COLORS.primary,
  BUG: COLORS.danger,
  EPIC: COLORS.purple,
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: COLORS.success,
  MEDIUM: COLORS.warning,
  HIGH: "#f97316",
  CRITICAL: COLORS.danger,
}

// ---------------------------------------------------------------------------
// Utilitaires date (semaine)
// ---------------------------------------------------------------------------

/** Retourne le lundi de la semaine contenant `date`. */
const getMondayOf = (date: Date): Date => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1 - day)
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Retourne un tableau des 7 jours (lun→dim) à partir du lundi donné. */
const getWeekDays = (monday: Date): Date[] =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    return d
  })

/** Formate une Date en "YYYY-MM-DD". */
const toDateKey = (d: Date): string => d.toISOString().slice(0, 10)

/** Formate une Date en "26 mai" (français court). */
const formatDayLabel = (d: Date): string =>
  d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })

/** Formate un lundi en "26 mai – 1 juin 2026". */
const formatWeekLabel = (monday: Date): string => {
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" }
  return `${monday.toLocaleDateString("fr-FR", opts)} – ${sunday.toLocaleDateString("fr-FR", { ...opts, year: "numeric" })}`
}

// ---------------------------------------------------------------------------
// Sous-composants utilitaires partagés
// ---------------------------------------------------------------------------

const EmptyState = ({ message }: { message: string }) => (
  <div style={{ textAlign: "center", padding: "32px 0", color: "var(--color-text-tertiary)", fontSize: 13 }}>
    {message}
  </div>
)

const SkeletonCard = ({ span = 1 }: { span?: number }) => (
  <div
    style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: 12,
      height: 260,
      gridColumn: `span ${span}`,
      animation: "pulse 1.5s ease-in-out infinite",
    }}
  />
)

const AnalyticsCard = ({
  title,
  children,
  style,
}: {
  title: string
  children: React.ReactNode
  style?: React.CSSProperties
}) => (
  <div
    style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: 12,
      padding: "20px 24px",
      ...style,
    }}
  >
    <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "var(--color-text)", letterSpacing: 0.2 }}>
      {title}
    </h3>
    {children}
  </div>
)

const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 8,
        padding: "10px 14px",
        boxShadow: "0 4px 16px rgba(0,0,0,.12)",
        fontSize: 13,
      }}
    >
      {label && <p style={{ margin: "0 0 6px", fontWeight: 700, color: "var(--color-text)" }}>{label}</p>}
      {payload.map((entry) => (
        <p key={entry.name} style={{ margin: "2px 0", color: entry.color, fontWeight: 500 }}>
          {entry.name} : {entry.value}
        </p>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Onglet "Analytiques" (inchangé, extrait en sous-composant)
// ---------------------------------------------------------------------------

const SprintBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    ACTIVE: { label: "Actif", bg: "#dcfce7", color: "#16a34a" },
    CLOSED: { label: "Clôturé", bg: "#f1f5f9", color: "#64748b" },
    PLANNED: { label: "Planifié", bg: "#eff6ff", color: "#3b82f6" },
  }
  const s = map[status] ?? map.PLANNED
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: s.bg, color: s.color, textTransform: "uppercase", letterSpacing: 0.5 }}>
      {s.label}
    </span>
  )
}

const AnalyticsTab = ({ data }: { data: ProjectAnalyticsData }) => {
  const sprint = data.activeSprint
  const pct = (n: number) => (sprint && sprint.total > 0 ? Math.round((n / sprint.total) * 100) : 0)
  const endDate = sprint?.endDate ? new Date(sprint.endDate) : null
  const daysLeft = endDate ? Math.ceil((endDate.getTime() - Date.now()) / 86_400_000) : null

  return (
    <div className="tempo-grid">
      {/* Vélocité */}
      <AnalyticsCard title="Vélocité par sprint" style={{ gridColumn: "span 2" }}>
        {data.velocity.length === 0 ? (
          <EmptyState message="Aucun sprint trouvé pour ce projet." />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.velocity.map((s) => ({ name: s.sprintName, Planifié: s.planned, Réalisé: s.completed, status: s.status }))} barCategoryGap="28%" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "var(--color-text-secondary)", paddingTop: 8 }} />
              <Bar dataKey="Planifié" fill={COLORS.primaryLight} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Réalisé" fill={COLORS.primary} radius={[4, 4, 0, 0]}>
                {data.velocity.map((entry, index) => (
                  <Cell key={index} fill={entry.status === "ACTIVE" ? COLORS.success : entry.status === "CLOSED" ? COLORS.primary : COLORS.primaryLight} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </AnalyticsCard>

      {/* Sprint actif */}
      <AnalyticsCard title="Sprint actif">
        {!sprint ? (
          <EmptyState message="Aucun sprint actif en ce moment." />
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: "var(--color-text)" }}>{sprint.name}</span>
              <SprintBadge status="ACTIVE" />
              {daysLeft !== null && (
                <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: daysLeft < 3 ? COLORS.danger : "var(--color-text-secondary)" }}>
                  {daysLeft > 0 ? `J-${daysLeft}` : "Dépassé"}
                </span>
              )}
            </div>
            {sprint.goal && <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 16px", fontStyle: "italic" }}>{sprint.goal}</p>}
            <div style={{ marginBottom: 16 }}>
              <div style={{ height: 8, borderRadius: 99, background: "var(--color-border)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct(sprint.done)}%`, background: COLORS.success, borderRadius: 99, transition: "width 600ms ease" }} />
              </div>
              <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "4px 0 0", textAlign: "right" }}>
                {pct(sprint.done)}% complété — {sprint.total} issues
              </p>
            </div>
            {[
              { label: "À faire", value: sprint.todo, color: "#64748b" },
              { label: "En cours", value: sprint.inProgress, color: COLORS.info },
              { label: "Terminé", value: sprint.done, color: COLORS.success },
            ].map((b) => (
              <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "var(--color-text-secondary)", width: 68 }}>{b.label}</span>
                <div style={{ flex: 1, height: 6, borderRadius: 99, background: "var(--color-border)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct(b.value)}%`, background: b.color, borderRadius: 99, transition: "width 600ms ease" }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: b.color, width: 28, textAlign: "right" }}>{b.value}</span>
              </div>
            ))}
          </>
        )}
      </AnalyticsCard>

      {/* Issues par type */}
      <AnalyticsCard title="Issues par type">
        {data.issuesByType.length === 0 ? (
          <EmptyState message="Aucune issue dans ce projet." />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data.issuesByType.map((d) => ({ name: d.label, value: d.count }))} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {data.issuesByType.map((entry, index) => (
                  <Cell key={index} fill={TYPE_COLORS[entry.label] ?? COLORS.primary} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "var(--color-text-secondary)" }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </AnalyticsCard>

      {/* Issues par priorité */}
      <AnalyticsCard title="Issues par priorité">
        {data.issuesByPriority.length === 0 ? (
          <EmptyState message="Aucune issue dans ce projet." />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart layout="vertical" data={data.issuesByPriority.map((d) => ({ name: d.label, count: d.count }))} margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" name="Issues" radius={[0, 4, 4, 0]}>
                {data.issuesByPriority.map((entry, index) => (
                  <Cell key={index} fill={PRIORITY_COLORS[entry.label] ?? COLORS.primary} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </AnalyticsCard>

      {/* Charge membres */}
      <AnalyticsCard title="Charge par membre" style={{ gridColumn: "span 2" }}>
        {data.memberWorkload.length === 0 ? (
          <EmptyState message="Aucun membre avec des issues assignées." />
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(160, data.memberWorkload.length * 44)}>
            <BarChart layout="vertical" data={data.memberWorkload.map((m) => ({ name: `${m.firstName} ${m.lastName}`, Assignées: m.assigned, Terminées: m.done }))} barCategoryGap="30%" barGap={3} margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }} axisLine={false} tickLine={false} width={110} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "var(--color-text-secondary)", paddingTop: 8 }} />
              <Bar dataKey="Assignées" fill={COLORS.primaryLight} radius={[0, 4, 4, 0]} />
              <Bar dataKey="Terminées" fill={COLORS.success} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </AnalyticsCard>

      {/* Activité hebdomadaire */}
      <AnalyticsCard title="Activité hebdomadaire (8 semaines)" style={{ gridColumn: "span 2" }}>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data.weeklyActivity}>
            <defs>
              <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2} />
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradClosed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.2} />
                <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: "var(--color-text-secondary)", paddingTop: 8 }} />
            <Area type="monotone" dataKey="created" name="Créées" stroke={COLORS.primary} strokeWidth={2} fill="url(#gradCreated)" dot={{ r: 3, fill: COLORS.primary }} />
            <Area type="monotone" dataKey="closed" name="Closes" stroke={COLORS.success} strokeWidth={2} fill="url(#gradClosed)" dot={{ r: 3, fill: COLORS.success }} />
          </AreaChart>
        </ResponsiveContainer>
      </AnalyticsCard>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Onglet "Feuille de temps"
// ---------------------------------------------------------------------------

/**
 * Construit un index {userId → {dateKey → totalMinutes}} depuis la liste de logs.
 * Utilisé pour remplir les cellules de la grille hebdomadaire.
 */
const buildTimeIndex = (
  logs: WorkLogDTO[],
): Map<string, { user: WorkLogDTO["user"]; days: Map<string, number> }> => {
  const index = new Map<string, { user: WorkLogDTO["user"]; days: Map<string, number> }>()
  for (const log of logs) {
    if (!index.has(log.userId)) {
      index.set(log.userId, { user: log.user, days: new Map() })
    }
    const entry = index.get(log.userId)!
    const key = toDateKey(new Date(log.date))
    entry.days.set(key, (entry.days.get(key) ?? 0) + log.timeSpentMinutes)
  }
  return index
}

interface DayCellDetail {
  userId: string
  dateKey: string
}

const TimesheetTab = ({ projectId }: { projectId: string }) => {
  const [monday, setMonday] = useState<Date>(() => getMondayOf(new Date()))
  const [logs, setLogs] = useState<WorkLogDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [quickLogCell, setQuickLogCell] = useState<DayCellDetail | null>(null)

  const weekDays = useMemo(() => getWeekDays(monday), [monday])
  const from = toDateKey(weekDays[0])
  const to = toDateKey(weekDays[6])

  // Référence stable pour éviter la re-exécution de l'effect si from/to string identiques
  const rangeKey = `${from}_${to}`
  const prevRangeKey = useRef("")

  useEffect(() => {
    if (rangeKey === prevRangeKey.current) return
    prevRangeKey.current = rangeKey
    setLoading(true)
    worklogApi
      .listByProject(projectId, { from, to })
      .then(setLogs)
      .finally(() => setLoading(false))
  }, [projectId, rangeKey])

  const timeIndex = useMemo(() => buildTimeIndex(logs), [logs])

  // Totaux par colonne (jour)
  const dayTotals = useMemo(
    () =>
      weekDays.map((d) => {
        const key = toDateKey(d)
        let total = 0
        for (const { days } of timeIndex.values()) {
          total += days.get(key) ?? 0
        }
        return total
      }),
    [weekDays, timeIndex],
  )

  const grandTotal = dayTotals.reduce((a, b) => a + b, 0)

  const handleQuickLogSuccess = (newLog: WorkLogDTO) => {
    setLogs((prev) => {
      const idx = prev.findIndex((l) => l.id === newLog.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = newLog
        return next
      }
      return [...prev, newLog]
    })
    setQuickLogCell(null)
  }

  // Cellule cliquable → ouvre WorkLogModal avec issueId non connu à ce niveau,
  // donc on ouvre une modal sans issueId (sera géré à la sélection d'issue si besoin)
  // Pour l'instant, on ouvre le modal de création "libre" depuis la feuille de temps.
  // Note : sans issueId connu depuis la feuille de temps, le bouton ouvre uniquement
  // le modal si une issue peut être identifiée — on désactive le clic sur cellule vide
  // pour l'instant (le flux normal est WorkLogList depuis une issue).

  return (
    <div>
      {/* Navigateur de semaine */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => setMonday((m) => { const d = new Date(m); d.setDate(d.getDate() - 7); return d })}
          style={navBtnStyle}
        >
          ← Semaine préc.
        </button>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)" }}>
          {formatWeekLabel(monday)}
        </span>
        <button
          onClick={() => setMonday((m) => { const d = new Date(m); d.setDate(d.getDate() + 7); return d })}
          style={navBtnStyle}
        >
          Semaine suiv. →
        </button>
        <button
          onClick={() => setMonday(getMondayOf(new Date()))}
          style={{ ...navBtnStyle, marginLeft: "auto", color: COLORS.primary, borderColor: COLORS.primary }}
        >
          Aujourd'hui
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--color-text-tertiary)", fontSize: 13 }}>
          Chargement…
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                {/* Colonne membre */}
                <th style={{ ...thStyle, width: 180, textAlign: "left" }}>Membre</th>
                {weekDays.map((d, i) => {
                  const isToday = toDateKey(d) === toDateKey(new Date())
                  return (
                    <th
                      key={i}
                      style={{
                        ...thStyle,
                        color: isToday ? COLORS.primary : undefined,
                        borderBottom: isToday ? `2px solid ${COLORS.primary}` : undefined,
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 400, color: "var(--color-text-tertiary)" }}>
                        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"][i]}
                      </div>
                      <div>{formatDayLabel(d)}</div>
                    </th>
                  )
                })}
                {/* Colonne total */}
                <th style={{ ...thStyle, color: "var(--color-text-secondary)" }}>Total</th>
              </tr>
            </thead>

            <tbody>
              {timeIndex.size === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "32px 0", color: "var(--color-text-tertiary)", fontSize: 13 }}>
                    Aucun pointage cette semaine.
                  </td>
                </tr>
              ) : (
                Array.from(timeIndex.entries()).map(([userId, { user, days }]) => {
                  const rowTotal = Array.from(days.values()).reduce((a, b) => a + b, 0)
                  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()

                  return (
                    <tr key={userId}>
                      {/* Cellule membre */}
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {user.pdpUrl ? (
                            <img src={user.pdpUrl} alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: COLORS.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                              {initials}
                            </div>
                          )}
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)" }}>
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </td>

                      {/* Cellules jours */}
                      {weekDays.map((d, i) => {
                        const key = toDateKey(d)
                        const mins = days.get(key) ?? 0
                        const isToday = key === toDateKey(new Date())
                        const isWeekend = i >= 5

                        return (
                          <td
                            key={i}
                            style={{
                              ...tdStyle,
                              textAlign: "center",
                              background: isToday
                                ? "rgba(99,102,241,.06)"
                                : isWeekend
                                  ? "var(--color-surface2)"
                                  : undefined,
                            }}
                          >
                            {mins > 0 ? (
                              <span
                                style={{
                                  display: "inline-block",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: COLORS.primary,
                                  background: "rgba(99,102,241,.1)",
                                  padding: "2px 8px",
                                  borderRadius: 20,
                                }}
                              >
                                {formatDuration(mins)}
                              </span>
                            ) : (
                              <span style={{ color: "var(--color-border)", fontSize: 16 }}>—</span>
                            )}
                          </td>
                        )
                      })}

                      {/* Total ligne */}
                      <td style={{ ...tdStyle, textAlign: "center", fontWeight: 700, fontSize: 13, color: "var(--color-text)" }}>
                        {rowTotal > 0 ? formatDuration(rowTotal) : "—"}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>

            {/* Ligne de totaux par jour */}
            {timeIndex.size > 0 && (
              <tfoot>
                <tr style={{ borderTop: "2px solid var(--color-border)" }}>
                  <td style={{ ...tdStyle, fontWeight: 700, fontSize: 12, color: "var(--color-text-secondary)" }}>
                    Total
                  </td>
                  {dayTotals.map((total, i) => (
                    <td key={i} style={{ ...tdStyle, textAlign: "center", fontWeight: 700, fontSize: 12, color: total > 0 ? "var(--color-text)" : "var(--color-border)" }}>
                      {total > 0 ? formatDuration(total) : "—"}
                    </td>
                  ))}
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 800, fontSize: 13, color: COLORS.primary }}>
                    {grandTotal > 0 ? formatDuration(grandTotal) : "—"}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* Modal de pointage rapide (déclenché depuis la grille si applicable) */}
      {quickLogCell && (
        <WorkLogModal
          isOpen
          onClose={() => setQuickLogCell(null)}
          onSuccess={handleQuickLogSuccess}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------

type Tab = "timesheet" | "analytics"

/**
 * Page Tempo avec onglets "Feuille de temps" et "Analytiques".
 *
 * Charge les données analytiques uniquement lors du premier accès à l'onglet
 * Analytiques (lazy load) pour ne pas pénaliser l'onglet feuille de temps.
 */
const Tempo = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const [tab, setTab] = useState<Tab>("timesheet")
  const [analyticsData, setAnalyticsData] = useState<ProjectAnalyticsData | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)
  const analyticsLoaded = useRef(false)

  // Charge les analytics lors du premier switch vers l'onglet analytiques
  useEffect(() => {
    if (tab !== "analytics" || analyticsLoaded.current || !projectId) return
    analyticsLoaded.current = true
    setAnalyticsLoading(true)
    analyticsApi
      .getProjectAnalytics(projectId)
      .then(setAnalyticsData)
      .catch(() => setAnalyticsError("Impossible de charger les métriques."))
      .finally(() => setAnalyticsLoading(false))
  }, [tab, projectId])

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "24px", background: "var(--color-bg)" }}>
      {/* En-tête */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--color-text)" }}>Tempo</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)" }}>
          Saisie des tempos et métriques du projet.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 24, borderBottom: "1px solid var(--color-border)" }}>
        {(["timesheet", "analytics"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              background: "none",
              border: "none",
              borderBottom: tab === t ? `2px solid ${COLORS.primary}` : "2px solid transparent",
              color: tab === t ? COLORS.primary : "var(--color-text-secondary)",
              cursor: "pointer",
              marginBottom: -1,
            }}
          >
            {t === "timesheet" ? "Feuille de temps" : "Analytiques"}
          </button>
        ))}
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .tempo-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) {
          .tempo-grid { grid-template-columns: 1fr; }
          .tempo-grid > * { grid-column: span 1 !important; }
        }
      `}</style>

      {/* Contenu */}
      {tab === "timesheet" && projectId && (
        <TimesheetTab projectId={projectId} />
      )}

      {tab === "analytics" && (
        analyticsLoading ? (
          <div className="tempo-grid">
            {[2, 1, 1, 1, 1, 2, 2].map((span, i) => <SkeletonCard key={i} span={span} />)}
          </div>
        ) : analyticsError ? (
          <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "14px 18px", color: "#dc2626", fontSize: 13 }}>
            {analyticsError}
          </div>
        ) : analyticsData ? (
          <AnalyticsTab data={analyticsData} />
        ) : null
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Styles tableau
// ---------------------------------------------------------------------------

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 13,
  minWidth: 700,
}

const thStyle: React.CSSProperties = {
  padding: "10px 12px",
  textAlign: "center",
  fontSize: 12,
  fontWeight: 700,
  color: "var(--color-text)",
  borderBottom: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  whiteSpace: "nowrap",
}

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid var(--color-border)",
  verticalAlign: "middle",
}

const navBtnStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  padding: "6px 12px",
  border: "1px solid var(--color-border)",
  borderRadius: 6,
  background: "var(--color-surface)",
  color: "var(--color-text)",
  cursor: "pointer",
}

export default Tempo
