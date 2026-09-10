/**
 * FIXS.ARTS STUDIO — project-detail.js
 * Powers project-detail.html?id=...
 */

document.addEventListener("DOMContentLoaded", async () => {
  const root = document.getElementById("projectDetailRoot");
  if (!root) return;

  await StorageManager.init();

  const notFoundState = document.getElementById("projectNotFound");
  const id = Utils.getQueryParam("id");
  const portfolio = StorageManager.loadPortfolio();
  const project = portfolio.find(p => p.id === id);

  if (!project){
    root.style.display = "none";
    notFoundState.style.display = "block";
    return;
  }

  document.title = project.title + " — Fixs.Arts Studio";

  const mainImg = document.getElementById("projectMainImage");
  const thumbRow = document.getElementById("projectThumbRow");
  const gallery = (project.gallery && project.gallery.length) ? project.gallery : [project.image];
  let activeGalleryIndex = 0;

  mainImg.src = gallery[0];
  mainImg.onerror = () => { mainImg.src = "assets/portfolio/placeholder.jpg"; };
  mainImg.addEventListener("click", () => Lightbox.open(gallery, activeGalleryIndex));

  thumbRow.innerHTML = gallery.map((src,i) => `
    <img src="${Utils.escapeHtml(src)}" class="${i===0?"active":""}" data-src="${Utils.escapeHtml(src)}" data-index="${i}" onerror="this.src='assets/portfolio/placeholder.jpg'">
  `).join("");
  Utils.qsa("img", thumbRow).forEach(thumb => {
    thumb.addEventListener("click", () => {
      activeGalleryIndex = Number(thumb.dataset.index);
      mainImg.src = thumb.dataset.src;
      Utils.qsa("img", thumbRow).forEach(t => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });

  document.getElementById("projectCategory").textContent = project.category;
  document.getElementById("projectTitle").textContent = project.title;
  document.getElementById("projectClient").textContent = project.client;
  document.getElementById("projectYear").textContent = project.year;
  document.getElementById("projectDescription").textContent = project.description;

  document.getElementById("projectServicesUsed").innerHTML =
    (project.servicesUsed || []).map(s => `<span class="chip">${Utils.escapeHtml(s)}</span>`).join("");
});
