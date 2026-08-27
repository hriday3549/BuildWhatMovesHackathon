import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NewComplaint from './pages/NewComplaint'
import TicketDetail from './pages/TicketDetail'
import Officer from './pages/Officer'
import Insights from './components/Insights'
import { getTickets } from './services/api'
import { installPageLanguage } from './services/i18n'

function Shell({ children, isDark, onThemeToggle, language, onLanguageChange }) {
  return (
    <div className="app-shell">
      <Header isDark={isDark} onThemeToggle={onThemeToggle} language={language} onLanguageChange={onLanguageChange} />
      {children || <main aria-label="Main content" className="route-placeholder" />}
      <Footer />
    </div>
  )
}

export default function App() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('nivaran-theme') === 'dark')
  const [language, setLanguage] = useState(() => localStorage.getItem('nivaran-language') || 'English')
  const [tickets, setTickets] = useState([])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('nivaran-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => { getTickets().then(setTickets).catch(() => setTickets([])) }, [])
  useEffect(() => { localStorage.setItem('nivaran-language', language); return installPageLanguage(language === 'हिन्दी' ? 'hi' : language === 'বাংলা' ? 'bn' : 'en') }, [language])

  const shell = (page) => <Shell isDark={isDark} onThemeToggle={() => setIsDark((current) => !current)} language={language} onLanguageChange={setLanguage}>{page}</Shell>

  return (
    <Routes>
      <Route path="/" element={shell(<LandingPage />)} />
      <Route path="/login" element={shell(<Login />)} />
      <Route path="/dashboard" element={shell(<Dashboard />)} />
      <Route path="/new-complaint" element={shell(<NewComplaint />)} />
      <Route path="/ticket/:id" element={shell(<TicketDetail />)} />
      <Route path="/officer" element={shell(<Officer />)} />
      <Route path="/insights" element={shell(<Insights tickets={tickets} />)} />
      <Route path="*" element={shell()} />
    </Routes>
  )
}
