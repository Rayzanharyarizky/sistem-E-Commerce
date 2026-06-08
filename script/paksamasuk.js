const namaUser = sessionStorage.getItem("nama");
const usernameUser = sessionStorage.getItem("username");

if (!namaUser && !usernameUser) {
  alert("Harap login dulu.");
  window.location.replace("../index.html");
}

