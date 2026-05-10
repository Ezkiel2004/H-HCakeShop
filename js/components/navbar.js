/* H&H — Navbar Component */
import { Auth } from '../auth.js';
import { Cart } from '../cart.js';
import { Store } from '../store.js';
import { getInitials } from '../utils.js';

export function renderNavbar(isAdmin = false) {
  const user = Auth.currentUser();
  const cartCount = Cart.getCount();
  const theme = Store.getTheme();

  const links = isAdmin ? '' : `
    <nav class="navbar-links hide-mobile">
      <a href="#/" class="navbar-link">Home</a>
      <a href="#/catalog" class="navbar-link">Menu</a>
      ${user ? `<a href="#/tracking" class="navbar-link">Track Order</a>` : ''}
      ${user ? `<a href="#/dashboard" class="navbar-link">My Orders</a>` : ''}
    </nav>`;

  const userSection = user ? `
    <div class="dropdown">
      <button class="navbar-user-btn" id="navbar-user-btn">
        <span class="avatar avatar-sm">${getInitials(user.name)}</span>
        <span class="hide-mobile" style="font-size:var(--text-sm)">${user.name.split(' ')[0]}</span>
      </button>
      <div class="dropdown-menu" id="navbar-user-menu">
        <div style="padding:var(--space-3) var(--space-4)">
          <div style="font-weight:600;font-size:var(--text-sm)">${user.name}</div>
          <div style="font-size:var(--text-xs);color:var(--gray-400)">${user.email}</div>
        </div>
        <div class="dropdown-divider"></div>
        ${user.role === 'admin' ? '<a href="#/admin" class="dropdown-item">📊 Admin Panel</a>' : ''}
        <a href="#/dashboard" class="dropdown-item">👤 My Dashboard</a>
        <a href="#/tracking" class="dropdown-item">📦 Track Order</a>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item" data-action="logout">🚪 Logout</a>
      </div>
    </div>` : `
    <a href="#/login" class="btn btn-sm btn-secondary">Log In</a>
    <a href="#/register" class="btn btn-sm btn-primary">Sign Up</a>`;

  return `
  <header class="navbar">
    <div class="navbar-inner">
      <a href="#/" class="navbar-brand">
        <span class="navbar-logo">🍽️</span>
        <span>H&H</span>
      </a>
      ${links}
      <div class="navbar-actions">
        <button class="theme-toggle" title="Toggle theme">${theme === 'dark' ? '☀️' : '🌙'}</button>
        ${!isAdmin ? `<a href="#/cart" class="navbar-cart">🛒<span class="cart-count" id="cart-count">${cartCount || ''}</span></a>` : ''}
        ${userSection}
      </div>
    </div>
  </header>`;
}
