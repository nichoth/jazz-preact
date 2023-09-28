import {
    LocalNode,
    CoValueImpl,
    CoID,
    CoMap,
    AccountID,
    JsonValue,
    CojsonInternalTypes,
    BinaryCoStream,
    BinaryCoStreamMeta,
} from 'cojson'
import { useContext, useEffect, useState } from 'preact/hooks'
import { ComponentChildren, FunctionComponent, createContext } from 'preact'
import {
    createBrowserNode,
    readBlobFromBinaryStream
} from 'jazz-browser'
import { AuthHook, AuthStatus } from './jazz-preact-auth-local.jsx'

export {
    createInviteLink,
    parseInviteLink,
    consumeInviteLinkFromWindowLocation,
} from 'jazz-browser'

type JazzContextType = {
    localNode?: LocalNode;
    logOut?: () => void;
    authStatus:AuthStatus;
};

const JazzContext = createContext<JazzContextType | undefined>(undefined)

interface Props {
    useAuth:AuthHook;
    children?: ComponentChildren;
    syncAddress?: string;
}

export const WithJazz:FunctionComponent<Props> = function WithJazz (props) {
    const { useAuth, syncAddress } = props
    const [node, setNode] = useState<LocalNode | undefined>()

    const { provider, logOut, authStatus } = useAuth()

    useEffect(() => {
        let done: (() => void) | undefined
        let stop = false;

        (async () => {
            const nodeHandle = await createBrowserNode({
                auth: provider,
                syncAddress:
                    syncAddress ||
                    new URLSearchParams(window.location.search).get('sync') ||
                    undefined,
            })

            if (stop) {
                nodeHandle.done()
                return
            }

            setNode(nodeHandle.node)

            done = nodeHandle.done
        })().catch((err) => {
            console.log('Failed to create browser node', err)
        })

        return () => {
            stop = true
            done && done()
        }
    }, [useAuth, syncAddress])

    // ??? how to deal with types + component children?
    // @ts-ignore
    return (<JazzContext.Provider value={{
        localNode: node,
        logOut,
        authStatus
    }}>
        {props.children}
    </JazzContext.Provider>)
}

export function useJazz () {
    const context = useContext(JazzContext)

    if (!context) {
        throw new Error('useJazz must be used within a WithJazz provider')
    }

    return context
}

export function useTelepathicState<T extends CoValueImpl> (id?: CoID<T>) {
    const [state, setState] = useState<T>()

    const { localNode } = useJazz()

    useEffect(() => {
        if (!id || !localNode) return
        let unsubscribe: (() => void) | undefined

        let done = false

        localNode
            .load(id)
            .then((state) => {
                if (done) return
                unsubscribe = state.subscribe((newState) => {
                    // console.log(
                    //     "Got update",
                    //     id,
                    //     newState.toJSON(),
                    // );
                    setState(newState as T)
                })
            })
            .catch((e) => {
                console.log('Failed to load', id, e)
            })

        return () => {
            done = true
            unsubscribe && unsubscribe()
        }
    }, [localNode, id])

    return state
}

export function useProfile<
    P extends {
        [key: string]: JsonValue;
    } & CojsonInternalTypes.ProfileContent = CojsonInternalTypes.ProfileContent
> (
    accountID?: AccountID
): CoMap<P, CojsonInternalTypes.ProfileMeta> | undefined {
    const [profileID, setProfileID] =
        useState<CoID<CoMap<P, CojsonInternalTypes.ProfileMeta>>>()

    const { localNode } = useJazz()

    useEffect(() => {
        if (!localNode) return
        accountID &&
            localNode
                .loadProfile(accountID)
                .then((profile) => setProfileID(profile.id as typeof profileID))
                .catch((e) => console.log('Failed to load profile', e))
    }, [localNode, accountID])

    return useTelepathicState(profileID)
}

export function useBinaryStream<C extends BinaryCoStream<BinaryCoStreamMeta>> (
    streamID?: CoID<C>,
    allowUnfinished?: boolean
): { blob: Blob; blobURL: string } | undefined {
    const { localNode } = useJazz()

    const stream = useTelepathicState(streamID)

    const [blob, setBlob] = useState<
        { blob: Blob; blobURL: string } | undefined
    >()

    useEffect(() => {
        if (!stream || !localNode) return
        readBlobFromBinaryStream(stream.id, localNode, allowUnfinished)
            .then((blob) =>
                setBlob(
                    blob && {
                        blob,
                        blobURL: URL.createObjectURL(blob),
                    }
                )
            )
            .catch((e) => console.error('Failed to read binary stream', e))
    }, [stream, localNode])

    useEffect(() => {
        return () => {
            blob && URL.revokeObjectURL(blob.blobURL)
        }
    }, [blob?.blobURL])

    return blob
}
