import { useModalContext } from "../../../context/modal"
import { CheckIcon, ErrorIcon, InfoIcon, WarningIcon } from "../iconModal"
import './index.css'

type ModalHeaderProps = {
  children: React.ReactNode
  showCloseButton?: boolean
  icon?: React.ReactNode
}

const ModalHeader = ({
  children,
  showCloseButton = true,
  icon,
}:ModalHeaderProps)=> {
  const { onClose, variant } = useModalContext()

  const defaultIcons = {
    success: <CheckIcon />,
    error: <ErrorIcon />,
    warning: <WarningIcon />,
    info: <InfoIcon />,
  }

  const showIcon = variant && variant !== 'default'
  const iconToShow = icon || (variant && variant !== 'default' ? defaultIcons[variant] : null)

  return (
    <div className="modal-header">
      {showIcon && iconToShow && (
        <div className="modal-icon-wrapper">
          {iconToShow}
        </div>
      )}
      <div className="modal-header-content">
        <h2>{children}</h2>
      </div>
      {showCloseButton && (
        <button
          onClick={onClose}
          className="modal-close-button"
          aria-label="Fermer"
        >
          ×
        </button>
      )}
    </div>
  )

}

export default ModalHeader