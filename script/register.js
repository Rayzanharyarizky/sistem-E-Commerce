function setMessage(el, msg, type = "info") {
  if (!el) return;
  el.textContent = msg;
  el.className = "mt-4 text-center text-sm";
  if (type === "error") el.classList.add("text-rose-600");
  else if (type === "success") el.classList.add("text-emerald-600");
  else el.classList.add("text-slate-600");
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const hasil = document.getElementById("registerHasil");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nama = document.getElementById("nama").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const password2 = document.getElementById("password2").value;

    if (!nama || !username || !password || !password2) {
      setMessage(hasil, "Semua field wajib diisi.", "error");
      return;
    }

    if (password.length < 6) {
      setMessage(hasil, "Password minimal 6 karakter.", "error");
      return;
    }

    if (password !== password2) {
      setMessage(hasil, "Konfirmasi password tidak cocok.", "error");
      return;
    }

    try {
      const raw = localStorage.getItem("Dataakun");
      const daftar = Array.isArray(JSON.parse(raw || "[]"))
        ? JSON.parse(raw || "[]")
        : [];
      const found = daftar.find((u) => String(u.username).trim() === username);
      if (found) {
        setMessage(hasil, "Username sudah dipakai, pilih lain.", "error");
        return;
      }

      daftar.push({ nama, username, password });
      localStorage.setItem("Dataakun", JSON.stringify(daftar));
      setMessage(
        hasil,
        "Registrasi berhasil. Mengalihkan ke halaman masuk...",
        "success",
      );

      setTimeout(() => {
        window.location.href = "./login.html";
      }, 800);
    } catch (err) {
      console.error("Gagal menyimpan akun", err);
      setMessage(hasil, "Gagal menyimpan data pendaftaran.", "error");
    }
  });
});
