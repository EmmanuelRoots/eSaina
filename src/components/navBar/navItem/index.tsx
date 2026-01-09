import { NavLink } from 'react-router-dom'

import type { NavItemProps } from '../../../interfaces/components/navItem'
import type { CSSProperties } from 'react'
import { useThemeColors } from '../../../hooks/theme'
import './index.css'

type Props = NavItemProps & {
  style?: CSSProperties
}

export const NavItem = ({ name, path, type, logo, style }: Props) => {
  const colors = useThemeColors()

  const activeStyle = {
    color: colors.primary,
    fontWeight: 600,
  } as CSSProperties

  const defaultStyle = {
    color: colors.secondaryText,
    '--hover-color': colors.primary,
    '--text-color': colors.secondaryText,
  } as CSSProperties

  switch (type) {
    case 'icon':
      return (
        <NavLink
          className="nav-item-icon"
          style={{ ...style }}
          key={new Date().getTime()}
          to={path}
        >
          <div className="icon-container">
            <img
              width={logo?.logoWidth}
              height={logo?.logoHeight}
              src={logo?.logoUrl}
              alt={name}
            />
          </div>
        </NavLink>
      )

    default:
      return (
        <NavLink
          className={({ isActive }) =>
            `nav-item-link ${isActive ? 'active' : ''}`
          }
          style={({ isActive }) => ({
            ...defaultStyle,
            ...style,
            ...(isActive ? activeStyle : {}),
          })}
          key={new Date().getTime()}
          to={path}
        >
          <span className="nav-text">{name}</span>
          <div
            className="nav-indicator"
            style={{ backgroundColor: colors.primary }}
          ></div>
        </NavLink>
      )
  }
}
