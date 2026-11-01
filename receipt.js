// Thermal Receipt Generator and Print Controller for Samovar.digital

export function formatCurrency(amount) {
  return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
}

export function generateReceiptHTML(order) {
  const dateObj = new Date(order.timestamp || Date.now());
  const formattedDate = dateObj.toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const formattedTime = dateObj.toLocaleTimeString('uz-UZ', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const subtotal = order.subtotal || order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const serviceFee = order.serviceFee || Math.round(subtotal * 0.1);
  const grandTotal = order.total || (subtotal + serviceFee);

  const itemsRows = order.items.map(item => `
    <tr>
      <td class="receipt-item-name-cell">
        ${item.name}
        <div class="receipt-item-formula">${item.quantity} x ${formatCurrency(item.price)}</div>
      </td>
      <td class="num-col receipt-item-total">
        ${formatCurrency(item.price * item.quantity)}
      </td>
    </tr>
  `).join('');

  return `
    <div class="thermal-receipt-paper" id="thermal-receipt-print-area">
      <div class="receipt-serrated-top"></div>
      
      <!-- Teahouse Header -->
      <div class="receipt-header-center">
        <img src="assets/images/logo.jpg" alt="Samovar Logo" class="receipt-logo-emblem">
        <div class="receipt-brand-title">SAMOVAR.DIGITAL</div>
        <div class="receipt-subtitle">CHOYXONA & MILLIY TAOMLAR</div>
        <div class="receipt-fiscal-badge">*** FISKAL CHEK ***</div>
        <div class="receipt-address-info">
          Toshkent sh., Choyxona ko'chasi 12<br>
          STIR / INN: 308 941 203 | Kassa № 01<br>
          Tel: +998 (71) 200-88-00
        </div>
      </div>

      <hr class="receipt-dashed-line">

      <!-- Metadata -->
      <div class="receipt-meta-grid">
        <div class="receipt-meta-row">
          <span class="receipt-meta-label">CHEK №:</span>
          <span class="receipt-meta-val">${order.id}</span>
        </div>
        <div class="receipt-meta-row">
          <span class="receipt-meta-label">STOL / MEHMONLAR:</span>
          <span class="receipt-meta-val" style="font-size: 0.95rem;">${order.table} (${order.guestCount ? order.guestCount + ' kishi' : '2 kishi'})</span>
        </div>
        <div class="receipt-meta-row">
          <span class="receipt-meta-label">SANA VA VAQT:</span>
          <span class="receipt-meta-val">${formattedDate} ${formattedTime}</span>
        </div>
        <div class="receipt-meta-row">
          <span class="receipt-meta-label">OFITSIANT / KASSIR:</span>
          <span class="receipt-meta-val">${order.waiter || 'Oktamboyev Ozodbek (Kassa #1)'}</span>
        </div>
        <div class="receipt-meta-row">
          <span class="receipt-meta-label">TO'LOV TURI:</span>
          <span class="receipt-meta-val">${order.paymentMethod || 'Karta / Payme'}</span>
        </div>
      </div>

      <hr class="receipt-dashed-line">

      <!-- Products Table -->
      <table class="receipt-items-table">
        <thead>
          <tr>
            <th>TAOM / MIQDOR</th>
            <th class="num-col">QIYMATI</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <hr class="receipt-dashed-line">

      <!-- Totals & Taxes -->
      <div class="receipt-totals-block">
        <div class="receipt-total-row">
          <span>ORALIQ JAMI (TAOMLAR):</span>
          <span>${formatCurrency(subtotal)}</span>
        </div>
        <div class="receipt-total-row">
          <span>XIZMAT HAQI (10%):</span>
          <span>${formatCurrency(serviceFee)}</span>
        </div>
        <div class="receipt-total-row">
          <span>QQS (0%):</span>
          <span>0 so'm</span>
        </div>
        <div class="receipt-grand-total">
          <span>JAMI TO'LOV:</span>
          <span>${formatCurrency(grandTotal)}</span>
        </div>
      </div>

      <!-- Notes if any -->
      ${order.notes ? `
        <div style="font-size: 0.7rem; margin-top: 8px; font-style: italic; color: #444;">
          * Izoh: ${order.notes}
        </div>
      ` : ''}

      <!-- QR Code & Barcode -->
      <div class="receipt-footer-center">
        <div class="receipt-barcode-box"></div>
        <div class="receipt-qr-box">
          <svg viewBox="0 0 100 100" fill="#000">
            <!-- Simulated Authentic Thermal QR Pattern -->
            <rect x="5" y="5" width="28" height="28" fill="none" stroke="#000" stroke-width="4"/>
            <rect x="11" y="11" width="16" height="16" fill="#000"/>
            <rect x="67" y="5" width="28" height="28" fill="none" stroke="#000" stroke-width="4"/>
            <rect x="73" y="11" width="16" height="16" fill="#000"/>
            <rect x="5" y="67" width="28" height="28" fill="none" stroke="#000" stroke-width="4"/>
            <rect x="11" y="73" width="16" height="16" fill="#000"/>
            <rect x="42" y="12" width="6" height="16" fill="#000"/>
            <rect x="52" y="8" width="8" height="8" fill="#000"/>
            <rect x="40" y="38" width="20" height="6" fill="#000"/>
            <rect x="15" y="44" width="12" height="6" fill="#000"/>
            <rect x="68" y="42" width="14" height="10" fill="#000"/>
            <rect x="42" y="56" width="16" height="16" fill="#000"/>
            <rect x="68" y="68" width="12" height="12" fill="#000"/>
            <rect x="84" y="60" width="8" height="18" fill="#000"/>
          </svg>
        </div>
        <div class="receipt-thank-msg">TASHRIFINGIZ UCHUN RAHMAT!</div>
        <div class="receipt-software-tag">SAMOVAR.DIGITAL POS SYSTEM • FISKAL BELGI: F-892410</div>
      </div>

      <div class="receipt-serrated-bottom"></div>
    </div>
  `;
}

export function openThermalReceiptModal(order) {
  const modal = document.getElementById('thermal-receipt-modal');
  const container = document.getElementById('thermal-receipt-content');
  if (!modal || !container) return;

  container.innerHTML = generateReceiptHTML(order);
  modal.classList.add('active');

  // Wire up print button in modal
  const printBtn = document.getElementById('btn-do-print-receipt');
  if (printBtn) {
    printBtn.onclick = () => {
      window.print();
    };
  }
}

export function closeThermalReceiptModal() {
  const modal = document.getElementById('thermal-receipt-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}
