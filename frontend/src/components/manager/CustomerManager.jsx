import { useState, useEffect } from 'react'
import { api } from '../../api.js'

const BLANK = { first_name:'', last_name:'', email:'', phone:'', date_joined: new Date().toISOString().slice(0,10) }

export default function CustomerManager() {
  const [customers, setCustomers] = useState([])
  const [form, setForm]           = useState(BLANK)
  const [editId, setEditId]       = useState(null)
  const [msg, setMsg]             = useState(null)
  const [search, setSearch]       = useState('')

  const load = () => api.getCustomers().then(setCustomers)
  useEffect(() => { load() }, [])

  const save = async () => {
    try {
      if (editId) {
        await api.updateCustomer(editId, { first_name: form.first_name, last_name: form.last_name, email: form.email, phone: form.phone })
        setMsg({ type:'ok', text:'Customer updated.' })
      } else {
        await api.createCustomer(form)
        setMsg({ type:'ok', text:'Customer added.' })
      }
      setForm(BLANK); setEditId(null); load()
    } catch (e) {
      setMsg({ type:'err', text: e.message })
    }
  }

  const del = async (id) => {
    if (!confirm('Delete this customer?')) return
    try { await api.deleteCustomer(id); load() }
    catch (e) { setMsg({ type:'err', text: e.message }) }
  }

  const startEdit = (c) => {
    setEditId(c.customer_id)
    setForm({ first_name:c.first_name, last_name:c.last_name, email:c.email, phone:c.phone||'', date_joined:c.date_joined })
  }

  const filtered = customers.filter(c =>
    `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {msg && <div className={`alert alert-${msg.type==='ok'?'ok':'err'}`}>{msg.text}</div>}
      <div className="two-col" style={{ alignItems:'start' }}>
        {/* Form */}
        <div className="card">
          <div className="card-hd">
            <span className="card-title">{editId ? 'Edit Customer' : 'Register Customer'}</span>
            {editId && <button className="btn btn-ghost btn-sm" onClick={() => { setEditId(null); setForm(BLANK) }}>Cancel</button>}
          </div>
          {['first_name','last_name','email','phone'].map(f => (
            <div className="form-group" key={f}>
              <label className="form-label">{f.replace('_',' ')}</label>
              <input className="form-input" value={form[f]}
                onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} />
            </div>
          ))}
          {!editId && (
            <div className="form-group">
              <label className="form-label">Date Joined</label>
              <input className="form-input" type="date" value={form.date_joined}
                onChange={e => setForm(p => ({ ...p, date_joined: e.target.value }))} />
            </div>
          )}
          <button className="btn btn-primary" onClick={save}>
            {editId ? 'Update' : '+ Register'}
          </button>
        </div>

        {/* List */}
        <div className="card">
          <div className="card-hd">
            <span className="card-title">Customers</span>
            <input className="form-input" style={{ width:'180px' }} placeholder="Search..." value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Joined</th><th></th></tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.customer_id}>
                    <td style={{ fontWeight:600 }}>{c.first_name} {c.last_name}</td>
                    <td style={{ color:'var(--muted)', fontSize:'.82rem' }}>{c.email}</td>
                    <td style={{ color:'var(--muted)', fontSize:'.82rem' }}>{c.date_joined}</td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn btn-ghost btn-sm" onClick={() => startEdit(c)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => del(c.customer_id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
