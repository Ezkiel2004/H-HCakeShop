/* CakeCraft — Admin Products Page */
import { Store } from '../store.js';
import { formatCurrency, sanitize } from '../utils.js';
import { showToast } from '../notifications.js';

export async function adminProductsPage() {
  const cakes = Store.getCakes();

  setTimeout(() => {
    // Add cake
    document.getElementById('add-cake-btn')?.addEventListener('click', () => openModal());
    // Edit/Delete
    document.querySelectorAll('[data-edit-cake]').forEach(b => b.onclick = () => openModal(b.dataset.editCake));
    document.querySelectorAll('[data-delete-cake]').forEach(b => b.onclick = () => {
      if (confirm('Delete this cake?')) { Store.removeCake(b.dataset.deleteCake); showToast({title:'Deleted',type:'info'}); location.hash='/admin/products'; }
    });
  }, 50);

  function openModal(cakeId) {
    const cake = cakeId ? Store.getCake(cakeId) : null;
    const overlay = document.createElement('div'); overlay.className = 'modal-overlay';
    overlay.innerHTML = `<div class="modal"><div class="modal-header"><h3>${cake ? 'Edit' : 'Add'} Cake</h3><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button></div>
    <form id="cake-form"><div class="modal-body">
      <div class="form-group"><label class="form-label">Name</label><input class="form-input" name="name" required value="${cake?.name || ''}"></div>
      <div class="grid-2 gap-4">
        <div class="form-group"><label class="form-label">Category</label><select class="form-select" name="category"><option ${cake?.category==='Classic'?'selected':''}>Classic</option><option ${cake?.category==='Premium'?'selected':''}>Premium</option><option ${cake?.category==='Specialty'?'selected':''}>Specialty</option></select></div>
        <div class="form-group"><label class="form-label">Flavor</label><input class="form-input" name="flavor" required value="${cake?.flavor || ''}"></div>
      </div>
      <div class="grid-2 gap-4">
        <div class="form-group"><label class="form-label">Price ($)</label><input class="form-input" type="number" step="0.01" name="price" required value="${cake?.price || ''}"></div>
        <div class="form-group"><label class="form-label">Rating</label><input class="form-input" type="number" step="0.1" min="1" max="5" name="rating" value="${cake?.rating || 4.5}"></div>
      </div>
      <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" name="description">${cake?.description || ''}</textarea></div>
      <div class="form-group"><label class="form-label">Sizes (comma-separated)</label><input class="form-input" name="sizes" value="${cake?.sizes?.join(', ') || '6\", 8\", 10\"'}"></div>
      <div class="form-group"><label class="form-label">Toppings (comma-separated)</label><input class="form-input" name="toppings" value="${cake?.toppings?.join(', ') || ''}"></div>
    </div>
    <div class="modal-footer"><button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button><button type="submit" class="btn btn-primary">${cake ? 'Update' : 'Add'} Cake</button></div></form></div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('active'));
    overlay.querySelector('#cake-form').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = { name: fd.get('name'), category: fd.get('category'), flavor: fd.get('flavor'), price: parseFloat(fd.get('price')), rating: parseFloat(fd.get('rating')), description: fd.get('description'), sizes: fd.get('sizes').split(',').map(s=>s.trim()), toppings: fd.get('toppings').split(',').map(s=>s.trim()).filter(Boolean), available: true, image: '', reviews: cake?.reviews || 0 };
      if (cake) { Store.updateCake(cake.id, data); showToast({title:'Updated!',type:'success'}); }
      else { data.id = 'cake_' + Date.now(); data.createdAt = new Date().toISOString(); data.bestseller = false; Store.addCake(data); showToast({title:'Cake Added!',type:'success'}); }
      overlay.remove(); location.hash = '/admin/products';
    };
  }

  const rows = cakes.map(c => `
    <tr>
      <td><div style="display:flex;align-items:center;gap:var(--space-3)"><div style="width:40px;height:40px;border-radius:var(--radius-md);background:linear-gradient(135deg,#e8b4c8,#d090a8);display:flex;align-items:center;justify-content:center">🎂</div><div><div style="font-weight:600">${sanitize(c.name)}</div><div class="text-xs text-muted">${c.flavor}</div></div></div></td>
      <td><span class="badge badge-neutral">${c.category}</span></td>
      <td class="font-semibold">${formatCurrency(c.price)}</td>
      <td>⭐ ${c.rating}</td>
      <td><span class="badge ${c.available?'badge-success':'badge-danger'}">${c.available?'Active':'Inactive'}</span></td>
      <td><div style="display:flex;gap:var(--space-2)"><button class="btn btn-sm btn-ghost" data-edit-cake="${c.id}">✏️</button><button class="btn btn-sm btn-ghost" data-delete-cake="${c.id}" style="color:var(--danger)">🗑️</button></div></td>
    </tr>`).join('');

  return `<div>
    <div class="admin-page-header"><div><h1>Products</h1><p class="text-muted">${cakes.length} cakes in catalog</p></div><button class="btn btn-primary" id="add-cake-btn">+ Add Cake</button></div>
    <div class="table-wrapper"><table class="data-table"><thead><tr><th>Cake</th><th>Category</th><th>Price</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>
  </div>`;
}
