import { createContext } from "react";
import type { ProjectDTO } from "../../data/dto/project";
import type { CreateIssueRequestDTO, IssueDTO, IssueStatus, UpdateIssueRequestDTO } from "../../data/dto/issue";
import type { SprintDTO } from "../../data/dto/sprint";

export interface ProjectContextType {
  currentProject: ProjectDTO | null;
  boardIssues: Record<string, IssueDTO[]>;
  backlogIssues: IssueDTO[];
  sprints: (SprintDTO & { issues: IssueDTO[] })[];
  loading: boolean;
  fetchProjectData: (projectId: string) => Promise<void>;
  fetchBoard: (projectId: string) => Promise<void>;
  fetchBacklog: (projectId: string) => Promise<void>;
  createIssue: (payload: CreateIssueRequestDTO) => Promise<IssueDTO | null>;
  createSprint: (projectId: string) => Promise<SprintDTO | null>;
  startSprint: (sprintId: string) => Promise<void>;
  closeSprint: (sprintId: string) => Promise<void>;
  updateIssue: (issueId: string, payload: UpdateIssueRequestDTO) => Promise<IssueDTO | null>;
  moveIssue: (issueId: string, fromStatus: IssueStatus, toStatus: IssueStatus, toIndex: number) => Promise<void>;
}

export const ProjectContext = createContext<ProjectContextType | undefined>(undefined);
