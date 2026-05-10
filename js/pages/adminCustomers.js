/* CakeCraft — Admin Customers Page */
import { Store } from '../store.js';
import { formatDate, formatCurrency, getInitials } from '../utils.js';

export async function adminCustomersPage() {
  const customers = Store.getUsers().filter(u => u.role === 'customer');
  const orders = Store.getOrders();

  const rows = customers.map(c => {
    const cOrders = orders.filter(o => o.userId === c.id);
    const spent = cOrders.reduce((s, o) => s + o.total, 0);
    return `<tr>
      <td><div style="display:flex;align-items:center;gap:var(--space-3)"><span class="avatar avatar-sm">${getInitials(c.name)}</span><div><div style="font-weight:600">${c.name}</div><div class="text-xs text-muted">${c.email}</div></div></div></td>
      <td>${formatDate(c.createdAt)}</td>
      <td>${cOrders.length}</td>
      <td>${formatCurrency(spent)}</td>
      <td>⭐ ${c.loyaltyPoints || 0}</td>
      <td><span class="badge ${c.status === 'active' ? 'badge-success' : 'badge-danger'}">${c.status}</span></td>
    </tr>`;
  }).join('');

  return `<div>
    <div class="admin-page-header"><div><h1>Customers</h1><p class="text-muted">${customers.length} registered customers</p></div></div>
    <div class="table-wrapper"><table class="data-table"><thead><tr><th>Customer</th><th>Joined</th><th>Orders</th><th>Spent</th><th>Points</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>
  </div>`;
}
