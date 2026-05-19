import type { IssueLabelDTO } from "../../data/dto/issue"

type Props = { label: IssueLabelDTO | { name: string; color?: string } }

export const IssueLabel = ({ label }: Props) => {
  const color = label.color || 'var(--color-text-secondary)'
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: 4,
        background: 'var(--color-surface2)',
        color,
        border: '1px solid var(--color-border)',
        textTransform: 'lowercase',
        letterSpacing: 0.2,
      }}
    >
      {label.name}
    </span>
  )
}
