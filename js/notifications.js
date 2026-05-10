/* ════════════════════════════════════════════════════
   CakeCraft — Toast Notification System
   ════════════════════════════════════════════════════ */

let container = null;

function ensureContainer() {
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Show a toast notification
 * @param {Object} opts
 * @param {string} opts.title
 * @param {string} opts.message
 * @param {'success'|'error'|'warning'|'info'} opts.type
 * @param {number} opts.duration — ms, default 4000
 */
export function showToast({ title, message, type = 'info', duration = 4000 }) {
  const c = ensureContainer();

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
    <span class="toast-close" onclick="this.closest('.toast').remove()">✕</span>
  `;

  c.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => toast.classList.add('show'));

  // Auto dismiss
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
