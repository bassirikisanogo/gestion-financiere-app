import { Outlet, NavLink, useNavigate } from 'react-router-dom'

export default function Layout() {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    navigate('/login')
  }

  const nav = [
    { to: '/', label: 'Tableau de bord' },
    { to: '/transactions', label: 'Transactions' },
    { to: '/rapports', label: 'Rapports' },
    { to: '/dettes', label: 'Dettes & factures' },
    { to: '/alertes', label: 'Alertes' },
  ]

  return (
    <>
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0.75rem 1.5rem',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            <NavLink to="/" style={{ color: 'var(--text)', textDecoration: 'none' }}>
              Gestion Financière
            </NavLink>
          </h1>
          <nav style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {nav.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                style={({ isActive }) => ({
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius)',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontWeight: isActive ? 600 : 500,
                  background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                })}
              >
                {label}
              </NavLink>
            ))}
            <button type="button" className="btn btn-secondary" onClick={logout} style={{ marginLeft: '0.5rem' }}>
              Déconnexion
            </button>
          </nav>
        </div>
      </header>
      <main style={{ flex: 1, padding: '1.5rem 0' }}>
        <div className="container">
          <Outlet />
        </div>
      </main>
    </>
  )
}
