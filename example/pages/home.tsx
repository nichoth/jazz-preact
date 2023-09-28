import { FunctionComponent } from 'preact'
import { useState, useCallback } from 'preact/hooks'
import { LocalNode } from 'cojson'
import { TodoProject, ListOfTasks } from '../types.js'
import { TextInput } from '../components/text-input.jsx'
import { Button } from '../components/button.jsx'
import './home.css'

/**
 * Home view
 * If you don't have a project yet, you see this
 * Otherwise, you see the route `main`
 * @returns {FunctionComponent}
 */
export function Home ({ localNode, setRoute }:{
    localNode:LocalNode;
    setRoute:(path:string)=>void
}):FunctionComponent<{
    localNode:LocalNode
    setRoute:(path:string)=>void
}> {
    const createProject = useCallback((title: string) => {
        if (!title) return

        // To create a new todo project, we first create a `Group`,
        // which is a scope for defining access rights (reader/writer/admin)
        // of its members, which will apply to all CoValues owned by that group.
        const projectGroup = localNode.createGroup()

        // Then we create an empty todo project and list of tasks within that group.
        const project = projectGroup.createMap<TodoProject>()
        const tasks = projectGroup.createList<ListOfTasks>()

        // We edit the todo project to initialise it.
        // Inside the `.edit` callback we can mutate a CoValue
        project.edit((project) => {
            project.set('title', title)
            project.set('tasks', tasks.id)
        })

        setRoute(`/id/${project.id}`)
    }, [localNode])

    return (<div className="route home">
        <h2>Create a new todo-list</h2>
        <NewList onSubmit={createProject} />
    </div>)
}

function NewList ({ onSubmit }:{
    onSubmit:(name:string) => any
}):FunctionComponent {
    const [isValid, setValid] = useState<boolean>(false)

    function input (ev:InputEvent & { target: HTMLFormElement }) {
        const form = ev.target
        const isOk = form.checkValidity()
        if (isOk !== isValid) setValid(isOk)
    }

    function submit (ev:SubmitEvent & { target: HTMLFormElement }) {
        ev.preventDefault()
        const name = ev.target.elements['list-name'].value
        onSubmit(name)
    }

    return (<form className="new-list" onInput={input} onSubmit={submit}>
        <TextInput name="list-name" displayName="List name"
            minLength={3}
            required={true}
        />

        <Button type="submit" isSpinning={false} disabled={!isValid}>
            Create list
        </Button>
    </form>)
}
