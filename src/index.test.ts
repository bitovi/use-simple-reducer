import { useSimpleReducer } from './index'
import { renderHook, act } from '@testing-library/react-hooks'

async function addToState(state: { count: number }, num: number) {
  return { count: state.count + num }
}

async function subtractFromState(state: { count: number }, num: number) {
  return { count: state.count - num }
}

let shouldThrowError = true

async function errorAction(state: { count: number }, num: number) {
  if (shouldThrowError) {
    throw new Error('This action has failed being executed')
  }
  return { count: 0 }
}

let { result, waitForNextUpdate } = renderHook(() =>
  useSimpleReducer(
    { count: 0 },
    {
      add: addToState,
      subtract: subtractFromState,
      fail: errorAction,
    },
  ),
)

beforeEach(() => {
  ;({ result, waitForNextUpdate } = renderHook(() =>
    useSimpleReducer(
      { count: 0 },
      {
        add: addToState,
        subtract: subtractFromState,
        fail: errorAction,
      },
    ),
  ))
})

test('basics', async () => {
  let [currentState, { add, subtract }] = result.current

  expect(currentState.count).toBe(0)

  // processing update
  act(() => add(2))

  await waitForNextUpdate()
  ;[currentState, { subtract }] = result.current

  expect(currentState.count).toBe(2)

  act(() => subtract(1))

  await waitForNextUpdate()
  ;[currentState, { add, subtract }] = result.current

  expect(currentState.count).toBe(1)
})

describe('queing', () => {
  test('queuing actions', async () => {
    let [currentState, { add, subtract }] = result.current

    expect(currentState.count).toBe(0)

    // processing update
    act(() => {
      add(2)
      subtract(1)
    })

    await waitForNextUpdate()
    ;[currentState, { add, subtract }] = result.current

    expect(currentState.count).toBe(1)
  })
  test('activity status', async () => {
    let [currentState, { add, subtract }, queue] = result.current

    expect(currentState.count).toBe(0)

    expect(queue.isActive).toBeFalsy()
    // processing update
    act(() => {
      add(2)
      subtract(1)
    })

    await waitForNextUpdate()
    ;[currentState, { add, subtract }, queue] = result.current

    expect(queue.isActive).toBeFalsy()
  })
})

describe('error handling', () => {
  test('error reason and queue status', async () => {
    let [currentState, { add, subtract, fail }, queue, error] = result.current

    expect(currentState.count).toBe(0)

    // processing update
    act(() => {
      add(2)
      subtract(1)
      fail(1)
      add(2)
      subtract(1)
    })

    await waitForNextUpdate()
    ;[currentState, { add, subtract, fail }, queue, error] = result.current
    if (error) {
      const { reason, failedAction, pendingActions, runFailedAction, runPendingActions, runAllActions } = error
      expect(currentState.count).toBe(1)
      // Check that the error message matches the one being thrown
      expect(reason.message).toEqual('This action has failed being executed')
      // Check that the failed action's name and args are correct
      expect(failedAction.actionName).toEqual('fail')
      expect(failedAction.args[0]).toBe(1)
      // Check that the number of pending actions in the queue is correct
      expect(pendingActions?.length).toBe(2)
      // Check that the first pending action's name and args are correct
      expect(pendingActions[0].actionName).toEqual('add')
      expect(pendingActions[0].args[0]).toBe(2)
    }
  })
  test('running the failed action after an error', async () => {
    shouldThrowError = true

    let [currentState, { add, subtract, fail }, queue, error] = result.current

    expect(currentState.count).toBe(0)

    // processing update
    act(() => {
      add(2)
      subtract(1)
      fail(1)
      add(2)
      subtract(1)
    })

    await waitForNextUpdate()
    ;[currentState, { add, subtract, fail }, queue, error] = result.current
    if (error) {
      const { runFailedAction } = error
      expect(currentState.count).toBe(1)
      shouldThrowError = false
      act(() => {
        runFailedAction()
      })
      await waitForNextUpdate()
      ;[currentState, {}, queue, error] = result.current
      expect(currentState.count).toBe(0)
      expect(error).toBeNull()
    }
  })
  test('running pending actions after an error', async () => {
    let [currentState, { add, subtract, fail }, queue, error] = result.current

    expect(currentState.count).toBe(0)

    // processing update
    act(() => {
      add(2)
      subtract(1)
      fail(1)
      add(2)
      subtract(1)
    })

    await waitForNextUpdate()
    ;[currentState, { add, subtract, fail }, queue, error] = result.current
    if (error) {
      const { runPendingActions } = error
      expect(currentState.count).toBe(1)
      act(() => {
        runPendingActions()
      })
      await waitForNextUpdate()
      ;[currentState] = result.current
      expect(currentState.count).toBe(2)
      expect(error).toBeNull()
    }
  })
  test('running all actions after an error', async () => {
    shouldThrowError = true

    let [currentState, { add, subtract, fail }, queue, error] = result.current

    expect(currentState.count).toBe(0)

    // processing update
    act(() => {
      add(2)
      subtract(1)
      fail(1)
      add(2)
      subtract(1)
    })

    await waitForNextUpdate()
    ;[currentState, { add, subtract, fail }, queue, error] = result.current
    if (error) {
      const { runAllActions } = error
      expect(currentState.count).toBe(1)
      shouldThrowError = false
      act(() => {
        runAllActions()
      })
      await waitForNextUpdate()
      ;[currentState, {}, queue, error] = result.current
      expect(currentState.count).toBe(1)
      expect(error).toBeNull()
    }
  })
  test('not running any recovery methods after an error', async () => {
    shouldThrowError = true

    let [currentState, { add, subtract, fail }, queue, error] = result.current

    expect(currentState.count).toBe(0)

    // processing update
    act(() => {
      add(2)
      subtract(1)
      fail(1)
      add(2)
      subtract(1)
    })

    await waitForNextUpdate()
    ;[currentState, { add, subtract, fail }, queue, error] = result.current
    if (error) {
      expect(currentState.count).toBe(1)
      expect(queue.pendingActions.length).toBe(0)
      expect(queue.runningAction).toBeNull()
    }
  })
  test('running a recovery method after the users invokes an action', async () => {
    shouldThrowError = true

    let [currentState, { add, subtract, fail }, queue, error] = result.current

    expect(currentState.count).toBe(0)

    // processing update
    act(() => {
      add(2)
      subtract(1)
      fail(1)
      add(2)
      subtract(1)
    })

    await waitForNextUpdate()
    ;[currentState, { add, subtract, fail }, queue, error] = result.current
    if (error) {
      expect(currentState.count).toBe(1)
      act(() => {
        add(2)
      })
      await waitForNextUpdate()
      
      [currentState, {}, queue, error] = result.current
      
      expect(error).toBeNull()
    }
  })
})
