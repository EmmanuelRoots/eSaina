import type { Logo } from "../../interfaces/components/form"


export const logoFactory = (width :number,height:number)=> {

  return {
    logoUrl : "/eSaina.png",
    logoHeight : height ?? 80,
    logoWidth : width ?? 80
  } as Logo
}