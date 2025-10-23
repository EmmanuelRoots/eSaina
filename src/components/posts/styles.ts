export const styles = {
  createPostInput: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    border: 'none',
    borderRadius: '24px',
    padding: '12px 16px',
    textAlign: 'left',
    color: '#65676b',
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  textarea: {
    width: '100%',
    minHeight: '120px',
    border: 'none',
    outline: 'none',
    fontSize: '18px',
    resize: 'none',
    fontFamily: 'inherit'
  }
} satisfies { [key: string]: React.CSSProperties }