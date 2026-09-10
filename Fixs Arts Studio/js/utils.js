/**
 * FIXS.ARTS STUDIO — utils.js
 * Small, dependency-free helper functions shared across pages.
 * No DOM side effects except showToast() and modal helpers.
 */

const Utils = (function(){

  function formatCurrency(amount, symbol){
    const sym = symbol || (window.StorageManager ? StorageManager.loadSettings().currencySymbol : "Rp");
    const n = Number(amount) || 0;
    return sym + n.toLocaleString("id-ID");
  }

  function generateId(prefix){
    const rand = Math.random().toString(36).slice(2,8);
    const time = Date.now().toString(36).slice(-4);
    return (prefix ? prefix + "-" : "") + time + rand;
  }

  function getQueryParam(name){
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function debounce(fn, delay){
    let timer = null;
    return function(...args){
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay || 250);
    };
  }

  function qs(selector, scope){ return (scope || document).querySelector(selector); }
  function qsa(selector, scope){ return Array.from((scope || document).querySelectorAll(selector)); }

  function escapeHtml(str){
    if (str === undefined || str === null) return "";
    return String(str)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function showToast(message, duration){
    let toast = document.getElementById("globalToast");
    if (!toast){
      toast = document.createElement("div");
      toast.id = "globalToast";
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => toast.classList.remove("show"), duration || 2400);
  }

  // Generic confirm modal. Returns a Promise<boolean>.
  function confirmModal({ title, message, confirmLabel, cancelLabel }){
    return new Promise((resolve) => {
      let overlay = document.getElementById("confirmOverlay");
      if (!overlay){
        overlay = document.createElement("div");
        overlay.id = "confirmOverlay";
        overlay.className = "modal-overlay";
        overlay.innerHTML = `
          <div class="modal-box">
            <h3 id="confirmTitle"></h3>
            <p id="confirmMessage"></p>
            <div class="modal-actions">
              <button class="btn btn-outline btn-sm" id="confirmCancelBtn"></button>
              <button class="btn btn-primary btn-sm" id="confirmOkBtn"></button>
            </div>
          </div>`;
        document.body.appendChild(overlay);
      }
      overlay.querySelector("#confirmTitle").textContent = title || "Konfirmasi";
      overlay.querySelector("#confirmMessage").textContent = message || "Apakah kamu yakin?";
      overlay.querySelector("#confirmCancelBtn").textContent = cancelLabel || "Batal";
      overlay.querySelector("#confirmOkBtn").textContent = confirmLabel || "Ya, lanjutkan";
      overlay.classList.add("open");

      function cleanup(result){
        overlay.classList.remove("open");
        okBtn.removeEventListener("click", onOk);
        cancelBtn.removeEventListener("click", onCancel);
        resolve(result);
      }
      const okBtn = overlay.querySelector("#confirmOkBtn");
      const cancelBtn = overlay.querySelector("#confirmCancelBtn");
      function onOk(){ cleanup(true); }
      function onCancel(){ cleanup(false); }
      okBtn.addEventListener("click", onOk);
      cancelBtn.addEventListener("click", onCancel);
    });
  }

  function readFileAsDataURL(file){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return {
    formatCurrency, generateId, getQueryParam, debounce,
    qs, qsa, escapeHtml, showToast, confirmModal, readFileAsDataURL
  };
})();
