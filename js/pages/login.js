/* CakeCraft — Login Page */
import { Auth } from '../auth.js';
import { Store } from '../store.js';
import { showToast } from '../notifications.js';
import { Router } from '../router.js';

export async function loginPage() {
  if (Auth.isLoggedIn()) { Router.navigate('/dashboard'); return ''; }

  setTimeout(() => {
    const form = document.getElementById('login-form');
    if (!form) return;
    form.onsubmit = async (e) => {
      e.preventDefault();
      const email = form.email.value.trim();
      const password = form.password.value;
      const err = document.getElementById('login-error');
      const submitBtn = form.querySelector('button[type="submit"]');

      // Client-side validation
      err.style.display = 'none';
      if (!email) { err.textContent = 'Please enter your email.'; err.style.display = 'block'; return; }
      if (!password) { err.textContent = 'Please enter your password.'; err.style.display = 'block'; return; }

      // Loading state
      submitBtn.textContent = 'Signing in...';
      submitBtn.disabled = true;

      const result = await Auth.login(email, password);
      if (result.success) {
        // Set destination hash and reload for a clean app restart with new session
        const dest = result.user.role === 'admin' ? '#/admin' : '#/dashboard';
        window.location.hash = dest;
        window.location.reload();
      } else {
        err.textContent = result.error; err.style.display = 'block';
        submitBtn.textContent = 'Sign In';
        submitBtn.disabled = false;
      }
    };
  }, 50);

  return `
  <div class="auth-page">
    <div class="auth-card animate-scaleIn">
      <div class="auth-header">
        <div style="font-size:2.5rem;margin-bottom:var(--space-4)">🎂</div>
        <h2>Welcome Back</h2>
        <p>Sign in to your H&H account</p>
      </div>
      <div id="login-error" class="form-error" style="display:none;text-align:center;margin-bottom:var(--space-4);padding:var(--space-3);background:var(--danger-bg);border-radius:var(--radius-md)"></div>
      <form id="login-form">
        <div class="form-group"><label class="form-label">Email</label><input class="form-input" type="email" name="email" required placeholder="you@example.com"></div>
        <div class="form-group"><label class="form-label">Password</label><input class="form-input" type="password" name="password" required placeholder="Enter password"></div>
        <button type="submit" class="btn btn-lg btn-primary btn-full">Sign In</button>
      </form>
      <div class="auth-footer">Don't have an account? <a href="#/register">Sign Up</a></div>
      <div style="margin-top:var(--space-4);padding:var(--space-4);background:var(--gray-50);border-radius:var(--radius-lg);font-size:var(--text-xs);color:var(--gray-500)">
        <strong>Demo accounts:</strong><br>
        Admin: admin@cakecraft.com / admin123<br>
        Customer: sarah@example.com / sarah123
      </div>
    </div>
  </div>`;
}
