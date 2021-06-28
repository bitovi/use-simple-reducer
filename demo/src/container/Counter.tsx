import { useAsyncReducerState } from '../asyncreducer/src/index'
import Button from '../components/Button'
import Loader from "react-loader-spinner";
import { CounterState } from '../types'
import {useRef } from 'react';
import Modal from '../components/Modal'
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'block',
        width: '100%',
        textAlign: 'center',
        marginTop: '50px',
    },
    text: {
        fontSize: '22px',
        fontWeight: 'bold'
    }
};

const initialState: CounterState = {
    count: 0,
};
function Counter() {
    const wait = function (time: number) {
        return new Promise((resolve) => { setTimeout(resolve, time) })
    }
    const amount = useRef(2);
    const [state, isProcessing, actions, error] = useAsyncReducerState(
        // initial state
        initialState,
        // collection of reducer methods
        {
            async add(state: CounterState, amountToAdd: number): Promise<CounterState> {
                await wait(1000)
                // This is just a workaround to throw an error the first time this action is invoked
                if (amount.current === 2) {
                    amount.current = 1
                    throw new Error("Error adding amount with value 2");
                }
                return { ...state, count: state.count + amount.current };
            },
            async subtract(state: CounterState, amountToSubtract: number): Promise<CounterState> {
                await wait(1000)
                return { ...state, count: state.count - amountToSubtract };
            }
        }
    )
    return (
        <div>
            {error ? <Modal message={error.reason} action={error.rerunLastAction} /> :
                <div>
                    <Button type="Two Steps Forward" handleClick={() => actions.add(2)} />
                    <Button type="One Step Back" handleClick={() => actions.subtract(1)} />
                    <div style={styles.container}>
                        <p style={styles.text}>Steps: {state.count}</p>
                        <div style={styles.text}>{isProcessing ? <Loader
                            type="Puff"
                            color="#00BFFF"
                            height={100}
                            width={100}
                        /> : "Processing completed"}</div>
                    </div>
                </div>}
        </div>

    );
}

export default Counter;
