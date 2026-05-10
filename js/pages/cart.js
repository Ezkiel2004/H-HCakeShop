/* H&H — Cart Page */
import { Cart } from '../cart.js';
import { Store } from '../store.js';
import { formatCurrency, sanitize } from '../utils.js';
import { showToast } from '../notifications.js';
import { getCategoryIcon } from '../menuData.js';

export async function cartPage() {
  const items = Cart.getItems();
  if (!items.length) {
    return `<div class="container"><div class="empty-state" style="padding:var(--space-20)"><div class="empty-state-icon">🛒</div><h3>Your cart is empty</h3><p>Browse our menu and add some delicious items!</p><a href="#/catalog" class="btn btn-primary">Browse Menu</a></div></div>`;
  }

  const reRender = async () => {
    const main = document.querySelector('.app-main');
    if (main) main.innerHTML = await cartPage();
    else location.hash = '/cart'; // fallback
  };

  setTimeout(() => {
    document.querySelectorAll('[data-cart-remove]').forEach(btn => {
      btn.onclick = async () => { 
        Cart.removeItem(btn.dataset.cartRemove); 
        await reRender();
        showToast({title:'Removed',type:'info'}); 
      };
    });
    document.querySelectorAll('[data-cart-plus]').forEach(btn => {
      btn.onclick = async () => { 
        const item = Cart.getItems().find(i=>i.id===btn.dataset.cartPlus); 
        if(item) { Cart.updateQty(item.id, item.qty+1); await reRender(); }
      };
    });
    document.querySelectorAll('[data-cart-minus]').forEach(btn => {
      btn.onclick = async () => { 
        const item = Cart.getItems().find(i=>i.id===btn.dataset.cartMinus); 
        if(item && item.qty>1) { Cart.updateQty(item.id, item.qty-1); await reRender(); }
      };
    });
    const couponBtn = document.getElementById('apply-coupon');
    if (couponBtn) {
      couponBtn.onclick = () => {
        const code = document.getElementById('coupon-code')?.value;
        if (code) { location.hash = '/cart?coupon=' + code; }
      };
    }
  }, 50);

  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  const couponCode = urlParams.get('coupon') || null;
  const totals = Cart.calculateTotals(couponCode);

  const itemsHtml = items.map(item => {
    // Try to get the product image from menu data
    const menuItem = Store.getCake(item.productId);
    const imgSrc = menuItem && menuItem.image ? menuItem.image : null;
    const icon = getCategoryIcon(item.category || '');

    const imgHtml = imgSrc
      ? `<img src="${imgSrc}" alt="${sanitize(item.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-lg)">`
      : `<span style="font-size:2.5rem">${icon}</span>`;

    // Build details string
    const details = [];
    if (item.variant) details.push(item.variant);
    if (item.selectedAddons && item.selectedAddons.length) details.push('Add-ons: ' + item.selectedAddons.join(', '));
    if (item.selectedUpgrades && item.selectedUpgrades.length) details.push(item.selectedUpgrades.join(', '));
    if (item.customSelections && item.customSelections.flavor) {
      details.push(`${item.customSelections.flavor} • ${item.customSelections.shape}`);
      if (item.customSelections.toppings && item.customSelections.toppings.length) details.push('Toppings: ' + item.customSelections.toppings.join(', '));
    }
    if (item.message) details.push(`"${sanitize(item.message)}"`);
    const detailStr = details.join(' • ');

    return `
    <div class="cart-item animate-fadeInUp">
      <div class="cart-item-image" style="background:linear-gradient(135deg,#e8b4c8,#d090a8);display:flex;align-items:center;justify-content:center;border-radius:var(--radius-lg);overflow:hidden">${imgHtml}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${sanitize(item.name)}</div>
        <div class="cart-item-details">${detailStr}</div>
        <div class="cart-item-actions">
          <div class="qty-controls">
            <button class="qty-btn" data-cart-minus="${item.id}">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" data-cart-plus="${item.id}">+</button>
          </div>
          <span class="price price-sm">${formatCurrency(item.price * item.qty)}</span>
        </div>
        <button class="cart-item-remove mt-2" data-cart-remove="${item.id}" style="color: var(--danger); background: transparent; border: none; cursor: pointer; display: flex; align-items: center; gap: 4px; padding: 4px 0;">
          <span style="font-size: 1.1rem">🗑️</span> Remove
        </button>
      </div>
    </div>`;
  }).join('');

  return `
  <div class="container">
    <div class="page-header"><h1>Shopping Cart</h1><p>${items.length} item(s) in your cart</p></div>
    <div class="cart-layout">
      <div class="cart-items">${itemsHtml}</div>
      <div class="cart-summary">
        <h3>Order Summary</h3>
        <div class="coupon-input">
          <input type="text" class="form-input" id="coupon-code" placeholder="Coupon code" value="${couponCode || ''}">
          <button class="btn btn-sm btn-secondary" id="apply-coupon">Apply</button>
        </div>
        ${totals.couponApplied ? `<div class="badge badge-success mb-4">✓ ${totals.couponApplied.code} applied</div>` : ''}
        <div class="cart-summary-row"><span>Subtotal</span><span>${formatCurrency(totals.subtotal)}</span></div>
        ${totals.discount > 0 ? `<div class="cart-summary-row" style="color:var(--success)"><span>Discount</span><span>-${formatCurrency(totals.discount)}</span></div>` : ''}
        <div class="cart-summary-row"><span>Delivery</span><span>${totals.deliveryFee ? formatCurrency(totals.deliveryFee) : 'Free'}</span></div>
        ${totals.tax > 0 ? `<div class="cart-summary-row"><span>Tax</span><span>${formatCurrency(totals.tax)}</span></div>` : ''}
        <div class="cart-summary-row cart-summary-total"><span>Total</span><span>${formatCurrency(totals.total)}</span></div>
        <a href="#/checkout${couponCode ? '?coupon='+couponCode : ''}" class="btn btn-lg btn-primary btn-full mt-6">Proceed to Checkout</a>
        <a href="#/catalog" class="btn btn-lg btn-ghost btn-full mt-2">Continue Shopping</a>
      </div>
    </div>
  </div>`;
}
