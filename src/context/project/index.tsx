import { useState, type JSX } from "react";
import type { ProjectDTO } from "../../data/dto/project";
import type { IssueDTO } from "../../data/dto/issue";
import type { SprintDTO } from "../../data/dto/sprint";
import projectApi from "../../services/api/project.api";
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
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
