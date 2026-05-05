import React, { createContext, useState, useContext, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check local storage first
    const savedTheme = localStorage.getItem('theme')
    // Check system preference
    if (savedTheme) {
      return savedTheme
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  })

  const [primaryColor, setPrimaryColor] = useState(() => {
    const savedColor = localStorage.getItem('primaryColor')
    return savedColor || '#ff6b35'
  })

  const [fontSize, setFontSize] = useState(() => {
    const savedSize = localStorage.getItem('fontSize')
    return savedSize || 'medium'
  })

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-theme')
      document.documentElement.classList.remove('light-theme')
    } else {
      document.documentElement.classList.add('light-theme')
      document.documentElement.classList.remove('dark-theme')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    // Apply primary color as CSS variable
    document.documentElement.style.setProperty('--primary-color', primaryColor)
    localStorage.setItem('primaryColor', primaryColor)
  }, [primaryColor])

  useEffect(() => {
    // Apply font size
    const sizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px'
    }
    document.documentElement.style.setProperty('--base-font-size', sizes[fontSize] || '16px')
    localStorage.setItem('fontSize', fontSize)
  }, [fontSize])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const setLightTheme = () => setTheme('light')
  const setDarkTheme = () => setTheme('dark')

  const colors = {
    light: {
      primary: primaryColor,
      secondary: '#ff8c42',
      background: '#ffffff',
      surface: '#f8f9fa',
      text: '#333333',
      textSecondary: '#666666',
      border: '#e9ecef',
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8'
    },
    dark: {
      primary: primaryColor,
      secondary: '#ff8c42',
      background: '#1a1a2e',
      surface: '#16213e',
      text: '#ffffff',
      textSecondary: '#aaaaaa',
      border: '#2d2d3d',
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8'
    }
  }

  const currentColors = colors[theme]

  const fontSizeOptions = [
    { value: 'small', label: 'Small', size: '14px' },
    { value: 'medium', label: 'Medium', size: '16px' },
    { value: 'large', label: 'Large', size: '18px' },
    { value: 'xlarge', label: 'Extra Large', size: '20px' }
  ]

  const primaryColors = [
    { value: '#ff6b35', label: 'Orange', class: 'color-orange' },
    { value: '#007bff', label: 'Blue', class: 'color-blue' },
    { value: '#28a745', label: 'Green', class: 'color-green' },
    { value: '#dc3545', label: 'Red', class: 'color-red' },
    { value: '#6f42c1', label: 'Purple', class: 'color-purple' },
    { value: '#fd7e14', label: 'Coral', class: 'color-coral' },
    { value: '#20c997', label: 'Teal', class: 'color-teal' },
    { value: '#e83e8c', label: 'Pink', class: 'color-pink' }
  ]

  const resetToDefaults = () => {
    setTheme('light')
    setPrimaryColor('#f3cc21')
    setFontSize('medium')
  }

  const value = {
    theme,
    setTheme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    primaryColor,
    setPrimaryColor,
    fontSize,
    setFontSize,
    fontSizeOptions,
    primaryColors,
    colors: currentColors,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    resetToDefaults
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeProvider