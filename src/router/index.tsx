
import { BrowserRouter } from 'react-router-dom'
import PrivateRoute from './privateRouter'
import PublicRoute from './publicRouter'
import { UseAuth } from '../context/user'

const MainRouter = ()=> {
    const {user} = UseAuth()

    return (
        <BrowserRouter>
            {user ? <PrivateRoute/> : <PublicRoute/>}
        </BrowserRouter>
    )

}

export default MainRouter