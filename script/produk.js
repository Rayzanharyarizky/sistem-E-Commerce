const api = "https://fakestoreapi.com/products";
const CART_KEY = "Produk_cart";
const USD_TO_IDR = 16000;
const container = document.getElementById("container");
const popularContainer = document.getElementById("popular");
const searchInputs = Array.from(
  document.querySelectorAll("[data-product-search]"),
);
const cartLink = document.getElementById("cart-link");
const welcomeUser = document.getElementById("welcome-user");
const logoutLink = document.getElementById("logout-link");
const accountButton = document.getElementById("account-button");
const dropdownAvatar = document.getElementById("dropdownAvatarName");
const accountNameElem = document.getElementById("account-name");
const accountAvatarImg = document.getElementById("account-avatar");
let Produk = [];

function isLoggedIn() {
  const nama = sessionStorage.getItem("nama");
  const username = sessionStorage.getItem("username");
  return Boolean(nama || username);
}

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

function addToCart(productId) {
  if (!isLoggedIn()) {
    alert("Harap login dulu.");
    const prefix = window.location.pathname.includes("/view/")
      ? "./"
      : "./view/";
    window.location.href = prefix + "login.html";
    return;
  }

  const product = motorcycles.find(
    (item) => Number(item.id) === Number(productId),
  );
  if (!product) return;

  const cart = readCart();
  const existing = cart.find((item) => Number(item.id) === Number(product.id));

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail,
      brand: product.brand || "-",
      qty: 1,
    });
  }

  writeCart(cart);
  updateCartLinkCount();
  alert(`${product.title} ditambahkan ke keranjang.`);
}

function updateWelcomeUser() {
  if (!welcomeUser) return;
  const nama = sessionStorage.getItem("nama");
  const username = sessionStorage.getItem("username");
  welcomeUser.textContent = nama || username || "User";
}

function updateAccountName() {
  const nama = sessionStorage.getItem("nama");
  const username = sessionStorage.getItem("username");
  const display = nama || username || "User";
  if (accountNameElem) accountNameElem.textContent = display;
  if (accountAvatarImg) {
    const avatar = sessionStorage.getItem("avatar") || "../gambar/alya.jpeg";
    accountAvatarImg.src = avatar;
    accountAvatarImg.alt = display;
  }
}

function handleLogout() {
  sessionStorage.removeItem("nama");
  sessionStorage.removeItem("username");
  window.location.replace("../index.html");
}

function renderProducts(products, keyword = "") {
  if (!container) return;

  if (products.length === 0) {
    container.className =
      "bg-neutral-secondary-medium border border-default rounded-base p-6";
    container.innerHTML = keyword
      ? `<p class="text-body">Produk dengan kata kunci "<strong>${keyword}</strong>" tidak ditemukan.</p>`
      : "<p class='text-body'>Data PRoduk tidak di temukan</p>";
    return;
  }

  const hasil = products
    .map(
      (element) => `  
          <article class="flex flex-col h-full overflow-hidden bg-stone-400  rounded-base shadow-xs">
            <div class="h-48 flex items-center justify-center bg-stone-400 p-3">
              <img
                class="max-h-full max-w-full object-contain"
                src="${element.thumbnail}"
                alt="${element.title}"
                onerror="this.onerror=null;this.src='https://placehold.co/320x200?text=Motor';"
              />
            </div>
          <div class="flex flex-1 flex-col justify-between p-4 md:p-5 leading-normal overflow-hidden">
            <div>
              <h5 class="mb-2 text-lg md:text-xl font-bold tracking-tight text-heading">${element.title}</h5>
              <p class="mb-4 text-sm text-body">${element.description}</p>
              <p class="mb-5 text-sm text-body">Brand: ${element.brand || "-"} | Harga: ${formatRupiahFromUsd(element.price)}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <a href="${window.location.pathname.includes("/view/") ? "./Detail.html" : "./view/Detail.html"}?id=${element.id}" 
                 class="inline-flex items-center w-auto text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
                Detail Produk
                <svg class="w-4 h-4 ms-1.5 rtl:rotate-180 -me-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m14 0-4 4m4-4-4-4"/></svg>
              </a>
              <button type="button" data-add-cart="${element.id}" class="inline-flex items-center w-auto text-white bg-gray-500 hover:bg-gray-600 transition focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
                Tambah ke Keranjang
              </button>
            </div>
          </div>
        </article>
      `,
    )
    .join("");

  container.innerHTML = hasil;
  container.className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5";
}

function renderPopular(products) {
  if (!popularContainer) return;
  const top = products.slice(0, 3);
  const html = top
    .map(
      (p) => `
      <article class="flex flex-col h-full overflow-hidden bg-stone-400 rounded-base shadow-xs">
        <div class="h-40 flex items-center justify-center bg-stone-400 p-3">
          <img class="max-h-full max-w-full object-contain" src="${p.thumbnail}" alt="${p.title}" onerror="this.onerror=null;this.src='https://placehold.co/320x200?text=Product';" />
        </div>
        <div class="flex flex-1 flex-col justify-between p-4 md:p-5 leading-normal overflow-hidden">
          <div>
            <h5 class="mb-2 text-lg font-bold tracking-tight text-heading">${p.title}</h5>
            <p class="mb-3 text-sm text-body">${p.description?.slice(0, 100) || ""}</p>
            <p class="text-sm text-body font-semibold">${formatRupiahFromUsd(p.price)}</p>
          </div>
          <div class="flex gap-2 mt-3">
            <a href="${window.location.pathname.includes("/view/") ? "./Detail.html" : "./view/Detail.html"}?id=${p.id}" 
               class="inline-flex items-center w-auto text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
                Detail Produk
                <svg class="w-4 h-4 ms-1.5 rtl:rotate-180 -me-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m14 0-4 4m4-4-4-4"/></svg>
              </a>
            <button type="button" data-add-cart="${p.id}" class="inline-flex items-center w-auto text-white bg-gray-500 hover:bg-gray-600 transition focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
                Tambah ke Keranjang
            </button>
          </div>
        </div>
      </article>
    `,
    )
    .join("");

  popularContainer.innerHTML = html;
}

function filterProducts(keyword) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  const filtered = motorcycles.filter((product) => {
    const title = String(product.title || "").toLowerCase();
    const brand = String(product.brand || "").toLowerCase();
    const description = String(product.description || "").toLowerCase();
    return (
      title.includes(normalizedKeyword) ||
      brand.includes(normalizedKeyword) ||
      description.includes(normalizedKeyword)
    );
  });
  renderProducts(filtered, keyword.trim());
}

searchInputs.forEach((input) => {
  input.addEventListener("input", (event) => {
    const value = event.target.value;
    searchInputs.forEach((otherInput) => {
      if (otherInput !== event.target) {
        otherInput.value = value;
      }
    });
    filterProducts(value);
  });
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-cart]");
  if (!button) return;
  addToCart(button.getAttribute("data-add-cart"));
});

fetch(api)
  .then((respon) => {
    if (!respon.ok) {
      throw new Error(`HTTP ${respon.status}`);
    }
    return respon.json();
  })
  .then((data) => {
    const productsArray = Array.isArray(data)
      ? data
      : Array.isArray(data.products)
        ? data.products
        : [];

    motorcycles = productsArray.map((item) => ({
      id: item.id,
      title: item.title || item.name || "-",
      price: item.price || 0,
      description: item.description || item.body || "",
      thumbnail:
        item.image ||
        item.thumbnail ||
        "https://placehold.co/320x200?text=Motor",
      brand: item.category || item.brand || "-",
    }));

    renderProducts(motorcycles);
    renderPopular(motorcycles);
  })
  .catch((error) => {
    if (!container) return;
    container.className =
      "bg-neutral-secondary-medium border border-default rounded-base p-6";
    container.innerHTML = `<p class="text-body">Gagal mengambil data Produk: ${error.message}.</p>`;
    console.error(error);
  });

updateCartLinkCount();
updateWelcomeUser();
updateAccountName();

logoutLink?.addEventListener("click", (event) => {
  event.preventDefault();
  handleLogout();
});

accountButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  if (!dropdownAvatar) return;
  dropdownAvatar.classList.toggle("hidden");
});

document.addEventListener("click", () => {
  if (!dropdownAvatar) return;
  if (!dropdownAvatar.classList.contains("hidden"))
    dropdownAvatar.classList.add("hidden");
});
