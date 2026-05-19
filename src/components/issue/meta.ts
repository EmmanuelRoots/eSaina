import {
  Bookmark, CheckSquare, Bug, Zap,
  ChevronDown, ChevronUp, ChevronsUp, Equal,
  type LucideIcon,
} from "lucide-react"
import { IssueType, IssuePriority } from "../../data/dto/issue"

export type Meta = { label: string; color: string; Icon: LucideIcon }

export const ISSUE_TYPE_META: Record<IssueType, Meta> = {
  [IssueType.STORY]: { label: 'Story', color: '#10b981', Icon: Bookmark },
  [IssueType.TASK]:  { label: 'Task',  color: '#3b82f6', Icon: CheckSquare },
  [IssueType.BUG]:   { label: 'Bug',   color: '#ef4444', Icon: Bug },
  [IssueType.EPIC]:  { label: 'Epic',  color: '#8b5cf6', Icon: Zap },
}

export const PRIORITY_META: Record<IssuePriority, Meta> = {
  [IssuePriority.LOW]:      { label: 'Basse',    color: '#06b6d4', Icon: ChevronDown },
  [IssuePriority.MEDIUM]:   { label: 'Moyenne',  color: '#f59e0b', Icon: Equal },
  [IssuePriority.HIGH]:     { label: 'Haute',    color: '#f97316', Icon: ChevronUp },
  [IssuePriority.CRITICAL]: { label: 'Critique', color: '#ef4444', Icon: ChevronsUp },
}
