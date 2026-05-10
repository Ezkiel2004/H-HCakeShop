/* ════════════════════════════════════════════════════
   CakeCraft — Order Processing
   ════════════════════════════════════════════════════ */

import { Store } from './store.js';
import { generateId, eventBus } from './utils.js';

const STATUS_ORDER = ['received', 'baking', 'decorating', 'out_for_delivery', 'delivered'];

export const Orders = {
  STATUS_ORDER,

  /** Create a new order from cart */
  async createOrder({ items, delivery, couponCode, paymentMethod, totals }) {
    const session = Store.getSession();
    if (!session) return { success: false, error: 'Please log in to place an order.' };

    const payload = {
      userId: session.userId,
      items,
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      tax: totals.tax,
      discount: totals.discount,
      total: totals.total,
      delivery,
      couponCode: couponCode || null,
      paymentMethod,
    };

    try {
      const response = await fetch('api/orders.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.success) {
        const order = {
          id: result.id,
          trackingId: result.trackingId,
          ...payload,
          status: 'received',
          createdAt: new Date().toISOString(),
          statusHistory: [{ status: 'received', time: new Date().toISOString() }]
        };

        if (Store.addOrderToCache) {
          Store.addOrderToCache(order);
        }

        eventBus.emit('order:created', order);
        return { success: true, order };
      } else {
        return { success: false, error: result.error || 'Failed to create order.' };
      }
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, error: 'Network error occurred while placing your order.' };
    }
  },

  /** Update order status (admin) */
  async updateStatus(orderId, newStatus) {
    try {
      const res = await fetch('api/orders.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus })
      });
      const result = await res.json();
      if (result.success) {
        const order = Store.getOrder(orderId);
        if (order) {
          const history = order.statusHistory || [];
          history.push({ status: newStatus, time: new Date().toISOString() });
          Store.updateOrderInCache(orderId, { status: newStatus, statusHistory: history });
        }
        eventBus.emit('order:status_updated', { orderId, status: newStatus });
        return { success: true };
      }
      return { success: false, error: result.error || 'Failed to update status.' };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: 'Network error updating order status.' };
    }
  },

  /** Assign driver to order */
  async assignDriver(orderId, driverId) {
    try {
      const res = await fetch('api/orders.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, driverId })
      });
      const result = await res.json();
      if (result.success) {
        Store.updateOrderInCache(orderId, { driverId: driverId || null });
        eventBus.emit('order:driver_assigned', { orderId, driverId });
        return { success: true };
      }
      return { success: false, error: result.error || 'Failed to assign driver.' };
    } catch (error) {
      console.error('Error assigning driver:', error);
      return { success: false, error: 'Network error assigning driver.' };
    }
  },

  /** Get status label */
  getStatusLabel(status) {
    const labels = {
      received: 'Order Received',
      baking: 'Baking',
      decorating: 'Decorating',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  },

  /** Get status badge class */
  getStatusBadge(status) {
    const badges = {
      received: 'badge-info',
      baking: 'badge-warning',
      decorating: 'badge-primary',
      out_for_delivery: 'badge-primary',
      delivered: 'badge-success',
      cancelled: 'badge-danger',
    };
    return badges[status] || 'badge-neutral';
  },

  /** Get status icon */
  getStatusIcon(status) {
    const icons = {
      received: '📋',
      baking: '🔥',
      decorating: '🎨',
      out_for_delivery: '🚚',
      delivered: '✅',
      cancelled: '❌',
    };
    return icons[status] || '📦';
  },

  /** Get analytics data */
  getAnalytics() {
    const orders = Store.getOrders();
    const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
    const totalOrders = orders.length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const pending = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;

    // Top cakes
    const cakeCounts = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        cakeCounts[item.name] = (cakeCounts[item.name] || 0) + item.qty;
      });
    });
    const topCakes = Object.entries(cakeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Status breakdown
    const statusBreakdown = {};
    orders.forEach(o => {
      statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1;
    });

    return { totalRevenue, totalOrders, delivered, pending, topCakes, statusBreakdown };
  },
};
