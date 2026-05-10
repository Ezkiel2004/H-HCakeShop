/* ════════════════════════════════════════════════════
   H&H — Cart System
   ════════════════════════════════════════════════════ */

import { Store } from './store.js';
import { eventBus } from './utils.js';

export const Cart = {
  /** Get all cart items */
  getItems() {
    return Store.getCart();
  },

  /** Get total item count */
  getCount() {
    return this.getItems().reduce((sum, item) => sum + item.qty, 0);
  },

  /** Add item to cart */
  addItem(item) {
    const cart = this.getItems();
    // Check if same product + same options already in cart
    const existingIdx = cart.findIndex(c =>
      c.productId === item.productId &&
      c.variant === item.variant &&
      JSON.stringify(c.selectedAddons || []) === JSON.stringify(item.selectedAddons || []) &&
      JSON.stringify(c.selectedUpgrades || []) === JSON.stringify(item.selectedUpgrades || []) &&
      JSON.stringify(c.customSelections || {}) === JSON.stringify(item.customSelections || {})
    );

    if (existingIdx > -1) {
      cart[existingIdx].qty += item.qty || 1;
    } else {
      cart.push({
        id: 'ci_' + Date.now(),
        productId: item.productId,
        name: item.name,
        category: item.category || '',
        variant: item.variant || '',
        selectedAddons: item.selectedAddons || [],
        selectedUpgrades: item.selectedUpgrades || [],
        customSelections: item.customSelections || {},
        message: item.message || '',
        price: item.price,
        qty: item.qty || 1,
      });
    }

    Store.saveCart(cart);
    eventBus.emit('cart:updated', cart);
    return cart;
  },

  /** Update item quantity */
  updateQty(itemId, qty) {
    const cart = this.getItems();
    const item = cart.find(c => c.id === itemId);
    if (item) {
      item.qty = Math.max(1, qty);
      Store.saveCart(cart);
      eventBus.emit('cart:updated', cart);
    }
    return cart;
  },

  /** Remove item */
  removeItem(itemId) {
    const cart = this.getItems().filter(c => c.id !== itemId);
    Store.saveCart(cart);
    eventBus.emit('cart:updated', cart);
    return cart;
  },

  /** Clear cart */
  clear() {
    Store.saveCart([]);
    eventBus.emit('cart:updated', []);
  },

  /** Calculate subtotal */
  getSubtotal() {
    return this.getItems().reduce((sum, item) => sum + (item.price * item.qty), 0);
  },

  /** Apply coupon and calculate totals */
  calculateTotals(couponCode = null) {
    const settings = Store.getSettings();
    const subtotal = this.getSubtotal();
    let discount = 0;
    let deliveryFee = settings.deliveryFee;
    let couponApplied = null;

    if (subtotal >= settings.freeDeliveryMin) {
      deliveryFee = 0;
    }

    if (couponCode) {
      const coupon = Store.getCoupon(couponCode);
      if (coupon && coupon.active && coupon.used < coupon.maxUses) {
        if (subtotal >= coupon.minOrder) {
          couponApplied = coupon;
          if (coupon.type === 'percentage') {
            discount = subtotal * (coupon.value / 100);
          } else if (coupon.type === 'fixed') {
            discount = coupon.value;
          } else if (coupon.type === 'free_delivery') {
            deliveryFee = 0;
          }
        }
      }
    }

    const taxable = subtotal - discount;
    const tax = taxable * settings.taxRate;
    const total = taxable + tax + deliveryFee;

    return { subtotal, discount, deliveryFee, tax, total, couponApplied };
  },
};
