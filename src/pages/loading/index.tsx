import Spinner from "../../components/spinner"
import type { Logo } from "../../interfaces/components/form"

type LoadinProps = {
  spinnerSize : number,
  height : string,
  logo : Logo,
  color : string
}

export const LoadingPage = ({height,logo,spinnerSize,color}:LoadinProps)=>{
  
  
  return (
    <div style={{display:"flex", justifyContent:"center", alignItems:"center", height: height}}>
      <Spinner logo={logo} size={spinnerSize} color={color}/>
    </div>
  )
}