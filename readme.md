# use-async-reducer-state

`useAsyncStateMethods` is a simple async state mechanism for ReactJS.  It's 
designed to be used for managing service state data and result in easy-to-test reducer methods.


## Use 


In your component, call `useAsyncReducerState` with:

- The initial state you want to manage
- A collection of reducer methods, each to be called with the `state` as the first argument and values 
  passed to the `action` method as the second argument.


```js
const [state, isProcessing, actions, error] = useAsyncReducerState(
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

- `error` - An error that is returned if any of the actions fail.

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

An error object gets returned if any of the reducer methods fails. The cause of the error, details of the failed action and some error handling methods are exposed as part of the object.
## Use

```js
    return (
        <div>
            <Button type="Two Steps Forward" handleClick={() => actions.add(2)} />
            <Button type="One Step Back" handleClick={() => actions.subtract(1)} />
            <div style={styles.container}>
                <p style={styles.text}>Steps: {state.count}</p>
                <div style={styles.text}>{isProcessing ? <Loader /> : "Processing completed"}</div>
            </div>
            {error && <AlertDialog content={error.reason} onConfirm={() => error.rerunLastAction()} />}
        </div>
    );
}
```

### Interface

  
The `error` could contain the following fields:

|  Field |  Purpose  |
| --------- | -------------------------------------------------------------------- |
| `reason : any` | The cause of the error. This can be of any type depending on the error thrown.|
| `actionAndArgs : ActionAndArgs` | Details of the error which includes the action's name, method and arguments. |
| `rerunLastAction : (skipPendingActions: boolean = false) => void` | An error recovery method to rerun the last failed action. If skipPendingActions is set to true, the queue will be abandoned and the remaining actions in the queue will not be processed (default is false). |
| `rerunLastActions : (numberOfActions: number, skipPendingActions: boolean = false, idempotentActions: boolean = false) => void` | Similar to redoLastAction but it takes numberOfActions as a parameter to specify the last N of actions to rerun. Setting idempotentActions to true will only rerun idempotent actions (default is false). |
| `skipFailedAction : (skipPendingActions: boolean = false) => void` | This will skip the last failed action instead of reruning it. Setting skipPendingActions will abandon the rest of the queue. |




