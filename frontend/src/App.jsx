import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, MessageCircle, Activity, FileText, Menu, X } from 'lucide-react'
import Dashboard from './components/Dashboard/Dashboard'
import ChatPage from './components/Chat/ChatPage'
import LoginPage from './components/Auth/LoginPage'
import RegisterPage from './components/Auth/RegisterPage'

function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation()

  function handleLogout() {
    localStorage.removeItem('medicus_user')
    window.location.href = '/login'
  }

  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/chat', icon: MessageCircle, label: 'Medicus Chat' },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col
          bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)]
          transition-all duration-300 ease-in-out
          ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-64'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-[var(--border-subtle)]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-medicus-500 to-medicus-700 flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-display text-lg font-bold tracking-tight text-[var(--text-primary)]">Medicus</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-medicus-500 font-medium">AI Assistant</p>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => window.innerWidth < 1024 && setCollapsed(true)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                ${isActive
                  ? 'bg-medicus-500/10 text-medicus-400 border border-medicus-500/20'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] border border-transparent'
                }
                ${collapsed ? 'lg:justify-center' : ''}
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium text-sm">{label}</span>}
            </NavLink>
          ))}
        </nav>
        
        {!collapsed && (
          <div className="px-3 pb-4">
            <div className="flex items-center gap-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-3 py-3">
              <div className="w-9 h-9 rounded-full bg-medicus-600 flex items-center justify-center text-white font-bold">
                {JSON.parse(localStorage.getItem('medicus_user') || '{}')?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {JSON.parse(localStorage.getItem('medicus_user') || '{}')?.full_name || 'User'}
                </p>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {JSON.parse(localStorage.getItem('medicus_user') || '{}')?.email || ''}
                </p>
                <button
                  onClick={handleLogout}
                  className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Collapse toggle (desktop) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center py-4 border-t border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </aside>
    </>
  )
}

function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024)
  
  const savedUser = localStorage.getItem('medicus_user')

  if (!savedUser && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-[var(--bg-secondary)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] flex items-center px-4">
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 ml-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-medicus-500 to-medicus-700 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-sm">Medicus</span>
        </div>
      </header>

      {/* Main content */}
      <main
        className={`
          transition-all duration-300 min-h-screen
          pt-14 lg:pt-0
          ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}
        `}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/login" element={<LoginPage onLogin={() => {}} />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
