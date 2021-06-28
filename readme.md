# use-async-reducer-state

`useAsyncReducerState` is a simple async state mechanism for ReactJS.  It's 
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

|  Field | Type |  Purpose  |
| ------- | ---------------- | ------------------- |
| `reason` | any | The cause of the error. This can be of any type depending on the error thrown.|
| `failedActionAndArgs` | ActionAndArgs | Details of the failed action which include the action's name, method and arguments. |
| `pendingActionsAndArgs` | ActionAndArgs[] | Details of the pending actions in the queue which include the actions' names, methods and arguments. |
| `rerunFailedtAction` | (skipPendingActions?: boolean) => void | An error recovery method to re-run the last failed action. Setting `skipPendingActions` to true will abandon the rest of the queue and the remaining actions will not be processed `default = false`. |
| `skipFailedAction` | (skipPendingActions?: boolean) => void | This will skip the last failed action instead of re-running it. Setting `skipPendingActions` to true will abandon the rest of the queue and the remaining actions will not be processed `default = false`. |


## Demonstration
CodeSandBox:
 > https://codesandbox.io/s/gallant-heisenberg-bwl9j




