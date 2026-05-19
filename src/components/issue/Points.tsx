type Props = { value?: number | null }

export const Points = ({ value }: Props) => {
  if (value == null) return null
  return (
    <span
      title={`${value} points`}
      style={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-surface2)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-secondary)',
        fontWeight: 700,
        fontSize: 11,
        flexShrink: 0,
      }}
    >
      {value}
    </span>
  )
}
