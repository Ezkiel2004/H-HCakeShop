/* CakeCraft — Admin Analytics Page */
import { Store } from '../store.js';
import { Orders } from '../orders.js';
import { formatCurrency } from '../utils.js';

export async function adminAnalyticsPage() {
  const analytics = Orders.getAnalytics();
  const orders = Store.getOrders();
  const customers = Store.getUsers().filter(u => u.role === 'customer');
  const avgOrder = analytics.totalOrders ? analytics.totalRevenue / analytics.totalOrders : 0;

  setTimeout(() => {
    drawRevenueChart('analytics-revenue');
    drawTopChart('analytics-top', analytics.topCakes);
  }, 100);

  return `<div>
    <div class="admin-page-header"><div><h1>Analytics</h1><p class="text-muted">Business insights and reports</p></div></div>
    <div class="admin-stats stagger">
      <div class="stat-card animate-fadeInUp"><div class="stat-card-icon" style="background:var(--primary-bg);color:var(--primary)">💰</div><div class="stat-card-value">${formatCurrency(analytics.totalRevenue)}</div><div class="stat-card-label">Total Revenue</div></div>
      <div class="stat-card animate-fadeInUp"><div class="stat-card-icon" style="background:var(--info-bg);color:var(--info)">📊</div><div class="stat-card-value">${formatCurrency(avgOrder)}</div><div class="stat-card-label">Avg Order Value</div></div>
      <div class="stat-card animate-fadeInUp"><div class="stat-card-icon" style="background:var(--success-bg);color:var(--success)">📦</div><div class="stat-card-value">${analytics.totalOrders}</div><div class="stat-card-label">Total Orders</div></div>
      <div class="stat-card animate-fadeInUp"><div class="stat-card-icon" style="background:var(--warning-bg);color:var(--warning)">👥</div><div class="stat-card-value">${customers.length}</div><div class="stat-card-label">Total Customers</div></div>
    </div>
    <div class="charts-grid">
      <div class="chart-card"><div class="chart-card-header"><h4>Revenue Trend</h4></div><canvas id="analytics-revenue" class="chart-canvas"></canvas></div>
      <div class="chart-card"><div class="chart-card-header"><h4>Top Products</h4></div><canvas id="analytics-top" class="chart-canvas"></canvas></div>
    </div>
  </div>`;
}

function drawRevenueChart(id) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth; canvas.height = 300;
  const w = canvas.width, h = canvas.height;
  
  // Compute real daily revenue from orders in the last 7 days
  const orders = Store.getOrders().filter(o => o.status !== 'cancelled');
  const dayLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dailyTotals = {};
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    dailyTotals[key] = 0;
  }
  orders.forEach(o => {
    const dateKey = (o.createdAt || '').split('T')[0];
    if (dateKey in dailyTotals) {
      dailyTotals[dateKey] += o.total || 0;
    }
  });
  const data = Object.values(dailyTotals);
  const labels = Object.keys(dailyTotals).map(d => {
    const dt = new Date(d + 'T00:00:00');
    return dayLabels[dt.getDay()];
  });
  const max = Math.max(...data, 1);
  const padL = 50, padB = 40, padT = 20;
  const drawW = w - padL - 20, drawH = h - padB - padT;
  // Grid
  ctx.strokeStyle = '#e8e4de'; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + (drawH / 4) * i;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - 20, y); ctx.stroke();
    ctx.fillStyle = '#8a8279'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'right';
    ctx.fillText('$' + Math.round(max - (max/4)*i), padL - 8, y + 4);
  }
  // Line + area
  const points = data.map((v, i) => ({ x: padL + (drawW / (data.length-1)) * i, y: padT + drawH - (v/max) * drawH }));
  ctx.beginPath();
  const grad = ctx.createLinearGradient(0, padT, 0, h - padB);
  grad.addColorStop(0, 'rgba(212,100,138,0.2)'); grad.addColorStop(1, 'rgba(212,100,138,0)');
  ctx.fillStyle = grad;
  ctx.moveTo(points[0].x, h - padB);
  points.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(points[points.length-1].x, h - padB); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.strokeStyle = '#d4648a'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
  points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.stroke();
  points.forEach(p => { ctx.beginPath(); ctx.fillStyle = '#d4648a'; ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.fillStyle = '#fff'; ctx.arc(p.x, p.y, 2, 0, Math.PI*2); ctx.fill(); });
  ctx.fillStyle = '#8a8279'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
  labels.forEach((l, i) => ctx.fillText(l, points[i].x, h - 15));
}

function drawTopChart(id, data) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth; canvas.height = 300;
  const h = canvas.height;
  const max = Math.max(...data.map(d=>d[1]), 1);
  const barH = 35, gap = 12, startY = 20;
  data.forEach(([name, val], i) => {
    const y = startY + i * (barH + gap);
    const barW = (val / max) * (canvas.width - 160);
    const grad = ctx.createLinearGradient(140, y, 140 + barW, y);
    grad.addColorStop(0, '#d4648a'); grad.addColorStop(1, '#c7956d');
    ctx.fillStyle = grad; ctx.beginPath(); ctx.roundRect(140, y, barW, barH, 4); ctx.fill();
    ctx.fillStyle = '#4a4540'; ctx.font = '13px Inter, sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(name.length > 14 ? name.substring(0,14)+'..' : name, 130, y + barH/2 + 5);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
    ctx.fillText(val + ' orders', 148, y + barH/2 + 5);
  });
}
