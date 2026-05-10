/* ════════════════════════════════════════════════════
   CakeCraft — Authentication System
   ════════════════════════════════════════════════════ */

import { Store } from './store.js';
import { eventBus } from './utils.js';

export const Auth = {
  /** Get current logged-in user (now just reads from Store cache) */
  currentUser() {
    const session = Store.getSession();
    if (!session) return null;
    return Store.getUser(session.userId);
  },

  /** Check if logged in */
  isLoggedIn() {
    return !!this.currentUser();
  },

  /** Get current user's role */
  getRole() {
    const user = this.currentUser();
    return user ? user.role : null;
  },

  /** Login via PHP API */
  async login(email, password) {
    try {
      const res = await fetch('api/users.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      
      // Update local store cache with the logged-in user
      Store.addUserToCache(data);
      Store.setSession({ userId: data.id, loginAt: new Date().toISOString() });
      eventBus.emit('auth:login', data);
      return { success: true, user: data };
      
    } catch (e) {
      console.error(e);
      return { success: false, error: 'Network error connecting to backend.' };
    }
  },

  /** Register via PHP API */
  async register({ name, email, password }) {
    try {
      const res = await fetch('api/users.php?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      
      Store.addUserToCache(data);
      Store.setSession({ userId: data.id, loginAt: new Date().toISOString() });
      eventBus.emit('auth:register', data);
      return { success: true, user: data };
      
    } catch (e) {
      console.error(e);
      return { success: false, error: 'Network error connecting to backend.' };
    }
  },

  /** Logout */
  logout() {
    Store.clearSession();
    eventBus.emit('auth:logout');
  },

  /** Auth guard for router — returns true if authorized */
  guard(requiredRole) {
    if (!this.isLoggedIn()) return false;
    if (!requiredRole) return true;
    const role = this.getRole();
    if (requiredRole === 'admin' && role !== 'admin') return false;
    if (requiredRole === 'driver' && role !== 'driver' && role !== 'admin') return false;
    return true;
  },

  /** Validate email format */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /** Validate password strength */
  validatePassword(password) {
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  }
};
