import { Route, Routes } from "react-router-dom"
import HomeLayout from "../pages/layout/home.layout"
import NewsPage from "../pages/news"
import MessagePage from "../pages/message"
import ConversationProvider from "../context/conversation"

const PrivateRoute = () => {
    
    return (
        <ConversationProvider>
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
        </ConversationProvider>
    )
}

export default PrivateRoute