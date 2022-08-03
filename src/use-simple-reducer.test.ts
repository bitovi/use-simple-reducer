import { renderHook, act } from '@testing-library/react-hooks'

import { useSimpleReducer } from './use-simple-reducer'

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

const initialState = { count: 0 }
const actions = {
  add: addToState,
  subtract: subtractFromState,
  fail: errorAction,
}

const currentStateIndex = 0
const errorIndex = 3

test('basics', async () => {
  const { result, waitForNextUpdate } = renderHook(() => useSimpleReducer(initialState, actions))
  const [, { add, subtract }] = result.current

  expect(result.current[currentStateIndex].count).toBe(0)

  act(() => add(2))

  await waitForNextUpdate()

  expect(result.current[currentStateIndex].count).toBe(2)

  act(() => subtract(1))

  await waitForNextUpdate()

  expect(result.current[currentStateIndex].count).toBe(1)
})

describe('queing', () => {
  test('queuing actions', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSimpleReducer(initialState, actions))
    const [, { add, subtract }] = result.current

    expect(result.current[currentStateIndex].count).toBe(0)

    act(() => {
      add(2)
      subtract(1)
    })

    await waitForNextUpdate()

    expect(result.current[currentStateIndex].count).toBe(1)
  })

  test('activity status', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSimpleReducer(initialState, actions))
    const [, { add, subtract }, queue] = result.current

    expect(result.current[currentStateIndex].count).toBe(0)

    expect(queue.isActive).toBeFalsy()

    act(() => {
      add(2)
      subtract(1)
    })

    await waitForNextUpdate()

    expect(queue.isActive).toBeFalsy()
  })
})

describe('error handling', () => {
  beforeEach(() => {
    shouldThrowError = true
  })

  test('error reason and queue status', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSimpleReducer(initialState, actions))
    const [, { add, subtract, fail }] = result.current

    expect(result.current[currentStateIndex].count).toBe(0)

    act(() => {
      add(2)
      subtract(1)
      fail(1)
      add(2)
      subtract(1)
    })

    await waitForNextUpdate()

    const error = result.current[errorIndex]

    expect(result.current[currentStateIndex].count).toBe(1)
    // Check that the error message matches the one being thrown
    expect(error?.reason.message).toEqual('This action has failed being executed')
    // Check that the failed action's name and args are correct
    expect(error?.failedAction.actionName).toEqual('fail')
    expect(error?.failedAction.args[0]).toBe(1)
    // Check that the number of pending actions in the queue is correct
    expect(error?.pendingActions?.length).toBe(2)
    // Check that the first pending action's name and args are correct
    expect(error?.pendingActions[0].actionName).toEqual('add')
    expect(error?.pendingActions[0].args[0]).toBe(2)
  })

  test('running the failed action after an error', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSimpleReducer(initialState, actions))

    const [, { add, subtract, fail }] = result.current

    expect(result.current[currentStateIndex].count).toBe(0)

    act(() => {
      add(2)
      subtract(1)
      fail(1)
      add(2)
      subtract(1)
    })

    await waitForNextUpdate()

    const error = result.current[errorIndex]

    expect(result.current[currentStateIndex].count).toBe(1)

    shouldThrowError = false

    act(() => {
      error?.runFailedAction()
    })

    await waitForNextUpdate()

    expect(result.current[currentStateIndex].count).toBe(0)
    expect(result.current[errorIndex]).toBeNull()
  })

  test('running pending actions after an error', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSimpleReducer(initialState, actions))
    const [, { add, subtract, fail }] = result.current

    expect(result.current[currentStateIndex].count).toBe(0)

    act(() => {
      add(2)
      subtract(1)
      fail(1)
      add(2)
      subtract(1)
    })

    await waitForNextUpdate()

    const error = result.current[errorIndex]

    expect(result.current[currentStateIndex].count).toBe(1)

    act(() => {
      error?.runPendingActions()
    })

    await waitForNextUpdate()

    expect(result.current[currentStateIndex].count).toBe(2)
    expect(result.current[errorIndex]).toBeNull()
  })

  test('running all actions after an error', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSimpleReducer(initialState, actions))
    const [, { add, subtract, fail }] = result.current

    expect(result.current[currentStateIndex].count).toBe(0)

    act(() => {
      add(2)
      subtract(1)
      fail(1)
      add(2)
      subtract(1)
    })

    await waitForNextUpdate()

    const error = result.current[errorIndex]

    expect(result.current[currentStateIndex].count).toBe(1)
    shouldThrowError = false
    act(() => {
      error?.runAllActions()
    })

    await waitForNextUpdate()

    expect(result.current[currentStateIndex].count).toBe(1)
    expect(result.current[errorIndex]).toBeNull()
  })

  test('not running any recovery methods after an error', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSimpleReducer(initialState, actions))
    const [, { add, subtract, fail }, queue] = result.current

    expect(result.current[currentStateIndex].count).toBe(0)

    act(() => {
      add(2)
      subtract(1)
      fail(1)
      add(2)
      subtract(1)
    })

    await waitForNextUpdate()

    expect(result.current[errorIndex]).toBeDefined()
    expect(result.current[currentStateIndex].count).toBe(1)
    expect(queue.pendingActions.length).toBe(0)
    expect(queue.runningAction).toBeNull()
  })

  test('running a recovery method after the users invokes an action', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSimpleReducer(initialState, actions))
    const [, { add, subtract, fail }] = result.current

    expect(result.current[currentStateIndex].count).toBe(0)

    act(() => {
      add(2)
      subtract(1)
      fail(1)
      add(2)
      subtract(1)
    })

    await waitForNextUpdate()

    expect(result.current[currentStateIndex].count).toBe(1)

    act(() => {
      add(2)
    })

    await waitForNextUpdate()
    expect(result.current[errorIndex]).toBeNull()
  })
})
