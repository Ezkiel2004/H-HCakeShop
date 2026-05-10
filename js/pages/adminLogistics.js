/* CakeCraft — Admin Logistics Page */
import { Store } from '../store.js';
import { Orders } from '../orders.js';
import { showToast } from '../notifications.js';
import { formatDateTime, getInitials } from '../utils.js';

export async function adminLogisticsPage() {
  const orders = Store.getOrders().filter(o => !['delivered','cancelled'].includes(o.status));
  const drivers = Store.getUsers().filter(u => u.role === 'driver');

  // Bind Add Driver form after render
  setTimeout(() => {
    const addBtn = document.getElementById('add-driver-btn');
    const modal = document.getElementById('add-driver-modal');
    const cancelBtn = document.getElementById('cancel-driver-btn');
    const form = document.getElementById('add-driver-form');

    if (addBtn && modal) {
      addBtn.onclick = () => { modal.style.display = 'flex'; };
      cancelBtn.onclick = () => { modal.style.display = 'none'; };
      modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
    }

    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const name = fd.get('driverName')?.trim();
        const email = fd.get('driverEmail')?.trim();
        const phone = fd.get('driverPhone')?.trim();
        const vehicle = fd.get('driverVehicle')?.trim();
        const submitBtn = form.querySelector('button[type="submit"]');

        if (!name || !email) {
          showToast({ title: 'Error', message: 'Name and email are required.', type: 'error' });
          return;
        }

        submitBtn.textContent = 'Adding...';
        submitBtn.disabled = true;

        try {
          const res = await fetch('api/users.php?action=register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password: 'driver123', role: 'driver', phone, vehicle })
          });
          const result = await res.json();

          if (res.ok && !result.error) {
            // Add to memory cache so the page updates
            Store.addUserToCache({ ...result, phone, vehicle, role: 'driver' });
            showToast({ title: 'Driver Added!', message: `${name} is now available for deliveries.`, type: 'success' });
            modal.style.display = 'none';
            // Re-render page
            location.hash = '/admin/logistics';
          } else {
            showToast({ title: 'Error', message: result.error || 'Failed to add driver.', type: 'error' });
            submitBtn.textContent = '+ Add Driver';
            submitBtn.disabled = false;
          }
        } catch (err) {
          showToast({ title: 'Error', message: 'Network error adding driver.', type: 'error' });
          submitBtn.textContent = '+ Add Driver';
          submitBtn.disabled = false;
        }
      };
    }
  }, 50);

  const driverCards = drivers.map(d => {
    const assigned = orders.filter(o => o.driverId === d.id);
    return `<div class="delivery-card">
      <div class="delivery-card-header">
        <div class="delivery-driver"><span class="avatar avatar-sm">${getInitials(d.name)}</span><div><div style="font-weight:600">${d.name}</div><div class="text-xs text-muted">${d.vehicle || ''} ${d.phone || ''}</div></div></div>
        <span class="badge badge-success">${assigned.length} active</span>
      </div>
      ${assigned.map(o => `
      <div style="padding:var(--space-3);background:var(--gray-50);border-radius:var(--radius-md);margin-bottom:var(--space-2);font-size:var(--text-sm)">
        <div style="display:flex;justify-content:space-between"><span style="font-weight:600">${o.trackingId}</span><span class="badge ${Orders.getStatusBadge(o.status)}">${Orders.getStatusLabel(o.status)}</span></div>
        <div class="text-xs text-muted mt-1">📍 ${o.delivery?.address || 'N/A'}</div>
        <div class="text-xs text-muted">📅 ${o.delivery?.date || ''} ${o.delivery?.time || ''}</div>
      </div>`).join('')}
      ${!assigned.length ? '<p class="text-sm text-muted">No active deliveries</p>' : ''}
    </div>`;
  }).join('');

  const unassigned = orders.filter(o => !o.driverId);

  return `<div>
    <div class="admin-page-header"><div><h1>Logistics</h1><p class="text-muted">${orders.length} active deliveries</p></div></div>
    <div class="logistics-map"><div class="logistics-map-placeholder"><div class="map-icon">🗺️</div><p>Map view simulation</p><p class="text-xs text-muted">${orders.length} active deliveries being tracked</p></div></div>
    ${unassigned.length ? `<div style="background:var(--warning-bg);border-radius:var(--radius-lg);padding:var(--space-4);margin-bottom:var(--space-6);display:flex;align-items:center;gap:var(--space-3)"><span>⚠️</span><span class="text-sm"><strong>${unassigned.length} unassigned orders.</strong> <a href="#/admin/orders">Assign drivers →</a></span></div>` : ''}
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-6)">
      <h3 style="margin:0">Driver Overview</h3>
      <button class="btn btn-primary btn-sm" id="add-driver-btn">🚗 Add Driver</button>
    </div>
    <div class="delivery-cards">${driverCards}</div>
    ${!drivers.length ? '<div class="empty-state"><div class="empty-state-icon">🚚</div><h3>No Drivers Yet</h3><p>Add your first driver to start managing deliveries.</p></div>' : ''}

    <!-- Add Driver Modal -->
    <div id="add-driver-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;justify-content:center;align-items:center;backdrop-filter:blur(4px)">
      <div style="background:var(--white);border-radius:var(--radius-xl);padding:var(--space-8);max-width:480px;width:90%;box-shadow:var(--shadow-xl);animation:scaleIn 0.2s ease">
        <h3 style="margin-bottom:var(--space-6)">🚗 Add New Driver</h3>
        <form id="add-driver-form">
          <div class="form-group"><label class="form-label">Full Name *</label><input class="form-input" name="driverName" required placeholder="e.g. John Smith"></div>
          <div class="form-group"><label class="form-label">Email *</label><input class="form-input" type="email" name="driverEmail" required placeholder="driver@example.com"></div>
          <div class="form-group"><label class="form-label">Phone</label><input class="form-input" name="driverPhone" placeholder="(555) 000-0000"></div>
          <div class="form-group"><label class="form-label">Vehicle</label><input class="form-input" name="driverVehicle" placeholder="e.g. White Toyota Van"></div>
          <div style="display:flex;gap:var(--space-3);justify-content:flex-end;margin-top:var(--space-6)">
            <button type="button" class="btn btn-ghost" id="cancel-driver-btn">Cancel</button>
            <button type="submit" class="btn btn-primary">+ Add Driver</button>
          </div>
        </form>
      </div>
    </div>
  </div>`;
}
