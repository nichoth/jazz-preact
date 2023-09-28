import { FunctionComponent } from 'preact'
import { Signal } from '@preact/signals'
import { useState } from 'preact/hooks'
import { LocalNode } from 'cojson'
import { Invitation } from '../state.js'
import { Button } from '../components/button.jsx'
import { TextInput } from '../components/text-input.jsx'
import { AuthStatus, ReadyStatus } from '../../src/jazz-preact-auth-local.jsx'
import '../components/button.css'
import '../components/text-input.css'
import './login.css'
import { Divider } from '../components/divider.jsx'

export const Login:FunctionComponent<{
    authStatus: AuthStatus;
    invitation: Signal<Invitation|null>;
    setRoute:(path:string)=>void;
    localNode:LocalNode
    next:string;
}> = function Login ({ setRoute, authStatus, next }) {
    const [isValid, setValid] = useState(false)

    // need this because `onInput` event doesnt work for cmd + delete event
    async function onFormKeydown (ev:KeyboardEvent) {
        const key = ev.key
        const { form } = ev.target as HTMLInputElement
        if (!form) return
        if (key !== 'Backspace' && key !== 'Delete') return

        const _isValid = (form.checkValidity())
        if (_isValid !== isValid) setValid(_isValid)
    }

    function handleInput (ev) {
        const { form } = ev.target as HTMLInputElement
        const _isValid = (form as HTMLFormElement).checkValidity()
        if (_isValid !== isValid) setValid(_isValid)
    }

    async function handleFormClick (ev:MouseEvent) {
        ev.preventDefault()

        try {
            const { type } = (ev.target as HTMLButtonElement).dataset
            if (!type) return

            if (type === 'login') {
                return await (authStatus as ReadyStatus).logIn()
            }

            // type must be 'create'
            const username = ((ev.target as HTMLButtonElement).form!.elements
                .namedItem('username') as HTMLInputElement).value

            await (authStatus as ReadyStatus).signUp(username)
            setRoute(next || '/')
        } catch (err) {
            console.log('errrrr', err)
        }
    }

    return (authStatus.state === 'ready') ?
        (<div className="ready">
            <h2>Login</h2>

            <form id="login-form" onInput={handleInput}
                onClick={handleFormClick}
                onKeydown={onFormKeydown}
            >
                <TextInput minLength={3} displayName="Display name"
                    name="username"
                    required={true}
                    autoComplete="webauthn"
                />
                <div className="control">
                    <h3>Create a new account</h3>
                    <Button isSpinning={false}
                        data-type="create"
                        disabled={!isValid}
                    >
                        Create account
                    </Button>
                </div>

                <Divider text="or" />

                <div className="control login">
                    <h3>Login with an existing account</h3>
                    <Button isSpinning={false} disabled={false}
                        data-type="login"
                    >
                        Login
                    </Button>
                </div>
            </form>
        </div>) :
        null
}
