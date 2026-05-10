/* ════════════════════════════════════════════════════
   H&H — Data Store (PHP + MySQL Backend + Local Menu)
   ════════════════════════════════════════════════════ */

import { getMenuItems, getMenuItem } from './menuData.js';

// Cache objects fetched from API to maintain synchronous UI methods
const memoryCache = {
  users: [],
  orders: [],
  coupons: [],
  settings: {}
};

const STORE_KEYS = {
  SESSION:   'cc_session',
  THEME:     'cc_theme',
};

// ─── LocalStorage Helpers (Cart & Session) ──────
function getLocal(key, defaultVal = null) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocal(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

/** Get user-scoped cart key */
function cartKey() {
  const session = getLocal(STORE_KEYS.SESSION);
  return session ? `cc_cart_${session.userId}` : null;
}

// ─── Public API ─────────────────────────────────
export const Store = {
  /**
   * Initializes the application store by fetching all necessary data from the PHP API.
   * Menu items are loaded from the local menuData module — no API call needed.
   * This is called once in app.js on load.
   */
  async init() {
    try {
      // 1. Settings
      const settingsRes = await fetch('api/settings.php');
      if (settingsRes.ok) memoryCache.settings = await settingsRes.json();
      
      // 2. Coupons
      const couponsRes = await fetch('api/coupons.php');
      if (couponsRes.ok) memoryCache.coupons = await couponsRes.json();

      // 3. Fetch user data based on role
      const session = this.getSession();
      if (session) {
        const userRes = await fetch(`api/users.php?id=${session.userId}`);
        if (userRes.ok) {
          const user = await userRes.json();
          this.addUserToCache(user);

          if (user.role === 'admin') {
            // Admin: fetch ALL orders and ALL users
            const allOrdersRes = await fetch('api/orders.php');
            if (allOrdersRes.ok) memoryCache.orders = await allOrdersRes.json();

            const allUsersRes = await fetch('api/users.php');
            if (allUsersRes.ok) {
              const allUsers = await allUsersRes.json();
              allUsers.forEach(u => this.addUserToCache(u));
            }
          } else {
            // Regular user: only their own orders
            const ordersRes = await fetch(`api/orders.php?user_id=${session.userId}`);
            if (ordersRes.ok) memoryCache.orders = await ordersRes.json();
          }
        } else {
          // Session invalid, clear it
          this.clearSession();
        }
      }
    } catch (error) {
       console.error("Failed to initialize store from backend API", error);
    }
  },

  // Products (menu items from local data)
  getCakes:    ()         => getMenuItems(),
  getCake:     (id)       => getMenuItem(id),
  
  // Users (Cached current user or admins)
  getUsers:       ()         => memoryCache.users,
  getUser:        (id)       => memoryCache.users.find(u => u.id === id) || null,
  addUserToCache: (user)     => {
      const idx = memoryCache.users.findIndex(u => u.id === user.id);
      if (idx !== -1) memoryCache.users[idx] = user;
      else memoryCache.users.push(user);
  },

  // Orders
  getOrders:       ()         => memoryCache.orders,
  getOrder:        (id)       => memoryCache.orders.find(o => o.id === id) || null,
  getOrderByTrack: (trackId)  => memoryCache.orders.find(o => o.trackingId === trackId) || null,
  getUserOrders:   (userId)   => memoryCache.orders.filter(o => o.userId === userId),
  addOrderToCache: (order)    => memoryCache.orders.unshift(order),
  updateOrderInCache(orderId, updates) {
    const idx = memoryCache.orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      memoryCache.orders[idx] = { ...memoryCache.orders[idx], ...updates };
    }
  },

  // Cart — scoped per-user
  getCart() {
    const key = cartKey();
    return key ? getLocal(key, []) : [];
  },
  saveCart(cart) {
    const key = cartKey();
    if (key) setLocal(key, cart);
  },

  // Coupons
  getCoupons:    ()         => memoryCache.coupons,
  getCoupon:     (code)     => memoryCache.coupons.find(c => c.code === code?.toUpperCase()) || null,
  addCouponToCache(coupon) { memoryCache.coupons.push(coupon); },
  removeCouponFromCache(couponId) { memoryCache.coupons = memoryCache.coupons.filter(c => c.id !== couponId); },
  
  // Session
  getSession: ()    => getLocal(STORE_KEYS.SESSION),
  setSession: (s)   => setLocal(STORE_KEYS.SESSION, s),
  clearSession: ()  => localStorage.removeItem(STORE_KEYS.SESSION),

  // Settings
  getSettings: () => {
    return Object.keys(memoryCache.settings).length > 0 ? memoryCache.settings : {
      platformName: 'H&H',
      currency: 'PHP',
      deliveryFee: 50,
      freeDeliveryMin: 500,
      taxRate: 0,
      loyaltyPointsPerDollar: 10,
      loyaltyPointsRedemption: 100
    };
  },
  updateSettingsCache(newSettings) {
    memoryCache.settings = { ...memoryCache.settings, ...newSettings };
  },

  // Theme
  getTheme: () => localStorage.getItem(STORE_KEYS.THEME) || 'light',
  setTheme: (t) => localStorage.setItem(STORE_KEYS.THEME, t),
};
