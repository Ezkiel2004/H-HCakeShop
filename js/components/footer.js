import { Auth } from '../auth.js';

export function renderFooter() {
  const user = Auth.currentUser();
  return `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="footer-brand">🍽️ <span>H&H</span></div>
          <p class="footer-desc">Fresh food, custom cakes, and party packages — all made with love and delivered to your door.</p>
          <div class="footer-social">
            <a href="#" title="Facebook">📘</a>
            <a href="#" title="Instagram">📷</a>
            <a href="#" title="Twitter">🐦</a>
          </div>
        </div>
        <div>
          <h4 class="footer-heading">Quick Links</h4>
          <a href="#/catalog" class="footer-link">Our Menu</a>
          ${user ? `<a href="#/tracking" class="footer-link">Track Order</a>` : ''}
          <a href="#/" class="footer-link">About Us</a>
          <a href="#/" class="footer-link">Contact</a>
        </div>
        <div>
          <h4 class="footer-heading">Categories</h4>
          <a href="#/catalog" class="footer-link">Combo Meals</a>
          <a href="#/catalog" class="footer-link">Burgers</a>
          <a href="#/catalog" class="footer-link">Packages</a>
          <a href="#/catalog" class="footer-link">Custom Cakes</a>
        </div>
        <div>
          <h4 class="footer-heading">Support</h4>
          <a href="#/" class="footer-link">FAQ</a>
          <a href="#/" class="footer-link">Delivery Policy</a>
          <a href="#/" class="footer-link">Returns</a>
          <a href="#/" class="footer-link">Privacy Policy</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2025 H&H. All rights reserved.</span>
        <span>Made with 🤍 for food lovers</span>
      </div>
    </div>
  </footer>`;
}
