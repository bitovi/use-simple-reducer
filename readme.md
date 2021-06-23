# use-async-reducer-state

`useAsyncStateMethods` is a simple async state mechanism for ReactJS.  It's 
designed to be used for managing service state data and result in easy-to-test reducer methods.


## Use 


In your component, call `useAsyncReducerstate` with:

- The initial state you want to manage
- A collection of reducer methods, each to be called with the `state` as the first argument and values 
  passed to the `action` method as the second argument.


```js
const [state, isProcessing, actions] = useAsyncReducerState(
    // initial state
    {count: 0},
    // collection of reducer methods
    {
        async add(state, amountToAdd ){
            return { ...state, count: state.count + amountToAdd };
        },
        async subtract(state, amountToSubtract ){
            return { ...state, count: state.count - amountToSubtract };
        }
    }
 )
```

`useAsyncReducerstate` returns:

- `state` - The latest state. This will initially return the initial state value, then it will return 
  the values returned by the reducer methods.
- `isProcessing` - `true` if an async action is running, `false` if otherwise.  This can be used to add loading, spinners
  or other UI elements to the page.
- `actions` - An object of methods that can be used to update the state.

When the user interacts with the page, call the `actions` methods. For example, 
you might call `actions.add` and `actions.subtract` as follows:

```jsx
return <div>
    <button onclick={()=> actions.add(2)}>Two Steps Forward</button>

    <button onclick={()=> actions.subtract(1)}>One Step Back</button>

    <p>Steps: {state.count}</p>
</div>
```

