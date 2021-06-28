# use-async-reducer-state

`useAsyncStateMethods` is a simple async state mechanism for ReactJS.  It's 
designed to be used for managing service state data and result in easy-to-test reducer methods.


## Use 


In your component, call `useAsyncReducerState` with:

- The initial state you want to manage
- A collection of reducer methods, each to be called with the `state` as the first argument and values 
  passed to the `action` method as the second argument.


```js
const [state, isProcessing, actions,] = useAsyncReducerState(
    // initial state
    {count: 0},
    // collection of reducer methods
    {
        async add(state, isIdemptonent, amountToAdd ){
            return { ...state, count: state.count + amountToAdd };
        },
        async subtract(state, amountToSubtract ){
            return { ...state, count: state.count - amountToSubtract };
        }
    }
 )
```

`useAsyncReducerState` returns:

- `state` - The latest state. This will initially return the initial state value, then it will return 
  the values returned by the reducer methods.
- `isProcessing` - `true` if an async action is running, `false` if otherwise.  This can be used to add loading, spinners
  or other UI elements to the page.
- `actions` - An object of methods that can be used to update the state.

- `error` - An object of an error that is returned if any of the actions fail.

When the user interacts with the page, call the `actions` methods. For example, 
you might call `actions.add` and `actions.subtract` as follows:

```jsx
return <div>
    <button onclick={()=> actions.add(2)}>Two Steps Forward</button>

    <button onclick={()=> actions.subtract(1)}>One Step Back</button>

    <p>Steps: {state.count}</p>
</div>
```

## Error Handling

An error state gets returned if any of the called actions fails. A reason for the error, failed action related info and some recovery methods are exposed as part of the error object.

```js
    return (
        <div>
            <Button type="Two Steps Forward" handleClick={() => actions.add(2)} />
            <Button type="One Step Back" handleClick={() => actions.subtract(1)} />
            <div style={styles.container}>
                <p style={styles.text}>Steps: {state.count}</p>
                <div style={styles.text}>{isProcessing ? <Loader /> : "Processing completed"}</div>
            </div>
            {error && <AlertDialog content={error.reason} onConfirm={() => error.redoLastAction()} />}
        </div>
    );
}
```

## Interface

The `error` object is composed of:

- `reason : any` 
A description of the error.

- `actionAndArgs : ActionAndArgs` 
A set of values related to the failed action such as it's name, the action and its arguments.

- `redoLastAction : (skipPendingActions: boolean = false) => void` 
Recovery method to rerun the last failed action, if skipPendingActions is set to true, the queue will be abandoned and the remaining actions in the queue will not be processed (default is false).

- `redoLastActions : (numberOfActions: number, skipPendingActions: boolean = false, idempotentActions: boolean = false) => void
` 
Similar to redoLastAction but takes numberOfActions as a parameter to specify the last N of actions to rerun. Setting idempotentActions to true will only rerun idempotent actions.
- `skipFailedAction : (skipPendingActions: boolean = false) => void` 
This will skip the last failed action instead of reruning it. Setting skipPendingActions will abandon the rest of the queue.


