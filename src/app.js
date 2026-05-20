const API_BASE_URL = "https://jguawzn6ka.execute-api.us-east-1.amazonaws.com";
const SHORTEN_FRONTEND_URL = "https://de7c8fkkejed4.cloudfront.net";

let authMode = "login";

document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
});

function checkSession() {
  const token = localStorage.getItem("shrtn_token");
  const username = localStorage.getItem("shrtn_username");

  if (token && username) {
    redirectToDashboard(token, username);
  }
}

function switchAuthMode(mode) {
  authMode = mode;
  const isLogin = mode === "login";

  document.getElementById("tabLogin").className = isLogin
    ? "py-2 text-xs font-semibold rounded-lg bg-white text-slate-800 shadow-sm transition-all"
    : "py-2 text-xs font-medium rounded-lg text-slate-500 hover:text-slate-800 transition-all";
  document.getElementById("tabRegister").className = !isLogin
    ? "py-2 text-xs font-semibold rounded-lg bg-white text-slate-800 shadow-sm transition-all"
    : "py-2 text-xs font-medium rounded-lg text-slate-500 hover:text-slate-800 transition-all";
  document.getElementById("btnAuthSubmit").querySelector("span").innerText =
    isLogin ? "Iniciar Sesión" : "Registrar Cuenta";
  document.getElementById("authAlert").classList.add("hidden");
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const username = document.getElementById("authUsername").value.trim();
  const password = document.getElementById("authPassword").value;
  const alertBox = document.getElementById("authAlert");
  const alertText = document.getElementById("authAlertText");

  alertBox.classList.add("hidden");

  try {
    const endpoint = authMode === "login" ? "/login" : "/register";
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Error al procesar credenciales");

    if (authMode === "login") {
      localStorage.setItem("shrtn_token", data.token);
      localStorage.setItem("shrtn_username", data.username);

      redirectToDashboard(data.token, data.username);
    } else {
      alert("¡Usuario registrado con éxito! Ya puedes iniciar sesión.");
      switchAuthMode("login");
    }
  } catch (err) {
    alertText.innerText = err.message;
    alertBox.classList.remove("hidden");
  }
}

function redirectToDashboard(token, username) {
  const secureToken = encodeURIComponent(token);
  const secureUser = encodeURIComponent(username);
  window.location.href = `${SHORTEN_FRONTEND_URL}?token=${secureToken}&username=${secureUser}`;
}
