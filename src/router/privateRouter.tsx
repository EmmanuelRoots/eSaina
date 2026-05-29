import { Navigate, Route, Routes } from "react-router-dom"
import HomeLayout from "../pages/layout/home.layout"
import NewsPage from "../pages/news"
import MessagePage from "../pages/message"
import ConversationProvider from "../context/conversation"
import PostProvider from "../context/post"
import SSEProvider from "../context/sse"
import { ProjectProvider } from "../context/project"
import ProjectList from "../pages/project/ProjectList"
import Board from "../pages/project/Board"
import Backlog from "../pages/project/Backlog"
import ProjectLayout from "../pages/project/ProjectLayout"
import RoleManagement from "../pages/admin/RoleManagement"
import UserManagement from "../pages/admin/UserManagement"
import GroupManagement from "../pages/admin/GroupManagement"
import TeamManagement from "../pages/admin/TeamManagement"
import Tempo from "../pages/project/Tempo"

const PrivateRoute = () => {

    return (
        <ConversationProvider>
            <PostProvider>
                <SSEProvider>
                    <ProjectProvider>
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
                                <Route path="projects">
                                    <Route path="" element={<ProjectList />} />
                                    <Route path=":projectId" element={<ProjectLayout />}>
                                        <Route path="board" element={<Board />} />
                                        <Route path="backlog" element={<Backlog />} />
                                        <Route path="tempo" element={<Tempo />} />
                                    </Route>
                                </Route>
                                <Route path="admin">
                                    <Route path="roles" element={<RoleManagement />} />
                                    <Route path="users" element={<UserManagement />} />
                                    <Route path="groups" element={<GroupManagement />} />
                                    <Route path="teams" element={<TeamManagement />} />
                                </Route>
                            </Route>
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </ProjectProvider>
                </SSEProvider>
            </PostProvider>
        </ConversationProvider>
    )
}

export default PrivateRoute