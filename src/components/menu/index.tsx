import { useThemeColors } from '../../hooks/theme'
import './index.css'

const CircularMenu = () => {
  const colors = useThemeColors()
  // console.log(colors);

  return (
    <div className="circular-menu" style={{ backgroundColor: colors.primary }}>
      <div className="menu-center">
        <div className="menu-icon">☰</div>
      </div>

      <a href="#" className="menu-item">
        🏠
      </a>
      <a href="#" className="menu-item">
        👤
      </a>
      <a href="#" className="menu-item">
        📧
      </a>
      <a href="#" className="menu-item">
        ⚙️
      </a>
      <a href="#" className="menu-item">
        📱
      </a>
      <a href="#" className="menu-item">
        🎨
      </a>
      <a href="#" className="menu-item">
        📊
      </a>
      <a href="#" className="menu-item">
        🔍
      </a>
    </div>
  )
}

export default CircularMenu
