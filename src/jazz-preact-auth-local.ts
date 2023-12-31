import { useState, useMemo } from 'preact/hooks'
import { BrowserLocalAuth } from 'jazz-browser-auth-local'
import { AuthProvider } from 'jazz-browser'

export type LoadingStatus = { state: 'loading' }
export type ReadyStatus = {
    state: 'ready';
    logIn: () => Promise<void>;
    signUp: (username:string) => Promise<void>;
}
export type SignedInStatus = {
    state: 'signedIn';
    logOut: () => void;
}
export type AuthStatus = { state:null } |
    LoadingStatus |
    ReadyStatus |
    SignedInStatus

export type AuthHook = () => {
    provider: AuthProvider;
    authStatus:AuthStatus;
    logOut?: () => void;
};

export function LocalAuth ({
    appName,
    appHostname,
}: {
    appName: string;
    appHostname?: string;
}):AuthHook {
    /**
     * @TODO
     * Why is this type failing?
     */
    // @ts-ignore
    return function useLocalAuth () {
        const [authStatus, setAuthState] = useState<AuthStatus>({
            state: 'loading'
        })

        const [logOutCounter, setLogOutCounter] = useState(0)

        const auth = useMemo(() => {
            return new BrowserLocalAuth(
                {
                    onReady (next) {
                        setAuthState({
                            state: 'ready',
                            logIn: next.logIn,
                            signUp: next.signUp,
                        })
                    },
                    onSignedIn (next) {
                        setAuthState({
                            state: 'signedIn',
                            logOut: () => {
                                next.logOut()
                                setAuthState({ state: 'loading' })
                                setLogOutCounter((c) => c + 1)
                            },
                        })
                    },
                },
                appName,
                appHostname
            )
        }, [appName, appHostname, logOutCounter])

        return {
            provider: auth,
            authStatus,
            logOut:
                authStatus.state === 'signedIn' ? authStatus.logOut : undefined,
        }
    }
}
