/**
 * FIXS.ARTS STUDIO — storage.js
 * ---------------------------------------------------------
 * StorageManager is the ONLY module allowed to touch
 * localStorage directly.
 *
 * DATA SOURCE ORDER (highest priority first):
 *   1. js/fixsarts-data.json  (if present, fetched once per page load)
 *   2. localStorage           (cache of the last data that was loaded)
 *   3. data.js DEFAULT_*      (fallback seed, only used if nothing
 *                              else is available yet)
 *
 * WORKFLOW FOR THE SITE OWNER:
 *   1. Edit content in admin.html as usual.
 *   2. Click "Export ke JSON" — downloads fixsarts-data.json.
 *   3. Replace js/fixsarts-data.json in the project with that file.
 *   4. Commit & push to GitHub. No code editing required.
 *
 * IMPORTANT: fetch() of a local file only works when the site is
 * served over http/https (GitHub Pages, a local dev server, etc).
 * Opening index.html directly as a file:// URL will silently skip
 * step 1 (browser security restriction) and fall back to
 * localStorage / data.js instead.
 * ---------------------------------------------------------
 */

const STORAGE_KEYS = {
  services: "fixsarts_services",
  portfolio: "fixsarts_portfolio",
  settings: "fixsarts_settings",
  cart: "fixsarts_cart"
};

const DATA_FILE_URL = "js/fixsarts-data.json";

const StorageManager = (function(){

  function safeParse(raw, fallback){
    try{
      const parsed = JSON.parse(raw);
      return parsed === null || parsed === undefined ? fallback : parsed;
    }catch(e){
      console.warn("StorageManager: failed to parse stored data, using fallback.", e);
      return fallback;
    }
  }

  function seedDefaultsIfEmpty(){
    if (localStorage.getItem(STORAGE_KEYS.services) === null){
      localStorage.setItem(STORAGE_KEYS.services, JSON.stringify(window.FixsData.services));
    }
    if (localStorage.getItem(STORAGE_KEYS.portfolio) === null){
      localStorage.setItem(STORAGE_KEYS.portfolio, JSON.stringify(window.FixsData.portfolio));
    }
    if (localStorage.getItem(STORAGE_KEYS.settings) === null){
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(window.FixsData.settings));
    }
    if (localStorage.getItem(STORAGE_KEYS.cart) === null){
      localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify([]));
    }
  }

  function loadServices(){
    return safeParse(localStorage.getItem(STORAGE_KEYS.services), window.FixsData.services);
  }
  function saveServices(services){
    localStorage.setItem(STORAGE_KEYS.services, JSON.stringify(services));
  }

  function loadPortfolio(){
    return safeParse(localStorage.getItem(STORAGE_KEYS.portfolio), window.FixsData.portfolio);
  }
  function savePortfolio(items){
    localStorage.setItem(STORAGE_KEYS.portfolio, JSON.stringify(items));
  }

  function loadSettings(){
    const stored = safeParse(localStorage.getItem(STORAGE_KEYS.settings), window.FixsData.settings);
    return Object.assign({}, window.FixsData.settings, stored, {
      homepage: Object.assign({}, window.FixsData.settings.homepage, stored.homepage || {})
    });
  }
  function saveSettings(settings){
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  }

  function loadCart(){
    return safeParse(localStorage.getItem(STORAGE_KEYS.cart), []);
  }
  function saveCart(items){
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(items));
  }

  function getCategories(){
    const services = loadServices();
    const set = new Set(services.map(s => s.category).filter(Boolean));
    return Array.from(set);
  }

  function resetData(){
    localStorage.setItem(STORAGE_KEYS.services, JSON.stringify(window.FixsData.services));
    localStorage.setItem(STORAGE_KEYS.portfolio, JSON.stringify(window.FixsData.portfolio));
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(window.FixsData.settings));
  }

  function exportData(){
    const payload = {
      exportedAt: new Date().toISOString(),
      services: loadServices(),
      portfolio: loadPortfolio(),
      settings: loadSettings()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fixsarts-data.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function validateImportPayload(payload){
    if (!payload || typeof payload !== "object") return "File JSON tidak valid.";
    if (!Array.isArray(payload.services)) return "Data 'services' tidak ditemukan atau bukan array.";
    if (!Array.isArray(payload.portfolio)) return "Data 'portfolio' tidak ditemukan atau bukan array.";
    if (!payload.settings || typeof payload.settings !== "object") return "Data 'settings' tidak ditemukan.";
    const badService = payload.services.find(s => !s.id || !s.title || typeof s.price === "undefined");
    if (badService) return "Ada item service yang kekurangan field wajib (id/title/price).";
    const badPortfolio = payload.portfolio.find(p => !p.id || !p.title);
    if (badPortfolio) return "Ada item portfolio yang kekurangan field wajib (id/title).";
    return null;
  }

  function applyPayload(payload){
    saveServices(payload.services);
    savePortfolio(payload.portfolio);
    saveSettings(Object.assign({}, window.FixsData.settings, payload.settings));
  }

  function importData(jsonString){
    let payload;
    try{
      payload = JSON.parse(jsonString);
    }catch(e){
      return { success:false, message:"File bukan JSON yang valid." };
    }
    const error = validateImportPayload(payload);
    if (error){
      return { success:false, message:error };
    }
    applyPayload(payload);
    return { success:true, message:"Data berhasil diimpor." };
  }

  // Fetch js/fixsarts-data.json (if it exists) and use it as the
  // source of truth, overwriting whatever is currently cached in
  // localStorage. Returns true if a valid file was applied.
  async function loadFromDataFile(){
    try{
      const res = await fetch(DATA_FILE_URL, { cache: "no-store" });
      if (!res.ok) return false; // file not found (404) — that's fine, just use fallback
      const payload = await res.json();
      const error = validateImportPayload(payload);
      if (error){
        console.warn("StorageManager: fixsarts-data.json ditemukan tapi tidak valid —", error);
        return false;
      }
      applyPayload(payload);
      return true;
    }catch(e){
      // File missing, unreachable, or fetch blocked (e.g. opened via file://).
      return false;
    }
  }

  // Call once per page load, before reading any data (loadServices,
  // loadPortfolio, loadSettings). Safe to call from multiple files —
  // every call shares the same underlying fetch, so ordering doesn't matter.
  let readyPromise = null;
  function init(){
    if (!readyPromise){
      readyPromise = (async () => {
        seedDefaultsIfEmpty();
        await loadFromDataFile();
      })();
    }
    return readyPromise;
  }

  return {
    init,
    loadServices, saveServices,
    loadPortfolio, savePortfolio,
    loadSettings, saveSettings,
    loadCart, saveCart,
    getCategories,
    resetData, exportData, importData
  };
})();
