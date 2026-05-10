/* CakeCraft — User Dashboard + Order History */
import { Auth } from '../auth.js';
import { Store } from '../store.js';
import { Orders } from '../orders.js';
import { formatCurrency, formatDate, formatDateTime } from '../utils.js';
import { Router } from '../router.js';

export async function userDashboardPage() {
  const user = Auth.currentUser();
  if (!user) { Router.navigate('/login'); return ''; }

  const userOrders = Store.getUserOrders(user.id);
  const activeOrders = userOrders.filter(o => !['delivered','cancelled'].includes(o.status));
  const totalSpent = userOrders.reduce((s, o) => s + o.total, 0);

  const orderRows = userOrders.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(o => `
    <tr>
      <td><a href="#/tracking/${o.trackingId}" style="font-weight:600">${o.trackingId}</a></td>
      <td>${o.items.map(i => i.name).join(', ')}</td>
      <td>${formatDate(o.createdAt)}</td>
      <td><span class="badge ${Orders.getStatusBadge(o.status)}">${Orders.getStatusIcon(o.status)} ${Orders.getStatusLabel(o.status)}</span></td>
      <td class="font-semibold">${formatCurrency(o.total)}</td>
      <td><a href="#/tracking/${o.trackingId}" class="btn btn-sm btn-ghost">View</a></td>
    </tr>`).join('');

  return `
  <div class="container" style="padding-top:var(--space-8);padding-bottom:var(--space-16)">
    <div class="dashboard-welcome">
      <h2>Welcome back, ${user.name.split(' ')[0]}! 👋</h2>
      <p>Here's an overview of your orders and rewards</p>
    </div>
    <div class="dashboard-stats stagger">
      <div class="stat-card animate-fadeInUp"><div class="stat-card-icon" style="background:var(--primary-bg);color:var(--primary)">📦</div><div class="stat-card-value">${userOrders.length}</div><div class="stat-card-label">Total Orders</div></div>
      <div class="stat-card animate-fadeInUp"><div class="stat-card-icon" style="background:var(--info-bg);color:var(--info)">⏳</div><div class="stat-card-value">${activeOrders.length}</div><div class="stat-card-label">Active Orders</div></div>
      <div class="stat-card animate-fadeInUp"><div class="stat-card-icon" style="background:var(--success-bg);color:var(--success)">💰</div><div class="stat-card-value">${formatCurrency(totalSpent)}</div><div class="stat-card-label">Total Spent</div></div>
      <div class="stat-card animate-fadeInUp"><div class="stat-card-icon" style="background:var(--warning-bg);color:var(--warning)">⭐</div><div class="stat-card-value">${user.loyaltyPoints || 0}</div><div class="stat-card-label">Loyalty Points</div></div>
    </div>

    ${activeOrders.length ? `
    <h3 class="mb-4">Active Orders</h3>
    <div class="grid-2 gap-4 mb-8">${activeOrders.map(o => {
      const progress = ((Orders.STATUS_ORDER.indexOf(o.status) + 1) / Orders.STATUS_ORDER.length) * 100;
      return `<div class="card" style="cursor:pointer" onclick="location.hash='/tracking/${o.trackingId}'">
        <div class="card-body">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-3)">
            <span style="font-weight:600">${o.trackingId}</span>
            <span class="badge ${Orders.getStatusBadge(o.status)}">${Orders.getStatusIcon(o.status)} ${Orders.getStatusLabel(o.status)}</span>
          </div>
          <p class="text-sm text-muted mb-3">${o.items.map(i=>i.name).join(', ')}</p>
          <div class="progress"><div class="progress-bar" style="width:${progress}%"></div></div>
        </div></div>`;
    }).join('')}</div>` : ''}

    <h3 class="mb-4">Order History</h3>
    ${userOrders.length ? `
    <div class="table-wrapper">
      <table class="data-table">
        <thead><tr><th>Tracking</th><th>Items</th><th>Date</th><th>Status</th><th>Total</th><th></th></tr></thead>
        <tbody>${orderRows}</tbody>
      </table>
    </div>` : '<div class="empty-state"><div class="empty-state-icon">📦</div><h3>No orders yet</h3><p>Start your first order!</p><a href="#/catalog" class="btn btn-primary">Browse Cakes</a></div>'}
  </div>`;
}
