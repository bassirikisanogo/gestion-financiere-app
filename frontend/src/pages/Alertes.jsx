import { useState, useEffect } from 'react'
import { alertes as apiAlertes } from '../api'

export default function Alertes() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    apiAlertes.list()
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => {
        setList([])
        setError('Impossible de charger les alertes. Vérifiez que le backend est démarré (port 8000).')
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const marquerLue = async (id) => {
    try {
      await apiAlertes.marquerLue(id)
      setList((prev) => prev.map((a) => (a.id === id ? { ...a, lue: true } : a)))
    } catch (_) {}
  }

  const severiteClass = (s) => (s === 'critique' ? 'danger' : s === 'attention' ? 'warning' : 'info')

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Chargement…</p>

  return (
    <>
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Alertes</h1>

      {error && (
        <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)' }}>
          <p style={{ color: 'var(--danger)', marginBottom: '0.75rem' }}>{error}</p>
          <button type="button" className="btn btn-primary" onClick={load}>Réessayer</button>
        </div>
      )}

      <div className="alertes-list">
        {list.length === 0 ? (
          <div className="card">
            <p style={{ color: 'var(--text-muted)' }}>Aucune alerte.</p>
          </div>
        ) : (
          list.map((a) => (
            <div key={a.id} className="card" style={{ opacity: a.lue ? 0.75 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className={`badge badge-${severiteClass(a.severite)}`}>
                    {a.type.replace(/_/g, ' ')}
                  </span>
                  <h3 style={{ marginTop: '0.5rem', fontSize: '1rem' }}>{a.titre}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{a.message}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    {new Date(a.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
                {!a.lue && (
                  <button type="button" className="btn btn-secondary" style={{ flexShrink: 0 }} onClick={() => marquerLue(a.id)}>
                    Marquer comme lue
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
