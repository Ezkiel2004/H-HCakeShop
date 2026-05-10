/* ════════════════════════════════════════════════════
   H&H — Main Application Entry Point
   ════════════════════════════════════════════════════ */

import { Store } from './store.js';
import { Router } from './router.js';
import { Auth } from './auth.js';
import { Cart } from './cart.js';
import { eventBus } from './utils.js';
import { renderNavbar } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { renderSidebar } from './components/sidebar.js';

// Page imports
import { landingPage } from './pages/landing.js';
import { catalogPage } from './pages/catalog.js';
import { itemDetailPage } from './pages/cakeDetail.js';
import { cartPage } from './pages/cart.js';
import { checkoutPage } from './pages/checkout.js';
import { orderTrackingPage } from './pages/orderTracking.js';
import { userDashboardPage } from './pages/userDashboard.js';
import { loginPage } from './pages/login.js';
import { registerPage } from './pages/register.js';
import { adminDashboardPage } from './pages/adminDashboard.js';
import { adminProductsPage } from './pages/adminProducts.js';
import { adminOrdersPage } from './pages/adminOrders.js';
import { adminCustomersPage } from './pages/adminCustomers.js';
import { adminLogisticsPage } from './pages/adminLogistics.js';
import { adminAnalyticsPage } from './pages/adminAnalytics.js';
import { adminSettingsPage } from './pages/adminSettings.js';

// Wrap page in customer layout (navbar + footer)
function customerLayout(pageFn) {
  return async (params) => {
    const content = await pageFn(params);
    return renderNavbar() + `<main class="app-main">${content}</main>` + renderFooter();
  };
}

// Wrap page in admin layout (navbar + sidebar + content)
function adminLayout(pageFn) {
  return async (params) => {
    const content = await pageFn(params);
    return renderNavbar(true) + `<div class="admin-layout">${renderSidebar()}<div class="admin-content">${content}</div></div>`;
  };
}

// Register routes
Router.register('/', customerLayout(landingPage), { title: 'Home' });
Router.register('/catalog', customerLayout(catalogPage), { title: 'Menu' });
Router.register('/item/:id', customerLayout(itemDetailPage), { title: 'Item Details' });
Router.register('/cart', customerLayout(cartPage), { title: 'Cart' });
Router.register('/checkout', customerLayout(checkoutPage), { auth: true, title: 'Checkout' });
Router.register('/tracking', customerLayout(orderTrackingPage), { title: 'Track Order' });
Router.register('/tracking/:id', customerLayout(orderTrackingPage), { title: 'Track Order' });
Router.register('/dashboard', customerLayout(userDashboardPage), { auth: true, title: 'Dashboard' });
Router.register('/login', customerLayout(loginPage), { title: 'Login' });
Router.register('/register', customerLayout(registerPage), { title: 'Register' });

// Admin routes  
Router.register('/admin', adminLayout(adminDashboardPage), { auth: true, role: 'admin', title: 'Admin Dashboard' });
Router.register('/admin/products', adminLayout(adminProductsPage), { auth: true, role: 'admin', title: 'Products' });
Router.register('/admin/orders', adminLayout(adminOrdersPage), { auth: true, role: 'admin', title: 'Orders' });
Router.register('/admin/customers', adminLayout(adminCustomersPage), { auth: true, role: 'admin', title: 'Customers' });
Router.register('/admin/logistics', adminLayout(adminLogisticsPage), { auth: true, role: 'admin', title: 'Logistics' });
Router.register('/admin/analytics', adminLayout(adminAnalyticsPage), { auth: true, role: 'admin', title: 'Analytics' });
Router.register('/admin/settings', adminLayout(adminSettingsPage), { auth: true, role: 'admin', title: 'Settings' });

// Auth guard
function authCheck(requiredRole) {
  return Auth.guard(requiredRole);
}

// Initialize store from PHP API then start routing
async function startApp() {
  await Store.init();
  
  // Apply saved theme
  const savedTheme = Store.getTheme();
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Start router
  Router.start(authCheck);
}

startApp();
// Post-render event hooks
window.addEventListener('route-rendered', () => {
  bindGlobalEvents();
});

function bindGlobalEvents() {
  // Theme toggle
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.onclick = () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      Store.setTheme(next);
      btn.textContent = next === 'dark' ? '☀️' : '🌙';
    };
  });

  // User dropdown
  const userBtn = document.getElementById('navbar-user-btn');
  const userMenu = document.getElementById('navbar-user-menu');
  if (userBtn && userMenu) {
    userBtn.onclick = (e) => {
      e.stopPropagation();
      userMenu.classList.toggle('show');
    };
    document.addEventListener('click', () => userMenu.classList.remove('show'), { once: true });
  }

  // Logout
  document.querySelectorAll('[data-action="logout"]').forEach(el => {
    el.onclick = (e) => {
      e.preventDefault();
      Auth.logout();
      window.location.hash = '#/';
      window.location.reload();
    };
  });
}

// Listen for cart updates to refresh badge
eventBus.on('cart:updated', () => {
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = Cart.getCount() || '';
});
