/* CakeCraft — Admin Sidebar Component */
export function renderSidebar() {
  const hash = window.location.hash.slice(1) || '/admin';
  const link = (path, icon, label, badge) => {
    const active = hash === path ? 'active' : '';
    return `<a href="#${path}" class="sidebar-link ${active}">
      <span class="sidebar-link-icon">${icon}</span>${label}
      ${badge ? `<span class="sidebar-link-badge">${badge}</span>` : ''}
    </a>`;
  };
  return `
  <aside class="admin-sidebar" id="admin-sidebar">
    <div class="sidebar-section">
      <div class="sidebar-section-label">Main</div>
      ${link('/admin', '📊', 'Dashboard')}
      ${link('/admin/orders', '📋', 'Orders', '3')}
      ${link('/admin/products', '🎂', 'Products')}
    </div>
    <div class="sidebar-section">
      <div class="sidebar-section-label">Management</div>
      ${link('/admin/customers', '👥', 'Customers')}
      ${link('/admin/logistics', '🚚', 'Logistics')}
      ${link('/admin/analytics', '📈', 'Analytics')}
    </div>
    <div class="sidebar-section">
      <div class="sidebar-section-label">System</div>
      ${link('/admin/settings', '⚙️', 'Settings')}
    </div>
  </aside>`;
}
