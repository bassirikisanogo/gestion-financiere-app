import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'

export default function Layout() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    setMenuOpen(false)
    navigate('/login')
  }

  const nav = [
    { to: '/', label: 'Tableau de bord' },
    { to: '/transactions', label: 'Transactions' },
    { to: '/rapports', label: 'Rapports' },
    { to: '/dettes', label: 'Dettes & factures' },
    { to: '/alertes', label: 'Alertes' },
  ]

  const navLinkStyle = ({ isActive }) => ({
    padding: '0.5rem 0.85rem',
    borderRadius: 'var(--radius)',
    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
    textDecoration: 'none',
    fontWeight: isActive ? 600 : 500,
    background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
    display: 'block',
  })

  return (
    <>
      <header className="layout-header">
        <div className="container layout-header-inner">
          <h1 className="layout-logo">
            <NavLink to="/" style={{ color: 'var(--text)', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
              Gestion Financière
            </NavLink>
          </h1>
          <button
            type="button"
            className="btn btn-secondary layout-menu-toggle"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
          <nav className={`layout-nav ${menuOpen ? 'layout-nav-open' : ''}`}>
            {nav.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                style={navLinkStyle}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </NavLink>
            ))}
            <button type="button" className="btn btn-secondary layout-logout" onClick={logout}>
              Déconnexion
            </button>
          </nav>
        </div>
      </header>
      <main style={{ flex: 1, padding: '1rem 0' }}>
        <div className="container">
          <Outlet />
        </div>
      </main>
    </>
  )
}
