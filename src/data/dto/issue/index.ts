import type { ProjectStatusDTO } from "../project"
import type { UserDTO } from "../user"

export enum IssueType {
  STORY = 'STORY',
  TASK = 'TASK',
  BUG = 'BUG',
  EPIC = 'EPIC',
}

export enum IssueStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

export enum IssuePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface IssueLabelDTO {
  id: string
  name: string
  color: string
}

export interface IssueCommentDTO {
  id: string
  content: string
  issueId: string
  authorId: string
  author?: Partial<UserDTO>
  parentId?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface IssueDTO {
  id: string
  projectId: string
  number: number
  key: string
  title: string
  description?: string | null
  type: IssueType
  status: IssueStatus
  statusId?: string
  projectStatus?: ProjectStatusDTO
  priority: IssuePriority
  storyPoints?: number | null
  position: number
  sprintId?: string | null
  assigneeId?: string | null
  assignee?: Partial<UserDTO>
  reporterId: string
  reporter?: Partial<UserDTO>
  parentIssueId?: string | null
  labels?: IssueLabelDTO[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateIssueRequestDTO {
  projectId: string
  title: string
  description?: string
  type?: IssueType
  statusId?: string
  priority?: IssuePriority
  storyPoints?: number
  sprintId?: string
  assigneeId?: string
  parentIssueId?: string
  labelIds?: string[]
}

export interface UpdateIssueRequestDTO {
  title?: string
  description?: string | null
  type?: IssueType
  status?: IssueStatus
  statusId?: string
  priority?: IssuePriority
  storyPoints?: number | null
  position?: number
  sprintId?: string | null
  assigneeId?: string | null
  parentIssueId?: string | null
}

export interface CreateIssueCommentRequestDTO {
  issueId: string
  content: string
  parentId?: string
}
