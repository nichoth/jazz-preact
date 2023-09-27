// import { FunctionComponent } from 'preact'
import { useState, useMemo } from 'preact/hooks'
import { BrowserLocalAuth } from 'jazz-browser-auth-local'
import { AuthProvider } from 'jazz-browser'

// export type LocalAuthComponent = (props: {
//     loading: boolean;
//     logIn: () => void;
//     signUp: (username: string) => void;
// }) => FunctionComponent

export type AuthHook = () => {
    auth: AuthProvider;
    logOut?: () => void;
};

export type AuthStatus =
    | { state: 'loading' }
    | {
        state: 'ready';
        logIn:() => void;
        signUp: (username: string) => void;
    }
    | { state: 'signedIn'; logOut: () => void; }

export function LocalAuth ({
    appName,
    appHostname,
}: {
    appName: string;
    appHostname?: string;
}):AuthHook {
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
            auth,
            authStatus,
            logOut:
                authStatus.state === 'signedIn' ? authStatus.logOut : undefined,
        }
    }
}
