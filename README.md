# jazz preact ![tests](https://github.com/nichoth/jazz-preact/actions/workflows/nodejs.yml/badge.svg)

Like [jazz-react](https://github.com/gardencmp/jazz/blob/main/DOCS.md/#jazz-react), this exposed hooks that help deal with auth status and telepathic state, but this uses [preact](https://preactjs.com/), not `react`.

## install 
```bash
npm i -S @nichoth/jazz-preact
```

## example
See [the example folder](./example/). The two functions you need to think about are `WithJazz` and `useJazz`.

```tsx
// index.tsx
import { render } from 'preact'
import { TodoApp } from './todo-app.jsx'
import { WithJazz } from '@nichoth/jazz-preact'
import { LocalAuth } from '@nichoth/jazz-preact/jazz-preact-auth-local.js'

const appName = 'Preact todo example'
const useLocalAuth = LocalAuth({ appName })

render(<WithJazz useAuth={useLocalAuth}>
    <TodoApp appName={appName} />
</WithJazz>, document.getElementById('root')!)
```

```jsx
// todo-app.tsx
import { useJazz } from '../src/index.jsx'

export function TodoApp () {
    const { localNode, logOut, authStatus } = useJazz()

    // ...

    return (<div>
        <h1>Preact todo example</h1>
        <ChildElement
            localNode={localNode}
            authStatus={authStatus}
        />
        <LogoutControl onLogout={logOut!} />
    </div>)
}
```