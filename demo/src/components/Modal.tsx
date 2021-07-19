import React from 'react';
import Popup from 'reactjs-popup';
const styles: { [key: string]: React.CSSProperties } = {
  modal: {
    fontSize: '12px',
  },
  header: {
    width: '100%',
    borderBottom: '1px solid gray',
    fontSize: '18px',
    textAlign: 'center',
    padding: '5px',
  },
  content: {
    width: '100%',
    padding: '10px 5px',
  },
  actions: {
    width: '100%',
    padding: '10px 5px',
    margin: 'auto',
    textAlign: 'center',
  },
  close: {
    cursor: 'pointer',
    position: 'absolute',
    display: 'block',
    padding: '2px 5px',
    lineHeight: '20px',
    right: '-10px',
    top: '-10px',
    fontSize: '24px',
    background: '#ffffff',
    borderRadius: '18px',
    border: '1px solid #cfcece',
  },
};
function Modal({ message, action }: { message: string; action: () => void }) {
  return (
    <Popup open modal nested>
      <div style={styles.modal}>
        <div style={styles.header}> The following error has occurred </div>
        <div style={styles.content}> {message}</div>
        <div style={styles.actions}>
          <button
            style={styles.button}
            onClick={() => {
              action();
            }}
          >
            Retry action
          </button>
        </div>
      </div>
    </Popup>
  );
}
export default Modal;
