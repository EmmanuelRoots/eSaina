import type { HTMLAttributes } from "react"
import { Colors } from "../../constants/colors"
import { useThemeColors } from "../../hooks/theme"

const styles = {
  body: {
    fontSize: "1rem",
    lineHeight: 1,
    fontWeight : "regular"
  },
  body2:{
    fontSize: "0.9rem",
    lineHeight: 1,
    fontWeight : "regular"
  },
  Headline:{
    fontSize: "1.17rem",
    lineHeight: 2,
    fontWeight: "bold"
  },
  caption:{
    fontSize: "0.8rem",
    lineHeight: 1,
    fontWeight: 'lighter'
  },
  subtitle1 : {
    fontSize :"1.15rem",
    lineHeight : 1.5,
    fontWeight : "bold"
  },
  subtitle2 : {
    fontSize : "1.13rem",
    lineHeight: 1.3,
    fontWeight : "bold"
  },
  subtitle3 : {
    fontSize : "1.05rem",
    lineHeight : 1.1,
    fontWeight : "bold"
  }
} satisfies Record<string, React.CSSProperties>

type TextProps = HTMLAttributes<HTMLParagraphElement> &{
  variant? : keyof typeof styles,
  color ? : keyof typeof Colors["light"]
}

const Text = ({variant, color, style, ...rest}:TextProps)=> {
  const colors = useThemeColors()

  return (
    <p style={{...styles[variant?? 'body'], color : colors[color ?? "default"],...style}} {...rest}></p>
  )
}

export default Text