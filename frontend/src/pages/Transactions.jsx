import { useState, useEffect } from 'react'
import { transactions as apiTransactions, categories } from '../api'

export default function Transactions() {
  const [list, setList] = useState([])
  const [categoriesList, setCategoriesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({
    type: 'entree',
    montant: '',
    libelle: '',
    categorie: '',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  })

  const load = () => {
    setLoading(true)
    setError('')
    Promise.all([apiTransactions.list(), categories.list()])
      .then(([tx, cat]) => {
        setList(Array.isArray(tx) ? tx : [])
        setCategoriesList(Array.isArray(cat) ? cat : [])
      })
      .catch(() => {
        setList([])
        setCategoriesList([])
        setError('Impossible de charger les données. Vérifiez que le backend est démarré (port 8000).')
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      montant: parseFloat(form.montant),
      categorie: form.categorie || null,
    }
    try {
      await apiTransactions.create(payload)
      setModal(false)
      setForm({ type: 'entree', montant: '', libelle: '', categorie: '', date: new Date().toISOString().slice(0, 10), notes: '' })
      load()
    } catch (err) {
      alert(err.response?.data?.montant?.[0] || 'Erreur lors de l\'enregistrement.')
    }
  }

  const deleteOne = async (id) => {
    if (!confirm('Supprimer cette transaction ?')) return
    try {
      await apiTransactions.delete(id)
      load()
    } catch (_) {
      alert('Erreur suppression.')
    }
  }

  const catsByType = (type) => categoriesList.filter((c) => c.type === type)

  return (
    <>
      <div className="page-header">
        <h1>Transactions</h1>
        <button type="button" className="btn btn-primary" onClick={() => setModal(true)}>
          + Nouvelle transaction
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
                <th>Date</th>
                <th>Libellé</th>
                <th>Type</th>
                <th>Catégorie</th>
                <th>Montant</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((t) => (
                <tr key={t.id}>
                  <td>{t.date}</td>
                  <td>{t.libelle}</td>
                  <td><span className={t.type}>{t.type === 'entree' ? 'Entrée' : 'Sortie'}</span></td>
                  <td>{t.categorie_nom || '—'}</td>
                  <td className={t.type}>
                    {t.type === 'entree' ? '+' : '−'}{Number(t.montant).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                  </td>
                  <td>
                    <button type="button" className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem' }} onClick={() => deleteOne(t.id)}>
                      Suppr.
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && (
            <p style={{ padding: '2rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Aucune transaction. Ajoutez une entrée ou une sortie.
            </p>
          )}
        </div>
      ) : null}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: 480, width: '100%' }}>
            <h2 style={{ marginBottom: '1rem' }}>Nouvelle transaction</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="entree">Entrée</option>
                  <option value="sortie">Sortie</option>
                </select>
              </div>
              <div className="form-group">
                <label>Montant (F CFA)</label>
                <input type="number" step="0.01" min="0" required value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Libellé</label>
                <input type="text" required value={form.libelle} onChange={(e) => setForm({ ...form, libelle: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Catégorie</label>
                <select value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })}>
                  <option value="">—</option>
                  {catsByType(form.type).map((c) => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
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
