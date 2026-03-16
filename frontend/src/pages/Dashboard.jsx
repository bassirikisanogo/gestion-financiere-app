import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { tableauBord } from '../api'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    tableauBord()
      .then(setData)
      .catch(() => setError('Impossible de charger le tableau de bord.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Chargement…</p>
  if (error) return <p style={{ color: 'var(--danger)' }}>{error}</p>
  if (!data) return null

  const { tresorerie, entrees_mois, sorties_mois, solde_mois, alertes } = data

  return (
    <>
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Tableau de bord</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Trésorerie actuelle</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: tresorerie >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {Number(tresorerie).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
          </p>
        </div>
        <div className="card">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Entrées ce mois</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--success)' }}>
            +{Number(entrees_mois).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
          </p>
        </div>
        <div className="card">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Sorties ce mois</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--danger)' }}>
            −{Number(sorties_mois).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
          </p>
        </div>
        <div className="card">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Solde du mois</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 600, color: solde_mois >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {Number(solde_mois).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
          </p>
        </div>
      </div>

      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem' }}>Alertes</h2>
          <Link to="/alertes" className="btn btn-secondary">Voir tout</Link>
        </div>
        {alertes?.length > 0 ? (
          <div className="alertes-list">
            {alertes.slice(0, 5).map((a) => (
              <div key={a.id} className="card" style={{ opacity: a.lue ? 0.7 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div>
                    <span className={`badge badge-${a.severite === 'critique' ? 'danger' : a.severite === 'attention' ? 'warning' : 'info'}`}>
                      {a.type.replace(/_/g, ' ')}
                    </span>
                    <h3 style={{ marginTop: '0.5rem', fontSize: '1rem' }}>{a.titre}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{a.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            <p style={{ color: 'var(--text-muted)' }}>Aucune alerte pour le moment.</p>
          </div>
        )}
      </section>
    </>
  )
}
