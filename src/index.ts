import {useState as reactUseState, useRef} from "react";

// Given an an object of functions and each function returns a promise, creates a combined type for all return values
type FunctionPromiseReturnType<T> = T extends { [key: string]: (...args: any[]) => PromiseLike<infer RT> } ? RT: unknown;

// An object of functions of unlimited arguments that return a parameterized type
interface BaseActions<RetType> {
    [key: string]:  (...args: any[]) => RetType
}
// Given a parameter type, makes a first argument with that type
type FunctionForFirstParamType<ParamType> = {
    (arg0: ParamType): void
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
        actions : Actions,
        useState = reactUseState
    ) 

    : [
        // Return state
        FunctionPromiseReturnType<Actions> | InitialState, 
        // Processing 
        boolean,
        // Methods
        // Returns an object, for each key of the passed value ...
        {[PropertyType in keyof Actions]: 
            // Returns a function whose first argument is 
            FunctionForFirstParamType< 
                // The first parameter type
                Parameters<
                    // For the specific function for an action
                    Actions[PropertyType]
                >[1] 
            >}
    ]   
{
    
    const [state, setState] = useState(initialState);
    const [processing, setProcessing] = useState(false);

    const isProccessing = useRef(false);
    const currentState = useRef<any>(state);


    const {current: queue} = useRef<Array<any>>([]);

    const methods = {} as {[PropertyType in keyof Actions]: FunctionForFirstParamType<Parameters<Actions[PropertyType]>>};

    // implementation
    for(let actionName in actions) {
        methods[actionName] = (...args: any[])=> {
            queue.push({
                actionName: actionName,
                action: actions[actionName],
                args: args
            });
            if(!isProccessing.current) {
                isProccessing.current = true;
                setProcessing(true);
                runNext();
            }
        };
    }
    
    function runNext(){
        const actionAndArgs = queue.shift();
        if(actionAndArgs !== undefined) {
            actionAndArgs.action(currentState.current, ...actionAndArgs.args).then((state: any)=> {
                currentState.current = state;
                setState(state);
                runNext();
            });
        } else {
            isProccessing.current = false;
            setProcessing(false);
        }
    }

    return [state,processing, methods];
}
