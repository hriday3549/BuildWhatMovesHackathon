import { BarChart3, ChevronDown, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const languages = ['English', 'हिन्दी', 'বাংলা']

export default function Header({ isDark, onThemeToggle, language, onLanguageChange }) {
  const location = useLocation()
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="header-inner">
        <a href="/" className="brand" aria-label="Nivaran home">
          <svg className="brand-logo" viewBox="0 0 40 40" aria-hidden="true">
            <path d="M9 5.5h15l7 7V34.5H9z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M24 5.5v7h7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M7 18.5 19.5 6" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M15 23h10M15 28h7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="brand-copy">
            <span className="brand-title">Nivaran</span>
            <span className="brand-subtitle">CPGRAMS 2.0 · Cut the Red Tape</span>
          </span>
        </a>
        <div className="header-actions">
          <Link className="department-login-pill" to="/login?role=officer&otp=true" aria-current={location.pathname === '/login' ? 'page' : undefined}>Departmental Login</Link>
          <Link className="insights-nav-link" to="/insights" aria-current={location.pathname === '/insights' ? 'page' : undefined}><BarChart3 size={16} /> Insights</Link>
          <div className="header-controls" aria-label="Theme and language controls">
            <button className="control-button theme-toggle" type="button" onClick={onThemeToggle} aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
              {isDark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
              <span>{isDark ? 'Light' : 'Dark'}</span>
            </button>
            <div className="language-menu">
              <button className="language-trigger" type="button" onClick={() => setIsLanguageMenuOpen((open) => !open)} aria-expanded={isLanguageMenuOpen} aria-haspopup="menu">
                <span>{language}</span><ChevronDown size={17} aria-hidden="true" />
              </button>
              {isLanguageMenuOpen && (
                <div className="language-options" role="menu" aria-label="Choose language">
                  {languages.map((option) => (
                    <button key={option} type="button" role="menuitem" className={option === language ? 'language-option language-option--selected' : 'language-option'} onClick={() => { onLanguageChange(option); setIsLanguageMenuOpen(false) }}>
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
