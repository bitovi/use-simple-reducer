# use-async-reducer-state

`useAsyncReducerState` is a simple async state mechanism for ReactJS.  It's 
designed to be used for managing service state data and result in easy-to-test reducer methods.


## Use 


In your component, call `useAsyncReducerState` with:

- The initial state you want to manage
- A collection of reducer methods, each to be called with the `state` as the first argument and values 
  passed to the `action` method as the second argument. If you are unfamiliar with the reducer pattern you can check out the redux [reducer](https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers).


```js
const [state, queue, actions, error] = useAsyncReducerState(
    // initial state
    {count: 0},
    // collection of reducer methods
    {
        async add(state, amountToAdd ){
            return { ...state, count: state.count + amountToAdd + amount.offset };
        },
        async subtract(state, amountToSubtract ){
            // Performing a GET request to fetch an offset value to be subtracted from 'amountToSubract'
            fetch("https://example.com/counter")
            .then(response => response.json())
            .then(amount => return { ...state, count: (state.count - amountToSubtract - amount.offset) })  
        }
    }
 )
```

`useAsyncReducerState` returns:

|  Field | Type |  Purpose  |
| ------- | ---------------- | ------------------- |
| `state` | {[key: string]: any} | The latest state. This will initially return the initial state value, then it will return the values returned by the reducer methods.|
| `queue` | {isProcessing: boolean, pendingActionsAndArgs: ActionAndArgs[], processingActionAndArgs : ActionAndArgs} | The state of the queue, whether it is still processing and the pending actions in the queue.|
| `actions` | {[key: string]: (arg: any) => void} | An object of methods that can be used to update the state.|
| `error` | Error \| null | An error that is returned if any of the actions fail, `null` if otherwise.|


When the user interacts with the page, call the `actions` methods. For example, 
you might call `actions.add` and `actions.subtract` as follows:

```jsx
return <div>
    <button onClick={()=> actions.add(2)}>Two Steps Forward</button>
    <button onClick={()=> actions.subtract(1)}>One Step Back</button>
    <div>
        <p>Steps: {state.count}</p>
        <div>{isProcessing ? <Loader /> : "Processing completed"}</div>
    </div>
</div>
```
The argument being passed to `actions` methods. For example, `actions.add(2)` should match the type of the 2nd argument of the reducer method         
```js
async add(state, amountToAdd ){
    return { ...state, count: state.count + amountToAdd };
}
```

## The Queue

Any invoked reducer action gets added to a queue. The queue will then start processing those asynchrous actions in the same order they have been added. The `isProcessing` flag gets set to `false` once all actions has been processed.  

### Interface

|  Field | Type |  Purpose  |
| ------- | ---------------- | ------------------- |
| `isProcessing` | boolean | `true` if an async action is running, `false` if otherwise.  This can be used to add loading, spinners or other UI elements to the page.|
| `processingActionAndArgs` | ActionAndArgs | Details of the in process action which include the action's name, method and arguments. |
| `pendingActionsAndArgs` | ActionAndArgs[] | An Array of details of the pending actions in the queue which include the actions' names, methods and arguments. |


## Error Handling

An error object gets returned if any of the reducer methods fails. The cause of the error, details of the failed action and some error handling methods are exposed as part of the object.

## Use

```js
    return (
        <div>
            <button onClick={()=> actions.add(2)}>Two Steps Forward</button>
            <button onClick={()=> actions.subtract(1)}>One Step Back</button>
            <div>
                <p>Steps: {state.count}</p>
                <div>{queue.isProcessing ? <Loader /> : "Processing completed"}</div>
            </div>
            {error && <AlertDialog content={error.reason} onConfirm={() => error.rerunFailedAction()} />}
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
| `pendingActionsAndArgs` | ActionAndArgs[] | An array of the details of the pending actions in the queue which include the actions' names, methods and arguments. |
| `runFailedAction` | () => void | An error recovery method to re-run the last failed action. |
| `runPendingActions` | () => void | An error recovery method to skip the failed action and only run the pending actions in the queue. |
| `runAllActions` | () => void | An error recovery method to re-run the failed action and all the pending actions in the queue. |

Unless the user calls any of the error recovery methods listed above, a default behaviour of the queue is to clear the failed and pending actions in it once an error occurs. 
These recovery methods are only available to use as long as no other intermediate actions has been performed. For example, If the user enqueues another action to the queue after one has failed and then tries to call one of the recovery methods it will fail.

## Demonstration
CodeSandBox:
 > https://codesandbox.io/s/gallant-heisenberg-bwl9j
