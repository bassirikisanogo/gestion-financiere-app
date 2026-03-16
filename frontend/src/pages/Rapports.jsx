import { useState, useEffect } from 'react'
import { rapports as apiRapports } from '../api'

const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1

export default function Rapports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [periode, setPeriode] = useState('mois')
  const [annee, setAnnee] = useState(currentYear)
  const [mois, setMois] = useState(currentMonth)

  const load = () => {
    setLoading(true)
    const params = periode === 'jour' ? { periode: 'jour' } : { periode: 'mois', annee, mois }
    apiRapports(params)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }

  useEffect(load, [periode, annee, mois])

  if (loading && !data) {
    return <p style={{ color: 'var(--text-muted)' }}>Chargement…</p>
  }

  return (
    <>
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Rapports</h1>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Période</label>
            <select value={periode} onChange={(e) => setPeriode(e.target.value)}>
              <option value="jour">Aujourd'hui</option>
              <option value="mois">Mois</option>
            </select>
          </div>
          {periode === 'mois' && (
            <>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Année</label>
                <input
                  type="number"
                  min="2020"
                  max="2030"
                  value={annee}
                  onChange={(e) => setAnnee(Number(e.target.value))}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Mois</label>
                <select value={mois} onChange={(e) => setMois(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1).toLocaleString('fr-FR', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          <button type="button" className="btn btn-primary" onClick={load}>
            Actualiser
          </button>
        </div>
      </div>

      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="card">
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Période</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{data.libelle_periode}</p>
            </div>
            <div className="card">
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Entrées</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--success)' }}>
                +{Number(data.entrees).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
              </p>
            </div>
            <div className="card">
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Sorties</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--danger)' }}>
                −{Number(data.sorties).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
              </p>
            </div>
            <div className="card">
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Solde</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, color: data.solde >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {Number(data.solde).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
              </p>
            </div>
          </div>

          <div className="card table-wrap">
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Transactions</h2>
            {data.transactions && data.transactions.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Libellé</th>
                    <th>Catégorie</th>
                    <th>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((t) => (
                    <tr key={t.id}>
                      <td>{t.date}</td>
                      <td>{t.type === 'entree' ? 'Entrée' : 'Sortie'}</td>
                      <td>{t.libelle}</td>
                      <td>{t.categorie_nom || '—'}</td>
                      <td style={{ color: t.type === 'entree' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                        {t.type === 'entree' ? '+' : '−'}
                        {Number(t.montant).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ padding: '2rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Aucune transaction sur cette période.
              </p>
            )}
          </div>
        </>
      )}
    </>
  )
}
