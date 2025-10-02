import type { CSSProperties } from "react"

import type { NavItemProps } from "../../interfaces/components/navItem"
import { NavItem } from "./navItem"
import './index.css'

type Props = {
  style? : CSSProperties
  navItems : NavItemProps []
}

const defaultStyle = {
  display : "flex",
  flexDirection : "row",
  alignItems : "center",
  justifyContent: "space-between",
  flex : 1
} as CSSProperties

export const NavBar = (props:Props) => {

  return (
    <nav style={{...defaultStyle, ...props.style}}>
      <div className="leftMenu">
      {
        props.navItems.map((nav:NavItemProps,index) => {
          return (
            <NavItem key={index} {...nav}/>
          )
        })
      }
      </div>
      <div className="rightMenu">
        <div>
          <img src="avatar.jpg" alt="User" className="avatar"/>
          <span>John Doe</span>
          <button>▼</button>
        </div>
      </div>
    </nav>
  )
}