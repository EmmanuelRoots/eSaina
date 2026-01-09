import { useEffect, useRef, useState, type CSSProperties } from 'react'

import type { NavItemProps } from '../../interfaces/components/navItem'
import { NavItem } from './navItem'
import './index.css'
import { UseAuth } from '../../context/user'
import { useThemeColors } from '../../hooks/theme'
import { Menu, X } from 'lucide-react'

type Props = {
  style?: CSSProperties
  navItems: NavItemProps[]
}

export const NavBar = (props: Props) => {
  const { logout, user } = UseAuth()
  const colors = useThemeColors()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const navStyle = {
    backgroundColor: colors.primaryBackground,
    color: colors.default,
    borderBottom: `1px solid ${colors.secondary}20`, // 20 for transparency
    ...props.style,
  } as CSSProperties

  const dropdownItemStyle = {
    '--hover-bg-color': colors.primary,
    '--hover-text-color': colors.primaryBackground,
    color: colors.default,
  } as CSSProperties

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav className="navbar-container" style={navStyle}>
      <button
        className="mobile-menu-btn"
        onClick={toggleMobileMenu}
        style={{ color: colors.default }}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        className={`leftMenu ${isMobileMenuOpen ? 'mobile-open' : ''}`}
        style={{
          backgroundColor: isMobileMenuOpen
            ? colors.primaryBackground
            : undefined,
        }}
      >
        {props.navItems.map((nav: NavItemProps, index) => {
          return <NavItem key={index} {...nav} />
        })}
      </div>
      <div className="rightMenu">
        <div className="user-menu" ref={dropdownRef} onClick={toggleDropdown}>
          <div className="user-info">
            <span className="user-name">
              {user?.firstName} {user?.lastName}
            </span>
          </div>
          <img src={user?.pdpUrl} className="pdp" alt="Profile" />
          <button className={`dropdown-toggle ${isDropdownOpen ? 'open' : ''}`}>
            ▼
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div
              className="dropdown-menu"
              style={{
                backgroundColor: colors.primaryBackground,
                borderColor: colors.secondary,
              }}
            >
              <button className="dropdown-item" style={dropdownItemStyle}>
                <p>Profil</p>
              </button>
              <button className="dropdown-item" style={dropdownItemStyle}>
                <p>Paramètres</p>
              </button>
              <button
                className="dropdown-item"
                style={dropdownItemStyle}
                onClick={logout}
              >
                <p>Déconnexion</p>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
