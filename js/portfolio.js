/**
 * FIXS.ARTS STUDIO — portfolio.js
 * Powers portfolio.html: category filter + search + card grid.
 */

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("portfolioGrid");
  if (!grid) return;

  await StorageManager.init();

  const searchInput = document.getElementById("portfolioSearch");
  const chipGroup = document.getElementById("portfolioCategoryChips");
  const emptyState = document.getElementById("portfolioEmptyState");
  const resultsMeta = document.getElementById("portfolioResultsMeta");

  let state = { query: "", category: "all" };

  function renderChips(){
    const portfolio = StorageManager.loadPortfolio();
    const categories = ["all", ...new Set(portfolio.map(p => p.category))];
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

  function cardTemplate(item){
    return `
      <article class="card">
        <a href="project-detail.html?id=${encodeURIComponent(item.id)}">
          <div class="card-media">
            <span class="badge">${Utils.escapeHtml(item.category)}</span>
            <img src="${Utils.escapeHtml(item.image)}" alt="${Utils.escapeHtml(item.title)}" loading="lazy" onerror="this.src='assets/portfolio/placeholder.jpg'">
          </div>
          <div class="card-body">
            <span class="cat">${Utils.escapeHtml(item.client)} · ${Utils.escapeHtml(item.year)}</span>
            <h3>${Utils.escapeHtml(item.title)}</h3>
            <p>${Utils.escapeHtml(item.description)}</p>
          </div>
        </a>
      </article>
    `;
  }

  function renderGrid(){
    const portfolio = StorageManager.loadPortfolio();
    const filtered = SearchEngine.filterPortfolio(portfolio, state);
    resultsMeta.textContent = `${filtered.length} proyek ditemukan`;

    if (filtered.length === 0){
      grid.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }
    emptyState.style.display = "none";
    grid.innerHTML = filtered.map(cardTemplate).join("");
  }

  searchInput.addEventListener("input", Utils.debounce(() => {
    state.query = searchInput.value;
    renderGrid();
  }, 200));

  renderChips();
  renderGrid();
});
