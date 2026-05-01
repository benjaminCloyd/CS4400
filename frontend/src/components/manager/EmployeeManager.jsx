import { useState, useEffect } from 'react'
import { api } from '../../api.js'

const BLANK = { first_name:'', last_name:'', hire_date: new Date().toISOString().slice(0,10) }

export default function EmployeeManager() {
  const [employees, setEmployees] = useState([])
  const [form, setForm]           = useState(BLANK)
  const [msg, setMsg]             = useState(null)

  const load = () => api.getEmployees().then(setEmployees)
  useEffect(() => { load() }, [])

  const save = async () => {
    try {
      await api.createEmployee(form)
      setMsg({ type:'ok', text:'Employee added.' })
      setForm(BLANK); load()
    } catch(e) { setMsg({ type:'err', text: e.message }) }
  }

  const del = async (id) => {
    if (!confirm('Remove this employee?')) return
    try { await api.deleteEmployee(id); load() }
    catch(e) { setMsg({ type:'err', text: e.message }) }
  }

  return (
    <div className="two-col">
      <div className="card">
        <div className="card-hd"><span className="card-title">Add Employee</span></div>
        {msg && <div className={`alert alert-${msg.type==='ok'?'ok':'err'}`}>{msg.text}</div>}
        {['first_name','last_name'].map(f => (
          <div className="form-group" key={f}>
            <label className="form-label">{f.replace('_',' ')}</label>
            <input className="form-input" value={form[f]}
              onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} />
          </div>
        ))}
        <div className="form-group">
          <label className="form-label">Hire Date</label>
          <input className="form-input" type="date" value={form.hire_date}
            onChange={e => setForm(p => ({ ...p, hire_date: e.target.value }))} />
        </div>
        <button className="btn btn-primary" onClick={save}>+ Add Employee</button>
      </div>

      <div className="card">
        <div className="card-hd"><span className="card-title">Staff</span></div>
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Name</th><th>Hire Date</th><th></th></tr></thead>
            <tbody>
              {employees.map(e => (
                <tr key={e.employee_id}>
                  <td style={{ fontWeight:600 }}>{e.first_name} {e.last_name}</td>
                  <td style={{ color:'var(--muted)', fontSize:'.82rem' }}>{e.hire_date}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => del(e.employee_id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
