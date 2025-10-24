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
  },
  commentInputContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: '18px',
    padding: '0 16px'
  },
  commentInput: {
    flex: 1,
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
    fontSize: '14px',
    padding: '8px 0'
  },
  sendCommentButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#1877f2',
    fontWeight: '600',
    fontSize: '14px',
    marginLeft: '8px',
    padding: 0
  },
  commentBubble: {
    backgroundColor: '#f0f2f5',
    borderRadius: '18px',
    padding: '0.8rem'
  },
  commentAuthor: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '2px'
  },
  commentText: {
    margin: 0,
    fontSize: '14px',
    color: '#050505'
  },
  commentAction: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  }
} satisfies { [key: string]: React.CSSProperties }