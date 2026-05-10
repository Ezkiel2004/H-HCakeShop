/* H&H — Menu / Catalog Page */
import { Store } from '../store.js';
import { formatCurrency, debounce, sanitize } from '../utils.js';
import { MENU_CATEGORIES, getCategoryIcon, getCategoryGrad } from '../menuData.js';

export async function catalogPage() {
  const items = Store.getCakes();

  const renderGrid = (list) => list.map(item => {
    const grad = getCategoryGrad(item.category);
    const priceLabel = item.variants && item.variants.length
      ? `From ${formatCurrency(item.variants[0].price)}`
      : formatCurrency(item.price);

    const imgHtml = item.image
      ? `<img src="${item.image}" alt="${sanitize(item.name)}" style="width:100%;height:100%;object-fit:cover">`
      : `<span style="font-size:3.5rem">${getCategoryIcon(item.category)}</span>`;

    return `
    <div class="card animate-fadeInUp" style="cursor:pointer" onclick="location.hash='/item/${item.id}'">
      <div class="card-img-wrapper">
        <div class="card-img" style="background:linear-gradient(135deg,${grad});display:flex;align-items:center;justify-content:center;overflow:hidden">${imgHtml}</div>
        <span class="card-badge">${item.category}</span>
      </div>
      <div class="card-body">
        <h4 class="card-title">${sanitize(item.name)}</h4>
        <p class="card-text">${sanitize(item.description)}</p>
      </div>
      <div class="card-footer">
        <span class="price price-sm">${priceLabel}</span>
        <span class="btn btn-sm btn-primary">${item.isCustomCake ? 'Customize' : 'Order'}</span>
      </div>
    </div>`;
  }).join('');

  setTimeout(() => {
    const search = document.getElementById('catalog-search');
    const grid = document.getElementById('catalog-grid');
    const count = document.getElementById('catalog-count');
    const sort = document.getElementById('catalog-sort');
    const catTabs = document.querySelectorAll('[data-cat-tab]');
    if (!search) return;

    let activeCategory = 'All';

    const filter = debounce(() => {
      let filtered = [...items];
      // Category filter
      if (activeCategory !== 'All') {
        filtered = filtered.filter(i => i.category === activeCategory);
      }
      // Search filter
      const q = search.value.toLowerCase();
      if (q) filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
      );
      // Sort
      const sv = sort.value;
      if (sv === 'price-low') filtered.sort((a,b) => a.price - b.price);
      else if (sv === 'price-high') filtered.sort((a,b) => b.price - a.price);
      else if (sv === 'name') filtered.sort((a,b) => a.name.localeCompare(b.name));

      grid.innerHTML = filtered.length
        ? renderGrid(filtered)
        : '<div class="empty-state"><div class="empty-state-icon">🔍</div><h3>No items found</h3><p>Try a different category or search term</p></div>';
      count.textContent = `${filtered.length} item(s) found`;
    }, 200);

    catTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        catTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeCategory = tab.dataset.catTab;
        filter();
      });
    });

    search.addEventListener('input', filter);
    sort.addEventListener('change', filter);
  }, 50);

  const categoryTabs = ['All', ...MENU_CATEGORIES].map(cat =>
    `<button class="category-tab${cat === 'All' ? ' active' : ''}" data-cat-tab="${cat}">${cat === 'All' ? '🍽️' : getCategoryIcon(cat)} ${cat}</button>`
  ).join('');

  return `
  <div class="container">
    <div class="page-header"><h1>Our Menu</h1><p>Explore our full selection of food, drinks & packages</p></div>
    <div class="category-tabs-wrapper">
      <div class="category-tabs" id="category-tabs">${categoryTabs}</div>
    </div>
    <div class="catalog-menu-layout">
      <div>
        <div class="catalog-header">
          <div class="search-bar" style="flex:1;max-width:320px">
            <span class="search-icon">🔍</span>
            <input type="text" id="catalog-search" placeholder="Search menu...">
          </div>
          <div style="display:flex;align-items:center;gap:var(--space-4)">
            <span class="catalog-count" id="catalog-count">${items.length} item(s) found</span>
            <select class="form-select" id="catalog-sort" style="width:auto">
              <option value="default">Default</option>
              <option value="name">Name A-Z</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
        <div class="catalog-grid stagger" id="catalog-grid">${renderGrid(items)}</div>
      </div>
    </div>
  </div>`;
}
