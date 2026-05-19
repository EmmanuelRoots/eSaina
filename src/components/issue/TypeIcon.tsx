import { IssueType } from "../../data/dto/issue"
import { ISSUE_TYPE_META } from "./meta"

type Props = { type: IssueType; size?: number }

export const TypeIcon = ({ type, size = 14 }: Props) => {
  const meta = ISSUE_TYPE_META[type]
  if (!meta) return null
  const { Icon } = meta
  return (
    <span
      title={meta.label}
      style={{
        width: size + 6,
        height: size + 6,
        borderRadius: 4,
        background: meta.color,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        flexShrink: 0,
      }}
    >
      <Icon size={size - 2} strokeWidth={2.5} />
    </span>
  )
}
