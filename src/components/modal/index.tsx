import { useEffect } from "react"
import { ModalContext } from "../../context/modal"

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnOverlayClick?: boolean;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
}

const Modal = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  variant = 'default'}:ModalProps) => {
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'unset'
      }
      return () => {
        document.body.style.overflow = 'unset'
      }
    }, [isOpen])

    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          onClose()
        }
      }
      window.addEventListener('keydown', handleEscape)
      return () => window.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])
  
    if (!isOpen) return null

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && closeOnOverlayClick) {
        onClose();
      }
    }

    return (
      <ModalContext.Provider value={{ isOpen, onClose, variant }}>
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className={`modal-content size-${size} variant-${variant}`}>
            {children}
          </div>
        </div>
      </ModalContext.Provider>
    )
}

export default Modal