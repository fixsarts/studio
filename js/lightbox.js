/**
 * FIXS.ARTS STUDIO — lightbox.js
 * ---------------------------------------------------------
 * Reusable image-preview popup used by service-detail.js and
 * project-detail.js. Opens as an overlay with a blurred backdrop
 * (the rest of the site stays visible behind it, dimmed/blurred)
 * instead of a full opaque takeover or a page navigation.
 *
 * Usage:
 *   Lightbox.open(["a.jpg","b.jpg"], 0); // open at index 0
 *   Lightbox.close();
 * ---------------------------------------------------------
 */

const Lightbox = (function(){
  let overlay = null;
  let images = [];
  let currentIndex = 0;

  function build(){
    overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.innerHTML = `
      <button type="button" class="lightbox-close" aria-label="Tutup preview">✕</button>
      <button type="button" class="lightbox-prev" aria-label="Gambar sebelumnya">‹</button>
      <img alt="Preview gambar" class="lightbox-image">
      <button type="button" class="lightbox-next" aria-label="Gambar berikutnya">›</button>
      <span class="lightbox-counter" id="lightboxCounter"></span>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector(".lightbox-close").addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    overlay.querySelector(".lightbox-prev").addEventListener("click", () => render(currentIndex - 1));
    overlay.querySelector(".lightbox-next").addEventListener("click", () => render(currentIndex + 1));

    document.addEventListener("keydown", (e) => {
      if (!overlay.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") render(currentIndex - 1);
      if (e.key === "ArrowRight") render(currentIndex + 1);
    });
  }

  function render(index){
    if (images.length === 0) return;
    currentIndex = (index + images.length) % images.length;
    overlay.querySelector(".lightbox-image").src = images[currentIndex];

    const multi = images.length > 1;
    overlay.querySelector(".lightbox-prev").style.display = multi ? "flex" : "none";
    overlay.querySelector(".lightbox-next").style.display = multi ? "flex" : "none";
    overlay.querySelector("#lightboxCounter").textContent = multi ? `${currentIndex + 1} / ${images.length}` : "";
  }

  function open(imageList, startIndex){
    if (!overlay) build();
    images = (imageList || []).filter(Boolean);
    if (images.length === 0) return;
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    render(startIndex || 0);
  }

  function close(){
    if (!overlay) return;
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  return { open, close };
})();
