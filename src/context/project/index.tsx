import { useState, type JSX } from "react";
import type { ProjectDTO, ProjectStatusDTO } from "../../data/dto/project";
import { StatusCategory } from "../../data/dto/project";
import {
  type CreateIssueRequestDTO,
  type IssueDTO,
  IssueStatus,
  type UpdateIssueRequestDTO,
} from "../../data/dto/issue";
import type { SprintDTO } from "../../data/dto/sprint";
import projectApi from "../../services/api/project.api";
import issueApi from "../../services/api/issue.api";
import sprintApi from "../../services/api/sprint.api";
import { ProjectContext } from "./context";

export { useProject } from "./useProject";

export const ProjectProvider = ({ children }: { children: JSX.Element | JSX.Element[] }) => {
  const [currentProject, setCurrentProject] = useState<ProjectDTO | null>(null);
  const [boardIssues, setBoardIssues] = useState<Record<string, IssueDTO[]>>({});
  const [backlogIssues, setBacklogIssues] = useState<IssueDTO[]>([]);
  const [sprints, setSprints] = useState<(SprintDTO & { issues: IssueDTO[] })[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjectData = async (projectId: string) => {
    setLoading(true);
    try {
      const project = await projectApi.getProjectById(projectId);
      setCurrentProject(project);
    } catch (error) {
      console.error("Error fetching project data", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoard = async (projectId: string) => {
    try {
      const data = await projectApi.getBoard(projectId);
      setBoardIssues(data);
    } catch (error) {
      console.error("Error fetching board", error);
    }
  };

  const fetchBacklog = async (projectId: string) => {
    try {
      const data = await projectApi.getBacklog(projectId);
      setBacklogIssues(data.backlog);
      setSprints(data.sprints);
    } catch (error) {
      console.error("Error fetching backlog", error);
    }
  };

  const createIssue = async (payload: CreateIssueRequestDTO): Promise<IssueDTO | null> => {
    try {
      const issue = await issueApi.createIssue(payload);
      // Add to the appropriate board column
      setBoardIssues((prev) => {
        const statusKey = issue.statusId || issue.status;
        const column = prev[statusKey] ? [...prev[statusKey]] : [];
        column.push(issue);
        return { ...prev, [statusKey]: column };
      });
      if (!payload.sprintId) {
        setBacklogIssues((prev) => [issue, ...prev]);
      } else {
        setSprints((prev) =>
          prev.map((s) =>
            s.id === payload.sprintId
              ? { ...s, issues: [...s.issues, issue] }
              : s,
          ),
        );
      }
      return issue;
    } catch (error) {
      console.error("Error creating issue", error);
      return null;
    }
  };

  const createSprint = async (projectId: string): Promise<SprintDTO | null> => {
    try {
      const nextNumber = sprints.length + 1;
      const sprint = await sprintApi.createSprint({
        projectId,
        name: `Sprint ${nextNumber}`,
      });
      setSprints((prev) => [...prev, { ...sprint, issues: [] }]);
      return sprint;
    } catch (error) {
      console.error("Error creating sprint", error);
      return null;
    }
  };

  const startSprint = async (sprintId: string): Promise<void> => {
    try {
      const updated = await sprintApi.startSprint(sprintId);
      setSprints((prev) =>
        prev.map((s) => (s.id === sprintId ? { ...s, ...updated } : s)),
      );
    } catch (error) {
      console.error("Error starting sprint", error);
    }
  };

  const closeSprint = async (sprintId: string): Promise<void> => {
    try {
      const updated = await sprintApi.closeSprint(sprintId);
      setSprints((prev) =>
        prev.map((s) => (s.id === sprintId ? { ...s, ...updated } : s)),
      );
      // Refresh backlog to see issues moved from the closed sprint
      if (currentProject?.id) {
        await fetchBacklog(currentProject.id);
      }
    } catch (error) {
      console.error("Error closing sprint", error);
    }
  };

  const updateIssue = async (
    issueId: string,
    payload: UpdateIssueRequestDTO,
  ): Promise<IssueDTO | null> => {
    try {
      const updated = await issueApi.updateIssue(issueId, payload);
      
      // Update Board state — déplace le ticket si son statusId a changé.
      setBoardIssues((prev) => {
        const newKey = updated.statusId;
        const next: Record<string, IssueDTO[]> = {};
        let oldKey: string | null = null;
        let oldIdx = -1;

        // Retirer le ticket de sa colonne actuelle
        for (const [key, list] of Object.entries(prev)) {
          const idx = list.findIndex((i) => i.id === updated.id);
          if (idx !== -1) {
            oldKey = key;
            oldIdx = idx;
            next[key] = list.filter((i) => i.id !== updated.id);
          } else {
            next[key] = list;
          }
        }

        // Insérer le ticket dans la bonne colonne
        const targetKey = newKey || oldKey;
        if (targetKey) {
          const targetList = [...(next[targetKey] ?? [])];
          if (oldKey === targetKey && oldIdx !== -1) {
            // Même colonne : réinsérer à la position d'origine pour éviter le saut visuel
            targetList.splice(Math.min(oldIdx, targetList.length), 0, updated);
          } else {
            targetList.push(updated);
          }
          next[targetKey] = targetList;
        }

        return next;
      });

      // Update Backlog state
      setBacklogIssues((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));

      // Update Sprints state
      setSprints((prev) =>
        prev.map((s) => ({
          ...s,
          issues: s.issues.map((i) => (i.id === updated.id ? updated : i)),
        })),
      );

      return updated;
    } catch (error) {
      console.error("Error updating issue", error);
      return null;
    }
  };

  const moveIssue = async (
    issueId: string,
    fromStatus: string,
    toStatus: string,
    toIndex: number,
  ): Promise<void> => {
    // Snapshot for rollback.
    let snapshot: Record<string, IssueDTO[]> | null = null;
    setBoardIssues((prev) => {
      snapshot = prev;
      const fromCol = [...(prev[fromStatus] ?? [])];
      const movingIdx = fromCol.findIndex((i) => i.id === issueId);
      if (movingIdx === -1) return prev;
      const [moving] = fromCol.splice(movingIdx, 1);
      const next: Record<string, IssueDTO[]> = { ...prev, [fromStatus]: fromCol };
      const toCol = fromStatus === toStatus ? fromCol : [...(prev[toStatus] ?? [])];
      const safeIdx = Math.max(0, Math.min(toIndex, toCol.length));

      // Mise à jour optimiste : statusId + dérivation de status depuis les statuts du projet
      const updatedMoving = { ...moving, statusId: toStatus };
      const targetProjectStatus = currentProject?.statuses?.find((s) => s.id === toStatus);
      if (targetProjectStatus) {
        if (targetProjectStatus.category === StatusCategory.TODO)
          updatedMoving.status = IssueStatus.TODO;
        else if (targetProjectStatus.category === StatusCategory.IN_PROGRESS)
          updatedMoving.status = IssueStatus.IN_PROGRESS;
        else if (targetProjectStatus.category === StatusCategory.DONE)
          updatedMoving.status = IssueStatus.DONE;
      }

      toCol.splice(safeIdx, 0, updatedMoving);
      next[toStatus] = toCol;
      return next;
    });
    try {
      // toStatus est toujours un statusId (UUID) car les clés de boardIssues sont des statusId
      const payload: UpdateIssueRequestDTO = { position: toIndex };
      if (fromStatus !== toStatus) {
        payload.statusId = toStatus;
      }
      const updated = await issueApi.updateIssue(issueId, payload);
      // Remplacer l'optimistic par la réponse serveur (status + statusId définitifs)
      setBoardIssues((prev) => ({
        ...prev,
        [toStatus]: (prev[toStatus] ?? []).map((i) => (i.id === issueId ? updated : i)),
      }));
    } catch (error) {
      console.error("Error moving issue, rolling back", error);
      if (snapshot) setBoardIssues(snapshot);
    }
  };

  const createStatus = async (projectId: string, payload: Partial<ProjectStatusDTO>): Promise<ProjectStatusDTO | null> => {
    try {
      const status = await projectApi.createProjectStatus(projectId, payload);
      setCurrentProject(prev => prev ? { ...prev, statuses: [...(prev.statuses || []), status].sort((a, b) => (a.position || 0) - (b.position || 0)) } : null);
      return status;
    } catch (error) {
      console.error("Error creating status", error);
      return null;
    }
  };

  const updateStatus = async (statusId: string, payload: Partial<ProjectStatusDTO>): Promise<ProjectStatusDTO | null> => {
    try {
      const status = await projectApi.updateProjectStatus(statusId, payload);
      setCurrentProject(prev => prev ? { ...prev, statuses: (prev.statuses || []).map(s => s.id === statusId ? status : s).sort((a, b) => (a.position || 0) - (b.position || 0)) } : null);
      return status;
    } catch (error) {
      console.error("Error updating status", error);
      return null;
    }
  };

  const deleteStatus = async (statusId: string): Promise<void> => {
    try {
      await projectApi.deleteProjectStatus(statusId);
      setCurrentProject(prev => prev ? { ...prev, statuses: (prev.statuses || []).filter(s => s.id !== statusId) } : null);
    } catch (error) {
      console.error("Error deleting status", error);
    }
  };

  const reorderStatuses = async (projectId: string, statusIds: string[]): Promise<void> => {
    // Snapshot pour rollback en cas d'échec
    let previousStatuses: ProjectStatusDTO[] | undefined;

    // Mise à jour optimiste : réordonne currentProject.statuses immédiatement
    // pour que le board reflète le nouvel ordre sans attendre l'API.
    setCurrentProject((prev) => {
      if (!prev?.statuses) return prev;
      previousStatuses = prev.statuses;
      const sorted = statusIds
        .map((id) => prev.statuses!.find((s) => s.id === id))
        .filter(Boolean) as ProjectStatusDTO[];
      return { ...prev, statuses: sorted };
    });

    try {
      await projectApi.reorderProjectStatuses(projectId, statusIds);
      // Pas de fetchProjectData ici : le backend peut retourner les statuts dans
      // leur ordre d'insertion (non trié par position), ce qui écraserait la
      // mise à jour optimiste et ferait revenir les colonnes en arrière.
    } catch (error) {
      console.error("Error reordering statuses", error);
      if (previousStatuses) {
        setCurrentProject((prev) => prev ? { ...prev, statuses: previousStatuses! } : null);
      }
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        boardIssues,
        backlogIssues,
        sprints,
        loading,
        fetchProjectData,
        fetchBoard,
        fetchBacklog,
        createIssue,
        createSprint,
        startSprint,
        closeSprint,
        updateIssue,
        moveIssue,
        createStatus,
        updateStatus,
        deleteStatus,
        reorderStatuses,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
