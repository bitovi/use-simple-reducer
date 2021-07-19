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

export function useAsyncReducerState<
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
  // Processing
  boolean,
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
  const [processing, setProcessing] = useState(false);
  const ifMounted = useIfMounted();
  const isProccessing = useRef(false);
  const currentState = useRef<any>(state);

  const { current: queue } = useRef<any[]>([]);

  const methods = {} as {
    [PropertyType in keyof Actions]: FunctionForFirstParamType<Parameters<Actions[PropertyType]>>;
  };

  // implementation
  for (const actionName in actions) {
    if (Object.prototype.hasOwnProperty.call(actions, actionName)) {
      methods[actionName] = (...args: any[]) => {
        queue.push({
          actionName,
          action: actions[actionName],
          args,
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
        ifMounted(() => {
          currentState.current = latestState;
          setState(latestState);
          runNext();
        });
      });
    } else {
      isProccessing.current = false;
      setProcessing(false);
    }
  }

  return [state, processing, methods];
}
