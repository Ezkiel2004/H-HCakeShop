import { Store } from '../store.js';
import { Auth } from '../auth.js';
import { formatCurrency } from '../utils.js';
import { getCategoryIcon, getCategoryGrad, MENU_CATEGORIES } from '../menuData.js';

export async function landingPage() {
  /* pick a featured item from each of 4 popular categories */
  const allItems = Store.getCakes();
  const featured = ['Burgers', 'Combo Meals', 'Pasta', 'Frappe / Iced Coffee']
    .map(cat => allItems.find(i => i.category === cat))
    .filter(Boolean);

  const itemCards = featured.map(item => {
    const grad = getCategoryGrad(item.category);
    const imgHtml = item.image
      ? `<img src="${item.image}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover">`
      : `<span style="font-size:4rem">${getCategoryIcon(item.category)}</span>`;

    return `
    <div class="card animate-fadeInUp" style="cursor:pointer" onclick="location.hash='/item/${item.id}'">
      <div class="card-img-wrapper">
        <div class="card-img" style="background:linear-gradient(135deg,${grad});display:flex;align-items:center;justify-content:center;overflow:hidden">${imgHtml}</div>
        <span class="card-badge">${item.category}</span>
      </div>
      <div class="card-body">
        <h4 class="card-title">${item.name}</h4>
        <p class="card-text">${item.description}</p>
      </div>
      <div class="card-footer">
        <span class="price">${item.variants && item.variants.length ? 'From ' + formatCurrency(item.variants[0].price) : formatCurrency(item.price)}</span>
        <span class="btn btn-sm btn-primary">Order</span>
      </div>
    </div>`;
  }).join('');

  /* Category quick-links */
  const catCards = MENU_CATEGORIES.slice(0, 6).map(cat => {
    const icon = getCategoryIcon(cat);
    const grad = getCategoryGrad(cat);
    return `
    <div class="feature-card animate-fadeInUp" style="cursor:pointer" onclick="location.hash='/catalog'">
      <div class="feature-icon" style="background:linear-gradient(135deg,${grad});color:#fff">${icon}</div>
      <h4>${cat}</h4>
    </div>`;
  }).join('');

  return `
  <section class="hero">
    <div class="hero-bg-pattern"></div>
    <div class="hero-content">
      <div class="hero-text">
        <div class="hero-badge">🌟 Homemade Happiness</div>
        <h1>Fresh Food & <span class="highlight">Custom Cakes</span> Delivered</h1>
        <p>Burgers, pasta, frappes, party packages, and custom-designed cakes — all made fresh and delivered to your door.</p>
        <div class="hero-actions">
          <a href="#/catalog" class="btn btn-xl btn-primary">Browse Menu</a>
          ${Auth.currentUser() ? `<a href="#/tracking" class="btn btn-xl btn-secondary">Track Order</a>` : ''}
        </div>
        <div class="hero-stats">
          <div><div class="hero-stat-value">1,000+</div><div class="hero-stat-label">Orders Served</div></div>
          <div><div class="hero-stat-value">4.9★</div><div class="hero-stat-label">Average Rating</div></div>
          <div><div class="hero-stat-value">${allItems.length}+</div><div class="hero-stat-label">Menu Items</div></div>
        </div>
      </div>
      <div class="hero-visual">
        <div style="width:100%;max-width:480px;height:400px;border-radius:var(--radius-2xl);background:linear-gradient(135deg,#f97316,#f59e0b);display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:var(--shadow-2xl)">
          <img src="images/Combo1.jpg" alt="H&H Featured" style="width:100%;height:100%;object-fit:cover">
        </div>
        <div class="hero-float-card card-1">
          <div style="display:flex;align-items:center;gap:var(--space-3)">
            <span style="font-size:1.5rem">⭐</span>
            <div><div style="font-weight:600;font-size:var(--text-sm)">5-Star Review</div><div style="font-size:var(--text-xs);color:var(--gray-500)">"Best combo meal!"</div></div>
          </div>
        </div>
        <div class="hero-float-card card-2">
          <div style="display:flex;align-items:center;gap:var(--space-3)">
            <span style="font-size:1.5rem">🚚</span>
            <div><div style="font-weight:600;font-size:var(--text-sm)">Fast Delivery</div><div style="font-size:var(--text-xs);color:var(--gray-500)">Fresh to your door</div></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section" style="background:var(--white)">
    <div class="container">
      <div class="section-header">
        <span class="section-subtitle">Categories</span>
        <h2>What Are You Craving?</h2>
        <p>Browse by category and find your favorite</p>
      </div>
      <div class="features-grid stagger">${catCards}</div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-header">
        <span class="section-subtitle">Featured</span>
        <h2>Customer Favorites</h2>
        <p>The items our customers order the most</p>
      </div>
      <div class="grid-4 stagger">${itemCards}</div>
      <div class="text-center mt-8">
        <a href="#/catalog" class="btn btn-lg btn-outline">View Full Menu →</a>
      </div>
    </div>
  </section>

  <section class="section" style="background:var(--white)">
    <div class="container">
      <div class="section-header">
        <span class="section-subtitle">Testimonials</span>
        <h2>What Our Customers Say</h2>
      </div>
      <div class="testimonials-grid">
        <div class="testimonial-card"><div class="testimonial-quote">"</div><p class="testimonial-text">The H&H Combo 3 is amazing! Spaghetti, burger, fries AND a brownie? Unbeatable value for the price.</p><div class="testimonial-author"><span class="avatar avatar-sm">JR</span><div><div class="testimonial-author-name">Juan Reyes</div><div class="testimonial-author-role">Loyal Customer</div></div></div></div>
        <div class="testimonial-card"><div class="testimonial-quote">"</div><p class="testimonial-text">Ordered a custom cake for my daughter's birthday — turned out exactly how I imagined. The ube flavor was perfect!</p><div class="testimonial-author"><span class="avatar avatar-sm">MC</span><div><div class="testimonial-author-name">Maria Cruz</div><div class="testimonial-author-role">Happy Mom</div></div></div></div>
        <div class="testimonial-card"><div class="testimonial-quote">"</div><p class="testimonial-text">Package #7 was perfect for our small get-together. Great food, great price. We'll definitely order again!</p><div class="testimonial-author"><span class="avatar avatar-sm">AT</span><div><div class="testimonial-author-name">Andrei Torres</div><div class="testimonial-author-role">Regular Customer</div></div></div></div>
      </div>
    </div>
  </section>

  <section class="section" style="background:var(--gradient-hero)">
    <div class="container text-center">
      <h2 style="color:var(--white);margin-bottom:var(--space-4)">Ready to Order?</h2>
      <p style="color:var(--gray-400);margin-bottom:var(--space-8);font-size:var(--text-lg)">Burgers, pasta, frappes, party packages, and custom cakes — all in one place</p>
      <a href="#/catalog" class="btn btn-xl btn-primary">Start Ordering →</a>
    </div>
  </section>`;
}
