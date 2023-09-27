import Router from '@nichoth/routes'
import { Login } from './pages/login.jsx'
import { MainView } from './pages/main.jsx'
import { Home } from './pages/home.jsx'

export default function _Router ():ReturnType<Router> {
    const router = Router()

    router.addRoute('/', () => {
        return Home
    })

    router.addRoute('/login', () => {
        return Login
    })

    router.addRoute('/id/:id', (match) => {
        return (props) => {
            return MainView({ ...props, params: match.params })
        }
    })

    return router
}
