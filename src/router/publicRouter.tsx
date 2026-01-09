import LoginPage from '../pages/login'
import { Navigate, Route, Routes } from 'react-router-dom'

const PublicRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default PublicRoute
