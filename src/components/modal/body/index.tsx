import './index.css'

type ModalBodyProps = {
  children: React.ReactNode
}

const ModalBody = ({ children } : ModalBodyProps) => {
  return <div className="modal-body">{children}</div>
};

export default ModalBody;