/**
 * FIXS.ARTS STUDIO — catalog.js
 * Powers services.html: dynamic category chips, search,
 * sort, and card rendering. Nothing here is hard-coded HTML.
 */

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("serviceGrid");
  if (!grid) return; // not on services.html

  const searchInput = document.getElementById("serviceSearch");
  const chipGroup = document.getElementById("categoryChips");
  const sortSelect = document.getElementById("sortSelect");
  const resultsMeta = document.getElementById("resultsMeta");
  const emptyState = document.getElementById("serviceEmptyState");

  let state = { query: "", category: "all", sort: "recommended" };

  function renderChips(){
    const categories = ["all", ...StorageManager.getCategories()];
    chipGroup.innerHTML = categories.map(cat => `
      <button class="chip ${cat === state.category ? "active" : ""}" data-cat="${Utils.escapeHtml(cat)}">
        ${cat === "all" ? "Semua" : Utils.escapeHtml(cat)}
      </button>
    `).join("");

    Utils.qsa(".chip", chipGroup).forEach(btn => {
      btn.addEventListener("click", () => {
        state.category = btn.dataset.cat;
        renderChips();
        renderGrid();
      });
    });
  }

  function cardTemplate(service){
    const pkg = (service.packages && service.packages[0]) || { price: service.price };
    return `
      <article class="card">
        <div class="card-media">
          <span class="badge">${Utils.escapeHtml(service.category)}</span>
          <img src="${Utils.escapeHtml(service.image)}" alt="${Utils.escapeHtml(service.title)}" loading="lazy" onerror="this.src='assets/images/placeholder.jpg'">
        </div>
        <div class="card-body">
          <span class="cat">${Utils.escapeHtml(service.category)}</span>
          <h3>${Utils.escapeHtml(service.title)}</h3>
          <p>${Utils.escapeHtml(service.shortDescription)}</p>
          <div class="card-price">${Utils.escapeHtml(service.priceLabel)}<b>${Utils.formatCurrency(service.price)}</b></div>
          <div class="card-actions">
            <a class="btn btn-outline btn-sm" href="service-detail.html?id=${encodeURIComponent(service.id)}">Lihat Detail</a>
            <button class="btn btn-primary btn-sm add-to-cart-btn" data-id="${service.id}" data-pkg="${pkg.id || ""}">+ Keranjang</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderGrid(){
    const allServices = StorageManager.loadServices();
    const filtered = SearchEngine.filterServices(allServices, { query: state.query, category: state.category });
    const sorted = SearchEngine.sortServices(filtered, state.sort);

    resultsMeta.textContent = `${sorted.length} layanan ditemukan`;

    if (sorted.length === 0){
      grid.innerHTML = "";
      emptyState.style.display = "block";
      emptyState.querySelector("p").textContent = state.query
        ? `Tidak ada layanan untuk pencarian "${state.query}".`
        : "Belum ada layanan pada kategori ini.";
      return;
    }
    emptyState.style.display = "none";
    grid.innerHTML = sorted.map(cardTemplate).join("");

    Utils.qsa(".add-to-cart-btn", grid).forEach(btn => {
      btn.addEventListener("click", () => {
        Cart.addItem(btn.dataset.id, btn.dataset.pkg, 1);
        Utils.showToast("Ditambahkan ke keranjang.");
      });
    });
  }

  searchInput.addEventListener("input", Utils.debounce(() => {
    state.query = searchInput.value;
    renderGrid();
  }, 200));

  sortSelect.addEventListener("change", () => {
    state.sort = sortSelect.value;
    renderGrid();
  });

  // support ?category= deep link from homepage
  const preselectedCategory = Utils.getQueryParam("category");
  if (preselectedCategory) state.category = preselectedCategory;

  renderChips();
  renderGrid();
});
