/* CakeCraft — Register Page */
import { Auth } from '../auth.js';
import { Store } from '../store.js';
import { showToast } from '../notifications.js';
import { Router } from '../router.js';

export async function registerPage() {
  if (Auth.isLoggedIn()) { Router.navigate('/dashboard'); return ''; }

  setTimeout(() => {
    const form = document.getElementById('register-form');
    if (!form) return;
    form.onsubmit = async (e) => {
      e.preventDefault();
      const name = form.fullname.value.trim();
      const email = form.email.value.trim();
      const password = form.password.value;
      const confirm = form.confirm.value;
      const err = document.getElementById('register-error');
      const submitBtn = form.querySelector('button[type="submit"]');

      // Client-side validation
      err.style.display = 'none';
      if (!name) { err.textContent = 'Please enter your full name.'; err.style.display = 'block'; return; }
      if (!Auth.isValidEmail(email)) { err.textContent = 'Please enter a valid email address.'; err.style.display = 'block'; return; }
      const pwErr = Auth.validatePassword(password);
      if (pwErr) { err.textContent = pwErr; err.style.display = 'block'; return; }
      if (password !== confirm) { err.textContent = 'Passwords do not match.'; err.style.display = 'block'; return; }

      // Loading state
      submitBtn.textContent = 'Creating Account...';
      submitBtn.disabled = true;

      const result = await Auth.register({ name, email, password });
      if (result.success) {
        // Set destination hash and reload for a clean app restart with new session
        window.location.hash = '#/dashboard';
        window.location.reload();
      } else {
        err.textContent = result.error; err.style.display = 'block';
        submitBtn.textContent = 'Create Account';
        submitBtn.disabled = false;
      }
    };
  }, 50);

  return `
  <div class="auth-page">
    <div class="auth-card animate-scaleIn">
      <div class="auth-header">
        <div style="font-size:2.5rem;margin-bottom:var(--space-4)">🎂</div>
        <h2>Create Account</h2>
        <p>Join H&H and start ordering</p>
      </div>
      <div id="register-error" class="form-error" style="display:none;text-align:center;margin-bottom:var(--space-4);padding:var(--space-3);background:var(--danger-bg);border-radius:var(--radius-md)"></div>
      <form id="register-form">
        <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" name="fullname" required placeholder="John Doe"></div>
        <div class="form-group"><label class="form-label">Email</label><input class="form-input" type="email" name="email" required placeholder="you@example.com"></div>
        <div class="form-group"><label class="form-label">Password</label><input class="form-input" type="password" name="password" required placeholder="Min 6 characters"></div>
        <div class="form-group"><label class="form-label">Confirm Password</label><input class="form-input" type="password" name="confirm" required placeholder="Re-enter password"></div>
        <button type="submit" class="btn btn-lg btn-primary btn-full">Create Account</button>
      </form>
      <div class="auth-footer">Already have an account? <a href="#/login">Sign In</a></div>
    </div>
  </div>`;
}
