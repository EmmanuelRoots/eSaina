import { NavLink } from "react-router-dom";

import type { NavItemProps } from "../../../interfaces/components/navItem";
import type { CSSProperties } from "react";
import { useThemeColors } from "../../../hooks/theme";
import './index.css'

type Props = NavItemProps & {
  style?: CSSProperties
}


export const NavItem = ({ name, path, type, logo, style }: Props) => {
  const colors = useThemeColors()
  const defaultStyle = {
    fontWeight: 500,
    color: colors.default,
    textDecoration: 'inherit',
    padding: '1%',
    // '--hover-scale': 2,
    transition: 'background-color 0.3s ease',
    '--hover-bg-color': colors.primary,
    '--hover-text-color': colors.primaryBackground,
    alignContent: "center"
  } as CSSProperties

  switch (type) {
    case "icon":
      return (
        <NavLink style={{ ...style, marginInline: 20 }} key={new Date().getTime()} to={path}>
          <div>
            <img width={logo?.logoWidth} height={logo?.logoHeight} src={logo?.logoUrl} />
          </div>
        </NavLink>
      )

    default:
      return (
        <NavLink className="nav-item-hover" style={{ ...defaultStyle, ...style }} key={new Date().getTime()} to={path}><p style={{ fontSize: '1em' }}>{name}</p></NavLink>
      )
  }

}