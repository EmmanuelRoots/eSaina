import type { NavItemProps } from "../../interfaces/components/navItem"
import { logoFactory } from "./logo.factory"

export const navBarFactory = ()=> {
  const navItems : NavItemProps [] = [
    {name:"ekandralogo",path:"/",type:"icon",logo:logoFactory(50,50)},
    {name : "Actualité",path:"/",type:"text"},
    {name:"Message",path:"/message",type:"text"}
  ]

  return navItems
}