import { createContext } from "react";
import type { ProjectDTO } from "../../data/dto/project";
import type { IssueDTO } from "../../data/dto/issue";
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
}

export const ProjectContext = createContext<ProjectContextType | undefined>(undefined);
