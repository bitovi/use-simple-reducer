const styles: { [key: string]: React.CSSProperties } = {
  button: {
    display: 'inline-block',
    width: '170px',
    height: '60px',
    background: '#EFEFEF',
    outline: 'none',
    border: '0',
    textTransform: 'uppercase',
  },
  container: {
    display: 'block',
    width: '100%',
    textAlign: 'center',
    marginBottom: '30px',
  },
};
interface ButtonProps {
  type: string;
  handleClick: () => void;
}
function Button({ type, handleClick }: ButtonProps) {
  return (
    <div style={styles.container}>
      <button style={styles.button} onClick={handleClick}>
        {type}
      </button>
    </div>
  );
}

export default Button;
