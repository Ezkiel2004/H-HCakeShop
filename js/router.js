/* ════════════════════════════════════════════════════
   CakeCraft — Hash-Based SPA Router
   ════════════════════════════════════════════════════ */

const routes = {};
let currentRoute = null;

export const Router = {
  /**
   * Register a route
   * @param {string} path — hash path, e.g. '/catalog'
   * @param {Function} handler — async function that returns HTML string
   * @param {Object} opts — { auth, role, title }
   */
  register(path, handler, opts = {}) {
    routes[path] = { handler, ...opts };
  },

  /** Navigate to a path */
  navigate(path) {
    window.location.hash = path;
  },

  /** Get current hash path */
  current() {
    return window.location.hash.slice(1) || '/';
  },

  /** Get route params (e.g. /cake/:id → { id: 'cake_001' }) */
  getParams() {
    return currentRoute?._params || {};
  },

  /** Start listening for hash changes */
  start(authCheck) {
    const resolve = () => {
      const hash = this.current();
      let matched = null;
      let params = {};

      // Exact match first
      if (routes[hash]) {
        matched = routes[hash];
      } else {
        // Pattern match (e.g. /cake/:id)
        for (const [pattern, route] of Object.entries(routes)) {
          const regex = patternToRegex(pattern);
          const match = hash.match(regex);
          if (match) {
            matched = route;
            const paramNames = (pattern.match(/:(\w+)/g) || []).map(p => p.slice(1));
            paramNames.forEach((name, i) => { params[name] = match[i + 1]; });
            break;
          }
        }
      }

      if (!matched) {
        matched = routes['/'] || routes['/404'];
      }

      if (matched) {
        // Auth check
        if (matched.auth && authCheck && !authCheck(matched.role)) {
          this.navigate('/login');
          return;
        }

        currentRoute = { ...matched, _params: params };

        // Update page title
        if (matched.title) {
          document.title = `${matched.title} — H&H`;
        }

        // Render
        const app = document.getElementById('app');
        if (app && matched.handler) {
          Promise.resolve(matched.handler(params)).then(html => {
            app.innerHTML = html;
            window.scrollTo(0, 0);
            // Dispatch custom event for post-render hooks
            window.dispatchEvent(new CustomEvent('route-rendered', { detail: { path: hash, params } }));
          });
        }
      }
    };

    window.addEventListener('hashchange', resolve);
    // Initial resolve
    resolve();
  }
};

/** Convert route pattern to regex */
function patternToRegex(pattern) {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const paramified = escaped.replace(/:(\w+)/g, '([^/]+)');
  return new RegExp('^' + paramified + '$');
}
