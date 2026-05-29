/**
 * Service API — WorkLog (saisie des tempos).
 *
 * Place dans le flux : composants/pages → worklog.api → axiosInstance → backend.
 * Toutes les requêtes passent par l'instance axios unique (gestion du refresh token incluse).
 *
 * Dépendances : axiosInstance (axios.utils), urls (urls.ts), WorkLogDTO.
 */

import { urls } from "../../constants/urls"
import type { CreateWorkLogDTO, UpdateWorkLogDTO, WorkLogDTO } from "../../data/dto/worklog"
import { axiosInstance } from "../utils/axios.utils"

/**
 * Crée un pointage de temps sur une issue.
 *
 * @param payload - Données du pointage (issueId, date ISO, durée en minutes, description).
 * @returns Le WorkLogDTO créé.
 */
const createWorkLog = async (payload: CreateWorkLogDTO): Promise<WorkLogDTO> => {
  const { data } = await axiosInstance.post(urls.worklog.CREATE, payload)
  return data.data
}

/**
 * Retourne tous les pointages d'une issue, triés par date décroissante.
 *
 * @param issueId - Id de l'issue.
 */
const listByIssue = async (issueId: string): Promise<WorkLogDTO[]> => {
  const { data } = await axiosInstance.get(urls.worklog.LIST_BY_ISSUE(issueId))
  return data.data
}

/**
 * Retourne les pointages d'un projet pour la feuille de temps.
 *
 * @param projectId - Id du projet.
 * @param filters   - Filtres optionnels : userId, from, to (dates ISO).
 */
const listByProject = async (
  projectId: string,
  filters: { userId?: string; from?: string; to?: string } = {},
): Promise<WorkLogDTO[]> => {
  const params = new URLSearchParams()
  if (filters.userId) params.set("userId", filters.userId)
  if (filters.from) params.set("from", filters.from)
  if (filters.to) params.set("to", filters.to)
  const query = params.toString() ? `?${params.toString()}` : ""
  const { data } = await axiosInstance.get(urls.worklog.LIST_BY_PROJECT(projectId) + query)
  return data.data
}

/**
 * Met à jour un pointage existant (ownership requis côté back).
 *
 * @param id      - Id du WorkLog.
 * @param payload - Champs à modifier.
 */
const updateWorkLog = async (id: string, payload: UpdateWorkLogDTO): Promise<WorkLogDTO> => {
  const { data } = await axiosInstance.patch(urls.worklog.UPDATE(id), payload)
  return data.data
}

/**
 * Supprime un pointage (ownership requis côté back).
 *
 * @param id - Id du WorkLog.
 */
const deleteWorkLog = async (id: string): Promise<void> => {
  await axiosInstance.delete(urls.worklog.DELETE(id))
}

export default { createWorkLog, listByIssue, listByProject, updateWorkLog, deleteWorkLog }
