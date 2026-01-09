import type { CSSProperties, ReactNode } from 'react'
import Row from '../../../components/row'
import Column from '../../../components/column'

type SectionProps = { children: ReactNode; style?: CSSProperties }

export const SectionLayout = ({ children, style }: SectionProps) => {
  return <Row style={style}>{children}</Row>
}

export const RightSection = ({ children, style }: SectionProps) => {
  return <Column style={style}>{children}</Column>
}

export const CenterSection = ({ children, style }: SectionProps) => {
  return <Column style={style}>{children}</Column>
}

export const LeftSection = ({ children, style }: SectionProps) => {
  return <Column style={style}>{children}</Column>
}
