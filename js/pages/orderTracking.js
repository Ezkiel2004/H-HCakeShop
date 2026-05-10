/* CakeCraft — Order Tracking Page */
import { Store } from '../store.js';
import { Orders } from '../orders.js';
import { formatDateTime, formatCurrency } from '../utils.js';
import { Router } from '../router.js';

export async function orderTrackingPage() {
  const params = Router.getParams();
  const trackId = params.id;

  setTimeout(() => {
    const btn = document.getElementById('track-btn');
    if (btn) {
      btn.onclick = () => {
        const val = document.getElementById('track-input')?.value?.trim();
        if (val) Router.navigate('/tracking/' + val);
      };
    }
    // Allow Enter key on input
    const input = document.getElementById('track-input');
    if (input) {
      input.onkeydown = (e) => {
        if (e.key === 'Enter') {
          const val = input.value.trim();
          if (val) Router.navigate('/tracking/' + val);
        }
      };
    }
  }, 50);

  let resultHtml = '';
  if (trackId) {
    // Try cache first, then fetch from API
    let order = Store.getOrderByTrack(trackId);
    
    if (!order) {
      try {
        const res = await fetch(`api/orders.php?tracking_id=${encodeURIComponent(trackId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.trackingId) {
            order = data;
          }
        }
      } catch (err) {
        console.error('Error fetching order by tracking ID:', err);
      }
    }

    if (order) {
      const steps = Orders.STATUS_ORDER;
      const currentIdx = steps.indexOf(order.status);
      const driver = order.driverId ? Store.getUser(order.driverId) : null;

      const timelineHtml = steps.map((s, i) => {
        const hist = order.statusHistory?.find(h => h.status === s);
        const cls = i < currentIdx ? 'completed' : i === currentIdx ? 'active' : '';
        return `
        <div class="timeline-step ${cls}">
          <div class="timeline-dot">${Orders.getStatusIcon(s)}</div>
          <div class="timeline-line"></div>
          <div class="timeline-content">
            <h4>${Orders.getStatusLabel(s)}</h4>
            <p>${getStepDesc(s)}</p>
            ${hist ? `<div class="timeline-time">${formatDateTime(hist.time)}</div>` : ''}
          </div>
        </div>`;
      }).join('');

      resultHtml = `
      <div class="tracking-result animate-fadeInUp">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:var(--space-6);flex-wrap:wrap;gap:var(--space-4)">
          <div>
            <h3 style="margin-bottom:var(--space-1)">Order ${order.trackingId}</h3>
            <p class="text-sm text-muted">Placed ${formatDateTime(order.createdAt)}</p>
          </div>
          <span class="badge ${Orders.getStatusBadge(order.status)}" style="font-size:var(--text-sm);padding:var(--space-2) var(--space-4)">${Orders.getStatusIcon(order.status)} ${Orders.getStatusLabel(order.status)}</span>
        </div>
        <div class="progress mb-6"><div class="progress-bar" style="width:${((currentIdx + 1) / steps.length) * 100}%"></div></div>
        <div class="order-timeline">${timelineHtml}</div>
        ${driver ? `
        <div style="background:var(--gray-50);border-radius:var(--radius-lg);padding:var(--space-5);margin-top:var(--space-6)">
          <h4 style="margin-bottom:var(--space-3)">🚚 Delivery Driver</h4>
          <div style="display:flex;align-items:center;gap:var(--space-3)">
            <span class="avatar">${driver.name.split(' ').map(w=>w[0]).join('')}</span>
            <div><div style="font-weight:600">${driver.name}</div><div class="text-sm text-muted">${driver.phone || ''} • ${driver.vehicle || ''}</div></div>
          </div>
        </div>` : ''}
        <div style="background:var(--gray-50);border-radius:var(--radius-lg);padding:var(--space-5);margin-top:var(--space-4)">
          <h4 style="margin-bottom:var(--space-3)">📦 Order Details</h4>
          ${order.items.map(i => `<div style="display:flex;justify-content:space-between;padding:var(--space-2) 0;font-size:var(--text-sm)"><span>${i.name} (${i.size}) × ${i.qty}</span><span>${formatCurrency(i.price * i.qty)}</span></div>`).join('')}
          <div style="border-top:1px solid var(--gray-200);margin-top:var(--space-3);padding-top:var(--space-3);display:flex;justify-content:space-between;font-weight:600"><span>Total</span><span>${formatCurrency(order.total)}</span></div>
        </div>
      </div>`;
    } else {
      resultHtml = `<div class="empty-state"><div class="empty-state-icon">🔍</div><h3>Order not found</h3><p>Please check your tracking number and try again</p></div>`;
    }
  }

  return `
  <div class="container">
    <div class="tracking-container">
      <div class="tracking-search">
        <h2>📦 Track Your Order</h2>
        <p>Enter your tracking number to see real-time updates</p>
        <div class="tracking-input-group">
          <input type="text" class="form-input" id="track-input" placeholder="e.g. TRK-2025-001" value="${trackId || ''}">
          <button class="btn btn-primary" id="track-btn">Track</button>
        </div>
        <p class="text-xs text-muted mt-4">Demo: try TRK-2025-001, TRK-2025-002, or TRK-2025-003</p>
      </div>
      ${resultHtml}
    </div>
  </div>`;
}

function getStepDesc(s) {
  const d = { received: 'Your order has been confirmed and is in the queue', baking: 'Our bakers are preparing your cake with love', decorating: 'Adding finishing touches and decorations', out_for_delivery: 'Your cake is on its way to you', delivered: 'Your cake has been delivered. Enjoy!' };
  return d[s] || '';
}
