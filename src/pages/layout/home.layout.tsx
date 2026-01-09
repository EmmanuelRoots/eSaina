import { Outlet } from 'react-router-dom'

// import { UseAuth } from "../../context/user";
import './index.css'
import { NavBar } from '../../components/navBar'
import { navBarFactory } from '../../services/factory/navBar.factory'
import Column from '../../components/column'
import Row from '../../components/row'
import { useThemeColors } from '../../hooks/theme'
import { UseSSE } from '../../context/sse'

const HomeLayout = () => {
  const navItems = navBarFactory()
  const colors = useThemeColors()
  const { isConnected } = UseSSE()

  console.log({ isConnected })

  return (
    <Column style={{ backgroundColor: colors.primaryBackground }}>
      <Row
        className="navSticky"
        style={{
          position: 'sticky',
          top: 0,
          backgroundColor: colors.primaryBackground,
        }}
      >
        <NavBar navItems={navItems} />
      </Row>
      <Outlet />
    </Column>
  )
}

export default HomeLayout
