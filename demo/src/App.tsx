import Counter from './container/Counter';

const styles: React.CSSProperties = {
  fontFamily: 'sans-serif',
  textAlign: 'center',
  marginBottom: '70px',
};

function App() {
  return (
    <div>
      <h1 style={styles}>Use Async Reducer State Demo</h1>
      <Counter />
    </div>
  );
}

export default App;
