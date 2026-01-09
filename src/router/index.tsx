import { BrowserRouter } from 'react-router-dom'
import PrivateRoute from './privateRouter'
import PublicRoute from './publicRouter'
import { UseAuth } from '../context/user'
import { LoadingPage } from '../pages/loading'
import { logoFactory } from '../services/factory/logo.factory'
import { useThemeColors } from '../hooks/theme'

const MainRouter = () => {
  const { user, loading } = UseAuth()
  const logo = logoFactory(80, 80)
  const colors = useThemeColors()

  if (loading) {
    return (
      <LoadingPage
        logo={logo}
        height="100vh"
        spinnerSize={120}
        color={colors.primary}
      />
    )
  }

  return (
    <BrowserRouter>{user ? <PrivateRoute /> : <PublicRoute />}</BrowserRouter>
  )
}

export default MainRouter
