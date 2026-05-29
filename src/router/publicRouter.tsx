
import LoginPage from "../pages/login";
import SignupPage from "../pages/signup";
import { Navigate, Route, Routes } from "react-router-dom";

const PublicRoute = ()=> {

    return (
        <Routes>
            <Route
                path="/"
                element={<LoginPage/>}
            />
            <Route
                path="/signup"
                element={<SignupPage/>}
            />
            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />
        </Routes>

    )
}

export default PublicRoute