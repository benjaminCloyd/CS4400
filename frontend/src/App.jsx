import { useState, useEffect } from 'react'
import { api } from './api.js'

// Customer views
import OrderPanel from './components/customer/OrderPanel.jsx'
import RewardsPanel from './components/customer/RewardsPanel.jsx'

// Manager views
import AnalyticsPanel from './components/manager/AnalyticsPanel.jsx'
import MenuManager from './components/manager/MenuManager.jsx'
import CustomerManager from './components/manager/CustomerManager.jsx'
import EmployeeManager from './components/manager/EmployeeManager.jsx'
import OrdersView from './components/manager/OrdersView.jsx'

const CUST_TABS = ['Order', 'Rewards']
const MGR_TABS = ['Analytics', 'Menu', 'Customers', 'Employees', 'Orders']

export default function App() {
  const [role, setRole] = useState('customer')  // 'customer' | 'manager'
  const [custTab, setCustTab] = useState('Order')
  const [mgrTab, setMgrTab] = useState('Analytics')
  const [customers, setCustomers] = useState([])
  const [customerId, setCustomerId] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    api.getCustomers().then(list => {
      setCustomers(list)
      if (list.length && !customerId) setCustomerId(list[0].customer_id)
    })
  }, [refreshKey])

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="brand">
          <span className="brand-icon"></span>
          <span className="brand-name">FastFood</span>
          <span className="brand-pill">Rewards</span>
        </div>

        <div className="role-sw">
          <button
            className={`role-btn ${role === 'customer' ? 'active' : ''}`}
            onClick={() => setRole('customer')}
          >Customer</button>
          <button
            className={`role-btn ${role === 'manager' ? 'active' : ''}`}
            onClick={() => setRole('manager')}
          >Manager</button>
        </div>
      </header>

      <main className="main">
        {/* ── Customer View ───────────────────────────────────── */}
        {role === 'customer' && (
          <>
            {/* Account selector */}
            <div className="cust-bar">
              <label>Your Account</label>
              <select
                className="form-select" style={{ width: '230px' }}
                value={customerId || ''}
                onChange={e => setCustomerId(Number(e.target.value))}
              >
                {customers.map(c => (
                  <option key={c.customer_id} value={c.customer_id}>
                    {c.first_name} {c.last_name}
                  </option>
                ))}
              </select>
              <div style={{ flex: 1 }} />
              <span style={{ color: 'var(--muted)', fontSize: '.8rem' }}>
                Or order as a guest — no account needed
              </span>
            </div>

            <div className="tabs">
              {CUST_TABS.map(t => (
                <button key={t} className={`tab-btn ${custTab === t ? 'active' : ''}`} onClick={() => setCustTab(t)}>{t}</button>
              ))}
            </div>

            {custTab === 'Order' && <OrderPanel customerId={customerId} onOrderPlaced={() => setRefreshKey(k => k + 1)} />}
            {custTab === 'Rewards' && <RewardsPanel customerId={customerId} />}
          </>
        )}

        {/* ── Manager View ────────────────────────────────────── */}
        {role === 'manager' && (
          <>
            <div className="tabs">
              {MGR_TABS.map(t => (
                <button key={t} className={`tab-btn ${mgrTab === t ? 'active' : ''}`} onClick={() => setMgrTab(t)}>{t}</button>
              ))}
            </div>

            {mgrTab === 'Analytics' && <AnalyticsPanel />}
            {mgrTab === 'Menu' && <MenuManager />}
            {mgrTab === 'Customers' && <CustomerManager />}
            {mgrTab === 'Employees' && <EmployeeManager />}
            {mgrTab === 'Orders' && <OrdersView />}
          </>
        )}
      </main>
    </div>
  )
}
