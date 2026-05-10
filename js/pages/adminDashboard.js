/* CakeCraft — Admin Dashboard */
import { Store } from '../store.js';
import { Orders } from '../orders.js';
import { formatCurrency, formatDateTime, timeAgo } from '../utils.js';

export async function adminDashboardPage() {
  const analytics = Orders.getAnalytics();
  const orders = Store.getOrders().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const customers = Store.getUsers().filter(u => u.role === 'customer');

  const recentRows = orders.map(o => `
    <tr>
      <td><span style="font-weight:600">${o.trackingId}</span></td>
      <td>${Store.getUser(o.userId)?.name || 'Unknown'}</td>
      <td>${o.items.map(i=>i.name).join(', ')}</td>
      <td><span class="badge ${Orders.getStatusBadge(o.status)}">${Orders.getStatusIcon(o.status)} ${Orders.getStatusLabel(o.status)}</span></td>
      <td class="font-semibold">${formatCurrency(o.total)}</td>
      <td class="text-sm text-muted">${timeAgo(o.createdAt)}</td>
    </tr>`).join('');

  // Simple bar chart data
  setTimeout(() => {
    drawMiniChart('revenue-chart', analytics.topCakes);
    drawStatusChart('status-chart', analytics.statusBreakdown);
  }, 100);

  return `
  <div>
    <div class="admin-page-header"><div><h1>Dashboard</h1><p class="text-muted">Overview of your cake business</p></div></div>
    <div class="admin-stats stagger">
      <div class="stat-card animate-fadeInUp"><div class="stat-card-icon" style="background:var(--primary-bg);color:var(--primary)">💰</div><div class="stat-card-value">${formatCurrency(analytics.totalRevenue)}</div><div class="stat-card-label">Total Revenue</div><div class="stat-card-change up">↑ 12.5%</div></div>
      <div class="stat-card animate-fadeInUp"><div class="stat-card-icon" style="background:var(--info-bg);color:var(--info)">📦</div><div class="stat-card-value">${analytics.totalOrders}</div><div class="stat-card-label">Total Orders</div><div class="stat-card-change up">↑ 8.2%</div></div>
      <div class="stat-card animate-fadeInUp"><div class="stat-card-icon" style="background:var(--success-bg);color:var(--success)">✅</div><div class="stat-card-value">${analytics.delivered}</div><div class="stat-card-label">Delivered</div></div>
      <div class="stat-card animate-fadeInUp"><div class="stat-card-icon" style="background:var(--warning-bg);color:var(--warning)">👥</div><div class="stat-card-value">${customers.length}</div><div class="stat-card-label">Customers</div></div>
    </div>

    <div class="charts-grid">
      <div class="chart-card"><div class="chart-card-header"><h4>Top Products</h4></div><canvas id="revenue-chart" class="chart-canvas"></canvas></div>
      <div class="chart-card"><div class="chart-card-header"><h4>Order Status</h4></div><canvas id="status-chart" class="chart-canvas"></canvas></div>
    </div>

    <div class="table-wrapper">
      <div style="padding:var(--space-5);display:flex;justify-content:space-between;align-items:center">
        <h4>Recent Orders</h4><a href="#/admin/orders" class="btn btn-sm btn-ghost">View All →</a>
      </div>
      <table class="data-table"><thead><tr><th>Tracking</th><th>Customer</th><th>Items</th><th>Status</th><th>Total</th><th>Time</th></tr></thead><tbody>${recentRows}</tbody></table>
    </div>
  </div>`;
}

function drawMiniChart(id, data) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth; canvas.height = 300;
  const w = canvas.width, h = canvas.height;
  const max = Math.max(...data.map(d => d[1]), 1);
  const barW = Math.min(60, (w - 80) / data.length - 10);
  const startX = 60;
  ctx.font = '12px Inter, sans-serif';
  data.forEach(([name, val], i) => {
    const barH = (val / max) * (h - 80);
    const x = startX + i * (barW + 20);
    const y = h - 40 - barH;
    const grad = ctx.createLinearGradient(x, y, x, h - 40);
    grad.addColorStop(0, '#d4648a'); grad.addColorStop(1, '#c7956d');
    ctx.fillStyle = grad; ctx.beginPath(); ctx.roundRect(x, y, barW, barH, 4); ctx.fill();
    ctx.fillStyle = '#8a8279'; ctx.textAlign = 'center';
    ctx.fillText(name.length > 10 ? name.substring(0, 10) + '..' : name, x + barW / 2, h - 20);
    ctx.fillText(val, x + barW / 2, y - 8);
  });
}

function drawStatusChart(id, data) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth; canvas.height = 300;
  const w = canvas.width, h = canvas.height;
  const total = Object.values(data).reduce((s, v) => s + v, 0) || 1;
  const colors = { received: '#5b8fd9', baking: '#e5a84b', decorating: '#c7956d', out_for_delivery: '#d4648a', delivered: '#4caf7d', cancelled: '#e05a5a' };
  const labels = { received: 'Received', baking: 'Baking', decorating: 'Decorating', out_for_delivery: 'Delivery', delivered: 'Delivered', cancelled: 'Cancelled' };
  let angle = -Math.PI / 2;
  const cx = w / 2, cy = h / 2 - 10, r = Math.min(w, h) / 2 - 50;
  Object.entries(data).forEach(([key, val]) => {
    const slice = (val / total) * Math.PI * 2;
    ctx.fillStyle = colors[key] || '#888';
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, angle, angle + slice); ctx.closePath(); ctx.fill();
    const mid = angle + slice / 2;
    const tx = cx + (r + 25) * Math.cos(mid), ty = cy + (r + 25) * Math.sin(mid);
    ctx.fillStyle = '#6b6560'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`${labels[key] || key} (${val})`, tx, ty);
    angle += slice;
  });
  // Center hole for doughnut
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--white').trim() || '#fff';
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2d2926'; ctx.font = 'bold 24px Playfair Display, serif'; ctx.textAlign = 'center';
  ctx.fillText(total, cx, cy + 4);
  ctx.fillStyle = '#8a8279'; ctx.font = '12px Inter, sans-serif';
  ctx.fillText('Orders', cx, cy + 22);
}
