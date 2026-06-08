let User = [];
let dataSiap = false;

function setLoginMessage(hasilElement, message, type = "info") {
  if (!hasilElement) return;

  hasilElement.textContent = message;
  hasilElement.className = "mt-4 text-center text-sm";

  if (type === "error") {
    hasilElement.classList.add("text-rose-600");
    return;
  }

  if (type === "success") {
    hasilElement.classList.add("text-emerald-600");
    return;
  }

  hasilElement.classList.add("text-slate-600");
}

function memuatUser() {
  try {
    const raw = localStorage.getItem("Dataakun");
    if (raw) {
      const parsed = JSON.parse(raw);
      User = Array.isArray(parsed) ? parsed : [];
    } else {
      // Default account jika belum ada data
      User = [{ nama: "Pelanggan", username: "admin", password: "12345" }];
      localStorage.setItem("Dataakun", JSON.stringify(User));
    }
    dataSiap = true;
  } catch (error) {
    console.error("Terjadi kesalahan saat memuat akun:", error);
    dataSiap = false;
    const hasil = document.getElementById("hasil");
    if (hasil) setLoginMessage(hasil, "Data login gagal dimuat.", "error");
  }
}

function handleLogin() {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const hasil = document.getElementById("hasil");

  if (!usernameInput || !passwordInput || !hasil) return;

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!dataSiap) {
    setLoginMessage(hasil, "Data login masih dimuat, coba lagi.", "error");
    return;
  }

  if (!username || !password) {
    setLoginMessage(hasil, "Username dan password wajib diisi.", "error");
    return;
  }

  const userLogin = User.find(
    (u) =>
      String(u.username).trim() === username &&
      String(u.password).trim() === password,
  );

  if (userLogin) {
    sessionStorage.setItem("nama", userLogin.nama);
    sessionStorage.setItem("username", userLogin.username);
    setLoginMessage(hasil, "Login berhasil!", "success");
    setTimeout(() => {
      window.location.href = "./produk.html";
    }, 500);
  } else {
    setLoginMessage(
      hasil,
      "Login gagal! Username atau password salah.",
      "error",
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  memuatUser();
  const loginForm = document.getElementById("loginForm");
  if (loginForm)
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      handleLogin();
    });
});

window.handleLogin = handleLogin;
