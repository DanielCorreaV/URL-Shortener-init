const API_BASE_URL = "https://jguawzn6ka.execute-api.us-east-1.amazonaws.com";

let authMode = "login";
let loadedAssets = [];
let selectedCode = null;

document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  checkSession();
});

function checkSession() {
  const token = localStorage.getItem("shrtn_token");
  const username = localStorage.getItem("shrtn_username");

  if (token && username) {
    document.getElementById("authContainer").classList.add("hidden");
    document.getElementById("userProfileName").innerText = username;
    document.getElementById("userAvatar").innerText = username
      .substring(0, 2)
      .toUpperCase();
    fetchUserAssets();
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
      document.getElementById("authForm").reset();
      checkSession();
    } else {
      alert("¡Usuario registrado con éxito! Ya puedes iniciar sesión.");
      switchAuthMode("login");
    }
  } catch (err) {
    alertText.innerText = err.message;
    alertBox.classList.remove("hidden");
  }
}

async function fetchUserAssets() {
  const container = document.getElementById("userLinksSidebar");
  container.innerHTML = `<div class="text-center py-6 text-xs text-slate-400 flex flex-col gap-2 justify-center items-center"><div class="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>Sincronizando la nube...</div>`;

  try {
    const response = await fetch(`${API_BASE_URL}/stats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("shrtn_token")}`,
      },
    });
    if (!response.ok) throw new Error();
    loadedAssets = await response.json();
    renderSidebarLinks();
  } catch (error) {
    container.innerHTML = `<div class="text-center py-6 text-xs text-red-500 font-medium px-2">⚠️ Error de enlace en la API.</div>`;
  }
}

function renderSidebarLinks() {
  const container = document.getElementById("userLinksSidebar");
  container.innerHTML = "";

  if (!loadedAssets || loadedAssets.length === 0) {
    container.innerHTML = `<div class="text-center py-6 text-xs text-slate-400 italic px-2">No tienes códigos generados.</div>`;
    return;
  }

  loadedAssets.forEach((asset) => {
    const button = document.createElement("button");
    button.className = `sidebar-link-btn w-full text-left p-3 rounded-xl border border-transparent hover:bg-slate-50 flex items-center justify-between gap-3 text-slate-700 font-medium text-sm transition-all`;
    button.id = `btn-${asset.code}`;
    button.onclick = () => selectAsset(asset.code);
    button.innerHTML = `
            <div class="truncate">
                <p class="font-semibold text-slate-800 font-mono">/${asset.code}</p>
                <p class="text-[11px] text-slate-400 truncate mt-0.5">${asset.long_url.replace(/https?:\/\//, "")}</p>
            </div>
            <span class="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200/50 shrink-0">${asset.total_clicks}</span>
        `;
    container.appendChild(button);
  });
  lucide.createIcons();

  if (selectedCode) {
    const activeBtn = document.getElementById(`btn-${selectedCode}`);
    if (activeBtn) activeBtn.classList.add("active");
  }
}

async function handleCreateLink(e) {
  e.preventDefault();
  const longUrlField = document.getElementById("longUrlInput");
  const longUrl = longUrlField.value.trim();

  try {
    const response = await fetch(`${API_BASE_URL}/shorten`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("shrtn_token")}`,
      },
      body: JSON.stringify({ long_url: longUrl }),
    });

    if (!response.ok) throw new Error();

    longUrlField.value = "";
    await fetchUserAssets();
    alert("¡Enlace mapeado con éxito!");
  } catch (err) {
    alert("Error al acortar la URL.");
  }
}

async function selectAsset(code) {
  const summary = loadedAssets.find((i) => i.code === code);
  if (!summary) return;

  if (selectedCode) {
    const prev = document.getElementById(`btn-${selectedCode}`);
    if (prev) prev.classList.remove("active");
  }
  selectedCode = code;
  document.getElementById(`btn-${code}`).classList.add("active");

  document.getElementById("emptyState").classList.add("hidden");
  document.getElementById("analyticsContent").classList.remove("hidden");

  document.getElementById("displayShortCode").innerText = `/${summary.code}`;
  document.getElementById("displayLongUrl").innerText = summary.long_url;
  document.getElementById("kpiTotalClicks").innerText = summary.total_clicks;

  const logsContainer = document.getElementById("liveLogsContainer");
  logsContainer.innerHTML = `<div class="p-4 text-xs text-slate-400 text-center animate-pulse">Descargando logs de DynamoDB...</div>`;

  try {
    const response = await fetch(`${API_BASE_URL}/stats/${code}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("shrtn_token")}`,
      },
    });
    const detailed = await response.json();

    logsContainer.innerHTML = "";
    if (!detailed.visit_history || detailed.visit_history.length === 0) {
      logsContainer.innerHTML = `<div class="p-6 text-slate-400 text-xs text-center italic">No hay clics registrados.</div>`;
    } else {
      [...detailed.visit_history].reverse().forEach((ts) => {
        const row = document.createElement("div");
        row.className =
          "px-6 py-3.5 flex justify-between items-center text-xs font-medium hover:bg-slate-50/50 transition-colors";
        row.innerHTML = `
                    <div class="flex items-center gap-2">
                        <div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                        <span class="text-slate-700 font-mono">GET_DECODE_REQUEST</span>
                    </div>
                    <span class="text-slate-400 font-mono text-[11px]">${new Date(ts).toLocaleString()}</span>
                `;
        logsContainer.appendChild(row);
      });
    }
  } catch (err) {
    logsContainer.innerHTML = `<div class="p-4 text-xs text-red-500 text-center">Error al leer métricas.</div>`;
  }
}

function copyCurrentShortUrl() {
  if (!selectedCode) return;
  const targetUrl = `${API_BASE_URL}/r/${selectedCode}`;
  navigator.clipboard
    .writeText(targetUrl)
    .then(() => alert("¡Enlace corto copiado al portapapeles con éxito!"));
}

function logout() {
  localStorage.clear();
  window.location.reload();
}
