import './index.css'

type ModalFooterProps = {
  children: React.ReactNode
}

const ModalFooter = ({ children } : ModalFooterProps) => {
  return <div className="modal-footer">{children}</div>
};

export default ModalFooter;
