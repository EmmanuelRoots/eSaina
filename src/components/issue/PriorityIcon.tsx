import { IssuePriority } from "../../data/dto/issue"
import { PRIORITY_META } from "./meta"

type Props = { priority: IssuePriority; size?: number }

export const PriorityIcon = ({ priority, size = 14 }: Props) => {
  const meta = PRIORITY_META[priority]
  if (!meta) return null
  const { Icon } = meta
  return (
    <span title={meta.label} style={{ display: 'inline-flex', flexShrink: 0 }}>
      <Icon size={size} color={meta.color} strokeWidth={3} />
    </span>
  )
}
