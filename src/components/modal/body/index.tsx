type ModalBodyProps = {
  children: React.ReactNode
}

export const ModalBody = ({ children } : ModalBodyProps) => {
  return <div className="modal-body">{children}</div>
};