/**
 * FIXS.ARTS STUDIO — admin.js
 * ---------------------------------------------------------
 * Single-page-style content manager for admin.html.
 * All reads/writes go through StorageManager only.
 *
 * IMPORTANT: this is a local, browser-based content manager,
 * NOT a secure authentication system. Anyone with access to
 * this browser profile can edit data. See README.md.
 * ---------------------------------------------------------
 */

const ICON_FIELDS = [
  { key: "search", label: "Icon Pencarian (halaman Layanan & Portfolio)" },
  { key: "cart", label: "Icon Keranjang (navbar)" },
  { key: "checkout", label: 'Icon Checkout (tombol "Lanjut ke Checkout")' },
  { key: "whatsapp", label: "Icon WhatsApp (footer)" },
  { key: "instagram", label: "Icon Instagram (footer)" },
  { key: "email", label: "Icon Email (footer)" }
];

document.addEventListener("DOMContentLoaded", async () => {
  await StorageManager.init();

  // ---------------- sidebar navigation ----------------
  const navButtons = Utils.qsa(".admin-nav-btn");
  const panels = Utils.qsa(".admin-panel");

  function showPanel(name){
    panels.forEach(p => p.classList.toggle("active", p.dataset.panel === name));
    navButtons.forEach(b => b.classList.toggle("active", b.dataset.target === name));
    if (name === "dashboard") renderDashboard();
    if (name === "services") renderServicesTable();
    if (name === "portfolio") renderPortfolioTable();
    if (name === "homepage") fillHomepageForm();
    if (name === "settings") fillSettingsForm();
    if (name === "icons") renderIconsForm();
  }
  navButtons.forEach(btn => btn.addEventListener("click", () => showPanel(btn.dataset.target)));

  // ================= DASHBOARD =================
  function renderDashboard(){
    const services = StorageManager.loadServices();
    const portfolio = StorageManager.loadPortfolio();
    const settings = StorageManager.loadSettings();
    const categories = StorageManager.getCategories();

    document.getElementById("statServices").textContent = services.length;
    document.getElementById("statPortfolio").textContent = portfolio.length;
    document.getElementById("statCategories").textContent = categories.length;
    document.getElementById("statFeatured").textContent = services.filter(s => s.featured).length;
    document.getElementById("statWhatsapp").textContent = settings.whatsappNumber;
  }

  // ================= GENERIC DRAG-TO-REORDER (used by Services & Portfolio) =================
  // Attaches once per <tbody> via event delegation, so it survives re-renders
  // (innerHTML gets replaced, but listeners bound to the tbody itself stay alive).
  function enableDragReorder(tbody, { getArray, saveArray, rerender }){
    let dragSrcIndex = null;

    function clearIndicators(){
      Utils.qsa("tr", tbody).forEach(r => r.classList.remove("dragging", "drag-over-top", "drag-over-bottom"));
    }

    tbody.addEventListener("dragstart", (e) => {
      const row = e.target.closest("tr[draggable='true']");
      if (!row) return;
      dragSrcIndex = Number(row.dataset.index);
      row.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(dragSrcIndex));
    });

    tbody.addEventListener("dragover", (e) => {
      const row = e.target.closest("tr[draggable='true']");
      if (!row) return;
      e.preventDefault();
      const rect = row.getBoundingClientRect();
      const isAfter = (e.clientY - rect.top) > rect.height / 2;
      Utils.qsa("tr", tbody).forEach(r => r.classList.remove("drag-over-top", "drag-over-bottom"));
      row.classList.add(isAfter ? "drag-over-bottom" : "drag-over-top");
    });

    tbody.addEventListener("drop", (e) => {
      const row = e.target.closest("tr[draggable='true']");
      if (!row || dragSrcIndex === null) return;
      e.preventDefault();

      const rect = row.getBoundingClientRect();
      const isAfter = (e.clientY - rect.top) > rect.height / 2;
      let targetIndex = Number(row.dataset.index) + (isAfter ? 1 : 0);

      const arr = getArray();
      const [moved] = arr.splice(dragSrcIndex, 1);
      if (dragSrcIndex < targetIndex) targetIndex -= 1;
      arr.splice(targetIndex, 0, moved);

      saveArray(arr);
      dragSrcIndex = null;
      clearIndicators();
      rerender();
    });

    tbody.addEventListener("dragend", () => {
      dragSrcIndex = null;
      clearIndicators();
    });
  }

  function moveItemByIndex(array, index, delta){
    const target = index + delta;
    if (target < 0 || target >= array.length) return array;
    const copy = array.slice();
    const [item] = copy.splice(index, 1);
    copy.splice(target, 0, item);
    return copy;
  }

  function dragHandleCell(index, total){
    return `
      <td class="drag-handle-cell">
        <div class="drag-handle-wrap">
          <span aria-hidden="true" title="Geser untuk mengubah urutan">⠿</span>
          <div class="reorder-btns">
            <button type="button" class="move-up-btn" data-index="${index}" aria-label="Naikkan urutan" ${index === 0 ? "disabled" : ""}>▲</button>
            <button type="button" class="move-down-btn" data-index="${index}" aria-label="Turunkan urutan" ${index === total - 1 ? "disabled" : ""}>▼</button>
          </div>
        </div>
      </td>`;
  }

  // ================= SERVICES: TABLE =================
  const servicesTableBody = document.getElementById("servicesTableBody");
  enableDragReorder(servicesTableBody, {
    getArray: () => StorageManager.loadServices(),
    saveArray: (arr) => StorageManager.saveServices(arr),
    rerender: renderServicesTable
  });

  function renderServicesTable(){
    const services = StorageManager.loadServices();
    if (services.length === 0){
      servicesTableBody.innerHTML = `<tr><td colspan="7" class="admin-empty">Belum ada layanan. Klik "+ Tambah Layanan".</td></tr>`;
      return;
    }
    servicesTableBody.innerHTML = services.map((s, index) => `
      <tr draggable="true" data-index="${index}">
        ${dragHandleCell(index, services.length)}
        <td><img class="admin-thumb" src="${Utils.escapeHtml(s.image)}" onerror="this.src='assets/images/placeholder.jpg'"></td>
        <td>${Utils.escapeHtml(s.title)}</td>
        <td>${Utils.escapeHtml(s.category)}</td>
        <td>${Utils.formatCurrency(s.price)}</td>
        <td>${s.featured ? "⭐ Ya" : "Tidak"}</td>
        <td class="admin-row-actions">
          <button class="btn btn-sm btn-outline" data-edit="${s.id}">Edit</button>
          <button class="btn btn-sm btn-outline" data-duplicate="${s.id}">Duplikat</button>
          <button class="btn btn-sm btn-outline admin-danger" data-delete="${s.id}">Hapus</button>
        </td>
      </tr>
    `).join("");

    Utils.qsa("[data-edit]", servicesTableBody).forEach(b => b.addEventListener("click", () => openServiceEditor(b.dataset.edit)));
    Utils.qsa("[data-duplicate]", servicesTableBody).forEach(b => b.addEventListener("click", () => duplicateService(b.dataset.duplicate)));
    Utils.qsa("[data-delete]", servicesTableBody).forEach(b => b.addEventListener("click", () => deleteService(b.dataset.delete)));
    Utils.qsa(".move-up-btn", servicesTableBody).forEach(b => b.addEventListener("click", () => {
      const reordered = moveItemByIndex(StorageManager.loadServices(), Number(b.dataset.index), -1);
      StorageManager.saveServices(reordered);
      renderServicesTable();
    }));
    Utils.qsa(".move-down-btn", servicesTableBody).forEach(b => b.addEventListener("click", () => {
      const reordered = moveItemByIndex(StorageManager.loadServices(), Number(b.dataset.index), 1);
      StorageManager.saveServices(reordered);
      renderServicesTable();
    }));
  }

  function duplicateService(id){
    const services = StorageManager.loadServices();
    const original = services.find(s => s.id === id);
    if (!original) return;
    const copy = JSON.parse(JSON.stringify(original));
    copy.id = Utils.generateId("service");
    copy.title = original.title + " (Copy)";
    services.push(copy);
    StorageManager.saveServices(services);
    renderServicesTable();
    Utils.showToast("Layanan diduplikat.");
  }

  async function deleteService(id){
    const ok = await Utils.confirmModal({
      title: "Hapus layanan ini?",
      message: "Layanan yang dihapus tidak bisa dikembalikan.",
      confirmLabel: "Hapus"
    });
    if (!ok) return;
    const services = StorageManager.loadServices().filter(s => s.id !== id);
    StorageManager.saveServices(services);
    renderServicesTable();
    Utils.showToast("Layanan dihapus.");
  }

  // ================= SERVICES: EDITOR MODAL =================
  const serviceModal = document.getElementById("serviceModal");
  const serviceForm = document.getElementById("serviceForm");
  let editingServiceId = null;
  let currentPackages = [];
  let currentServiceGallery = []; // extra slide images, on top of the main "Gambar Utama"

  document.getElementById("addServiceBtn").addEventListener("click", () => openServiceEditor(null));
  document.getElementById("closeServiceModal").addEventListener("click", () => serviceModal.classList.remove("open"));

  function openServiceEditor(id){
    editingServiceId = id;
    const services = StorageManager.loadServices();
    const service = id ? services.find(s => s.id === id) : null;

    document.getElementById("serviceModalTitle").textContent = service ? "Edit Layanan" : "Tambah Layanan";
    serviceForm.title.value = service ? service.title : "";
    serviceForm.category.value = service ? service.category : "";
    serviceForm.shortDescription.value = service ? service.shortDescription : "";
    serviceForm.description.value = service ? service.description : "";
    serviceForm.price.value = service ? service.price : "";
    serviceForm.priceLabel.value = service ? service.priceLabel : "Mulai dari";
    serviceForm.image.value = service ? service.image : "";
    serviceForm.tags.value = service ? (service.tags || []).join(", ") : "";
    serviceForm.featured.checked = service ? Boolean(service.featured) : false;
    serviceForm.active.checked = service ? service.active !== false : true;

    currentPackages = service ? JSON.parse(JSON.stringify(service.packages || [])) : [];
    renderPackageEditor();

    // gallery = every image besides the main one, used as extra slides
    currentServiceGallery = service
      ? (service.gallery || []).filter(g => g && g !== service.image)
      : [];
    renderServiceGalleryEditor();

    // image local preview / file select (dataURL) — local-only, see README
    const preview = document.getElementById("serviceImagePreview");
    preview.src = service ? service.image : "assets/images/placeholder.jpg";
    preview.onerror = () => { preview.src = "assets/images/placeholder.jpg"; };

    serviceModal.classList.add("open");
  }

  document.getElementById("serviceImageFile").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const dataUrl = await Utils.readFileAsDataURL(file);
    serviceForm.image.value = dataUrl;
    document.getElementById("serviceImagePreview").src = dataUrl;
  });

  // ---- gallery editor (extra slide images for service-detail.html) ----
  function renderServiceGalleryEditor(){
    const container = document.getElementById("serviceGalleryEditorList");
    container.innerHTML = currentServiceGallery.map((src, index) => `
      <div class="gallery-editor-row" data-index="${index}">
        <img class="gallery-thumb" src="${Utils.escapeHtml(src || "assets/images/placeholder.jpg")}" onerror="this.src='assets/images/placeholder.jpg'">
        <div class="form-field">
          <label>Gambar tambahan ${index + 1}</label>
          <input type="text" class="gallery-url-input" value="${Utils.escapeHtml(src)}" placeholder="assets/images/nama-file.jpg atau tempel URL">
          <input type="file" class="gallery-file-input" accept="image/*">
        </div>
        <button type="button" class="btn btn-sm btn-outline admin-danger gallery-remove-btn">Hapus</button>
      </div>
    `).join("") || `<p class="admin-empty">Belum ada gambar tambahan. Klik "+ Tambah Gambar".</p>`;

    Utils.qsa(".gallery-editor-row", container).forEach(row => {
      const idx = Number(row.dataset.index);
      const urlInput = row.querySelector(".gallery-url-input");
      const thumb = row.querySelector(".gallery-thumb");
      urlInput.addEventListener("input", () => {
        currentServiceGallery[idx] = urlInput.value.trim();
        thumb.src = urlInput.value.trim() || "assets/images/placeholder.jpg";
      });
      row.querySelector(".gallery-file-input").addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const dataUrl = await Utils.readFileAsDataURL(file);
        currentServiceGallery[idx] = dataUrl;
        urlInput.value = dataUrl;
        thumb.src = dataUrl;
      });
      row.querySelector(".gallery-remove-btn").addEventListener("click", () => {
        currentServiceGallery.splice(idx, 1);
        renderServiceGalleryEditor();
      });
    });
  }

  document.getElementById("addServiceGalleryBtn").addEventListener("click", () => {
    currentServiceGallery.push("");
    renderServiceGalleryEditor();
  });

  function renderPackageEditor(){
    const container = document.getElementById("packageEditorList");
    container.innerHTML = currentPackages.map((pkg, index) => `
      <div class="package-editor-row" data-index="${index}">
        <div class="pe-grid">
          <input type="text" placeholder="Nama paket" class="pe-name" value="${Utils.escapeHtml(pkg.name || "")}">
          <input type="number" placeholder="Harga" class="pe-price" value="${pkg.price || 0}">
        </div>
        <input type="text" placeholder="Deskripsi singkat paket" class="pe-desc" value="${Utils.escapeHtml(pkg.description || "")}">
        <textarea placeholder="Fitur (satu baris = satu fitur)" class="pe-features">${Utils.escapeHtml((pkg.features || []).join("\n"))}</textarea>
        <button type="button" class="btn btn-sm btn-outline admin-danger pe-remove">Hapus Paket</button>
      </div>
    `).join("") || `<p class="admin-empty">Belum ada paket. Klik "+ Tambah Paket".</p>`;

    Utils.qsa(".package-editor-row", container).forEach(row => {
      const idx = Number(row.dataset.index);
      row.querySelector(".pe-remove").addEventListener("click", () => {
        currentPackages.splice(idx, 1);
        renderPackageEditor();
      });
    });
  }

  document.getElementById("addPackageBtn").addEventListener("click", () => {
    currentPackages.push({ id: Utils.generateId("pkg"), name: "", price: 0, description: "", features: [] });
    renderPackageEditor();
  });

  function collectPackagesFromForm(){
    const rows = Utils.qsa(".package-editor-row", document.getElementById("packageEditorList"));
    return rows.map((row, i) => ({
      id: currentPackages[i] ? currentPackages[i].id : Utils.generateId("pkg"),
      name: row.querySelector(".pe-name").value.trim(),
      price: Number(row.querySelector(".pe-price").value) || 0,
      description: row.querySelector(".pe-desc").value.trim(),
      features: row.querySelector(".pe-features").value.split("\n").map(f => f.trim()).filter(Boolean)
    }));
  }

  serviceForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const services = StorageManager.loadServices();
    const packages = collectPackagesFromForm();

    const payload = {
      id: editingServiceId || Utils.generateId("service"),
      title: serviceForm.title.value.trim(),
      category: serviceForm.category.value.trim() || "Other",
      shortDescription: serviceForm.shortDescription.value.trim(),
      description: serviceForm.description.value.trim(),
      price: Number(serviceForm.price.value) || 0,
      priceLabel: serviceForm.priceLabel.value.trim() || "Mulai dari",
      image: serviceForm.image.value.trim() || "assets/images/placeholder.jpg",
      gallery: Array.from(new Set([
        serviceForm.image.value.trim() || "assets/images/placeholder.jpg",
        ...currentServiceGallery.map(s => (s || "").trim()).filter(Boolean)
      ])),
      tags: serviceForm.tags.value.split(",").map(t => t.trim()).filter(Boolean),
      featured: serviceForm.featured.checked,
      active: serviceForm.active.checked,
      createdAt: new Date().toISOString().slice(0,10),
      packages: packages.length ? packages : [{ id: Utils.generateId("pkg"), name: "Standard", price: Number(serviceForm.price.value) || 0, description: "", features: [] }]
    };

    if (!payload.title){
      Utils.showToast("Judul layanan wajib diisi.");
      return;
    }

    if (editingServiceId){
      const index = services.findIndex(s => s.id === editingServiceId);
      const preserved = services[index];
      services[index] = Object.assign({}, preserved, payload, { id: preserved.id, createdAt: preserved.createdAt });
    } else {
      services.push(payload);
    }

    StorageManager.saveServices(services);
    serviceModal.classList.remove("open");
    renderServicesTable();
    Utils.showToast("Layanan disimpan.");
  });

  // ================= PORTFOLIO: TABLE =================
  const portfolioTableBody = document.getElementById("portfolioTableBody");
  enableDragReorder(portfolioTableBody, {
    getArray: () => StorageManager.loadPortfolio(),
    saveArray: (arr) => StorageManager.savePortfolio(arr),
    rerender: renderPortfolioTable
  });

  function renderPortfolioTable(){
    const portfolio = StorageManager.loadPortfolio();
    if (portfolio.length === 0){
      portfolioTableBody.innerHTML = `<tr><td colspan="6" class="admin-empty">Belum ada proyek portfolio.</td></tr>`;
      return;
    }
    portfolioTableBody.innerHTML = portfolio.map((p, index) => `
      <tr draggable="true" data-index="${index}">
        ${dragHandleCell(index, portfolio.length)}
        <td><img class="admin-thumb" src="${Utils.escapeHtml(p.image)}" onerror="this.src='assets/portfolio/placeholder.jpg'"></td>
        <td>${Utils.escapeHtml(p.title)}</td>
        <td>${Utils.escapeHtml(p.category)}</td>
        <td>${p.featured ? "⭐ Ya" : "Tidak"}</td>
        <td class="admin-row-actions">
          <button class="btn btn-sm btn-outline" data-edit-p="${p.id}">Edit</button>
          <button class="btn btn-sm btn-outline admin-danger" data-delete-p="${p.id}">Hapus</button>
        </td>
      </tr>
    `).join("");

    Utils.qsa("[data-edit-p]", portfolioTableBody).forEach(b => b.addEventListener("click", () => openPortfolioEditor(b.dataset.editP)));
    Utils.qsa("[data-delete-p]", portfolioTableBody).forEach(b => b.addEventListener("click", () => deletePortfolio(b.dataset.deleteP)));
    Utils.qsa(".move-up-btn", portfolioTableBody).forEach(b => b.addEventListener("click", () => {
      const reordered = moveItemByIndex(StorageManager.loadPortfolio(), Number(b.dataset.index), -1);
      StorageManager.savePortfolio(reordered);
      renderPortfolioTable();
    }));
    Utils.qsa(".move-down-btn", portfolioTableBody).forEach(b => b.addEventListener("click", () => {
      const reordered = moveItemByIndex(StorageManager.loadPortfolio(), Number(b.dataset.index), 1);
      StorageManager.savePortfolio(reordered);
      renderPortfolioTable();
    }));
  }

  async function deletePortfolio(id){
    const ok = await Utils.confirmModal({ title: "Hapus proyek ini?", message: "Proyek portfolio yang dihapus tidak bisa dikembalikan.", confirmLabel: "Hapus" });
    if (!ok) return;
    StorageManager.savePortfolio(StorageManager.loadPortfolio().filter(p => p.id !== id));
    renderPortfolioTable();
    Utils.showToast("Proyek dihapus.");
  }

  // ================= PORTFOLIO: EDITOR MODAL =================
  const portfolioModal = document.getElementById("portfolioModal");
  const portfolioForm = document.getElementById("portfolioForm");
  let editingPortfolioId = null;
  let currentPortfolioGallery = []; // extra slide images, on top of the main "Gambar Utama"

  document.getElementById("addPortfolioBtn").addEventListener("click", () => openPortfolioEditor(null));
  document.getElementById("closePortfolioModal").addEventListener("click", () => portfolioModal.classList.remove("open"));

  function openPortfolioEditor(id){
    editingPortfolioId = id;
    const portfolio = StorageManager.loadPortfolio();
    const item = id ? portfolio.find(p => p.id === id) : null;

    document.getElementById("portfolioModalTitle").textContent = item ? "Edit Proyek" : "Tambah Proyek";
    portfolioForm.title.value = item ? item.title : "";
    portfolioForm.category.value = item ? item.category : "";
    portfolioForm.client.value = item ? item.client : "";
    portfolioForm.year.value = item ? item.year : new Date().getFullYear();
    portfolioForm.description.value = item ? item.description : "";
    portfolioForm.image.value = item ? item.image : "";
    portfolioForm.servicesUsed.value = item ? (item.servicesUsed || []).join(", ") : "";
    portfolioForm.featured.checked = item ? Boolean(item.featured) : false;

    currentPortfolioGallery = item
      ? (item.gallery || []).filter(g => g && g !== item.image)
      : [];
    renderPortfolioGalleryEditor();

    const preview = document.getElementById("portfolioImagePreview");
    preview.src = item ? item.image : "assets/portfolio/placeholder.jpg";
    preview.onerror = () => { preview.src = "assets/portfolio/placeholder.jpg"; };

    portfolioModal.classList.add("open");
  }

  document.getElementById("portfolioImageFile").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const dataUrl = await Utils.readFileAsDataURL(file);
    portfolioForm.image.value = dataUrl;
    document.getElementById("portfolioImagePreview").src = dataUrl;
  });

  // ---- gallery editor (extra slide images for project-detail.html) ----
  function renderPortfolioGalleryEditor(){
    const container = document.getElementById("portfolioGalleryEditorList");
    container.innerHTML = currentPortfolioGallery.map((src, index) => `
      <div class="gallery-editor-row" data-index="${index}">
        <img class="gallery-thumb" src="${Utils.escapeHtml(src || "assets/portfolio/placeholder.jpg")}" onerror="this.src='assets/portfolio/placeholder.jpg'">
        <div class="form-field">
          <label>Gambar tambahan ${index + 1}</label>
          <input type="text" class="gallery-url-input" value="${Utils.escapeHtml(src)}" placeholder="assets/portfolio/nama-file.jpg atau tempel URL">
          <input type="file" class="gallery-file-input" accept="image/*">
        </div>
        <button type="button" class="btn btn-sm btn-outline admin-danger gallery-remove-btn">Hapus</button>
      </div>
    `).join("") || `<p class="admin-empty">Belum ada gambar tambahan. Klik "+ Tambah Gambar".</p>`;

    Utils.qsa(".gallery-editor-row", container).forEach(row => {
      const idx = Number(row.dataset.index);
      const urlInput = row.querySelector(".gallery-url-input");
      const thumb = row.querySelector(".gallery-thumb");
      urlInput.addEventListener("input", () => {
        currentPortfolioGallery[idx] = urlInput.value.trim();
        thumb.src = urlInput.value.trim() || "assets/portfolio/placeholder.jpg";
      });
      row.querySelector(".gallery-file-input").addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const dataUrl = await Utils.readFileAsDataURL(file);
        currentPortfolioGallery[idx] = dataUrl;
        urlInput.value = dataUrl;
        thumb.src = dataUrl;
      });
      row.querySelector(".gallery-remove-btn").addEventListener("click", () => {
        currentPortfolioGallery.splice(idx, 1);
        renderPortfolioGalleryEditor();
      });
    });
  }

  document.getElementById("addPortfolioGalleryBtn").addEventListener("click", () => {
    currentPortfolioGallery.push("");
    renderPortfolioGalleryEditor();
  });

  portfolioForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const portfolio = StorageManager.loadPortfolio();
    const payload = {
      id: editingPortfolioId || Utils.generateId("project"),
      title: portfolioForm.title.value.trim(),
      category: portfolioForm.category.value.trim() || "Other",
      client: portfolioForm.client.value.trim(),
      year: portfolioForm.year.value.trim(),
      description: portfolioForm.description.value.trim(),
      image: portfolioForm.image.value.trim() || "assets/portfolio/placeholder.jpg",
      gallery: Array.from(new Set([
        portfolioForm.image.value.trim() || "assets/portfolio/placeholder.jpg",
        ...currentPortfolioGallery.map(s => (s || "").trim()).filter(Boolean)
      ])),
      servicesUsed: portfolioForm.servicesUsed.value.split(",").map(s => s.trim()).filter(Boolean),
      featured: portfolioForm.featured.checked
    };

    if (!payload.title){
      Utils.showToast("Judul proyek wajib diisi.");
      return;
    }

    if (editingPortfolioId){
      const index = portfolio.findIndex(p => p.id === editingPortfolioId);
      portfolio[index] = Object.assign({}, portfolio[index], payload, { id: portfolio[index].id });
    } else {
      portfolio.push(payload);
    }
    StorageManager.savePortfolio(portfolio);
    portfolioModal.classList.remove("open");
    renderPortfolioTable();
    Utils.showToast("Proyek disimpan.");
  });

  // ================= HOMEPAGE CONTENT =================
  const homepageForm = document.getElementById("homepageForm");
  function fillHomepageForm(){
    const settings = StorageManager.loadSettings();
    const hp = settings.homepage;
    homepageForm.eyebrow.value = hp.eyebrow;
    homepageForm.title.value = hp.title;
    homepageForm.description.value = hp.description;
    homepageForm.primaryButton.value = hp.primaryButton;
    homepageForm.secondaryButton.value = hp.secondaryButton;
    homepageForm.ctaTitle.value = hp.ctaTitle;
    homepageForm.ctaDescription.value = hp.ctaDescription;
    homepageForm.ctaButton.value = hp.ctaButton;
    homepageForm.heroMediaType.value = hp.heroMediaType || "shape";
    homepageForm.heroMediaUrl.value = hp.heroMediaUrl || "";
    renderHeroMediaPreview();
  }

  // ---- hero banner (image/video/shape) preview ----
  function renderHeroMediaPreview(){
    const type = homepageForm.heroMediaType.value;
    const url = homepageForm.heroMediaUrl.value.trim();
    document.getElementById("heroMediaUrlField").style.display = type === "shape" ? "none" : "block";

    const previewWrap = document.getElementById("heroMediaPreviewWrap");
    if (type === "shape" || !url){
      previewWrap.innerHTML = "";
      return;
    }
    if (type === "video"){
      previewWrap.innerHTML = `<video src="${Utils.escapeHtml(url)}" style="width:100%;max-width:320px;border-radius:10px;" controls muted></video>`;
    } else {
      previewWrap.innerHTML = `<img src="${Utils.escapeHtml(url)}" style="width:100%;max-width:320px;border-radius:10px;object-fit:cover;" onerror="this.style.display='none'">`;
    }
  }
  homepageForm.heroMediaType.addEventListener("change", renderHeroMediaPreview);
  homepageForm.heroMediaUrl.addEventListener("input", renderHeroMediaPreview);
  document.getElementById("heroMediaFile").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const dataUrl = await Utils.readFileAsDataURL(file);
    homepageForm.heroMediaUrl.value = dataUrl;
    if (homepageForm.heroMediaType.value === "shape"){
      homepageForm.heroMediaType.value = file.type.startsWith("video") ? "video" : "image";
    }
    renderHeroMediaPreview();
  });

  homepageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const settings = StorageManager.loadSettings();
    settings.homepage = {
      eyebrow: homepageForm.eyebrow.value,
      title: homepageForm.title.value,
      description: homepageForm.description.value,
      primaryButton: homepageForm.primaryButton.value,
      secondaryButton: homepageForm.secondaryButton.value,
      ctaTitle: homepageForm.ctaTitle.value,
      ctaDescription: homepageForm.ctaDescription.value,
      ctaButton: homepageForm.ctaButton.value,
      heroMediaType: homepageForm.heroMediaType.value,
      heroMediaUrl: homepageForm.heroMediaUrl.value.trim()
    };
    StorageManager.saveSettings(settings);
    Utils.showToast("Konten homepage disimpan.");
  });

  // ================= SETTINGS =================
  const settingsForm = document.getElementById("settingsForm");

  function updateLogoPreview(url){
    const img = document.getElementById("logoPreviewImg");
    const placeholder = document.getElementById("logoPreviewPlaceholder");
    if (url){
      img.src = url;
      img.style.display = "block";
      placeholder.style.display = "none";
    } else {
      img.style.display = "none";
      placeholder.style.display = "block";
    }
  }

  function fillSettingsForm(){
    const s = StorageManager.loadSettings();
    settingsForm.brandName.value = s.brandName;
    settingsForm.studioName.value = s.studioName;
    settingsForm.whatsappNumber.value = s.whatsappNumber;
    settingsForm.instagramUrl.value = s.instagramUrl;
    settingsForm.email.value = s.email;
    settingsForm.location.value = s.location;
    settingsForm.footerDescription.value = s.footerDescription;
    settingsForm.copyrightText.value = s.copyrightText;
    settingsForm.currencySymbol.value = s.currencySymbol;
    settingsForm.logoUrl.value = s.logoUrl || "";
    updateLogoPreview(s.logoUrl);
  }

  settingsForm.logoUrl.addEventListener("input", () => updateLogoPreview(settingsForm.logoUrl.value.trim()));
  document.getElementById("logoFileInput").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const dataUrl = await Utils.readFileAsDataURL(file);
    settingsForm.logoUrl.value = dataUrl;
    updateLogoPreview(dataUrl);
  });

  settingsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const s = StorageManager.loadSettings();
    Object.assign(s, {
      brandName: settingsForm.brandName.value,
      studioName: settingsForm.studioName.value,
      whatsappNumber: settingsForm.whatsappNumber.value.replace(/\D/g,""),
      instagramUrl: settingsForm.instagramUrl.value,
      email: settingsForm.email.value,
      location: settingsForm.location.value,
      footerDescription: settingsForm.footerDescription.value,
      copyrightText: settingsForm.copyrightText.value,
      currencySymbol: settingsForm.currencySymbol.value,
      logoUrl: settingsForm.logoUrl.value.trim()
    });
    StorageManager.saveSettings(s);
    Utils.showToast("Pengaturan disimpan.");
    renderDashboard();
  });

  // ================= ICONS =================
  function renderIconsForm(){
    const settings = StorageManager.loadSettings();
    const icons = settings.icons || {};
    const container = document.getElementById("iconFieldsContainer");
    container.innerHTML = ICON_FIELDS.map(f => `
      <div class="icon-field-card" data-key="${f.key}">
        <label>${Utils.escapeHtml(f.label)}</label>
        <div class="icon-field-preview">${Utils.renderIconHTML(icons[f.key] || "")}</div>
        <input type="text" class="icon-value-input" value="${Utils.escapeHtml(icons[f.key] || "")}" placeholder="Emoji, teks, atau path gambar">
        <input type="file" class="icon-file-input" accept="image/*">
      </div>
    `).join("");

    Utils.qsa(".icon-field-card", container).forEach(card => {
      const input = card.querySelector(".icon-value-input");
      const preview = card.querySelector(".icon-field-preview");
      input.addEventListener("input", () => {
        preview.innerHTML = Utils.renderIconHTML(input.value.trim());
      });
      card.querySelector(".icon-file-input").addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const dataUrl = await Utils.readFileAsDataURL(file);
        input.value = dataUrl;
        preview.innerHTML = Utils.renderIconHTML(dataUrl);
      });
    });
  }

  document.getElementById("iconsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const settings = StorageManager.loadSettings();
    const icons = Object.assign({}, settings.icons);
    Utils.qsa(".icon-field-card", document.getElementById("iconFieldsContainer")).forEach(card => {
      icons[card.dataset.key] = card.querySelector(".icon-value-input").value.trim();
    });
    settings.icons = icons;
    StorageManager.saveSettings(settings);
    Utils.showToast("Icons disimpan.");
  });

  // ================= DATA MANAGEMENT =================
  document.getElementById("exportDataBtn").addEventListener("click", () => {
    StorageManager.exportData();
    Utils.showToast("Data diekspor sebagai fixsarts-data.json");
  });

  document.getElementById("importDataInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = StorageManager.importData(reader.result);
      Utils.showToast(result.message);
      if (result.success){
        renderDashboard();
        renderServicesTable();
        renderPortfolioTable();
        fillSettingsForm();
        fillHomepageForm();
        renderIconsForm();
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  document.getElementById("resetDataBtn").addEventListener("click", async () => {
    const ok = await Utils.confirmModal({
      title: "Kembalikan ke data default?",
      message: "Semua perubahan katalog, portfolio, dan pengaturan akan diganti dengan data contoh bawaan.",
      confirmLabel: "Reset"
    });
    if (!ok) return;
    StorageManager.resetData();
    renderDashboard();
    renderServicesTable();
    renderPortfolioTable();
    fillSettingsForm();
    fillHomepageForm();
    renderIconsForm();
    Utils.showToast("Data dikembalikan ke default.");
  });

  // start on dashboard
  showPanel("dashboard");
});
