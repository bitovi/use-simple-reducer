import { useAsyncReducerState } from './index';
import { renderHook, act } from '@testing-library/react-hooks'


async function addToState(state: {count: number}, number: number) {;
  return {count: state.count + number};
}

async function subtractFromState(state: {count: number}, number: number) {

  return {count: state.count - number};
}


test('basics', async () => {

  const {result, waitForNextUpdate}  = renderHook(
      () => useAsyncReducerState({count: 0},{
        add: addToState,
        subtract: subtractFromState
      })
    )

  let [currentState, processing,{add, subtract}] = result.current;

  expect(currentState.count).toBe(0);

  // processing update
  act( ()=>  add(2) );

  await waitForNextUpdate();

  [currentState, processing,{subtract}] = result.current;

  expect(currentState.count).toBe(2);

  act( ()=>  subtract(1) );

  await waitForNextUpdate();

  [currentState, processing,{subtract}] = result.current;

  expect(currentState.count).toBe(1);

});


test('queing', async ()=> {

  const {result, waitForNextUpdate}  = renderHook(
    () => useAsyncReducerState({count: 0},{
      add: addToState,
      subtract: subtractFromState
    })
  )

  let [currentState, processing,{add, subtract}] = result.current;

  expect(currentState.count).toBe(0);

  // processing update
  act( ()=> { 
    add(2); 
    subtract(1); 
  } );

  await waitForNextUpdate();

  [currentState, processing,{subtract}] = result.current;

  expect(currentState.count).toBe(1);


});

