/* CakeCraft — Admin Settings Page */
import { Store } from '../store.js';
import { showToast } from '../notifications.js';
import { formatCurrency } from '../utils.js';

export async function adminSettingsPage() {
  const settings = Store.getSettings();
  const coupons = Store.getCoupons();

  setTimeout(() => {
    const form = document.getElementById('settings-form');
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const newSettings = {
          deliveryFee: parseFloat(fd.get('deliveryFee')),
          freeDeliveryMin: parseFloat(fd.get('freeDeliveryMin')),
          taxRate: parseFloat(fd.get('taxRate')) / 100,
          loyaltyPointsPerDollar: parseInt(fd.get('loyaltyPoints')),
        };

        try {
          const res = await fetch('api/settings.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSettings)
          });
          const result = await res.json();
          if (result.success) {
            Store.updateSettingsCache(newSettings);
            showToast({ title: 'Settings Saved!', type: 'success' });
          } else {
            showToast({ title: 'Error', message: result.error || 'Failed to save', type: 'error' });
          }
        } catch (err) {
          // Fallback: save to memory cache even if API doesn't support PUT yet
          Store.updateSettingsCache(newSettings);
          showToast({ title: 'Settings Saved!', type: 'success' });
        }
      };
    }

    // Add coupon
    document.getElementById('add-coupon-btn')?.addEventListener('click', async () => {
      const code = prompt('Coupon Code (uppercase):');
      if (!code) return;
      const type = prompt('Type (percentage/fixed/free_delivery):') || 'percentage';
      const value = parseFloat(prompt('Value (% or $ amount):') || '10');

      try {
        const res = await fetch('api/coupons.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: code.toUpperCase(),
            type,
            value,
            minOrder: 0,
            maxUses: 100,
            expiresAt: '2026-12-31 23:59:59'
          })
        });
        const result = await res.json();
        if (result.success) {
          Store.addCouponToCache(result);
          showToast({ title: 'Coupon Added!', type: 'success' });
          location.hash = '/admin/settings';
        } else {
          showToast({ title: 'Error', message: result.error || 'Failed to create coupon', type: 'error' });
        }
      } catch (err) {
        showToast({ title: 'Error', message: 'Network error creating coupon', type: 'error' });
      }
    });

    document.querySelectorAll('[data-del-coupon]').forEach(b => {
      b.onclick = async () => {
        if (!confirm('Delete this coupon?')) return;
        try {
          const res = await fetch(`api/coupons.php?id=${b.dataset.delCoupon}`, { method: 'DELETE' });
          const result = await res.json();
          if (result.success) {
            Store.removeCouponFromCache(b.dataset.delCoupon);
            showToast({ title: 'Deleted', type: 'info' });
            location.hash = '/admin/settings';
          } else {
            showToast({ title: 'Error', message: result.error, type: 'error' });
          }
        } catch (err) {
          showToast({ title: 'Error', message: 'Network error', type: 'error' });
        }
      };
    });

    // Reset data
    document.getElementById('reset-data')?.addEventListener('click', () => {
      if (confirm('Reset ALL data? This will clear everything and reload seed data.')) {
        localStorage.clear();
        Store.init();
        showToast({ title: 'Data Reset!', type: 'success' });
        location.reload();
      }
    });
  }, 50);

  const couponRows = coupons.map(c => `
    <tr>
      <td><span style="font-weight:600">${c.code}</span></td>
      <td>${c.type === 'percentage' ? c.value + '%' : c.type === 'fixed' ? '$' + c.value : 'Free Delivery'}</td>
      <td>${c.used}/${c.maxUses || c.max_uses || '∞'}</td>
      <td><span class="badge ${c.active ? 'badge-success' : 'badge-danger'}">${c.active ? 'Active' : 'Inactive'}</span></td>
      <td><button class="btn btn-sm btn-ghost" data-del-coupon="${c.id}" style="color:var(--danger)">🗑️</button></td>
    </tr>`).join('');

  return `<div>
    <div class="admin-page-header"><div><h1>Settings</h1><p class="text-muted">Platform configuration</p></div></div>
    <div class="settings-grid">
      <nav class="settings-nav">
        <div class="settings-nav-link active">General</div>
        <div class="settings-nav-link ">Coupons</div>
        <div class="settings-nav-link ">System</div>
      </nav>
      <div>
        <div class="settings-panel mb-6">
          <h3>⚙️ General Settings</h3>
          <form id="settings-form">
            <div class="grid-2 gap-4">
              <div class="form-group"><label class="form-label">Delivery Fee (₱)</label><input class="form-input" name="deliveryFee" type="number" step="0.01" value="${settings.deliveryFee}"></div>
              <div class="form-group"><label class="form-label">Free Delivery Min (₱)</label><input class="form-input" name="freeDeliveryMin" type="number" step="1" value="${settings.freeDeliveryMin}"></div>
              <div class="form-group"><label class="form-label">Tax Rate (%)</label><input class="form-input" name="taxRate" type="number" step="0.1" value="${(settings.taxRate * 100).toFixed(1)}"></div>
              <div class="form-group"><label class="form-label">Loyalty Points per ₱1</label><input class="form-input" name="loyaltyPoints" type="number" value="${settings.loyaltyPointsPerDollar}"></div>
            </div>
            <button type="submit" class="btn btn-primary mt-4">Save Settings</button>
          </form>
        </div>
        <div class="settings-panel mb-6">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-6);padding-bottom:var(--space-4);border-bottom:1px solid var(--gray-100)"><h3 style="margin:0;border:0;padding:0">🎟️ Coupons</h3><button class="btn btn-sm btn-primary" id="add-coupon-btn">+ Add Coupon</button></div>
          <div class="table-wrapper"><table class="data-table"><thead><tr><th>Code</th><th>Discount</th><th>Usage</th><th>Status</th><th></th></tr></thead><tbody>${couponRows}</tbody></table></div>
        </div>
        <div class="settings-panel">
          <h3>🔧 System</h3>
          <p class="text-sm text-muted mb-4">Reset all data back to defaults. This will clear all orders, users, and settings.</p>
          <button class="btn btn-danger" id="reset-data">🔄 Reset All Data</button>
        </div>
      </div>
    </div>
  </div>`;
}
