import { render } from 'preact'
import { useCallback } from 'preact/hooks'
import { LocalAuth } from '../src/jazz-preact-auth-local.jsx'
import { WithJazz, useJazz } from '../src/index.jsx'
import { useSimpleHashRouterThatAcceptsInvites } from './router.js'

const appName = 'Jazz Todo List Example'

const auth = LocalAuth({
    appName,
    Component: function PrettyAuth () {
        return (<div>auth here</div>)
    }
})

function Example () {
    return (<WithJazz auth={auth}>
        <App />
    </WithJazz>)
}

function App () {
    const { localNode, logOut } = useJazz()
    // This sets up routing and accepting invites
    const [currentProjectId, navigateToProjectId] =
        useSimpleHashRouterThatAcceptsInvites<TodoProject>(localNode)

    const createProject = useCallback(
        (title: string) => {
            if (!title) return;

            // To create a new todo project, we first create a `Group`,
            // which is a scope for defining access rights (reader/writer/admin)
            // of its members, which will apply to all CoValues owned by that group.
            const projectGroup = localNode.createGroup();

            // Then we create an empty todo project and list of tasks within that group.
            const project = projectGroup.createMap<TodoProject>()
            const tasks = projectGroup.createList<ListOfTasks>()

            // We edit the todo project to initialise it.
            // Inside the `.edit` callback we can mutate a CoValue
            project.edit((project) => {
                project.set('title', title)
                project.set('tasks', tasks.id)
            })

            navigateToProjectId(project.id)
        },
        [localNode, navigateToProjectId]
    )

    return (<div className="the-app">
        the app
    </div>)
}

render((<Example />), document.getElementById('root')!)
