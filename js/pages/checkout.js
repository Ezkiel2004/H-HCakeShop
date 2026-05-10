/* CakeCraft — Checkout Page */
import { Cart } from '../cart.js';
import { Auth } from '../auth.js';
import { Orders } from '../orders.js';
import { formatCurrency } from '../utils.js';
import { showToast } from '../notifications.js';
import { Router } from '../router.js';

export async function checkoutPage() {
  const user = Auth.currentUser();
  if (!user) { Router.navigate('/login'); return ''; }
  const items = Cart.getItems();
  if (!items.length) { Router.navigate('/cart'); return ''; }

  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  const couponCode = urlParams.get('coupon') || null;
  const totals = Cart.calculateTotals(couponCode);

  setTimeout(() => {
    const form = document.getElementById('checkout-form');
    if (!form) return;
      form.onsubmit = async (e) => {
        e.preventDefault();
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Processing...';
        submitBtn.disabled = true;

        const fd = new FormData(form);
        const delivery = { name: fd.get('name'), phone: fd.get('phone'), address: fd.get('address'), date: fd.get('date'), time: fd.get('time') };
        
        try {
          const result = await Orders.createOrder({ items, delivery, couponCode, paymentMethod: fd.get('payment'), totals });

      if (result.success) {
        Cart.clear();
        showToast({ title: 'Order Placed!', message: `Tracking: ${result.order.trackingId}`, type: 'success', duration: 6000 });
        const app = document.getElementById('app');
        app.innerHTML = `
          ${document.querySelector('.navbar')?.outerHTML || ''}
          <main class="app-main"><div class="container"><div class="confirmation-page">
            <div class="confirmation-icon">✓</div>
            <h2>Order Confirmed!</h2>
            <p class="text-muted mb-4">Your order has been placed successfully</p>
            <div style="background:var(--white);border-radius:var(--radius-xl);padding:var(--space-6);display:inline-block;border:1px solid var(--gray-100);margin-bottom:var(--space-6)">
              <p class="text-sm text-muted">Tracking Number</p>
              <p style="font-size:var(--text-2xl);font-weight:700;color:var(--primary)">${result.order.trackingId}</p>
            </div>
            <div><p class="text-sm text-muted mb-4">Total: <strong>${formatCurrency(result.order.total)}</strong></p></div>
            <div style="display:flex;gap:var(--space-4);justify-content:center">
              <a href="#/tracking/${result.order.trackingId}" class="btn btn-primary">Track Order</a>
              <a href="#/catalog" class="btn btn-secondary">Continue Shopping</a>
            </div>
          </div></div></main>`;
        } else {
          showToast({ title: 'Error', message: result.error, type: 'error' });
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }
      } catch (err) {
        showToast({ title: 'Error', message: 'Network error placing order', type: 'error' });
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    };
  }, 50);

  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  return `
  <div class="container">
    <div class="page-header"><h1>Checkout</h1></div>
    <form id="checkout-form">
    <div class="checkout-layout">
      <div>
        <div class="checkout-section">
          <h3>📍 Delivery Details</h3>
          <div class="grid-2 gap-4">
            <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" name="name" required value="${user.name}"></div>
            <div class="form-group"><label class="form-label">Phone</label><input class="form-input" name="phone" required value="${user.phone || ''}"></div>
          </div>
          <div class="form-group"><label class="form-label">Delivery Address</label><input class="form-input" name="address" required value="${user.address || ''}" placeholder="Enter your full address"></div>
          <div class="grid-2 gap-4">
            <div class="form-group"><label class="form-label">Delivery Date</label><input class="form-input" type="date" name="date" required min="${tomorrow}"></div>
            <div class="form-group"><label class="form-label">Time Slot</label>
              <select class="form-select" name="time" required>
                <option value="10:00-12:00">10:00 AM - 12:00 PM</option>
                <option value="12:00-14:00">12:00 PM - 2:00 PM</option>
                <option value="14:00-16:00">2:00 PM - 4:00 PM</option>
                <option value="16:00-18:00">4:00 PM - 6:00 PM</option>
              </select>
            </div>
          </div>
        </div>
        <div class="checkout-section">
          <h3>💳 Payment Method</h3>
          <label class="filter-option"><input type="radio" name="payment" value="credit_card" checked> Credit / Debit Card</label>
          <label class="filter-option"><input type="radio" name="payment" value="paypal"> PayPal</label>
          <label class="filter-option"><input type="radio" name="payment" value="cod"> Cash on Delivery</label>
          <p class="form-hint mt-4">Payment is simulated for demo purposes</p>
        </div>
      </div>
      <div class="cart-summary">
        <h3>Order Summary</h3>
        ${items.map(i => `<div class="cart-summary-row"><span>${i.name} × ${i.qty}</span><span>${formatCurrency(i.price * i.qty)}</span></div>`).join('')}
        <div class="cart-summary-row" style="border-top:1px solid var(--gray-100);margin-top:var(--space-3);padding-top:var(--space-3)"><span>Subtotal</span><span>${formatCurrency(totals.subtotal)}</span></div>
        ${totals.discount > 0 ? `<div class="cart-summary-row" style="color:var(--success)"><span>Discount</span><span>-${formatCurrency(totals.discount)}</span></div>` : ''}
        <div class="cart-summary-row"><span>Delivery</span><span>${totals.deliveryFee ? formatCurrency(totals.deliveryFee) : 'Free'}</span></div>
        <div class="cart-summary-row"><span>Tax</span><span>${formatCurrency(totals.tax)}</span></div>
        <div class="cart-summary-row cart-summary-total"><span>Total</span><span>${formatCurrency(totals.total)}</span></div>
        <button type="submit" class="btn btn-lg btn-primary btn-full mt-6">Place Order — ${formatCurrency(totals.total)}</button>
      </div>
    </div>
    </form>
  </div>`;
}
