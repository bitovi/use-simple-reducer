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
// An error object with a message string, an actionAndArgs object and a callback function
interface Error {
    reason: any,
    actionAndArgs: ActionAndArgs,
    rerunFailedAction: (skipPendingActions?: boolean) => void
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
        boolean,
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
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<Error | null>(null)
    const isProccessing = useRef(false);
    const currentState = useRef<any>(state);


    const { current: queue } = useRef<ActionAndArgs[]>([]);

    const methods = {} as { [PropertyType in keyof Actions]: FunctionForFirstParamType<Parameters<Actions[PropertyType]>> };

    // implementation
    for (const actionName in actions) {
        if (Object.prototype.hasOwnProperty.call(actions, actionName)) {
            methods[actionName] = (...args: any[]) => {
                queue.push({
                    actionName,
                    action: actions[actionName],
                    args
                });
                if (!isProccessing.current) {
                    isProccessing.current = true;
                    setProcessing(true);
                    runNext();
                }
            };
        }
    }

    function runNext() {
        const actionAndArgs = queue.shift();
        if (actionAndArgs !== undefined) {
            actionAndArgs.action(currentState.current, ...actionAndArgs.args).then((latestState: any) => {
                currentState.current = latestState;
                setError(null)
                setState(latestState);
                runNext();
            }).catch((err: any) => {
                setError({
                    reason: err.message,
                    actionAndArgs,
                    rerunFailedAction: (skipPendingActions: boolean = false) => runLast(actionAndArgs)
                })
                isProccessing.current = false;
                setProcessing(false);
            }
            );
        } else {
            isProccessing.current = false;
            setProcessing(false);
        }
    }
    function runLast(actionAndArgs: any) {
        queue.unshift(actionAndArgs)
        runNext();
    }
    return [state, processing, methods, error];
}
