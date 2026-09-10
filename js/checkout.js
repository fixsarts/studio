/**
 * FIXS.ARTS STUDIO — checkout.js
 * Powers checkout.html: order summary + form validation +
 * structured WhatsApp message generation.
 */

document.addEventListener("DOMContentLoaded", () => {
  const summaryRoot = document.getElementById("checkoutSummary");
  if (!summaryRoot) return;

  const form = document.getElementById("checkoutForm");
  const emptyState = document.getElementById("checkoutEmptyState");
  const items = Cart.getDetailedItems();

  if (items.length === 0){
    form.style.display = "none";
    summaryRoot.style.display = "none";
    emptyState.style.display = "block";
    return;
  }

  renderSummary(items);
  wireForm(items);

  function renderSummary(items){
    const total = items.reduce((s,i) => s + i.subtotal, 0);
    summaryRoot.innerHTML = `
      <h3>Ringkasan Pesanan</h3>
      ${items.map(item => `
        <div class="summary-row">
          <span>${Utils.escapeHtml(item.title)} (${Utils.escapeHtml(item.packageName)}) × ${item.qty}</span>
          <span>${Utils.formatCurrency(item.subtotal)}</span>
        </div>
      `).join("")}
      <div class="summary-row total"><span>Total</span><span>${Utils.formatCurrency(total)}</span></div>
    `;
  }

  function setFieldError(fieldId, message){
    const field = document.getElementById(fieldId).closest(".form-field");
    field.classList.toggle("error", Boolean(message));
    const errorEl = field.querySelector(".field-error");
    if (errorEl) errorEl.textContent = message || "";
  }

  function validate(data){
    let valid = true;
    if (!data.name.trim()){
      setFieldError("customerName", "Nama wajib diisi.");
      valid = false;
    } else setFieldError("customerName", "");

    const waDigits = data.whatsapp.replace(/\D/g,"");
    if (waDigits.length < 9){
      setFieldError("customerWhatsapp", "Nomor WhatsApp tidak valid.");
      valid = false;
    } else setFieldError("customerWhatsapp", "");

    if (!data.brief.trim()){
      setFieldError("customerBrief", "Ceritakan sedikit kebutuhan desain kamu.");
      valid = false;
    } else setFieldError("customerBrief", "");

    return valid;
  }

  function buildWhatsAppMessage(data, items){
    const settings = StorageManager.loadSettings();
    const total = items.reduce((s,i) => s + i.subtotal, 0);

    let lines = [];
    lines.push(`Halo ${settings.studioName} 👋`);
    lines.push("");
    lines.push("Saya ingin melakukan pemesanan:");
    lines.push("");
    items.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.title}`);
      lines.push(`Paket: ${item.packageName}`);
      lines.push(`Qty: ${item.qty}`);
      lines.push(`Harga: ${Utils.formatCurrency(item.subtotal)}`);
      lines.push("");
    });
    lines.push("--------------------------------");
    lines.push(`TOTAL: ${Utils.formatCurrency(total)}`);
    lines.push("--------------------------------");
    lines.push("");
    lines.push(`Nama: ${data.name}`);
    lines.push(`WhatsApp: ${data.whatsapp}`);
    if (data.email) lines.push(`Email: ${data.email}`);
    lines.push("");
    lines.push(`Brief: ${data.brief}`);
    if (data.notes) lines.push(`Catatan: ${data.notes}`);
    lines.push("");
    lines.push("Terima kasih.");

    return lines.join("\n");
  }

  function wireForm(items){
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById("customerName").value,
        whatsapp: document.getElementById("customerWhatsapp").value,
        email: document.getElementById("customerEmail").value,
        brief: document.getElementById("customerBrief").value,
        notes: document.getElementById("customerNotes").value
      };

      if (!validate(data)) return;

      const settings = StorageManager.loadSettings();
      const message = buildWhatsAppMessage(data, items);
      const url = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    });
  }
});
