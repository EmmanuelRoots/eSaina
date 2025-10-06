import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import MainRouter from './router/index.tsx'
import AuthProvider from './context/user/index.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import ConversationProvider from './context/conversation/index.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_GOOGLE_ID}>
      <AuthProvider>
        <ConversationProvider>
          <MainRouter/>
        </ConversationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
