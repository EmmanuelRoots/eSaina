import { ListChecks, MessageCircle } from "lucide-react"
import type { CSSProperties } from "react"
import type { IssueDTO } from "../../data/dto/issue"
import { Avatar } from "../avatar"
import { TypeIcon } from "./TypeIcon"
import { PriorityIcon } from "./PriorityIcon"
import { IssueLabel } from "./IssueLabel"
import { Points } from "./Points"

type Props = {
  issue: IssueDTO
  /** Number of completed/total subtasks if you have them. Optional. */
  subtasks?: { done: number; total: number }
  /** Comment count if available. Optional. */
  commentsCount?: number
  density?: 'comfy' | 'compact'
  onClick?: () => void
  style?: CSSProperties
}

export const IssueCard = ({
  issue,
  subtasks,
  commentsCount,
  density = 'comfy',
  onClick,
  style,
}: Props) => {
  const pad = density === 'compact' ? 10 : 14

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 10,
        padding: pad,
        cursor: onClick ? 'grab' : 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: density === 'compact' ? 8 : 10,
        boxShadow: 'var(--shadow-xs)',
        transition: 'all 150ms cubic-bezier(.4,0,.2,1)',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border-strong)'
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)'
        e.currentTarget.style.boxShadow = 'var(--shadow-xs)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Labels */}
      {issue.labels && issue.labels.length > 0 && density !== 'compact' && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {issue.labels.map((l) => (
            <IssueLabel key={l.id} label={l} />
          ))}
        </div>
      )}

      {/* Title */}
      <div
        style={{
          fontSize: density === 'compact' ? 13 : 14,
          fontWeight: 500,
          color: 'var(--color-text)',
          lineHeight: 1.4,
          textWrap: 'pretty',
        }}
      >
        {issue.title}
      </div>

      {/* Subtasks progress */}
      {subtasks && subtasks.total > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
          }}
        >
          <ListChecks size={12} />
          <span>
            {subtasks.done} / {subtasks.total}
          </span>
          <div
            style={{
              flex: 1,
              height: 4,
              background: 'var(--color-surface2)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                background: 'var(--color-primary)',
                width: `${(subtasks.done / subtasks.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
        <TypeIcon type={issue.type} size={12} />
        <span
          style={{
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
          }}
        >
          {issue.key}
        </span>
        <PriorityIcon priority={issue.priority} size={14} />

        {commentsCount != null && commentsCount > 0 && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 11,
              color: 'var(--color-text-tertiary)',
            }}
          >
            <MessageCircle size={12} />
            {commentsCount}
          </span>
        )}

        <span style={{ flex: 1 }} />

        {issue.storyPoints != null && <Points value={issue.storyPoints} />}
        <Avatar user={issue.assignee} size={22} ring="var(--color-surface)" />
      </div>
    </div>
  )
}
