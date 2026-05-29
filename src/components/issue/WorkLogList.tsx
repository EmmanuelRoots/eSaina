/**
 * WorkLogList — liste des pointages de temps sur une issue.
 *
 * Affiche :
 *  - La barre de progression temps passé / temps estimé.
 *  - La liste des pointages avec avatar, auteur, durée, date, description.
 *  - Les boutons éditer / supprimer (visibles uniquement pour l'auteur du pointage).
 *  - Un bouton "+ Pointer du temps" pour ajouter un nouveau pointage.
 *
 * Place dans le flux : affiché dans le détail d'une issue.
 * Dépendances : worklog.api, WorkLogModal, useAuth (contexte user), WorkLogDTO.
 */

import { useEffect, useState } from "react"
import worklogApi from "../../services/api/worklog.api"
import WorkLogModal, { formatDuration } from "./WorkLogModal"
import type { WorkLogDTO } from "../../data/dto/worklog"
import { UseAuth } from "../../context/user"

// ---------------------------------------------------------------------------
// Sous-composant : barre de progression temps passé / estimé
// ---------------------------------------------------------------------------

/**
 * Barre de progression visuelle du temps logué vs estimé.
 * Si estimé = null, affiche uniquement le total logué.
 */
const TimeProgress = ({
  spentMinutes,
  estimatedMinutes,
}: {
  spentMinutes: number
  estimatedMinutes?: number | null
}) => {
  const pct =
    estimatedMinutes && estimatedMinutes > 0
      ? Math.min(Math.round((spentMinutes / estimatedMinutes) * 100), 100)
      : null

  const overrun = estimatedMinutes ? spentMinutes > estimatedMinutes : false

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          Temps logué :{" "}
          <strong style={{ color: "var(--color-text)" }}>
            {formatDuration(spentMinutes)}
          </strong>
        </span>
        {estimatedMinutes != null && (
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
            Estimé :{" "}
            <strong style={{ color: "var(--color-text)" }}>
              {formatDuration(estimatedMinutes)}
            </strong>
          </span>
        )}
      </div>
      {pct !== null && (
        <div
          style={{
            height: 6,
            borderRadius: 99,
            background: "var(--color-border)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              borderRadius: 99,
              background: overrun ? "#ef4444" : "#22c55e",
              transition: "width 400ms ease",
            }}
          />
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sous-composant : ligne d'un pointage
// ---------------------------------------------------------------------------

/**
 * Affiche un WorkLog individuel avec actions éditer/supprimer si l'utilisateur
 * connecté en est l'auteur.
 */
const WorkLogItem = ({
  log,
  currentUserId,
  onEdit,
  onDelete,
}: {
  log: WorkLogDTO
  currentUserId: string
  onEdit: (log: WorkLogDTO) => void
  onDelete: (id: string) => void
}) => {
  const isOwner = log.userId === currentUserId
  const initials = `${log.user.firstName[0]}${log.user.lastName[0]}`.toUpperCase()
  const formattedDate = new Date(log.date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "10px 0",
        borderBottom: "1px solid var(--color-border)",
        alignItems: "flex-start",
      }}
    >
      {/* Avatar */}
      {log.user.pdpUrl ? (
        <img
          src={log.user.pdpUrl}
          alt={`${log.user.firstName} ${log.user.lastName}`}
          style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--color-primary)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
      )}

      {/* Contenu */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)" }}>
            {log.user.firstName} {log.user.lastName}
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--color-primary)",
              background: "rgba(99,102,241,.1)",
              padding: "1px 7px",
              borderRadius: 20,
            }}
          >
            {formatDuration(log.timeSpentMinutes)}
          </span>
          <span style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginLeft: "auto" }}>
            {formattedDate}
          </span>
        </div>
        {log.description && (
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 13,
              color: "var(--color-text-secondary)",
              wordBreak: "break-word",
            }}
          >
            {log.description}
          </p>
        )}
      </div>

      {/* Actions (owner seulement) */}
      {isOwner && (
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => onEdit(log)}
            title="Modifier"
            style={actionBtnStyle}
          >
            ✏️
          </button>
          <button
            type="button"
            onClick={() => onDelete(log.id)}
            title="Supprimer"
            style={{ ...actionBtnStyle, color: "#ef4444" }}
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------

interface WorkLogListProps {
  issueId: string
  /** Estimation de temps en minutes (issue.estimatedMinutes). */
  estimatedMinutes?: number | null
}

/**
 * Liste des pointages de temps pour une issue, avec barre de progression
 * et bouton de création.
 *
 * @param issueId          - Id de l'issue.
 * @param estimatedMinutes - Estimation de l'issue pour la barre de progression.
 */
const WorkLogList = ({ issueId, estimatedMinutes }: WorkLogListProps) => {
  const { user } = UseAuth()
  const [logs, setLogs] = useState<WorkLogDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<WorkLogDTO | undefined>(undefined)

  const totalSpent = logs.reduce((sum, l) => sum + l.timeSpentMinutes, 0)

  useEffect(() => {
    setLoading(true)
    worklogApi
      .listByIssue(issueId)
      .then(setLogs)
      .finally(() => setLoading(false))
  }, [issueId])

  const handleSuccess = (updated: WorkLogDTO) => {
    setLogs((prev) => {
      const idx = prev.findIndex((l) => l.id === updated.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = updated
        return next
      }
      return [updated, ...prev]
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce pointage ?")) return
    await worklogApi.deleteWorkLog(id)
    setLogs((prev) => prev.filter((l) => l.id !== id))
  }

  const openCreate = () => {
    setEditTarget(undefined)
    setModalOpen(true)
  }

  const openEdit = (log: WorkLogDTO) => {
    setEditTarget(log)
    setModalOpen(true)
  }

  return (
    <div>
      {/* En-tête section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--color-text)" }}>
          Suivi du temps
        </h4>
        <button type="button" onClick={openCreate} style={addBtnStyle}>
          + Pointer du temps
        </button>
      </div>

      {/* Barre de progression */}
      {(totalSpent > 0 || estimatedMinutes != null) && (
        <TimeProgress spentMinutes={totalSpent} estimatedMinutes={estimatedMinutes} />
      )}

      {/* Liste */}
      {loading ? (
        <p style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>Chargement…</p>
      ) : logs.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>
          Aucun pointage pour cette issue.
        </p>
      ) : (
        <div>
          {logs.map((log) => (
            <WorkLogItem
              key={log.id}
              log={log}
              currentUserId={user?.id ?? ""}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <WorkLogModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        issueId={issueId}
        worklog={editTarget}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const actionBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 14,
  padding: "2px 4px",
  borderRadius: 4,
  lineHeight: 1,
}

const addBtnStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  padding: "5px 10px",
  borderRadius: 6,
  border: "1px solid var(--color-primary)",
  color: "var(--color-primary)",
  background: "transparent",
  cursor: "pointer",
}

export default WorkLogList
