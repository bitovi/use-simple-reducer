import { useState as reactUseState, useRef } from "react";

// Given an an object of functions and each function returns a promise, creates a combined type for all return values
type FunctionPromiseReturnType<T> = T extends { [key: string]: (...args: any[]) => PromiseLike<infer RT> } ? RT : unknown;

// An object of functions of unlimited arguments that return a parameterized type
interface BaseActions<RetType> {
    [key: string]: (...args: any[]) => RetType
}
// Given a parameter type, makes a first argument with that type
type FunctionForFirstParamType<ParamType> = (arg0: ParamType) => void

// An object of a name string, an action callback function and an array of arguments being passed to the action
interface ActionAndArgs {
    actionName: string,
    action: (...args: any[]) => any,
    args: any[]
}
//The state of the queue, whether it is still processing and details of the running and pending actions in the queue
interface Queue {
    isProcessing: boolean,
    runningActionAndArgs?: ActionAndArgs,
    pendingActionsAndArgs?: ActionAndArgs[]
}
// An error object with a message string, an actionAndArgs object and a callback function
interface Error {
    reason: any,
    failedActionAndArgs: ActionAndArgs,
    pendingActionsAndArgs: ActionAndArgs[],
    runFailedAction: () => void,
    runPendingActions: () => void,
    runAllActions: () => void
}
export function useAsyncReducerState
    <
        // State of the initial state
        InitialState,
        // Actions is an object of functions where each value is a function
        Actions extends BaseActions<any>
    >

    (
        initialState: InitialState,
        actions: Actions,
        useState = reactUseState
    )

    : [
        // Return state
        FunctionPromiseReturnType<Actions> | InitialState,
        // Processing 
        Queue,
        // Methods
        // Returns an object, for each key of the passed value ...
        { [PropertyType in keyof Actions]:
            // Returns a function whose first argument is 
            FunctionForFirstParamType<
                // The first parameter type
                Parameters<
                    // For the specific function for an action
                    Actions[PropertyType]
                >[1]
            > },
        // Error
        Error | null
    ] {

    const [state, setState] = useState(initialState);
    const [queue, setQueue] = useState<Queue>({isProcessing :false});
    const [error, setError] = useState<Error | null>(null)
    const {current: currentQueue} = useRef<ActionAndArgs[]>([]);
    let {current: currentState} = useRef<any>(state);

    const methods = {} as { [PropertyType in keyof Actions]: FunctionForFirstParamType<Parameters<Actions[PropertyType]>> };

    // implementation
    for (const actionName in actions) {
        if (Object.prototype.hasOwnProperty.call(actions, actionName)) {
            methods[actionName] = (...args: any[]) => {
                currentQueue.push({
                    actionName,
                    action: actions[actionName],
                    args
                });
                if (!queue.isProcessing) {
                    runNext();
                }
            };
        }
    }

    function runNext() {
        setQueue({...queue, isProcessing: true});
        const actionAndArgs = currentQueue.shift();
        if (actionAndArgs !== undefined) {
            actionAndArgs.action(currentState, ...actionAndArgs.args).then((latestState: any) => {
                currentState = latestState;
                setError(null)
                setQueue({...queue, runningActionAndArgs: actionAndArgs, pendingActionsAndArgs: [...currentQueue]});
                setState(latestState);
                runNext();
            }).catch((err: any) => {
                const pendingActionsAndArgs = [...currentQueue]
                currentQueue.splice(0, currentQueue.length)
                setQueue({...queue, isProcessing: false});
                setError({
                    reason: err,
                    failedActionAndArgs: actionAndArgs,
                    pendingActionsAndArgs: pendingActionsAndArgs,
                    runFailedAction: () => runActions([actionAndArgs]),
                    runPendingActions: () => runActions(pendingActionsAndArgs),
                    runAllActions: () => runActions([actionAndArgs, ...pendingActionsAndArgs])
                })
            }
            );
        } else {
            setQueue({...queue, isProcessing: false});
        }
    }
    function runActions(actionsAndArgs: ActionAndArgs[]) {
        for (const actionAndArgs of actionsAndArgs) {
            currentQueue.push(actionAndArgs)
        }
        runNext();
    }
    return [state, queue, methods, error];
}
