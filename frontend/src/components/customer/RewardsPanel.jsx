import { useState, useEffect } from 'react'
import { api } from '../../api.js'

export default function RewardsPanel({ customerId }) {
  const [account, setAccount] = useState(null)
  const [txns, setTxns]       = useState([])
  const [orders, setOrders]   = useState([])

  useEffect(() => {
    if (!customerId) return
    api.getRewardAccount(customerId).then(setAccount).catch(() => setAccount(null))
    api.getRewardTxns(customerId).then(setTxns)
    api.getCustomerOrders(customerId).then(setOrders)
  }, [customerId])

  if (!customerId) return <p className="empty">Select your account to view rewards.</p>

  return (
    <div>
      {/* Points banner */}
      <div className="pts-banner">
        <div>
          <div className="pts-label">🏅 Points Balance</div>
          <div className="pts-val">{account?.points_balance ?? '—'}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div className="pts-label">How it works</div>
          <div style={{ color:'var(--muted)', fontSize:'.85rem', marginTop:'.2rem' }}>
            1 point per $1 spent<br />
            Redeem at checkout
          </div>
        </div>
      </div>

      <div className="two-col">
        {/* Transaction history */}
        <div className="card">
          <div className="card-hd"><span className="card-title">Points History</span></div>
          {txns.length === 0
            ? <p className="empty">No transactions yet.</p>
            : (
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Order #</th>
                      <th>Earned</th>
                      <th>Redeemed</th>
                      <th>Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txns.map(t => (
                      <tr key={t.reward_transaction_id}>
                        <td style={{ color:'var(--muted)', fontSize:'.8rem' }}>
                          {new Date(t.transaction_date).toLocaleDateString()}
                        </td>
                        <td>#{t.order_id}</td>
                        <td style={{ color:'var(--success)', fontWeight:600 }}>+{t.points_earned}</td>
                        <td style={{ color: t.points_redeemed ? 'var(--danger)' : 'var(--dim)' }}>
                          {t.points_redeemed ? `-${t.points_redeemed}` : '—'}
                        </td>
                        <td style={{ fontWeight:700, color: t.net_points >= 0 ? 'var(--accent)' : 'var(--danger)' }}>
                          {t.net_points >= 0 ? '+' : ''}{t.net_points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>

        {/* Order history */}
        <div className="card">
          <div className="card-hd"><span className="card-title">Order History</span></div>
          {orders.length === 0
            ? <p className="empty">No orders yet.</p>
            : orders.map(o => (
              <div key={o.order_id} style={{ borderBottom:'1px solid var(--border)', paddingBottom:'1rem', marginBottom:'1rem' }}>
                <div className="flex items-center gap-2" style={{ justifyContent:'space-between' }}>
                  <span style={{ fontWeight:700 }}>Order #{o.order_id}</span>
                  <span style={{ color:'var(--primary)', fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.1rem' }}>
                    ${o.total_amount.toFixed(2)}
                  </span>
                </div>
                <div style={{ color:'var(--muted)', fontSize:'.78rem', marginBottom:'.5rem' }}>
                  {new Date(o.order_datetime).toLocaleString()} · {o.employee_name}
                </div>
                {o.items?.map(i => (
                  <div key={i.order_item_id} style={{ display:'flex', justifyContent:'space-between', fontSize:'.82rem', color:'var(--text)', padding:'2px 0' }}>
                    <span>{i.item_name} <span style={{ color:'var(--dim)' }}>×{i.quantity}</span></span>
                    <span style={{ color:'var(--muted)' }}>${(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ display:'flex', gap:'.5rem', marginTop:'.5rem' }}>
                  {o.points_earned > 0 && <span className="badge badge-green">+{o.points_earned} pts</span>}
                  {o.points_redeemed > 0 && <span className="badge badge-red">-{o.points_redeemed} pts</span>}
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
