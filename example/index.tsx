import { render } from 'preact'
import { TodoApp } from './todo-app.jsx'
import { WithJazz } from '../src/index.jsx'
import { LocalAuth } from '../src/jazz-preact-auth-local.jsx'

const appName = 'Preact todo example'
const useLocalAuth = LocalAuth({ appName })

render(<WithJazz authHook={useLocalAuth}>
    <TodoApp appName={appName} />
</WithJazz>, document.getElementById('root')!)
