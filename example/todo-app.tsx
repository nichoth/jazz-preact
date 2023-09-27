import { FunctionComponent } from 'preact'
import Route from 'route-event'
import { useEffect, useMemo, useState } from 'preact/hooks'
import { Button } from './components/button.jsx'
import Router from './router.jsx'
import { useJazz } from '../src/index.jsx'
import './todo-app.css'

/**
 * The top level view component. This is always rendered.
 *   - Setup routing
 *   - Parse invitations
 *   - redirect to `/login` if not authed
 */
export const TodoApp:FunctionComponent<{
    appName:string,
    syncAddress?:string,
    appHostName?:string,
}> = function TodoApp ({
    appName
}) {
    const [routeState, setRouteState] = useState<string|null>(null)

    // if `/login` is the original page we loaded,
    // then set the next path to '/'
    // otherwise, go back to the last route after login
    const next = useMemo<string>(() => {
        return (location.pathname.includes('login') ?
            '/' :
            (location.pathname + location.search))
    }, [])

    const router = useMemo(() => Router(), [])
    const routeEvent = useMemo(() => {
        return Route()
    }, [])

    /**
     * Subscribe to route changes. This hears local link clicks as well as
     * calls to `setRoute`.
     */
    useEffect(() => {
        const route = routeEvent(function onRoute (path) {
            setRouteState(path)
        })

        return route
    }, [routeEvent])

    const { localNode, logOut, auth } = useJazz()

    const signedIn = useMemo<boolean>(() => {
        return !!logOut
    }, [logOut])

    /**
     * redirect if not authed
     */
    useEffect(() => {
        if (!signedIn) {
            if (location.pathname === '/login') return
            routeEvent.setRoute('/login')
        } else {
            routeEvent.setRoute(next)
        }
    }, [signedIn])

    console.log('render', routeState)

    const match = router.match(routeState)
    const Element = match.action(match)

    return (<div>
        <h1>{appName}</h1>
        <Element params={match.params} localNode={localNode} auth={auth} />
        <LogoutControl onLogout={logOut!} isSignedIn={!!localNode} />
    </div>)
}

function LogoutControl ({ onLogout, isSignedIn }:{
    onLogout:()=>void;
    isSignedIn:boolean;
}):FunctionComponent {
    return (isSignedIn ?
        (<div className="logout">
            <Button
                isSpinning={false}
                onClick={onLogout}
            >
                Log Out
            </Button>
        </div>) :
        null)
}
