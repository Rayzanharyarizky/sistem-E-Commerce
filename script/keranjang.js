const CART_KEY = "produk_cart";
const USD_TO_IDR = 16000;
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const clearCartButton = document.getElementById("clear-cart");
const checkoutButton = document.getElementById("checkout");

function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function formatRupiahFromUsd(usdValue) {
  const idrValue = Number(usdValue || 0) * USD_TO_IDR;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(idrValue);
}

function renderCart() {
  if (!cartItemsContainer || !cartTotal) return;

  const cart = readCart();
  if (cart.length === 0) {
    cartItemsContainer.innerHTML =
      "<p class='text-body'>Keranjang masih kosong.</p>";
    cartTotal.textContent = "Rp0";
    if (clearCartButton) clearCartButton.disabled = true;
    if (checkoutButton) checkoutButton.disabled = true;
    return;
  }

  const html = cart
    .map(
      (item) => `
        <article class="flex flex-wrap items-center justify-between gap-4 p-4 bg-neutral-primary border border-default rounded-base">
          <div class="flex items-center gap-4 min-w-0">
            <img src="${item.thumbnail}" alt="${item.title}" class="w-16 h-16 object-contain rounded-base bg-neutral-secondary-medium p-1" onerror="this.onerror=null;this.src='https://placehold.co/120x120?text=Motor';">
            <div class="min-w-0">
              <h2 class="font-semibold text-heading truncate">${item.title}</h2>
              <p class="text-sm text-body">Brand: ${item.brand || "-"}</p>
              <p class="text-sm text-body">Harga: ${formatRupiahFromUsd(item.price)} x <span class="font-medium">${item.qty}</span></p>
              <div class="mt-2 inline-flex items-center gap-2">
                <button type="button" data-decrease-id="${item.id}" class="inline-flex items-center px-2 py-1 text-sm border-default-medium bg-neutral-secondary-medium">−</button>
                <span class="px-3 py-1 bg-white/5 rounded-md text-sm">${item.qty}</span>
                <button type="button" data-increase-id="${item.id}" class="inline-flex items-center px-2 py-1 text-sm border-default-medium bg-neutral-secondary-medium">+</button>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <p class="font-semibold text-heading">${formatRupiahFromUsd(Number(item.price) * Number(item.qty))}</p>
            <button type="button" data-remove-id="${item.id}" class="inline-flex items-center text-sm px-3 py-2 rounded-base border border-default-medium bg-neutral-secondary-medium text-body hover:text-heading hover:bg-neutral-tertiary-medium">Hapus</button>
          </div>
        </article>
      `,
    )
    .join("");

  cartItemsContainer.innerHTML = html;
  const total = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0),
    0,
  );
  cartTotal.textContent = formatRupiahFromUsd(total);
  if (clearCartButton) clearCartButton.disabled = false;
  if (checkoutButton) checkoutButton.disabled = false;
}

cartItemsContainer?.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove-id]");
  if (removeButton) {
    const id = Number(removeButton.getAttribute("data-remove-id"));
    const nextCart = readCart().filter((item) => Number(item.id) !== id);
    writeCart(nextCart);
    renderCart();
    return;
  }

  const incButton = event.target.closest("[data-increase-id]");
  if (incButton) {
    const id = Number(incButton.getAttribute("data-increase-id"));
    const cart = readCart();
    const idx = cart.findIndex((i) => Number(i.id) === id);
    if (idx !== -1) {
      cart[idx].qty = Number(cart[idx].qty || 0) + 1;
      writeCart(cart);
      renderCart();
    }
    return;
  }

  const decButton = event.target.closest("[data-decrease-id]");
  if (decButton) {
    const id = Number(decButton.getAttribute("data-decrease-id"));
    const cart = readCart();
    const idx = cart.findIndex((i) => Number(i.id) === id);
    if (idx !== -1) {
      const current = Number(cart[idx].qty || 0);
      if (current <= 1) {
        const nextCart = cart.filter((i) => Number(i.id) !== id);
        writeCart(nextCart);
      } else {
        cart[idx].qty = current - 1;
        writeCart(cart);
      }
      renderCart();
    }
    return;
  }
});

clearCartButton?.addEventListener("click", () => {
  writeCart([]);
  renderCart();
});

checkoutButton?.addEventListener("click", () => {
  const cart = readCart();
  if (!cart || cart.length === 0) return;

  const productIds = cart.map((item) => item.id).join(", ");
  const total = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0),
    0,
  );

  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;

  const modal = document.createElement("div");
  modal.style.cssText = `
    background: white;
    padding: 24px;
    border-radius: 8px;
    max-width: 400px;
    width: 90%;
    color: #333;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  `;

  modal.innerHTML = `
    <h3 style="font-weight: bold; font-size: 1.25rem; margin-bottom: 12px;">Konfirmasi Pembayaran</h3>
    <p style="font-size: 0.875rem; margin-bottom: 8px;">ID Produk: <span style="font-weight: 600;">${productIds}</span></p>
    <p style="font-size: 0.875rem; margin-bottom: 16px;">Total Tagihan: <span style="font-weight: 600;">${formatRupiahFromUsd(total)}</span></p>
    <p style="font-size: 0.875rem; margin-bottom: 12px;">Pilih Metode Pembayaran:</p>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <button id="pay-cod" style="background: #4b5563; color: white; padding: 10px; border-radius: 4px; border: none; cursor: pointer;">COD (Bayar di Tempat)</button>
      <button id="pay-qris" style="background: #4b5563; color: white; padding: 10px; border-radius: 4px; border: none; cursor: pointer;">QRIS (Transfer Scan)</button>
      <button id="pay-cancel" style="background: transparent; color: #666; padding: 10px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; margin-top: 8px;">Batal</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const finishCheckout = (method, instruction) => {
    const now = new Date();
    const dateStr = now.toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "short",
    });

    document.body.removeChild(overlay);

    alert(
      `Checkout Berhasil!\nMetode: ${method}\nID Produk: ${productIds}\nWaktu: ${dateStr}\n\nInstruksi: ${instruction}`,
    );

    writeCart([]);
    renderCart();
  };

  document.getElementById("pay-cod")?.addEventListener("click", () => {
    finishCheckout(
      "COD",
      "Harap siapkan uang tunai saat kurir datang mengantarkan barang.",
    );
  });

  document.getElementById("pay-qris")?.addEventListener("click", () => {
    finishCheckout(
      "QRIS",
      "Silakan lakukan pembayaran melalui aplikasi e-wallet atau bank Anda dengan scan kode QR kami.",
    );
  });

  document.getElementById("pay-cancel")?.addEventListener("click", () => {
    document.body.removeChild(overlay);
  });
});

renderCart();
