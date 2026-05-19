import { Outlet } from "react-router-dom"
import { useState, useEffect } from "react"
import { Sidebar } from "../../components/sidebar"
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
        <Outlet />
      </main>
    </div>
  )
}

export default HomeLayout
