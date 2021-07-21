import { useSimpleReducer } from '@bitovi/use-simple-reducer';
import Button from '../components/Button';
import Loader from 'react-loader-spinner';
import Modal from '../components/Modal';
import { CounterState } from '../types';

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
    marginBottom: '50px',
  },
  queueText: {
    fontSize: '30px',
    fontWeight: 'bold',
    marginTop: '70px',
  },
  grid: {
    width: '50%',
    margin: '50px auto',
    display: 'grid',
    gridGap: '10px',
    gridTemplateColumns: 'repeat(8, 1fr [col])',
    backgroundColor: '#fff',
    color: '#444',
  },
  itemRunning: {
    gridRow: '1 / 2',
    gridColumn: 'col 0 / col 1',
    backgroundColor: '#234242',
    color: '#fff',
    borderRadius: '5px',
    padding: '10px',
    fontSize: '80%',
  },
  itemPending: {
    gridRow: '1 / 2',
    gridColumn: 'col 1 / span 7',
    backgroundColor: '#234242',
    color: '#fff',
    borderRadius: '5px',
    padding: '20px',
    fontSize: '80%',
  },
  item: {
    backgroundColor: '#444',
    color: '#fff',
    borderRadius: '5px',
    padding: '20px',
    fontSize: '80%',
  },
  dashed: {
    borderTop: '3px dashed #bbb',
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
  const [state, actions, queue, error] = useSimpleReducer(
    // initial state
    initialState,
    // collection of reducer methods
    {
      async add(state: CounterState, amountToAdd: number): Promise<CounterState> {
        await updateCountOnServer(1000);
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
            <div style={{ ...styles.text, height: '80px' }}>
              {queue.isActive ? (
                <Loader type="Puff" color="#00BFFF" height={100} width={100} />
              ) : (
                <p style={{ color: 'navy' }}> Processing completed </p>
              )}
            </div>
            <hr style={styles.dashed} />
            <p style={styles.queueText}>Representation of the queue</p>
            <div style={styles.grid}>
              <div style={styles.itemRunning}> Running action </div>
              <div style={styles.itemPending}> Pending actions </div>
              {queue.runningAction ? <div style={styles.item}> {queue.runningAction?.actionName} </div> : <div />}
              {queue.pendingActions.map(({ actionName }) => (
                <div style={styles.item}>{actionName}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Counter;
