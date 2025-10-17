import { type CSSProperties } from "react"
import type { CredentialResponse } from "@react-oauth/google"
import { jwtDecode } from "jwt-decode"

import GenericForm from "../../components/form"
import { UseAuth } from "../../context/user"
import type { GoogleLoginDTO, LoginDTO } from "../../data/dto/login"
import { LoginFormFactory } from "../../services/factory/loginForm.factory"
import { useThemeColors } from "../../hooks/theme"
import { logoFactory } from "../../services/factory/logo.factory"


const LoginPage = ()=> {
    const {login} = UseAuth()
    const colors = useThemeColors()
    const fields = LoginFormFactory()
    const logo = logoFactory(200,200)
    const titleStyle = {
        color : colors.primaryBackground
    } as CSSProperties
    const style = {
        backgroundColor: colors.primary,
        display : "flex",
        flexDirection: "column",
        padding: 20,
        borderRadius : 8,
        gap : 8
    }as CSSProperties

    const initialValues : LoginDTO = {
        email: '',
        password: ''
    }

    const onSuccess = (res : CredentialResponse)=>{
        const googleUser = jwtDecode(res.credential || '') as GoogleLoginDTO
        console.log({googleUser})
        login(googleUser)
       
    }

    return (
        <div style={{height:'90vh',display:"flex",alignItems:"center",justifyContent:"center"}}>
            <GenericForm 
                fields={fields}
                initialValues={initialValues}
                title="Connexion"
                titleStyle={titleStyle}
                submitText="Se connecter"
                onSubmit={login}
                style={style}
                showGoogleLogin={true}
                onGoogleLoginSuccess={onSuccess}
                logo={logo}
            />       
        </div>
    )
}

export default LoginPage