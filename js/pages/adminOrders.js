/* CakeCraft — Admin Orders Page */
import { Store } from '../store.js';
import { Orders } from '../orders.js';
import { formatCurrency, formatDateTime } from '../utils.js';
import { showToast } from '../notifications.js';

export async function adminOrdersPage() {
  const orders = Store.getOrders().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  const drivers = Store.getUsers().filter(u => u.role === 'driver');

  setTimeout(() => {
    document.querySelectorAll('[data-status-select]').forEach(sel => {
      sel.onchange = async () => {
        const result = await Orders.updateStatus(sel.dataset.statusSelect, sel.value);
        if (result.success) {
          showToast({title:'Status Updated',type:'success'});
        } else {
          showToast({title:'Error', message: result.error, type:'error'});
        }
        location.hash = '/admin/orders';
      };
    });
    document.querySelectorAll('[data-driver-select]').forEach(sel => {
      sel.onchange = async () => {
        const result = await Orders.assignDriver(sel.dataset.driverSelect, sel.value);
        if (result.success) {
          showToast({title:'Driver Assigned',type:'success'});
        } else {
          showToast({title:'Error', message: result.error, type:'error'});
        }
      };
    });
  }, 50);

  const statusOpts = (current) => ['received','baking','decorating','out_for_delivery','delivered','cancelled'].map(s =>
    `<option value="${s}" ${s===current?'selected':''}>${Orders.getStatusLabel(s)}</option>`).join('');
  const driverOpts = (current) => `<option value="">Unassigned</option>` + drivers.map(d =>
    `<option value="${d.id}" ${d.id===current?'selected':''}>${d.name}</option>`).join('');

  const rows = orders.map(o => `
    <tr>
      <td><span style="font-weight:600">${o.trackingId}</span><div class="text-xs text-muted">${formatDateTime(o.createdAt)}</div></td>
      <td>${Store.getUser(o.userId)?.name || 'Unknown'}</td>
      <td class="text-sm">${o.items.map(i=>`${i.name} (${i.size})×${i.qty}`).join(', ')}</td>
      <td><select class="form-select" data-status-select="${o.id}" style="width:auto;padding:4px 8px;font-size:12px">${statusOpts(o.status)}</select></td>
      <td><select class="form-select" data-driver-select="${o.id}" style="width:auto;padding:4px 8px;font-size:12px">${driverOpts(o.driverId)}</select></td>
      <td class="font-semibold">${formatCurrency(o.total)}</td>
    </tr>`).join('');

  return `<div>
    <div class="admin-page-header"><div><h1>Orders</h1><p class="text-muted">${orders.length} total orders</p></div></div>
    <div class="table-wrapper"><table class="data-table"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Status</th><th>Driver</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table></div>
  </div>`;
}
