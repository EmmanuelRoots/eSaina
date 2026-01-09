import type { Logo } from '../form'

export interface NavItemProps {
  path: string
  name: string
  type: 'text' | 'icon'
  logo?: Logo
}
