import React from 'react'
import './Loader.css'

const Loader = ({ 
  type = 'spinner', 
  size = 'medium', 
  text = 'Loading...',
  fullScreen = false,
  overlay = false
}) => {
  
  const loaderSizes = {
    small: { width: '30px', height: '30px', fontSize: '12px' },
    medium: { width: '50px', height: '50px', fontSize: '14px' },
    large: { width: '70px', height: '70px', fontSize: '16px' }
  }

  const sizeConfig = loaderSizes[size] || loaderSizes.medium

  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return (
          <div className="loader-spinner" style={{ width: sizeConfig.width, height: sizeConfig.height }}>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
        )
      
      case 'dots':
        return (
          <div className="loader-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        )
      
      case 'pulse':
        return (
          <div className="loader-pulse" style={{ width: sizeConfig.width, height: sizeConfig.height }}>
            <div className="pulse-ring"></div>
          </div>
        )
      
      case 'skeleton':
        return (
          <div className="loader-skeleton">
            <div className="skeleton-header"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
            <div className="skeleton-line"></div>
          </div>
        )
      
      case 'card':
        return (
          <div className="loader-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-title"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-button"></div>
          </div>
        )
      
      default:
        return (
          <div className="loader-spinner" style={{ width: sizeConfig.width, height: sizeConfig.height }}>
            <div className="spinner-ring"></div>
          </div>
        )
    }
  }

  const loaderContent = (
    <div className={`loader-container loader-${type} loader-${size}`}>
      {renderLoader()}
      {text && <p className="loader-text" style={{ fontSize: sizeConfig.fontSize }}>{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        {loaderContent}
      </div>
    )
  }

  if (overlay) {
    return (
      <div className="loader-overlay">
        {loaderContent}
      </div>
    )
  }

  return loaderContent
}

// Pre-configured loaders for common use cases
export const PageLoader = () => <Loader type="spinner" size="large" text="Loading page..." fullScreen />
export const SectionLoader = () => <Loader type="pulse" size="medium" text="Loading..." />
export const ButtonLoader = () => <Loader type="dots" size="small" text="" />
export const CardLoader = () => <Loader type="card" size="medium" text="" />
export const TableLoader = () => <Loader type="skeleton" size="medium" text="" />

export default Loader