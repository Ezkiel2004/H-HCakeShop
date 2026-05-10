/* H&H — Item Detail Page (Universal) */
import { Store } from '../store.js';
import { Cart } from '../cart.js';
import { Auth } from '../auth.js';
import { formatCurrency, sanitize } from '../utils.js';
import { showToast } from '../notifications.js';
import { Router } from '../router.js';
import { getCategoryIcon, getCategoryGrad } from '../menuData.js';

export async function itemDetailPage() {
  const params = Router.getParams();
  const item = Store.getCake(params.id);
  if (!item) return `<div class="container"><div class="empty-state"><div class="empty-state-icon">🔍</div><h3>Item not found</h3><a href="#/catalog" class="btn btn-primary mt-4">Back to Menu</a></div></div>`;

  const grad = getCategoryGrad(item.category);

  /* ── Custom Cake Builder ── */
  if (item.isCustomCake) return renderCustomCakePage(item, grad);

  /* ── Package Display ── */
  if (item.category === 'Packages') return renderPackagePage(item, grad);

  /* ── Standard / Combo / Variant Item ── */
  return renderStandardPage(item, grad);
}

/* ═══════════════════════════════════════════════════
   STANDARD / COMBO ITEMS
   ═══════════════════════════════════════════════════ */
function renderStandardPage(item, grad) {
  const hasVariants = item.variants && item.variants.length > 0;
  const hasAddons   = item.addons && item.addons.length > 0;
  const hasUpgrades = item.upgrades && item.upgrades.length > 0;
  const hasIncludes = item.includes && item.includes.length > 0;

  const startPrice = hasVariants ? item.variants[0].price : item.price;

  setTimeout(() => {
    const qtyEl = document.getElementById('item-qty');
    const totalEl = document.getElementById('item-total');
    const addBtn = document.getElementById('add-to-cart-btn');
    if (!addBtn) return;

    let selectedVariant = hasVariants ? item.variants[0].label : '';
    let currentPrice = startPrice;
    let selectedAddons = [];
    let selectedUpgrades = [];
    let qty = 1;

    function updatePrice() {
      let price = currentPrice;
      selectedAddons.forEach(a => { const found = item.addons.find(x => x.label === a); if (found) price += found.price; });
      selectedUpgrades.forEach(u => { const found = item.upgrades.find(x => x.label === u); if (found) price += found.price; });
      totalEl.textContent = formatCurrency(price * qty);
      totalEl.dataset.unitPrice = price;
    }

    // Variant chips
    document.querySelectorAll('[data-variant]').forEach(chip => {
      chip.onclick = () => {
        document.querySelectorAll('[data-variant]').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        selectedVariant = chip.dataset.variant;
        const v = item.variants.find(x => x.label === selectedVariant);
        if (v) currentPrice = v.price;
        updatePrice();
      };
    });

    // Addon chips
    document.querySelectorAll('[data-addon]').forEach(chip => {
      chip.onclick = () => {
        chip.classList.toggle('selected');
        selectedAddons = [...document.querySelectorAll('[data-addon].selected')].map(c => c.dataset.addon);
        updatePrice();
      };
    });

    // Upgrade chips
    document.querySelectorAll('[data-upgrade]').forEach(chip => {
      chip.onclick = () => {
        // Only one upgrade at a time
        document.querySelectorAll('[data-upgrade]').forEach(c => c.classList.remove('selected'));
        if (selectedUpgrades.includes(chip.dataset.upgrade)) {
          selectedUpgrades = [];
        } else {
          chip.classList.add('selected');
          selectedUpgrades = [chip.dataset.upgrade];
        }
        updatePrice();
      };
    });

    // Qty controls
    document.getElementById('qty-minus')?.addEventListener('click', () => { qty = Math.max(1, qty - 1); qtyEl.textContent = qty; updatePrice(); });
    document.getElementById('qty-plus')?.addEventListener('click', () => { qty++; qtyEl.textContent = qty; updatePrice(); });

    // Add to cart
    addBtn.onclick = () => {
      if (!Auth.isLoggedIn()) {
        showToast({ title: 'Login Required', message: 'Please log in to add items to your cart.', type: 'warning' });
        Router.navigate('/login');
        return;
      }
      const unitPrice = Number(totalEl.dataset.unitPrice) || currentPrice;
      Cart.addItem({
        productId: item.id,
        name: item.name,
        category: item.category,
        variant: selectedVariant,
        selectedAddons,
        selectedUpgrades,
        message: '',
        price: unitPrice,
        qty,
      });
      showToast({ title: 'Added to Cart!', message: `${item.name}${selectedVariant ? ' (' + selectedVariant + ')' : ''}`, type: 'success' });
    };

    updatePrice();
  }, 50);

  const variantChips = hasVariants
    ? `<div class="customizer-option"><label>Size</label><div class="option-chips">${item.variants.map((v, i) => `<span class="option-chip${i === 0 ? ' selected' : ''}" data-variant="${v.label}">${v.label} — ${formatCurrency(v.price)}</span>`).join('')}</div></div>`
    : '';

  const addonChips = hasAddons
    ? `<div class="customizer-option"><label>Add-ons</label><div class="option-chips">${item.addons.map(a => `<span class="option-chip" data-addon="${a.label}">${a.label} (+${formatCurrency(a.price)})</span>`).join('')}</div></div>`
    : '';

  const upgradeChips = hasUpgrades
    ? `<div class="customizer-option"><label>Upgrades</label><div class="option-chips">${item.upgrades.map(u => `<span class="option-chip" data-upgrade="${u.label}">${u.label} (+${formatCurrency(u.price)})</span>`).join('')}</div></div>`
    : '';

  const includesList = hasIncludes
    ? `<div class="customizer-option"><label>Includes</label><ul class="includes-list">${item.includes.map(i => `<li>✓ ${sanitize(i)}</li>`).join('')}</ul></div>`
    : '';

  return `
  <div class="container">
    <div style="padding:var(--space-4) 0"><a href="#/catalog" style="color:var(--gray-500);font-size:var(--text-sm)">← Back to Menu</a></div>
    <div class="cake-detail">
      <div class="cake-detail-image">
        <div style="width:100%;height:500px;background:linear-gradient(135deg,${grad});display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:var(--radius-xl)">${item.image ? `<img src="${item.image}" alt="${sanitize(item.name)}" style="width:100%;height:100%;object-fit:cover">` : `<span style="font-size:8rem">${getCategoryIcon(item.category)}</span>`}</div>
      </div>
      <div class="cake-detail-info">
        <span class="badge badge-primary mb-2">${item.category}</span>
        <h1>${sanitize(item.name)}</h1>
        <p class="cake-detail-desc">${sanitize(item.description)}</p>
        <div class="cake-detail-price"><span class="price price-lg">${hasVariants ? 'From ' + formatCurrency(item.variants[0].price) : formatCurrency(item.price)}</span></div>

        <div class="customizer">
          <h4>🛒 Order Options</h4>
          ${includesList}
          ${variantChips}
          ${addonChips}
          ${upgradeChips}
          <div class="customizer-summary">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div class="qty-controls">
                <button class="qty-btn" id="qty-minus">−</button>
                <span class="qty-value" id="item-qty">1</span>
                <button class="qty-btn" id="qty-plus">+</button>
              </div>
              <div><span class="text-sm text-muted">Total: </span><span class="price price-lg" id="item-total" data-unit-price="${startPrice}">${formatCurrency(startPrice)}</span></div>
            </div>
          </div>
        </div>
        <button class="btn btn-xl btn-primary btn-full" id="add-to-cart-btn">🛒 Add to Cart</button>
      </div>
    </div>
  </div>`;
}

/* ═══════════════════════════════════════════════════
   PACKAGE PAGE
   ═══════════════════════════════════════════════════ */
function renderPackagePage(item, grad) {
  setTimeout(() => {
    const qtyEl = document.getElementById('item-qty');
    const totalEl = document.getElementById('item-total');
    const addBtn = document.getElementById('add-to-cart-btn');
    if (!addBtn) return;
    let qty = 1;

    function updatePrice() {
      totalEl.textContent = formatCurrency(item.price * qty);
    }

    document.getElementById('qty-minus')?.addEventListener('click', () => { qty = Math.max(1, qty - 1); qtyEl.textContent = qty; updatePrice(); });
    document.getElementById('qty-plus')?.addEventListener('click', () => { qty++; qtyEl.textContent = qty; updatePrice(); });

    addBtn.onclick = () => {
      if (!Auth.isLoggedIn()) {
        showToast({ title: 'Login Required', message: 'Please log in to add items to your cart.', type: 'warning' });
        Router.navigate('/login');
        return;
      }
      Cart.addItem({
        productId: item.id,
        name: item.name,
        category: item.category,
        variant: item.paxCount || '',
        selectedAddons: [],
        selectedUpgrades: [],
        message: '',
        price: item.price,
        qty,
      });
      showToast({ title: 'Added to Cart!', message: `${item.name} (${item.paxCount})`, type: 'success' });
    };
  }, 50);

  const includesList = item.includes.map(i => `<li>• ${sanitize(i)}</li>`).join('');

  return `
  <div class="container">
    <div style="padding:var(--space-4) 0"><a href="#/catalog" style="color:var(--gray-500);font-size:var(--text-sm)">← Back to Menu</a></div>
    <div class="cake-detail">
      <div class="cake-detail-image">
        <div style="width:100%;height:500px;background:linear-gradient(135deg,${grad});display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:var(--radius-xl)">${item.image ? `<img src="${item.image}" alt="${sanitize(item.name)}" style="width:100%;height:100%;object-fit:cover">` : `<span style="font-size:8rem">${getCategoryIcon(item.category)}</span>`}</div>
      </div>
      <div class="cake-detail-info">
        <span class="badge badge-primary mb-2">Packages</span>
        <h1>${sanitize(item.name)}</h1>
        <div class="badge badge-neutral mb-4">${item.paxCount}</div>
        <div class="cake-detail-price"><span class="price price-lg">${formatCurrency(item.price)}</span></div>

        <div class="customizer">
          <h4>📦 Package Contents</h4>
          <ul class="package-contents-list">${includesList}</ul>
          <div class="customizer-summary">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div class="qty-controls">
                <button class="qty-btn" id="qty-minus">−</button>
                <span class="qty-value" id="item-qty">1</span>
                <button class="qty-btn" id="qty-plus">+</button>
              </div>
              <div><span class="text-sm text-muted">Total: </span><span class="price price-lg" id="item-total">${formatCurrency(item.price)}</span></div>
            </div>
          </div>
        </div>
        <button class="btn btn-xl btn-primary btn-full" id="add-to-cart-btn">🛒 Add to Cart</button>
      </div>
    </div>
  </div>`;
}

/* ═══════════════════════════════════════════════════
   CUSTOM CAKE BUILDER
   ═══════════════════════════════════════════════════ */
function renderCustomCakePage(item, grad) {
  const opts = item.customOptions;

  setTimeout(() => {
    const totalEl = document.getElementById('item-total');
    const qtyEl = document.getElementById('item-qty');
    const msgInput = document.getElementById('cake-message');
    const addBtn = document.getElementById('add-to-cart-btn');
    if (!addBtn) return;

    let selectedFlavor = opts.flavors[0];
    let selectedShape = opts.shapes[0];
    let selectedSize = opts.sizes[0];
    let selectedToppings = [];
    let qty = 1;

    function computePrice() {
      let price = item.price;
      price += selectedShape.extraPrice || 0;
      price += selectedSize.extraPrice || 0;
      price += selectedToppings.reduce((sum, t) => sum + t.price, 0);
      return price;
    }

    function updatePrice() {
      const unit = computePrice();
      totalEl.textContent = formatCurrency(unit * qty);
      totalEl.dataset.unitPrice = unit;
    }

    // Flavor chips
    document.querySelectorAll('[data-flavor]').forEach(chip => {
      chip.onclick = () => {
        document.querySelectorAll('[data-flavor]').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        selectedFlavor = chip.dataset.flavor;
      };
    });

    // Shape chips
    document.querySelectorAll('[data-shape]').forEach(chip => {
      chip.onclick = () => {
        document.querySelectorAll('[data-shape]').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        selectedShape = opts.shapes.find(s => s.label === chip.dataset.shape);
        updatePrice();
      };
    });

    // Size chips
    document.querySelectorAll('[data-cake-size]').forEach(chip => {
      chip.onclick = () => {
        document.querySelectorAll('[data-cake-size]').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        selectedSize = opts.sizes.find(s => s.label === chip.dataset.cakeSize);
        updatePrice();
      };
    });

    // Topping chips
    document.querySelectorAll('[data-cake-topping]').forEach(chip => {
      chip.onclick = () => {
        chip.classList.toggle('selected');
        const sel = [...document.querySelectorAll('[data-cake-topping].selected')].map(c => c.dataset.cakeTopping);
        selectedToppings = opts.toppings.filter(t => sel.includes(t.label));
        updatePrice();
      };
    });

    // Qty
    document.getElementById('qty-minus')?.addEventListener('click', () => { qty = Math.max(1, qty - 1); qtyEl.textContent = qty; updatePrice(); });
    document.getElementById('qty-plus')?.addEventListener('click', () => { qty++; qtyEl.textContent = qty; updatePrice(); });

    // Add to cart
    addBtn.onclick = () => {
      if (!Auth.isLoggedIn()) {
        showToast({ title: 'Login Required', message: 'Please log in to add items to your cart.', type: 'warning' });
        Router.navigate('/login');
        return;
      }
      const unitPrice = computePrice();
      Cart.addItem({
        productId: item.id,
        name: 'Custom Cake',
        category: 'Custom Cakes',
        variant: selectedSize.label,
        selectedAddons: selectedToppings.map(t => t.label),
        selectedUpgrades: [],
        customSelections: {
          flavor: selectedFlavor,
          shape: selectedShape.label,
          size: selectedSize.label,
          toppings: selectedToppings.map(t => t.label),
        },
        message: msgInput?.value || '',
        price: unitPrice,
        qty,
      });
      showToast({ title: 'Added to Cart!', message: `Custom Cake — ${selectedFlavor} (${selectedSize.label})`, type: 'success' });
    };

    updatePrice();
  }, 50);

  const flavorChips = opts.flavors.map((f, i) =>
    `<span class="option-chip${i === 0 ? ' selected' : ''}" data-flavor="${f}">${f}</span>`
  ).join('');

  const shapeChips = opts.shapes.map((s, i) =>
    `<span class="option-chip${i === 0 ? ' selected' : ''}" data-shape="${s.label}">${s.label}${s.extraPrice ? ' (+' + formatCurrency(s.extraPrice) + ')' : ''}</span>`
  ).join('');

  const sizeChips = opts.sizes.map((s, i) =>
    `<span class="option-chip${i === 0 ? ' selected' : ''}" data-cake-size="${s.label}">${s.label}${s.extraPrice ? ' (+' + formatCurrency(s.extraPrice) + ')' : ''}</span>`
  ).join('');

  const toppingChips = opts.toppings.map(t =>
    `<span class="option-chip" data-cake-topping="${t.label}">${t.label} (+${formatCurrency(t.price)})</span>`
  ).join('');

  return `
  <div class="container">
    <div style="padding:var(--space-4) 0"><a href="#/catalog" style="color:var(--gray-500);font-size:var(--text-sm)">← Back to Menu</a></div>
    <div class="cake-detail">
      <div class="cake-detail-image">
        <div style="width:100%;height:500px;background:linear-gradient(135deg,${grad});display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:var(--radius-xl)">${item.image ? `<img src="${item.image}" alt="${sanitize(item.name)}" style="width:100%;height:100%;object-fit:cover">` : `<span style="font-size:8rem">${getCategoryIcon(item.category)}</span>`}</div>
      </div>
      <div class="cake-detail-info">
        <span class="badge badge-primary mb-2">Custom Cakes</span>
        <h1>Design Your Custom Cake</h1>
        <p class="cake-detail-desc">${sanitize(item.description)}</p>
        <div class="cake-detail-price"><span class="price price-lg">From ${formatCurrency(item.price)}</span> <span class="text-sm text-muted">base price</span></div>

        <div class="customizer">
          <h4>🎨 Cake Builder</h4>
          <div class="customizer-option"><label>Flavor</label><div class="option-chips">${flavorChips}</div></div>
          <div class="customizer-option"><label>Shape</label><div class="option-chips">${shapeChips}</div></div>
          <div class="customizer-option"><label>Size</label><div class="option-chips">${sizeChips}</div></div>
          <div class="customizer-option"><label>Toppings (+${formatCurrency(25)} each)</label><div class="option-chips">${toppingChips}</div></div>
          <div class="customizer-option">
            <label>Custom Message</label>
            <input type="text" class="form-input" id="cake-message" placeholder="e.g. Happy Birthday!" maxlength="50">
          </div>
          <div class="customizer-summary">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div class="qty-controls">
                <button class="qty-btn" id="qty-minus">−</button>
                <span class="qty-value" id="item-qty">1</span>
                <button class="qty-btn" id="qty-plus">+</button>
              </div>
              <div><span class="text-sm text-muted">Total: </span><span class="price price-lg" id="item-total" data-unit-price="${item.price}">${formatCurrency(item.price)}</span></div>
            </div>
          </div>
        </div>
        <button class="btn btn-xl btn-primary btn-full" id="add-to-cart-btn">🛒 Add to Cart</button>
      </div>
    </div>
  </div>`;
}
