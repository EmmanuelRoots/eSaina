import { useEffect, useRef, useState } from "react"
import type { NavItemProps } from "../../interfaces/components/navItem"
import { NavItem } from "./navItem"
import './index.css'
import { UseAuth } from "../../context/user"

type Props = {
  navItems: NavItemProps[]
}

export const NavBar = (props: Props) => {
  const { logout, user } = UseAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <nav className="nav-container">
      <div className="leftMenu">
        {props.navItems.map((nav, index) => (
          <NavItem key={index} {...nav} />
        ))}
      </div>
      <div className="rightMenu">
        <div className="user-menu" ref={dropdownRef} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <img src={user?.pdpUrl} className="pdp" />
          <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{user?.firstName}</span>
          <span className="dropdown-toggle">▼</span>

          {isDropdownOpen && (
            <div className="dropdown-menu">
              <button className="dropdown-item"><p>Profil</p></button>
              <button className="dropdown-item"><p>Paramètres</p></button>
              <button className="dropdown-item" onClick={logout}><p>Déconnexion</p></button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}