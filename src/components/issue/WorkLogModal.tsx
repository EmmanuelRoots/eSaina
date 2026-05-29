/**
 * WorkLogModal — modal de saisie d'un pointage de temps (style JIRA).
 *
 * Supporte la création et la modification d'un WorkLog.
 * Le champ de durée accepte le format JIRA : "1h 30m", "2h", "45m", "1h30m".
 *
 * Place dans le flux : affiché depuis WorkLogList ou un détail d'issue,
 * appelle worklog.api pour persister puis notifie le parent via onSuccess.
 *
 * Dépendances : Modal compound, worklog.api, WorkLogDTO.
 */

import { useEffect, useState } from "react"
import Modal from "../modal"
import ModalHeader from "../modal/header"
import ModalBody from "../modal/body"
import ModalFooter from "../modal/footer"
import worklogApi from "../../services/api/worklog.api"
import type { CreateWorkLogDTO, UpdateWorkLogDTO, WorkLogDTO } from "../../data/dto/worklog"

// ---------------------------------------------------------------------------
// Utilitaires de conversion durée ↔ minutes
// ---------------------------------------------------------------------------

/**
 * Parse une chaîne de durée style JIRA en minutes.
 * Exemples acceptés : "1h 30m", "2h", "45m", "1h30m", "90".
 *
 * @returns Le nombre de minutes, ou null si le format est invalide.
 */
export const parseDuration = (input: string): number | null => {
  const s = input.trim().toLowerCase()
  if (!s) return null

  // Format "Xh Ym" ou "Xh" ou "Ym" (avec ou sans espace entre h et m)
  const full = s.match(/^(?:(\d+)h\s*)?(?:(\d+)m)?$/)
  if (full && (full[1] || full[2])) {
    const h = parseInt(full[1] ?? "0", 10)
    const m = parseInt(full[2] ?? "0", 10)
    const total = h * 60 + m
    return total > 0 ? total : null
  }

  // Format numérique simple : interprété comme des minutes
  const num = parseInt(s, 10)
  if (!isNaN(num) && num > 0) return num

  return null
}

/**
 * Formate un nombre de minutes en chaîne lisible style JIRA ("1h 30m", "2h", "45m").
 */
export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface WorkLogModalProps {
  isOpen: boolean
  onClose: () => void
  /** Id de l'issue sur laquelle on logue du temps (création). */
  issueId?: string
  /** WorkLog existant à modifier (édition). */
  worklog?: WorkLogDTO
  /** Appelé après création ou mise à jour réussie. */
  onSuccess: (worklog: WorkLogDTO) => void
}

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

/**
 * Modal de saisie / modification d'un pointage de temps style JIRA.
 *
 * @param isOpen    - Visibilité du modal.
 * @param onClose   - Callback de fermeture.
 * @param issueId   - Id de l'issue cible (mode création).
 * @param worklog   - WorkLog à modifier (mode édition).
 * @param onSuccess - Callback appelé après persistance réussie.
 */
const WorkLogModal = ({
  isOpen,
  onClose,
  issueId,
  worklog,
  onSuccess,
}: WorkLogModalProps) => {
  const isEdit = !!worklog

  const todayISO = new Date().toISOString().slice(0, 10)

  const [date, setDate] = useState(todayISO)
  const [durationInput, setDurationInput] = useState("")
  const [description, setDescription] = useState("")
  const [durationError, setDurationError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialise les champs lors de l'ouverture (création ou édition)
  useEffect(() => {
    if (!isOpen) return
    if (worklog) {
      setDate(worklog.date.slice(0, 10))
      setDurationInput(formatDuration(worklog.timeSpentMinutes))
      setDescription(worklog.description ?? "")
    } else {
      setDate(todayISO)
      setDurationInput("")
      setDescription("")
    }
    setDurationError(null)
    setError(null)
  }, [isOpen, worklog])

  const handleDurationBlur = () => {
    const minutes = parseDuration(durationInput)
    if (durationInput && minutes === null) {
      setDurationError("Format invalide. Exemples : 1h 30m, 2h, 45m")
    } else {
      setDurationError(null)
    }
  }

  const handleSubmit = async () => {
    const minutes = parseDuration(durationInput)
    if (!minutes) {
      setDurationError("Durée requise. Exemples : 1h 30m, 2h, 45m")
      return
    }

    setLoading(true)
    setError(null)

    try {
      let result: WorkLogDTO
      if (isEdit && worklog) {
        const payload: UpdateWorkLogDTO = {
          date,
          timeSpentMinutes: minutes,
          description: description || null,
        }
        result = await worklogApi.updateWorkLog(worklog.id, payload)
      } else {
        const payload: CreateWorkLogDTO = {
          issueId: issueId!,
          date,
          timeSpentMinutes: minutes,
          description: description || undefined,
        }
        result = await worklogApi.createWorkLog(payload)
      }
      onSuccess(result)
      onClose()
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalHeader>{isEdit ? "Modifier le pointage" : "Pointer du temps"}</ModalHeader>

      <ModalBody>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Date */}
          <div>
            <label style={labelStyle}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Durée JIRA */}
          <div>
            <label style={labelStyle}>
              Temps passé
              <span style={{ color: "var(--color-text-tertiary)", fontWeight: 400, marginLeft: 6 }}>
                (ex. 1h 30m, 2h, 45m)
              </span>
            </label>
            <input
              type="text"
              value={durationInput}
              onChange={(e) => {
                setDurationInput(e.target.value)
                setDurationError(null)
              }}
              onBlur={handleDurationBlur}
              placeholder="1h 30m"
              style={{
                ...inputStyle,
                borderColor: durationError ? "#ef4444" : undefined,
              }}
              autoFocus
            />
            {durationError && (
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#ef4444" }}>
                {durationError}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>
              Description
              <span style={{ color: "var(--color-text-tertiary)", fontWeight: 400, marginLeft: 6 }}>
                (optionnel)
              </span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le travail effectué…"
              rows={3}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          {error && (
            <p style={{ margin: 0, fontSize: 13, color: "#ef4444" }}>{error}</p>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} style={cancelBtnStyle} disabled={loading}>
            Annuler
          </button>
          <button type="button" onClick={handleSubmit} style={submitBtnStyle} disabled={loading}>
            {loading ? "Enregistrement…" : isEdit ? "Modifier" : "Pointer"}
          </button>
        </div>
      </ModalFooter>
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// Styles inline (alignés sur les CSS vars du thème)
// ---------------------------------------------------------------------------

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--color-text)",
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  fontSize: 14,
  border: "1px solid var(--color-border)",
  borderRadius: 6,
  background: "var(--color-surface)",
  color: "var(--color-text)",
  outline: "none",
  boxSizing: "border-box",
}

const cancelBtnStyle: React.CSSProperties = {
  padding: "8px 16px",
  fontSize: 13,
  fontWeight: 600,
  borderRadius: 6,
  border: "1px solid var(--color-border)",
  background: "transparent",
  color: "var(--color-text)",
  cursor: "pointer",
}

const submitBtnStyle: React.CSSProperties = {
  padding: "8px 16px",
  fontSize: 13,
  fontWeight: 600,
  borderRadius: 6,
  border: "none",
  background: "var(--color-primary)",
  color: "#fff",
  cursor: "pointer",
}

export default WorkLogModal
