import { useState, useEffect } from 'react'
import { api } from '../../api.js'

export default function OrderPanel({ customerId, onOrderPlaced }) {
  const [menu, setMenu]       = useState([])
  const [employees, setEmp]   = useState([])
  const [cart, setCart]       = useState({})          // { menu_item_id: quantity }
  const [empId, setEmpId]     = useState('')
  const [redeem, setRedeem]   = useState(0)
  const [points, setPoints]   = useState(0)
  const [msg, setMsg]         = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.getMenu().then(setMenu)
    api.getEmployees().then(setEmp)
  }, [])

  useEffect(() => {
    if (customerId) {
      api.getCustomerPoints(customerId).then(r => setPoints(r.points_balance))
    }
  }, [customerId])

  const toggle = (id) => {
    setCart(prev => {
      if (prev[id]) {
        const next = { ...prev }; delete next[id]; return next
      }
      return { ...prev, [id]: 1 }
    })
  }

  const changeQty = (id, delta) => {
    setCart(prev => {
      const next = { ...prev, [id]: (prev[id] || 0) + delta }
      if (next[id] < 1) { delete next[id] }
      return next
    })
  }

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const item = menu.find(m => m.menu_item_id === Number(id))
    return { ...item, quantity: qty }
  })

  const total  = cartItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const earned = Math.floor(total)
  const groups = ['Entree','Side','Drink','Dessert']

  const placeOrder = async () => {
    if (!empId)            return setMsg({ type:'err', text:'Select a cashier first.' })
    if (!cartItems.length) return setMsg({ type:'err', text:'Cart is empty.' })
    if (redeem > points)   return setMsg({ type:'err', text:'Not enough points.' })

    setLoading(true); setMsg(null)
    try {
      const res = await api.createOrder({
        customer_id:     customerId || null,
        employee_id:     Number(empId),
        items:           cartItems.map(i => ({ menu_item_id: i.menu_item_id, quantity: i.quantity })),
        points_redeemed: redeem,
      })
      setMsg({ type:'ok', text: `Order #${res.order_id} placed! You earned ${res.points_earned} pts.` })
      setCart({}); setRedeem(0)
      if (customerId) api.getCustomerPoints(customerId).then(r => setPoints(r.points_balance))
      onOrderPlaced?.()
    } catch (e) {
      setMsg({ type:'err', text: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="two-col">
      {/* Left — menu */}
      <div>
        {msg && <div className={`alert alert-${msg.type === 'ok' ? 'ok' : 'err'}`}>{msg.text}</div>}
        {groups.map(cat => {
          const items = menu.filter(m => m.category === cat)
          if (!items.length) return null
          return (
            <div key={cat} style={{ marginBottom: '1.2rem' }}>
              <div className="form-label mb-1">{cat}</div>
              <div className="menu-grid">
                {items.map(item => (
                  <div
                    key={item.menu_item_id}
                    className={`menu-card ${cart[item.menu_item_id] ? 'sel' : ''}`}
                    onClick={() => toggle(item.menu_item_id)}
                  >
                    {cart[item.menu_item_id] > 0 && (
                      <span className="menu-qty-badge">×{cart[item.menu_item_id]}</span>
                    )}
                    <div className="menu-cat">{item.category}</div>
                    <div className="menu-name">{item.item_name}</div>
                    <div className="menu-price">${item.price.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Right — cart */}
      <div>
        <div className="card" style={{ position:'sticky', top:'80px' }}>
          <div className="card-hd"><span className="card-title">Your Order</span></div>

          {cartItems.length === 0
            ? <p className="empty">Tap items to add them</p>
            : cartItems.map(item => (
              <div className="cart-item" key={item.menu_item_id}>
                <div>
                  <div style={{ fontWeight:600 }}>{item.item_name}</div>
                  <div style={{ color:'var(--muted)', fontSize:'.8rem' }}>${item.price.toFixed(2)} each</div>
                </div>
                <div className="qty-ctrl">
                  <button className="qty-btn" onClick={() => changeQty(item.menu_item_id, -1)}>−</button>
                  <span className="qty-num">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => changeQty(item.menu_item_id, +1)}>+</button>
                </div>
              </div>
            ))
          }

          <div className="cart-total">
            <span>Total</span>
            <span style={{ color:'var(--primary)' }}>${total.toFixed(2)}</span>
          </div>

          <div style={{ borderTop:'1px solid var(--border)', marginTop:'.75rem', paddingTop:'.75rem', display:'flex', justifyContent:'space-between', fontSize:'.8rem', color:'var(--muted)' }}>
            <span>Points to earn</span>
            <span style={{ color:'var(--accent)', fontWeight:700 }}>+{earned} pts</span>
          </div>

          <div style={{ height:'1px', background:'var(--border)', margin:'1rem 0' }} />

          <div className="form-group">
            <label className="form-label">Cashier</label>
            <select className="form-select" value={empId} onChange={e => setEmpId(e.target.value)}>
              <option value="">Select employee...</option>
              {employees.map(e => (
                <option key={e.employee_id} value={e.employee_id}>
                  {e.first_name} {e.last_name}
                </option>
              ))}
            </select>
          </div>

          {customerId && (
            <div className="form-group">
              <label className="form-label">Redeem points (balance: {points})</label>
              <div className="flex items-center gap-1">
                <input
                  type="number" className="form-input"
                  min={0} max={points} value={redeem}
                  onChange={e => setRedeem(Number(e.target.value))}
                  style={{ width:'100px' }}
                />
                <span style={{ color:'var(--muted)', fontSize:'.8rem' }}>pts</span>
              </div>
            </div>
          )}

          <button
            className="btn btn-primary" style={{ width:'100%', marginTop:'.5rem', justifyContent:'center', padding:'10px' }}
            onClick={placeOrder} disabled={loading}
          >
            {loading ? 'Placing...' : '🍔 Place Order'}
          </button>
        </div>
      </div>
    </div>
  )
}
