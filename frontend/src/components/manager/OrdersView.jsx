import { useState, useEffect } from 'react'
import { api } from '../../api.js'

export default function OrdersView() {
  const [orders, setOrders] = useState([])

  useEffect(() => { api.getOrders().then(setOrders) }, [])

  return (
    <div className="card">
      <div className="card-hd">
        <span className="card-title">All Orders</span>
        <button className="btn btn-ghost btn-sm" onClick={() => api.getOrders().then(setOrders)}>↻ Refresh</button>
      </div>
      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th><th>Date/Time</th><th>Customer</th>
              <th>Cashier</th><th>Amount</th><th>Pts Earned</th><th>Pts Used</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.order_id}>
                <td style={{ color:'var(--muted)' }}>#{o.order_id}</td>
                <td style={{ fontSize:'.8rem', color:'var(--muted)' }}>
                  {new Date(o.order_datetime).toLocaleString()}
                </td>
                <td style={{ fontWeight:600 }}>{o.customer_name || <span style={{color:'var(--dim)'}}>Guest</span>}</td>
                <td>{o.employee_name}</td>
                <td style={{ color:'var(--primary)', fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.05rem' }}>
                  ${o.total_amount.toFixed(2)}
                </td>
                <td>
                  {o.points_earned > 0
                    ? <span className="badge badge-green">+{o.points_earned}</span>
                    : <span style={{color:'var(--dim)'}}>—</span>}
                </td>
                <td>
                  {o.points_redeemed > 0
                    ? <span className="badge badge-red">-{o.points_redeemed}</span>
                    : <span style={{color:'var(--dim)'}}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
