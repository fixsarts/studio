/**
 * FIXS.ARTS STUDIO — app.js
 * Shared behaviour that runs on every public page:
 * mobile nav drawer, active-link highlight, cart badge init,
 * footer year, and settings-driven text (brand name, footer, etc.)
 *
 * Load order on every page:
 * data.js -> storage.js -> utils.js -> cart.js -> app.js -> (page script)
 */

document.addEventListener("DOMContentLoaded", async () => {
  await StorageManager.init();

  // ---- mobile nav drawer ----
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  if (toggle && menu){
    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("open");
      toggle.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen);
    });
    Utils.qsa("a", menu).forEach(a => a.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.classList.remove("open");
    }));
  }

  // ---- active link highlight ----
  const current = window.location.pathname.split("/").pop() || "index.html";
  Utils.qsa(".nav-menu a").forEach(a => {
    const href = a.getAttribute("href");
    if (href === current) a.classList.add("active");
  });

  // ---- footer year ----
  Utils.qsa(".year").forEach(el => { el.textContent = new Date().getFullYear(); });

  // ---- settings-driven text (brand name, footer, contact) ----
  const settings = StorageManager.loadSettings();
  Utils.qsa("[data-setting]").forEach(el => {
    const key = el.dataset.setting;
    if (settings[key] !== undefined) el.textContent = settings[key];
  });
  Utils.qsa("[data-setting-href]").forEach(el => {
    const key = el.dataset.settingHref;
    if (key === "whatsapp"){
      el.href = `https://wa.me/${settings.whatsappNumber}`;
    } else if (key === "email"){
      el.href = `mailto:${settings.email}`;
    } else if (settings[key]){
      el.href = settings[key];
    }
  });

  // cart badge (Cart module already updates on DOMContentLoaded too,
  // this covers pages where cart.js loads after app.js)
  if (window.Cart) Cart.updateBadge();
});
