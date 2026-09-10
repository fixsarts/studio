/**
 * FIXS.ARTS STUDIO — cart.js
 * Core cart API (usable on every page for the badge count)
 * + DOM rendering for cart.html (guarded, only runs if the
 * cart page's markup is present).
 */

const Cart = (function(){

  function getItems(){
    return StorageManager.loadCart();
  }

  function saveItems(items){
    StorageManager.saveCart(items);
    updateBadge();
  }

  function addItem(serviceId, packageId, qty){
    qty = Math.max(1, parseInt(qty, 10) || 1);
    const items = getItems();
    const existing = items.find(i => i.serviceId === serviceId && i.packageId === packageId);
    if (existing){
      existing.qty += qty;
    } else {
      items.push({ serviceId, packageId, qty });
    }
    saveItems(items);
  }

  function removeItem(serviceId, packageId){
    const items = getItems().filter(i => !(i.serviceId === serviceId && i.packageId === packageId));
    saveItems(items);
  }

  function updateQty(serviceId, packageId, qty){
    qty = Math.max(1, parseInt(qty, 10) || 1);
    const items = getItems();
    const target = items.find(i => i.serviceId === serviceId && i.packageId === packageId);
    if (target) target.qty = qty;
    saveItems(items);
  }

  function clear(){
    saveItems([]);
  }

  // Resolves each cart line against current service/package data.
  // Lines pointing at deleted services/packages are dropped silently.
  function getDetailedItems(){
    const services = StorageManager.loadServices();
    const items = getItems();
    const detailed = [];
    items.forEach(item => {
      const service = services.find(s => s.id === item.serviceId);
      if (!service) return;
      const pkg = (service.packages || []).find(p => p.id === item.packageId) || service.packages[0];
      if (!pkg) return;
      detailed.push({
        serviceId: service.id,
        packageId: pkg.id,
        title: service.title,
        image: service.image,
        packageName: pkg.name,
        price: pkg.price,
        qty: item.qty,
        subtotal: pkg.price * item.qty
      });
    });
    return detailed;
  }

  function getCount(){
    return getItems().reduce((sum, i) => sum + i.qty, 0);
  }

  function getTotal(){
    return getDetailedItems().reduce((sum, i) => sum + i.subtotal, 0);
  }

  function updateBadge(){
    Utils.qsa(".cart-count").forEach(el => { el.textContent = getCount(); });
  }

  // ---------------- DOM rendering for cart.html ----------------
  function renderCartPage(){
    const container = document.getElementById("cartItems");
    if (!container) return;

    const items = getDetailedItems();
    const emptyState = document.getElementById("cartEmptyState");
    const summary = document.getElementById("cartSummary");

    if (items.length === 0){
      container.innerHTML = "";
      if (emptyState) emptyState.style.display = "block";
      if (summary) summary.style.display = "none";
      return;
    }

    if (emptyState) emptyState.style.display = "none";
    if (summary) summary.style.display = "block";

    container.innerHTML = items.map(item => `
      <div class="cart-item" data-service="${item.serviceId}" data-package="${item.packageId}">
        <img src="${Utils.escapeHtml(item.image)}" alt="${Utils.escapeHtml(item.title)}" onerror="this.src='assets/images/placeholder.jpg'">
        <div>
          <div class="ci-title">${Utils.escapeHtml(item.title)}</div>
          <div class="ci-pkg">Paket: ${Utils.escapeHtml(item.packageName)}</div>
          <div class="ci-price">${Utils.formatCurrency(item.subtotal)}</div>
        </div>
        <div class="ci-actions">
          <div class="qty-control">
            <button class="qty-dec" aria-label="Kurangi jumlah">−</button>
            <input type="text" inputmode="numeric" value="${item.qty}" aria-label="Jumlah" class="qty-input">
            <button class="qty-inc" aria-label="Tambah jumlah">+</button>
          </div>
          <a href="#" class="remove-link">Hapus</a>
        </div>
      </div>
    `).join("");

    renderSummary(items);
    wireCartRowEvents();
  }

  function renderSummary(items){
    const summary = document.getElementById("cartSummary");
    if (!summary) return;
    const total = items.reduce((s,i) => s + i.subtotal, 0);
    summary.innerHTML = `
      <h3>Ringkasan</h3>
      <div class="summary-row"><span>Jumlah item</span><span>${items.reduce((s,i)=>s+i.qty,0)}</span></div>
      <div class="summary-row total"><span>Total</span><span>${Utils.formatCurrency(total)}</span></div>
      <a href="checkout.html" class="btn btn-primary btn-block" style="margin-top:20px;">${Utils.getIcon('checkout','✅')} Lanjut ke Checkout</a>
    `;
  }

  function wireCartRowEvents(){
    Utils.qsa(".cart-item").forEach(row => {
      const serviceId = row.dataset.service;
      const packageId = row.dataset.package;
      const input = row.querySelector(".qty-input");

      row.querySelector(".qty-inc").addEventListener("click", () => {
        updateQty(serviceId, packageId, parseInt(input.value,10) + 1);
        renderCartPage();
      });
      row.querySelector(".qty-dec").addEventListener("click", () => {
        const next = parseInt(input.value,10) - 1;
        if (next < 1) return;
        updateQty(serviceId, packageId, next);
        renderCartPage();
      });
      input.addEventListener("change", () => {
        updateQty(serviceId, packageId, input.value);
        renderCartPage();
      });
      row.querySelector(".remove-link").addEventListener("click", (e) => {
        e.preventDefault();
        removeItem(serviceId, packageId);
        renderCartPage();
        Utils.showToast("Item dihapus dari keranjang.");
      });
    });

    const clearBtn = document.getElementById("clearCartBtn");
    if (clearBtn){
      clearBtn.addEventListener("click", async () => {
        const ok = await Utils.confirmModal({
          title: "Kosongkan keranjang?",
          message: "Semua item di keranjang akan dihapus.",
          confirmLabel: "Ya, kosongkan"
        });
        if (ok){
          clear();
          renderCartPage();
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await StorageManager.init();
    updateBadge();
    renderCartPage();
  });

  return {
    getItems, addItem, removeItem, updateQty, clear,
    getDetailedItems, getCount, getTotal, updateBadge
  };
})();
