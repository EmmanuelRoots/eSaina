import { Outlet } from "react-router-dom"
import { useState, useEffect } from "react"
import { Sidebar } from "../../components/sidebar"
import { NotificationBell } from "../../components/notification-bell"
import { useThemeColors } from "../../hooks/theme"
import { UseSSE } from "../../context/sse"
import "./index.css"

const STORAGE_KEY = 'esaina.sidebar-collapsed'

const HomeLayout = () => {
  useThemeColors()              // applies CSS variables on the root
  const { isConnected } = UseSSE()
  console.log({ isConnected })

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'true' }
    catch { return false }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, String(collapsed)) } catch { /* ignore */ }
  }, [collapsed])

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--color-background)' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Barre de titre avec cloche de notifications */}
        <header style={{
          height: 52,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 16px',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
        }}>
          <NotificationBell />
        </header>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default HomeLayout
