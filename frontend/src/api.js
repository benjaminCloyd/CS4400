const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Customers
  getCustomers:   ()        => req('/customers/'),
  createCustomer: (data)    => req('/customers/', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id, data)=> req(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id)      => req(`/customers/${id}`, { method: 'DELETE' }),

  // Employees
  getEmployees:   ()     => req('/employees/'),
  createEmployee: (data) => req('/employees/', { method: 'POST', body: JSON.stringify(data) }),
  deleteEmployee: (id)   => req(`/employees/${id}`, { method: 'DELETE' }),

  // Menu
  getMenu:        ()        => req('/menu/'),
  createMenuItem: (data)    => req('/menu/', { method: 'POST', body: JSON.stringify(data) }),
  updateMenuItem: (id, data)=> req(`/menu/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMenuItem: (id)      => req(`/menu/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders:         ()           => req('/orders/'),
  getCustomerOrders: (customerId) => req(`/orders/customer/${customerId}`),
  createOrder:       (data)       => req('/orders/', { method: 'POST', body: JSON.stringify(data) }),

  // Rewards
  getRewardAccount:    (cid) => req(`/rewards/${cid}`),
  getCustomerPoints:   (cid) => req(`/rewards/${cid}/points`),
  getRewardTxns:       (cid) => req(`/rewards/${cid}/transactions`),

  // Analytics
  getSummary:         () => req('/analytics/summary'),
  getCustomerSpending:() => req('/analytics/customer-spending'),
  getMenuSales:       () => req('/analytics/menu-sales'),
  getEmployeeStats:   () => req('/analytics/employee-stats'),
  getTopCustomers:    () => req('/analytics/top-customers'),
};
