/**
 * FIXS.ARTS STUDIO — service-detail.js
 * Powers service-detail.html?id=... : gallery, package
 * selector, quantity, add to cart / order now, related services.
 */

document.addEventListener("DOMContentLoaded", async () => {
  const root = document.getElementById("serviceDetailRoot");
  if (!root) return;

  await StorageManager.init();

  const notFoundState = document.getElementById("serviceNotFound");
  const id = Utils.getQueryParam("id");
  const services = StorageManager.loadServices();
  const service = services.find(s => s.id === id);

  if (!service){
    root.style.display = "none";
    notFoundState.style.display = "block";
    return;
  }

  let selectedPackage = service.packages[0];
  let qty = 1;

  // ---- gallery ----
  const mainImg = document.getElementById("mainImage");
  const thumbRow = document.getElementById("thumbRow");
  const gallery = (service.gallery && service.gallery.length) ? service.gallery : [service.image];

  mainImg.src = gallery[0];
  mainImg.alt = service.title;
  mainImg.onerror = () => { mainImg.src = "assets/images/placeholder.jpg"; };

  thumbRow.innerHTML = gallery.map((src, i) => `
    <img src="${Utils.escapeHtml(src)}" class="${i === 0 ? "active" : ""}" data-src="${Utils.escapeHtml(src)}" onerror="this.src='assets/images/placeholder.jpg'">
  `).join("");
  Utils.qsa("img", thumbRow).forEach(thumb => {
    thumb.addEventListener("click", () => {
      mainImg.src = thumb.dataset.src;
      Utils.qsa("img", thumbRow).forEach(t => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });

  // ---- text content ----
  document.getElementById("serviceCategory").textContent = service.category;
  document.getElementById("serviceTitle").textContent = service.title;
  document.getElementById("serviceDescription").textContent = service.description;
  document.title = service.title + " — Fixs.Arts Studio";

  // ---- packages ----
  const packageList = document.getElementById("packageList");
  function renderPackages(){
    packageList.innerHTML = service.packages.map(pkg => `
      <div class="package-option ${pkg.id === selectedPackage.id ? "selected" : ""}" data-pkg="${pkg.id}">
        <div>
          <div class="p-name">${Utils.escapeHtml(pkg.name)}</div>
          <div style="color:var(--text-muted);font-size:0.85rem;margin-top:4px;">${Utils.escapeHtml(pkg.description || "")}</div>
          <ul>${(pkg.features || []).map(f => `<li>${Utils.escapeHtml(f)}</li>`).join("")}</ul>
        </div>
        <div class="p-price">${Utils.formatCurrency(pkg.price)}</div>
      </div>
    `).join("");

    Utils.qsa(".package-option", packageList).forEach(el => {
      el.addEventListener("click", () => {
        selectedPackage = service.packages.find(p => p.id === el.dataset.pkg);
        renderPackages();
        updatePriceTag();
      });
    });
  }

  function updatePriceTag(){
    document.getElementById("priceTag").innerHTML =
      `${Utils.escapeHtml(service.priceLabel)}<b>${Utils.formatCurrency(selectedPackage.price)}</b>`;
  }

  renderPackages();
  updatePriceTag();

  // ---- quantity ----
  const qtyInput = document.getElementById("qtyInput");
  document.getElementById("qtyInc").addEventListener("click", () => {
    qty += 1; qtyInput.value = qty;
  });
  document.getElementById("qtyDec").addEventListener("click", () => {
    if (qty <= 1) return;
    qty -= 1; qtyInput.value = qty;
  });
  qtyInput.addEventListener("change", () => {
    qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
    qtyInput.value = qty;
  });

  // ---- actions ----
  document.getElementById("addToCartBtn").addEventListener("click", () => {
    Cart.addItem(service.id, selectedPackage.id, qty);
    Utils.showToast("Ditambahkan ke keranjang.");
  });
  document.getElementById("orderNowBtn").addEventListener("click", () => {
    Cart.addItem(service.id, selectedPackage.id, qty);
    window.location.href = "checkout.html";
  });

  // ---- related services (same category, excluding self) ----
  const relatedGrid = document.getElementById("relatedGrid");
  const related = services
    .filter(s => s.id !== service.id && s.category === service.category && s.active !== false)
    .slice(0, 3);

  if (related.length === 0){
    document.getElementById("relatedSection").style.display = "none";
  } else {
    relatedGrid.innerHTML = related.map(s => `
      <article class="card">
        <div class="card-media">
          <img src="${Utils.escapeHtml(s.image)}" alt="${Utils.escapeHtml(s.title)}" onerror="this.src='assets/images/placeholder.jpg'">
        </div>
        <div class="card-body">
          <span class="cat">${Utils.escapeHtml(s.category)}</span>
          <h3>${Utils.escapeHtml(s.title)}</h3>
          <div class="card-price">${Utils.escapeHtml(s.priceLabel)}<b>${Utils.formatCurrency(s.price)}</b></div>
          <div class="card-actions">
            <a class="btn btn-outline btn-sm btn-block" href="service-detail.html?id=${encodeURIComponent(s.id)}">Lihat Detail</a>
          </div>
        </div>
      </article>
    `).join("");
  }
});
