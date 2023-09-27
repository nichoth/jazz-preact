import { FunctionComponent } from 'preact'
import { useState, useCallback } from 'preact/hooks'
import { LocalNode, CoID, CoValueImpl } from 'cojson'
import { Signal } from '@preact/signals'
import { createInviteLink } from 'jazz-browser'
import { Toast } from '../components/toast.jsx'
import { Task, TodoProject } from '../types.js'
import { Button } from '../components/button.jsx'
import { NewTaskInputRow } from '../components/new-task.jsx'
import { useTelepathicState } from '../../src/index.jsx'
import { Divider } from '../components/divider.jsx'
import { CopyBtn } from '../components/copy-btn.jsx'
import './main.css'

/**
 * This is the route for viewing a todo list.
 * The todo list ID comes from the URL -- /id/<projectId>
 */
export const MainView:FunctionComponent<{
    params:{ id:CoID<CoValueImpl> }
    localNode:Signal<LocalNode|null>
    emit:(a:any, b:any)=>any
}> = function MainView ({
    localNode,
    params,
}) {
    const project = useTelepathicState(params.id)
    // Property 'get' does not exist on type 'CoValueImpl'.
    // Property 'get' does not exist on type 'CoStream<JsonValue, JsonObject | null>'.
    // @ts-ignore
    const tasks = useTelepathicState(project?.get('tasks'))

    // `createTask` is similar to `createProject` we saw earlier, creating a new CoMap
    // for a new task (in the same group as the list of tasks/the project), and then
    // adding it as an item to the project's list of tasks.
    const createTask = useCallback((text: string) => {
        if (!tasks || !text) return
        const task = tasks.group.createMap<Task>()

        task.edit((task) => {
            task.set('text', text)
            task.set('done', false)
        })

        // ??? why do types fail?
        // @ts-ignore
        tasks.edit(projectTasks => {
            projectTasks.push(task.id)
        })
    }, [tasks])

    const handleChange = useCallback(function handleChange (task, ev) {
        // "done" status is all that can change
        const checked = ev.target.form.elements['done-status'].checked
        task.edit(_task => _task.set('done', !!checked))
    }, [])

    return (<div>
        <h2>List</h2>
        {/* @ts-ignore */}
        <h3>{project?.get('title')}</h3>
        <ul className="todo-list">
            {/* @ts-ignore */}
            {tasks?.map((taskId: CoID<Task>) => {
                const task = useTelepathicState(taskId)

                return (<li key={taskId}>
                    <form onChange={handleChange.bind(null, task)}>
                        <label>
                            <input defaultChecked={task?.get('done') || false}
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

        <Divider />

        <div className="task-controls">
            <NewTaskInputRow onCreateTask={createTask}
                disabled={false}
            />
        </div>

        {project ?
            // ??? why do types fail
            // @ts-ignore
            <InvitationLinkControl list={project} /> :
            null
        }
    </div>)
}

const InvitationLinkControl:FunctionComponent<{
    list: TodoProject
}> = function InvitationLinkControl ({ list }) {
    const [showToast, setToast] = useState<boolean>(false)
    const [invitation, setInvitation] = useState('')

    function create (ev) {
        ev.preventDefault()
        const inviteLink = createInviteLink(list, 'writer')
        setInvitation(inviteLink)
        setToast(true)
    }

    const closeToast = useCallback((ev:MouseEvent) => {
        ev.preventDefault()
        setToast(false)
    }, [])

    return list?.group.myRole() === 'admin' ?
        (<div className="create-invitation-link">
            <Button onClick={create} isSpinning={false}>
                Create invitation
            </Button>

            {showToast ?
                (<Toast type="success" onClose={closeToast}>
                    {invitation}
                    <CopyBtn payload={invitation}>Copy</CopyBtn>
                </Toast>) :
                null
            }
        </div>) :
        null
}
