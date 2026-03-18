import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../api'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await auth.login(username, password)
      localStorage.setItem('access', data.access)
      localStorage.setItem('refresh', data.refresh)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.erreur || 'Identifiants incorrects.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="card" style={{ padding: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>Connexion</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Application de Gestion Financière
        </p>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Nom d'utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>
          )}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
        <p style={{ marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Pas de compte ? <Link to="/register">S'inscrire</Link>
        </p>
      </div>
    </div>
  )
}
