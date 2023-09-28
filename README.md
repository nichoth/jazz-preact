# jazz preact
Like [jazz-react](https://github.com/gardencmp/jazz/blob/main/DOCS.md/#jazz-react). This exposes hooks that help with auth and telepathic state, but using [preact](https://preactjs.com/) instead of `react`.

## install 
```bash
npm i -S @nichoth/jazz-preact
```

## example
See [the example folder](./example/). The three functions you need to think about are [WithJazz](#withjazz), [useJazz](#usejazz), and [useTelepathicState](#usetelepathicstate).

### WithJazz
Create the `context` for Jazz.

```tsx
// index.tsx
import { render } from 'preact'
import { TodoApp } from './todo-app.jsx'
import { WithJazz } from '@nichoth/jazz-preact'
import { LocalAuth } from '@nichoth/jazz-preact/jazz-preact-auth-local.js'

const appName = 'Preact todo example'
const useLocalAuth = LocalAuth({ appName })

// takes an auth hook, and provides the `AuthStatus` to children
render(<WithJazz useAuth={useLocalAuth}>
    <TodoApp appName={appName} />
</WithJazz>, document.getElementById('root')!)
```

### useJazz
Get a reference to a Jazz node. Call this in a child node of `WhithJazz`, above.

```tsx
// example/todo-app.tsx
import { useJazz } from '@nichoth/jazz-preact'

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

### useTelepathicState
Takes an optional `id` attribute, which should be the ID for a `CoValue`. 

```tsx
// example/pages/main.tsx
import { CoID, CoValueImpl } from 'cojson'
import { useTelepathicState } from '@nichoth/jazz-preact'
import { ListOfTasks, Task, TodoProject } from '../types.js'

function MainView ({ params }) {
    const project = useTelepathicState<TodoProject>(params.id as CoID<TodoProject>)
    const tasks = useTelepathicState<ListOfTasks>(project?.get('tasks'))

    // ...

    return (<div>
        <h2>{project?.get('title')}</h2>

        <ul className="todo-list">
            {tasks?.map((taskId:CoID<Task>) => {
                const task = useTelepathicState(taskId)

                return (<li key={taskId}>
                    <form onChange={handleChange.bind(null, task)}>
                        <label>
                            <input checked={task?.get('done') || false}
                                type="checkbox"
                                name="done-status"
                            />
                            {task?.get('done') ?
                                (<s>{task.get('text')}</s>) :
                                (<span>{task?.get('text')}</span>)
                            }
                        </label>
                    </form>
                </li>)
            })}
        </ul>
    </div>)
}
```
