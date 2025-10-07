import './index.css'

type ModalFooterProps = {
  children: React.ReactNode
}

export const ModalFooter = ({ children } : ModalFooterProps) => {
  return <div className="modal-footer">{children}</div>
};
