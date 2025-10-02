import { Route, Routes } from "react-router-dom"
import HomeLayout from "../pages/layout/home.layout"
import NewsPage from "../pages/news"
import MessagePage from "../pages/message"

const PrivateRoute = () => {
    
    return (
        <Routes>
            <Route
                path="/" 
                element={<HomeLayout/>}
            >
                <Route
                    path=""
                    element={<NewsPage/>}
                />
                <Route
                    path="message"
                    element={<MessagePage/>}
                />
            </Route>
        </Routes>
    )
}

export default PrivateRoute