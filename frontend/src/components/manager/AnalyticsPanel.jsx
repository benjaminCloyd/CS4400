import { useState, useEffect } from 'react'
import { api } from '../../api.js'

export default function AnalyticsPanel() {
  const [summary, setSummary]       = useState(null)
  const [custData, setCustData]     = useState([])
  const [menuData, setMenuData]     = useState([])
  const [empData, setEmpData]       = useState([])
  const [topCust, setTopCust]       = useState([])

  useEffect(() => {
    api.getSummary().then(setSummary)
    api.getCustomerSpending().then(setCustData)
    api.getMenuSales().then(setMenuData)
    api.getEmployeeStats().then(setEmpData)
    api.getTopCustomers().then(setTopCust)
  }, [])

  return (
    <div>
      {/* KPIs */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-val">{summary?.total_orders ?? '—'}</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-val">${summary?.total_revenue?.toFixed(2) ?? '—'}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Customers</div>
          <div className="stat-val">{summary?.total_customers ?? '—'}</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Avg Order</div>
          <div className="stat-val">${summary?.avg_order_value?.toFixed(2) ?? '—'}</div>
        </div>
      </div>

      <div className="two-col">
        {/* Best-selling items */}
        <div className="card">
          <div className="card-hd"><span className="card-title">Menu Sales (View)</span></div>
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Item</th><th>Category</th><th>Qty Sold</th><th>Revenue</th></tr></thead>
              <tbody>
                {menuData.map(m => (
                  <tr key={m.menu_item_id}>
                    <td style={{ fontWeight:600 }}>{m.item_name}</td>
                    <td><span className="badge badge-gold">{m.category}</span></td>
                    <td>{m.total_quantity_sold}</td>
                    <td style={{ color:'var(--success)' }}>${Number(m.total_item_revenue).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Employee stats */}
        <div className="card">
          <div className="card-hd"><span className="card-title">Employee Stats</span></div>
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Employee</th><th>Orders</th><th>Sales</th></tr></thead>
              <tbody>
                {empData.map(e => (
                  <tr key={e.employee_id}>
                    <td style={{ fontWeight:600 }}>{e.employee_name}</td>
                    <td>{e.orders_processed}</td>
                    <td style={{ color:'var(--success)' }}>${Number(e.total_sales).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Customer spending — uses CustomerSpendingSummary view */}
      <div className="card">
        <div className="card-hd">
          <span className="card-title">Customer Spending Summary (View)</span>
          <span style={{ fontSize:'.75rem', color:'var(--muted)' }}>Above-avg customers highlighted</span>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer</th><th>Orders</th><th>Total Spent</th>
                <th>Pts Earned</th><th>Pts Redeemed</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {custData.map(c => {
                const isTop = topCust.some(t => t.customer_id === c.customer_id)
                return (
                  <tr key={c.customer_id}>
                    <td style={{ fontWeight:600 }}>{c.first_name} {c.last_name}</td>
                    <td>{c.total_orders}</td>
                    <td style={{ color:'var(--primary)' }}>${Number(c.total_spent).toFixed(2)}</td>
                    <td style={{ color:'var(--success)' }}>+{c.total_points_earned}</td>
                    <td style={{ color: c.total_points_redeemed > 0 ? 'var(--danger)' : 'var(--dim)' }}>
                      {c.total_points_redeemed > 0 ? `-${c.total_points_redeemed}` : '—'}
                    </td>
                    <td>
                      {isTop
                        ? <span className="badge badge-gold">⭐ Top Spender</span>
                        : <span className="badge" style={{ color:'var(--dim)', borderColor:'var(--border)' }}>Regular</span>
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
