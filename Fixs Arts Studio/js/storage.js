/**
 * FIXS.ARTS STUDIO — storage.js
 * ---------------------------------------------------------
 * The ONLY module allowed to touch localStorage directly.
 * Every other file (public pages + admin) must go through
 * StorageManager. This keeps the app ready for a future
 * swap to a real backend (REST API / Supabase / Firebase):
 * you would only need to rewrite the functions in this file.
 *
 * NOTE ON STATIC LIMITATIONS:
 * This is browser-local storage. It is NOT a shared, secure,
 * multi-user database. Data lives only in the current browser.
 * See README.md for details.
 * ---------------------------------------------------------
 */

const STORAGE_KEYS = {
  services: "fixsarts_services",
  portfolio: "fixsarts_portfolio",
  settings: "fixsarts_settings",
  cart: "fixsarts_cart"
};

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

  function init(){
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
    // merge with defaults so newly-added settings fields don't break older saved data
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
    saveServices(payload.services);
    savePortfolio(payload.portfolio);
    saveSettings(Object.assign({}, window.FixsData.settings, payload.settings));
    return { success:true, message:"Data berhasil diimpor." };
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
