import {type CSSProperties, type HTMLAttributes, type ReactNode } from "react"
import './index.css'
import { useThemeColors } from "../../hooks/theme"

type ButtonProps = HTMLAttributes<HTMLButtonElement> & {
  children : ReactNode,
  icon ? : ReactNode,
  style ? : CSSProperties,
  hoverColor? : string,
  onClick : ()=>void,
  disabled? : boolean
}



const Button = ({children, icon, style, onClick, hoverColor, disabled, ...rest}:ButtonProps)=>{
  const colors = useThemeColors()

  const defaultStyle = {
    display : "flex",
    justifyContent : "center",
    alignItems : "center",
    padding : "1%",
    gap : 4,
    border : "none",
    borderRadius : 8,
    '--hover-bg-color': hoverColor ?? colors.primary,
  } as CSSProperties

  return (
    <button className="btn-hover" {...rest} style={{...defaultStyle,...style}} onClick={onClick} disabled={disabled}>
      {icon && (icon)}
      {children}
    </button>
  )
}

export default Button