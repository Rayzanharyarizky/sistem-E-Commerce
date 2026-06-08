const CART_KEY = "motorcycle_cart";
const USD_TO_IDR = 16000;
const detailContainer = document.getElementById("detail-container");
const cartLink = document.getElementById("cart-link");
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

function formatRupiahFromUsd(usdValue) {
  const idrValue = Number(usdValue || 0) * USD_TO_IDR;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(idrValue);
}

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

function updateCartLinkCount() {
  if (!cartLink) return;
  const count = readCart().reduce(
    (total, item) => total + Number(item.qty || 0),
    0,
  );
  cartLink.textContent = count > 0 ? `Keranjang (${count})` : "Keranjang";
}

function addToCart(product) {
  const cart = readCart();
  const existing = cart.find((item) => Number(item.id) === Number(product.id));

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnail: product.image || product.thumbnail,
      brand: product.brand || "-",
      qty: 1,
    });
  }

  writeCart(cart);
  updateCartLinkCount();
  alert(`${product.title} ditambahkan ke keranjang.`);
}

function renderError(message) {
  if (!detailContainer) return;
  detailContainer.innerHTML = `<p class="text-body">${message}</p>`;
}

function renderDetail(product) {
  if (!detailContainer) return;

  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image || product.thumbnail];

  const imageList = images
    .map(
      (image, index) => `
        <div class="h-24 flex items-center justify-center rounded-base border border-default-medium bg-neutral-secondary overflow-hidden">
          <img
            src="${image}"
            alt="${product.title} ${index + 1}"
            class="max-h-full max-w-full object-contain"
            onerror="this.onerror=null;this.src='https://placehold.co/320x200?text=Image';"
          />
        </div>
      `,
    )
    .join("");

  const discountedPrice =
    Number(product.price) * (1 - Number(product.discountPercentage || 0) / 100);

  detailContainer.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <div class="h-72 flex items-center justify-center rounded-base border border-default-medium bg-blue-300 p-4 mb-4 overflow-hidden">
          <img
            src="${product.image || product.thumbnail}"
            alt="${product.title}"
            class="max-h-full max-w-full object-contain"
            onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=Image';"
          />
        </div>
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-3">
          ${imageList}
        </div>
      </div>

      <div class="flex flex-col">
        <h2 class="text-2xl md:text-3xl font-bold text-heading mb-2">${product.title}</h2>
        <p class="text-body mb-4">${product.description}</p>

        <div class="space-y-2 text-sm text-body mb-6">
          <p><span class="font-semibold text-heading">Brand:</span> ${product.brand || "-"}</p>
          <p><span class="font-semibold text-heading">Kategori:</span> ${product.category || "-"}</p>
          <p><span class="font-semibold text-heading">Stok:</span> ${product.stock ?? "-"}</p>
          <p><span class="font-semibold text-heading">Rating:</span> ${product.rating ?? "-"}</p>
        </div>

        <div class="bg-neutral-primary border border-default rounded-base p-4 mb-6">
          <p class="text-sm text-body line-through">Harga awal: ${formatRupiahFromUsd(product.price)}</p>
          <p class="text-xl font-bold text-heading">Harga diskon: ${formatRupiahFromUsd(discountedPrice)}</p>
          <p class="text-sm text-body">Diskon: ${Number(product.discountPercentage || 0).toFixed(2)}%</p>
        </div>

        <div class="flex flex-wrap gap-3">
          <button id="add-cart-btn" type="button" class="inline-flex items-center text-white bg-gray-500 hover:bg-gray-600 transition focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
            Tambah ke Keranjang
          </button>
          <a href="./keranjang.html" class="inline-flex items-center text-body bg-neutral-secondary-medium border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
            Lihat Keranjang
          </a>
        </div>
      </div>
    </div>
  `;

  const addButton = document.getElementById("add-cart-btn");
  addButton?.addEventListener("click", () => addToCart(product));
}

if (!productId) {
  renderError("ID produk tidak ditemukan di URL.");
} else {
  fetch(`https://fakestoreapi.com/products/${productId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then((product) => {
      renderDetail(product);
    })
    .catch((error) => {
      renderError(`Gagal mengambil detail produk: ${error.message}.`);
      console.error(error);
    });
}

updateCartLinkCount();
