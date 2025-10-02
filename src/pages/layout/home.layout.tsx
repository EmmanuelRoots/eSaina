import { Outlet } from "react-router-dom";

// import { UseAuth } from "../../context/user";
import "./index.css"
import { NavBar } from "../../components/navBar";
import { navBarFactory } from "../../services/factory/navBar.factory";
import Column from "../../components/column";
import Row from "../../components/row";
import { useThemeColors } from "../../hooks/theme";

const HomeLayout = () => {
    //const {logout} = UseAuth()
    const navItems = navBarFactory()
    const colors = useThemeColors()
    

    return (
      <Column>
        <Row className="navSticky" style={{position : "sticky",top : 0, backgroundColor : colors.primaryBackground}}>
          <NavBar navItems={navItems}/>
        </Row>
        <Outlet/>
        {/* <Row style={{height:"100vh"}}>
          
          <Column className="sidebar" style={{flex : "1 1 15%"}}>
            <aside style={{ background: "#333", color: "#fff" }}>
              <button onClick={logout}>Deconnexion</button>
            </aside>
          </Column>
          <Column className="main-content" style={{flex : "1 1 70%", overflowY:"auto"}}>
            <Outlet/>
          </Column>
          <Column className="sidebar" style={{flex : "1 1 15%"}}></Column>
        </Row> */}
      </Column>
  );
}   

export default HomeLayout