import { Route, Routes } from "react-router-dom"
import HomeLayout from "../pages/layout/home.layout"
import NewsPage from "../pages/news"
import MessagePage from "../pages/message"
import ConversationProvider from "../context/conversation"
import PostProvider from "../context/post"
import SSEProvider from "../context/sse"

const PrivateRoute = () => {
    
    return (
        <ConversationProvider>
            <PostProvider>
                <SSEProvider>
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
                </SSEProvider>
            </PostProvider>
        </ConversationProvider>
    )
}

export default PrivateRoute