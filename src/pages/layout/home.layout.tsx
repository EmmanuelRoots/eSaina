import { Outlet } from "react-router-dom";

// import { UseAuth } from "../../context/user";
import "./index.css"
import { NavBar } from "../../components/navBar";
import { navBarFactory } from "../../services/factory/navBar.factory";
import Column from "../../components/column";
import Row from "../../components/row";
import { useThemeColors } from "../../hooks/theme";
import { UseSSE } from "../../context/sse";

const HomeLayout = () => {
    const navItems = navBarFactory()
    const colors = useThemeColors()
    const {isConnected} = UseSSE()

    console.log({isConnected});
    

    return (
      <Column>
        <NavBar navItems={navItems}/>
        <Outlet/>
      </Column>
  );
}   

export default HomeLayout