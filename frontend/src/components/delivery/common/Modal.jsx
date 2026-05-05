import React, { useEffect, useCallback } from 'react'
import './Modal.css'

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showFooter = false,
  footerButtons = [],
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false
}) => {
  
  const handleOverlayClick = useCallback((e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }, [closeOnOverlayClick, onClose])

  const handleEscKey = useCallback((e) => {
    if (closeOnEsc && e.key === 'Escape') {
      onClose()
    }
  }, [closeOnEsc, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleEscKey)
    }
    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [isOpen, handleEscKey])

  if (!isOpen) return null

  const modalSizes = {
    small: 'modal-small',
    medium: 'modal-medium',
    large: 'modal-large',
    full: 'modal-full'
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-container ${modalSizes[size]}`}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          {showCloseButton && (
            <button className="modal-close" onClick={onClose}>
              &times;
            </button>
          )}
        </div>

        <div className="modal-body">
          {children}
        </div>

        {showFooter && (
          <div className="modal-footer">
            {footerButtons.length > 0 ? (
              footerButtons.map((button, index) => (
                <button
                  key={index}
                  className={`modal-btn ${button.className || 'secondary'}`}
                  onClick={button.onClick}
                  disabled={button.disabled || loading}
                >
                  {button.loading ? <span className="btn-spinner"></span> : button.text}
                </button>
              ))
            ) : (
              <>
                {onCancel && (
                  <button className="modal-btn secondary" onClick={onCancel} disabled={loading}>
                    {cancelText}
                  </button>
                )}
                {onConfirm && (
                  <button className="modal-btn primary" onClick={onConfirm} disabled={loading}>
                    {loading ? <span className="btn-spinner"></span> : confirmText}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Pre-configured modals for common use cases
export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, loading }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title || 'Confirm Action'}
    size="small"
    showFooter={true}
    onConfirm={onConfirm}
    onCancel={onClose}
    confirmText="Confirm"
    cancelText="Cancel"
    loading={loading}
  >
    <p className="modal-message">{message || 'Are you sure you want to proceed?'}</p>
  </Modal>
)

export const AlertModal = ({ isOpen, onClose, title, message, type = 'info' }) => {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Notice'}
      size="small"
      showFooter={true}
      onConfirm={onClose}
      confirmText="OK"
    >
      <div className={`alert-modal alert-${type}`}>
        <span className="alert-icon">{icons[type]}</span>
        <p className="alert-message">{message}</p>
      </div>
    </Modal>
  )
}

export const ImageModal = ({ isOpen, onClose, imageUrl, alt }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title=""
    size="large"
    showCloseButton={true}
    closeOnOverlayClick={true}
  >
    <div className="image-modal-content">
      <img src={imageUrl} alt={alt} className="image-modal-img" />
    </div>
  </Modal>
)

export default Modal