import type { CredentialResponse } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'

import GenericForm from '../../components/form'
import { UseAuth } from '../../context/user'
import type { GoogleLoginDTO, LoginDTO } from '../../data/dto/login'
import { LoginFormFactory } from '../../services/factory/loginForm.factory'
import { logoFactory } from '../../services/factory/logo.factory'
import { useThemeColors } from '../../hooks/theme'
import './login.css'
import type { CSSProperties } from 'react'

const LoginPage = () => {
  const { login } = UseAuth()
  const fields = LoginFormFactory()
  const logo = logoFactory(400, 400)
  const colors = useThemeColors()

  const initialValues: LoginDTO = {
    email: '',
    password: '',
  }

  const style = {
    padding: 0,
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  } as CSSProperties

  const onSuccess = (res: CredentialResponse) => {
    const googleUser = jwtDecode(res.credential || '') as GoogleLoginDTO
    login(googleUser)
  }

  return (
    <div className="login-container">
      <div className="login-branding">
        <img src={logo.logoUrl} alt="eSaina Logo" className="branding-logo" />
        <h1>eSaina</h1>
        <p>Votre plateforme de gestion intelligente.</p>
      </div>
      <div className="login-form-wrapper">
        <div className="login-card">
          <h2 className="login-title">Connexion</h2>
          <p className="login-subtitle">Bienvenue, veuillez vous connecter.</p>

          <GenericForm
            fields={fields}
            initialValues={initialValues}
            submitText="Se connecter"
            onSubmit={login}
            showGoogleLogin={true}
            onGoogleLoginSuccess={onSuccess}
            style={style}
            className="login-form-content"
          />
        </div>
      </div>
    </div>
  )
}

export default LoginPage
