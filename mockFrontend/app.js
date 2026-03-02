const API_BASE = "/api/v1";

function setToken(token) {
  localStorage.setItem("token", token);
}

function getToken() {
  return localStorage.getItem("token");
}

function showSection(id) {
  document.querySelectorAll("#auth-container form, #providers-container, #booking-container").forEach(el => el.classList.add("hidden"));
  const el = document.getElementById(id);
  if (el) el.classList.remove("hidden");
}

async function fetchJSON(url, options = {}) {
  const token = getToken();
  const headers = options.headers || {};
  headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  options.headers = headers;
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || res.statusText);
  }
  return res.json();
}

// auth
async function login(data) {
  return fetchJSON(`${API_BASE}/auth/login`, { method: "POST", body: JSON.stringify(data) });
}

async function register(data) {
  return fetchJSON(`${API_BASE}/auth/register`, { method: "POST", body: JSON.stringify(data) });
}

async function loadProviders() {
  const list = document.getElementById("providers-list");
  list.innerHTML = "";
  const providers = await fetchJSON(`${API_BASE}/providers`);
  providers.forEach(p => {
    const li = document.createElement("li");
    li.textContent = `${p.name} (${p.address})`;
    list.appendChild(li);
  });
  // also populate select for booking
  const sel = document.getElementById("provider-select");
  sel.innerHTML = "";
  providers.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p._id;
    opt.textContent = p.name;
    sel.appendChild(opt);
  });
}

async function createBooking(providerId, date) {
  return fetchJSON(`${API_BASE}/providers/${providerId}/bookings`, {
    method: "POST",
    body: JSON.stringify({ bookingDate: date }),
  });
}

// event wiring
window.addEventListener("DOMContentLoaded", () => {
  const userInfo = document.getElementById("user-info");

  document.getElementById("show-login").addEventListener("click", () => showSection("login-form"));
  document.getElementById("show-register").addEventListener("click", () => showSection("register-form"));

  document.getElementById("login-form").addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    try {
      const data = await login({ email, password });
      setToken(data.token || data);
      userInfo.textContent = `Logged in as ${email}`;
      showSection("providers-container");
      await loadProviders();
      document.getElementById("booking-container").classList.remove("hidden");
    } catch (err) {
      document.getElementById("login-error").textContent = err.message;
    }
  });

  document.getElementById("register-form").addEventListener("submit", async e => {
    e.preventDefault();
    const name = document.getElementById("reg-name").value;
    const telephone = document.getElementById("reg-telephone").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;
    try {
      await register({ name, telephone, email, password });
      alert("Registered successfully, please log in.");
      showSection("login-form");
    } catch (err) {
      document.getElementById("reg-error").textContent = err.message;
    }
  });

  document.getElementById("create-booking").addEventListener("click", async () => {
    const providerId = document.getElementById("provider-select").value;
    const date = document.getElementById("booking-date").value;
    try {
      await createBooking(providerId, date);
      alert("Booking created");
    } catch (err) {
      document.getElementById("booking-error").textContent = err.message;
    }
  });
});
