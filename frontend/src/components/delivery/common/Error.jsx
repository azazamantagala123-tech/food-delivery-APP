import React from 'react'
import './Error.css'

const Error = ({ 
  type = 'default', 
  message, 
  title, 
  onRetry, 
  onGoHome,
  errorDetails = null 
}) => {
  
  const errorConfig = {
    // 404 - Page Not Found
    '404': {
      icon: '🔍',
      title: 'Page Not Found',
      message: 'The page you are looking for does not exist or has been moved.',
      primaryAction: { text: 'Go Home', action: onGoHome },
      secondaryAction: { text: 'Go Back', action: () => window.history.back() }
    },
    // 401 - Unauthorized
    '401': {
      icon: '🔒',
      title: 'Unauthorized Access',
      message: 'You need to login to access this page.',
      primaryAction: { text: 'Login', action: onGoHome },
      secondaryAction: { text: 'Go Back', action: () => window.history.back() }
    },
    // 403 - Forbidden
    '403': {
      icon: '🚫',
      title: 'Access Denied',
      message: 'You do not have permission to access this page.',
      primaryAction: { text: 'Go Home', action: onGoHome },
      secondaryAction: { text: 'Go Back', action: () => window.history.back() }
    },
    // 500 - Server Error
    '500': {
      icon: '⚠️',
      title: 'Server Error',
      message: 'Something went wrong on our end. Please try again later.',
      primaryAction: { text: 'Try Again', action: onRetry },
      secondaryAction: { text: 'Go Home', action: onGoHome }
    },
    // 503 - Service Unavailable
    '503': {
      icon: '🔧',
      title: 'Service Unavailable',
      message: 'Our servers are currently under maintenance. Please check back soon.',
      primaryAction: { text: 'Refresh', action: () => window.location.reload() },
      secondaryAction: { text: 'Go Home', action: onGoHome }
    },
    // Network Error
    'network': {
      icon: '📡',
      title: 'Network Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
      primaryAction: { text: 'Retry', action: onRetry },
      secondaryAction: { text: 'Go Home', action: onGoHome }
    },
    // Payment Failed
    'payment': {
      icon: '💳',
      title: 'Payment Failed',
      message: 'Your payment could not be processed. Please try again with a different payment method.',
      primaryAction: { text: 'Try Again', action: onRetry },
      secondaryAction: { text: 'Go to Cart', action: onGoHome }
    },
    // Order Failed
    'order': {
      icon: '📦',
      title: 'Order Failed',
      message: 'Unable to place your order. Please try again.',
      primaryAction: { text: 'Try Again', action: onRetry },
      secondaryAction: { text: 'View Cart', action: onGoHome }
    },
    // Default
    'default': {
      icon: '❌',
      title: title || 'Something Went Wrong',
      message: message || 'An unexpected error occurred. Please try again.',
      primaryAction: { text: 'Try Again', action: onRetry },
      secondaryAction: { text: 'Go Home', action: onGoHome }
    }
  }

  const config = errorConfig[type] || errorConfig.default

  return (
    <div className="error-container">
      <div className="error-card">
        <div className="error-icon">{config.icon}</div>
        <h1 className="error-title">{config.title}</h1>
        <p className="error-message">{config.message}</p>
        
        {errorDetails && (
          <div className="error-details">
            <details>
              <summary>Technical Details</summary>
              <pre>{JSON.stringify(errorDetails, null, 2)}</pre>
            </details>
          </div>
        )}

        <div className="error-actions">
          {config.primaryAction && (
            <button 
              className="error-btn primary"
              onClick={config.primaryAction.action}
            >
              {config.primaryAction.text}
            </button>
          )}
          {config.secondaryAction && (
            <button 
              className="error-btn secondary"
              onClick={config.secondaryAction.action}
            >
              {config.secondaryAction.text}
            </button>
          )}
        </div>

        <div className="error-help">
          <p>Need help? <a href="/support">Contact Support</a></p>
        </div>
      </div>
    </div>
  )
}

// Specific Error Components for easier use
export const NotFoundError = (props) => <Error type="404" {...props} />
export const UnauthorizedError = (props) => <Error type="401" {...props} />
export const ForbiddenError = (props) => <Error type="403" {...props} />
export const ServerError = (props) => <Error type="500" {...props} />
export const NetworkError = (props) => <Error type="network" {...props} />
export const PaymentError = (props) => <Error type="payment" {...props} />
export const OrderError = (props) => <Error type="order" {...props} />

export default Error