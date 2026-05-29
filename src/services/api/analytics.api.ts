/**
 * Service API — Analytics / Tempo (frontend).
 *
 * Consomme l'endpoint GET /analytics/project/:projectId du backend.
 * Utilise l'instance axios centralisée avec gestion du refresh token.
 *
 * Dépendances : axiosInstance, urls.analytics.
 */

import { urls } from "../../constants/urls";
import { axiosInstance } from "../utils/axios.utils";

/** Vélocité d'un sprint : points planifiés vs réalisés. */
export interface SprintVelocity {
  sprintId: string;
  sprintName: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  planned: number;
  completed: number;
}

/** Répartition d'issues par une dimension (type, priorité…). */
export interface IssueRepartition {
  label: string;
  count: number;
}

/** Charge d'un membre du projet. */
export interface MemberWorkload {
  userId: string;
  firstName: string;
  lastName: string;
  pdpUrl: string | null;
  assigned: number;
  done: number;
}

/** Progression du sprint actif. */
export interface ActiveSprintProgress {
  id: string;
  name: string;
  goal: string | null;
  startDate: string | null;
  endDate: string | null;
  todo: number;
  inProgress: number;
  done: number;
  total: number;
}

/** Activité hebdomadaire : issues créées et closes par semaine. */
export interface WeeklyActivity {
  week: string;
  created: number;
  closed: number;
}

/** Payload complet retourné par l'endpoint analytics. */
export interface ProjectAnalyticsData {
  velocity: SprintVelocity[];
  issuesByType: IssueRepartition[];
  issuesByPriority: IssueRepartition[];
  activeSprint: ActiveSprintProgress | null;
  memberWorkload: MemberWorkload[];
  weeklyActivity: WeeklyActivity[];
}

/**
 * Récupère les métriques Tempo d'un projet.
 *
 * @param projectId - Identifiant du projet.
 * @returns ProjectAnalyticsData.
 */
const getProjectAnalytics = async (
  projectId: string,
): Promise<ProjectAnalyticsData> => {
  const { data } = await axiosInstance
    .get<{ success: boolean; data: ProjectAnalyticsData }>(
      urls.analytics.PROJECT(projectId),
    )
    .catch((err) => {
      throw err;
    });
  return data.data;
};

export default { getProjectAnalytics };
