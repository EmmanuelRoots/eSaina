import { useEffect, useRef, useState, type CSSProperties } from "react"

import type { NavItemProps } from "../../interfaces/components/navItem"
import { NavItem } from "./navItem"
import './index.css'
import { UseAuth } from "../../context/user"
import { useThemeColors } from "../../hooks/theme"

type Props = {
  style?: CSSProperties
  navItems: NavItemProps[]
}

const defaultStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  flex: 1,

} as CSSProperties

export const NavBar = (props: Props) => {
  const { logout, user } = UseAuth()
  const colors = useThemeColors()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownStyle = {
    transition: 'background-color 0.3s ease',
    '--hover-bg-color': colors.primary,
    '--hover-text-color': colors.primaryBackground,
  } as CSSProperties

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav style={{ ...defaultStyle, ...props.style }}>
      <div className="leftMenu">
        {
          props.navItems.map((nav: NavItemProps, index) => {
            return (
              <NavItem key={index} {...nav} />
            )
          })
        }
      </div>
      <div className="rightMenu">
        <div className="user-menu" ref={dropdownRef} >
          <img src={user?.pdpUrl} className="pdp" />
          <span style={{ color: colors.default }}>{user?.firstName} {user?.lastName}</span>
          <button style={{ color: colors.default }} onClick={toggleDropdown} className="dropdown-toggle">
            ▼
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <button className="dropdown-item" style={dropdownStyle}><p>Profil</p></button>
              <button className="dropdown-item" style={dropdownStyle}><p>Paramètres</p></button>
              <button className="dropdown-item" style={dropdownStyle} onClick={logout}><p>Déconnexion</p></button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}