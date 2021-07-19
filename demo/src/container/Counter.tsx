import { useSimpleReducer } from '@bitovi/use-async-reducer-state';
import Button from '../components/Button';
import Loader from 'react-loader-spinner';
import Modal from '../components/Modal';
import { CounterState } from '../types';
import { useRef } from 'react';

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'block',
    width: '100%',
    textAlign: 'center',
    marginTop: '50px',
  },
  text: {
    fontSize: '22px',
    fontWeight: 'bold',
  },
};

const updateCountOnServer = function (time: number) {
  // Mocking updating the count state on the server with a wait
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};
const initialState: CounterState = {
  count: 0,
};
function Counter() {
  const amount = useRef(2);
  const [state, actions, queue, error] = useSimpleReducer(
    // initial state
    initialState,
    // collection of reducer methods
    {
      async add(state: CounterState, amountToAdd: number): Promise<CounterState> {
        await updateCountOnServer(1000);
        if (amount.current === 2) {
          amount.current = 1;
          throw new Error('Error adding amount with value 2');
        }
        return { ...state, count: state.count + amountToAdd };
      },
      async subtract(state: CounterState, amountToSubtract: number): Promise<CounterState> {
        await updateCountOnServer(1000);
        return { ...state, count: state.count - amountToSubtract };
      },
    },
  );
  return (
    <div>
      {error ? (
        <Modal message={error.reason.message} action={error.runFailedAction} />
      ) : (
        <div>
          <Button type="Two Steps Forward" handleClick={() => actions.add(2)} />
          <Button type="One Step Back" handleClick={() => actions.subtract(1)} />

          <div style={styles.container}>
            <p style={styles.text}>Steps: {state.count}</p>
            <div style={styles.text}>
              {queue.isActive ? (
                <Loader type="Puff" color="#00BFFF" height={100} width={100} />
              ) : (
                'Processing completed'
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Counter;
