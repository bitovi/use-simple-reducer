import { useState as reactUseState, useRef, useEffect } from 'react';
import useIfMounted from './hooks/useIfMounted';
// Given an an object of functions and each function returns a promise, creates a combined type for all return values
type FunctionPromiseReturnType<T> = T extends { [key: string]: (...args: any[]) => PromiseLike<infer RT> }
  ? RT
  : unknown;

// An object of functions of unlimited arguments that return a parameterized type
interface BaseActions<RetType> {
  [key: string]: (...args: any[]) => RetType;
}
// Given a parameter type, makes a first argument with that type
type FunctionForFirstParamType<ParamType> = (arg0: ParamType) => void;
// Give an initial state, if it is a promise it will return the non error return type of it. Otherwise, it returns the initial state
type FunctionForInitialStateType<StateType> = StateType extends PromiseLike<infer IS> ? IS | null : StateType;
// A user-defined type guard to check whether the initialState is a Promise
function isInitialStatePromise(initialState: { [key: string]: any }): initialState is Promise<{ [key: string]: any }> {
  return initialState && Object.prototype.toString.call(initialState) === '[object Promise]';
}
type Nullable<T> = T | null;
// An object of a name string, an action callback function and an array of arguments being passed to the action
interface ActionAndArgs {
  actionName: string;
  action: (...args: any[]) => any;
  args: any[];
}
// The state of the queue, whether it is still active and details of the running and pending actions in the queue
interface Queue {
  isActive: boolean;
  runningAction: Nullable<ActionAndArgs>;
  pendingActions: ActionAndArgs[];
}
// An error object with a message string, an actionAndArgs object and a callback function
interface Error {
  reason: any;
  failedAction: ActionAndArgs;
  pendingActions: ActionAndArgs[];
  runFailedAction: () => void;
  runPendingActions: () => void;
  runAllActions: () => void;
}
export function useSimpleReducer<
  // State of the initial state
  InitialState,
  // Actions is an object of functions where each value is a function
  Actions extends BaseActions<any>,
>(
  initialState: InitialState,
  actions: Actions,
  useState = reactUseState,
): [
  // Return state
  FunctionPromiseReturnType<Actions> | FunctionForInitialStateType<InitialState>,
  // Methods
  // Returns an object, for each key of the passed value ...
  {
    [PropertyType in keyof Actions]: FunctionForFirstParamType<
      // Returns a function whose first argument is
      // The first parameter type
      Parameters<
        // For the specific function for an action
        Actions[PropertyType]
      >[1]
    >;
  },
  // Queue
  Queue,
  // Error
  Nullable<Error>,
] {
  useEffect(() => {
    if (isInitialStatePromise(initialState)) {
      initialState.then((response: any) => {
        setState(response);
        currentState.current = response;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [state, setState] = useState(initialState as FunctionForInitialStateType<InitialState>);
  const [queue, setQueue] = useState<Queue>({ isActive: false, runningAction: null, pendingActions: [] });
  const [error, setError] = useState<Error | null>(null);
  const { current: currentQueue } = useRef<ActionAndArgs[]>([]);
  const ifMounted = useIfMounted();
  const isProccessing = useRef(false);
  const currentState = useRef<any>(state);

  const methods = {} as {
    [PropertyType in keyof Actions]: FunctionForFirstParamType<Parameters<Actions[PropertyType]>>;
  };

  // implementation
  for (const actionName in actions) {
    if (Object.prototype.hasOwnProperty.call(actions, actionName)) {
      methods[actionName] = (...args: any[]) => {
        currentQueue.push({
          actionName,
          action: actions[actionName],
          args,
        });
        if (!isProccessing.current) {
          isProccessing.current = true;
          runNext();
        }
      };
    }
  }

  function runNext() {
    const actionAndArgs = currentQueue.shift();
    if (actionAndArgs !== undefined) {
      setQueue({ ...queue, isActive: true, runningAction: actionAndArgs, pendingActions: [...currentQueue] });
      actionAndArgs
        .action(currentState.current, ...actionAndArgs.args)
        .then((latestState: any) => {
          ifMounted(() => {
            currentState.current = latestState;
            setError(null);
            setState(latestState);
            runNext();
          });
        })
        .catch((err: any) => {
          ifMounted(() => {
            const pendingActions = [...currentQueue];
            currentQueue.splice(0, currentQueue.length);
            isProccessing.current = false;
            setQueue({ ...queue, isActive: false, runningAction: null, pendingActions: [] });
            setError({
              reason: err,
              failedAction: actionAndArgs,
              pendingActions,
              runFailedAction: () => runActions([actionAndArgs]),
              runPendingActions: () => runActions(pendingActions),
              runAllActions: () => runActions([actionAndArgs, ...pendingActions]),
            });
          });
        });
    } else {
      isProccessing.current = false;
      setQueue({ ...queue, isActive: false, runningAction: null, pendingActions: [] });
    }
  }
  function runActions(actionsAndArgs: ActionAndArgs[]) {
    currentQueue.push(...actionsAndArgs);
    runNext();
  }
  return [state, methods, queue, error];
}
