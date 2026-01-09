import type { CSSProperties, HTMLAttributes } from 'react'

type Props = HTMLAttributes<HTMLDivElement> & {
  gap?: number
}

const rowStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
}

const Row = ({ style, gap, ...rest }: Props) => {
  return (
    <div
      style={{
        ...rowStyle,
        ...style,
        ...(gap ? { gap: gap } : undefined),
      }}
      {...rest}
    />
  )
}

export default Row
