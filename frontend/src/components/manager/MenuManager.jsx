import { useState, useEffect } from 'react'
import { api } from '../../api.js'

const CATEGORIES = ['Entree', 'Side', 'Drink', 'Dessert']
const BLANK = { item_name: '', price: '', category: 'Entree' }

export default function MenuManager() {
  const [items, setItems]   = useState([])
  const [form, setForm]     = useState(BLANK)
  const [editId, setEditId] = useState(null)
  const [msg, setMsg]       = useState(null)

  const load = () => api.getMenu().then(setItems)
  useEffect(() => { load() }, [])

  const save = async () => {
    const payload = { ...form, price: parseFloat(form.price) }
    try {
      if (editId) {
        await api.updateMenuItem(editId, payload)
        setMsg({ type:'ok', text:'Item updated.' })
      } else {
        await api.createMenuItem(payload)
        setMsg({ type:'ok', text:'Item added.' })
      }
      setForm(BLANK); setEditId(null); load()
    } catch (e) {
      setMsg({ type:'err', text: e.message })
    }
  }

  const del = async (id) => {
    if (!confirm('Delete this item?')) return
    try { await api.deleteMenuItem(id); load() }
    catch (e) { setMsg({ type:'err', text: e.message }) }
  }

  const startEdit = (item) => {
    setEditId(item.menu_item_id)
    setForm({ item_name: item.item_name, price: item.price, category: item.category })
  }

  return (
    <div className="two-col">
      {/* Form */}
      <div className="card">
        <div className="card-hd">
          <span className="card-title">{editId ? 'Edit Item' : 'Add Item'}</span>
          {editId && <button className="btn btn-ghost btn-sm" onClick={() => { setEditId(null); setForm(BLANK) }}>Cancel</button>}
        </div>
        {msg && <div className={`alert alert-${msg.type === 'ok' ? 'ok' : 'err'}`}>{msg.text}</div>}
        <div className="form-group">
          <label className="form-label">Item Name</label>
          <input className="form-input" value={form.item_name}
            onChange={e => setForm(p => ({ ...p, item_name: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Price ($)</label>
          <input className="form-input" type="number" step=".01" value={form.price}
            onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" value={form.category}
            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={save}>
          {editId ? 'Update Item' : '+ Add Item'}
        </button>
      </div>

      {/* List */}
      <div className="card">
        <div className="card-hd"><span className="card-title">Menu Items</span></div>
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Name</th><th>Category</th><th>Price</th><th></th></tr></thead>
            <tbody>
              {items.map(item => (
                <tr key={item.menu_item_id}>
                  <td style={{ fontWeight:600 }}>{item.item_name}</td>
                  <td><span className="badge badge-gold">{item.category}</span></td>
                  <td style={{ color:'var(--primary)' }}>${Number(item.price).toFixed(2)}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(item)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(item.menu_item_id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
