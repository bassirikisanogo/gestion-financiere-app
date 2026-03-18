import { useState, useEffect } from 'react'
import { dettes as apiDettes } from '../api'

export default function Dettes() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({
    type: 'a_recevoir',
    libelle: '',
    montant: '',
    date_echance: '',
    notes: '',
  })

  const load = () => {
    setLoading(true)
    setError('')
    apiDettes.list()
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => {
        setList([])
        setError('Impossible de charger les données. Vérifiez que le backend est démarré (port 8000).')
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...form, montant: parseFloat(form.montant), date_echance: form.date_echance || null }
    try {
      await apiDettes.create(payload)
      setModal(false)
      setForm({ type: 'a_recevoir', libelle: '', montant: '', date_echance: '', notes: '' })
      load()
    } catch (_) {
      alert('Erreur lors de l\'enregistrement.')
    }
  }

  const deleteOne = async (id) => {
    if (!confirm('Supprimer cette dette ?')) return
    try {
      await apiDettes.delete(id)
      load()
    } catch (_) {
      alert('Erreur suppression.')
    }
  }

  return (
    <>
      <div className="page-header">
        <h1>Dettes & créances</h1>
        <button type="button" className="btn btn-primary" onClick={() => setModal(true)}>
          + Ajouter une dette / créance
        </button>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)' }}>
          <p style={{ color: 'var(--danger)', marginBottom: '0.75rem' }}>{error}</p>
          <button type="button" className="btn btn-primary" onClick={load}>Réessayer</button>
        </div>
      )}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Chargement…</p>
      ) : !error ? (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Libellé</th>
                <th>Type</th>
                <th>Montant</th>
                <th>Restant</th>
                <th>Échéance</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id}>
                  <td>{d.libelle}</td>
                  <td>{d.type === 'a_recevoir' ? 'À recevoir' : 'À payer'}</td>
                  <td>{Number(d.montant).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</td>
                  <td>{Number(d.restant).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</td>
                  <td>{d.date_echance || '—'}</td>
                  <td>
                    <button type="button" className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem' }} onClick={() => deleteOne(d.id)}>
                      Suppr.
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && (
            <p style={{ padding: '2rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Aucune dette ni créance enregistrée.
            </p>
          )}
        </div>
      ) : null}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: 480, width: '100%' }}>
            <h2 style={{ marginBottom: '1rem' }}>Nouvelle dette / créance</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="a_recevoir">À recevoir (créance)</option>
                  <option value="a_payer">À payer (dette)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Libellé</label>
                <input type="text" required value={form.libelle} onChange={(e) => setForm({ ...form, libelle: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Montant (F CFA)</label>
                <input type="number" step="0.01" min="0" required value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Date d'échéance</label>
                <input type="date" value={form.date_echance} onChange={(e) => setForm({ ...form, date_echance: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Notes (optionnel)</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary">Enregistrer</button>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
