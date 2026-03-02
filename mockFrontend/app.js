const API_BASE = "http://localhost:5050/api/v1";

let currentUser = null;

function setToken(token) {
  localStorage.setItem("token", token);
}

function getToken() {
  return localStorage.getItem("token");
}

function setCurrentUser(user) {
  currentUser = user;
  localStorage.setItem("currentUser", JSON.stringify(user));
  updateUserInfo();
}

function getCurrentUser() {
  if (!currentUser) {
    const stored = localStorage.getItem("currentUser");
    if (stored) currentUser = JSON.parse(stored);
  }
  return currentUser;
}

function updateUserInfo() {
  const userInfo = document.getElementById("user-info");
  const logoutBtn = document.getElementById("logout-btn");
  if (currentUser) {
    userInfo.textContent = `Logged in as ${currentUser.name} (${currentUser.role})`;
    logoutBtn.classList.remove("hidden");
  } else {
    userInfo.textContent = "";
    logoutBtn.classList.add("hidden");
  }
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

async function logout() {
  return fetchJSON(`${API_BASE}/auth/logout`, { method: "GET" });
}

async function getCurrentUserData() {
  return fetchJSON(`${API_BASE}/auth/me`, { method: "GET" });
}

async function loadProviders() {
  const list = document.getElementById("providers-list");
  list.innerHTML = "";
  try {
    const response = await fetchJSON(`${API_BASE}/providers`);
    console.log("Raw response:", response);
    
    // Handle wrapped response { success: true, data: [...] }
    const providers = Array.isArray(response) ? response : response.data || [];
    console.log("Providers loaded:", providers);
    
    if (!providers || providers.length === 0) {
      list.innerHTML = "<li>No providers available</li>";
      return;
    }
    providers.forEach(p => {
      const li = document.createElement("li");
      li.textContent = `${p.name} (${p.address}) - ${p.tel}`;
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
  } catch (err) {
    console.error("Error loading providers:", err);
    list.innerHTML = `<li style="color:red;">Error loading providers: ${err.message}</li>`;
  }
}

async function addProvider(name, address, tel) {
  return fetchJSON(`${API_BASE}/providers`, {
    method: "POST",
    body: JSON.stringify({ name, address, tel }),
  });
}

async function loadBookings() {
  const list = document.getElementById("bookings-list");
  if (!list) return;
  list.innerHTML = "";
  try {
    const response = await fetchJSON(`${API_BASE}/bookings`);
    console.log("Bookings response:", response);
    
    // Handle wrapped response { success: true, data: [...] }
    const bookings = Array.isArray(response) ? response : response.data || [];
    
    if (bookings.length === 0) {
      list.innerHTML = "<li>No bookings yet</li>";
    } else {
      bookings.forEach(b => {
        const li = document.createElement("li");
        li.textContent = `Booking: ${new Date(b.bookingDate).toLocaleString()} (Provider: ${b.provider})`;
        list.appendChild(li);
      });
    }
  } catch (err) {
    console.error("Error loading bookings:", err);
    list.innerHTML = "<li>Could not load bookings</li>";
  }
}

async function createBooking(providerId, date) {
  return fetchJSON(`${API_BASE}/providers/${providerId}/bookings`, {
    method: "POST",
    body: JSON.stringify({ bookingDate: date }),
  });
}

// event wiring
window.addEventListener("DOMContentLoaded", () => {
  updateUserInfo();

  document.getElementById("show-login").addEventListener("click", () => showSection("login-form"));
  document.getElementById("show-register").addEventListener("click", () => showSection("register-form"));

  document.getElementById("logout-btn").addEventListener("click", async () => {
    try {
      await logout();
      currentUser = null;
      localStorage.removeItem("currentUser");
      localStorage.removeItem("token");
      updateUserInfo();
      document.getElementById("auth-container").classList.remove("hidden");
      document.getElementById("providers-container").classList.add("hidden");
      document.getElementById("booking-container").classList.add("hidden");
      alert("Logged out");
    } catch (err) {
      alert("Logout error: " + err.message);
    }
  });

  document.getElementById("login-form").addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    try {
      const data = await login({ email, password });
      setToken(data.token || data);
      const userData = await getCurrentUserData();
      console.log("User data:", userData);
      setCurrentUser(userData.data || userData);
      document.getElementById("auth-container").classList.add("hidden");
      document.getElementById("providers-container").classList.remove("hidden");
      document.getElementById("booking-container").classList.remove("hidden");
      
      if (currentUser.role === "admin") {
        document.getElementById("admin-provider-form").classList.remove("hidden");
      } else {
        document.getElementById("admin-provider-form").classList.add("hidden");
      }
      
      await loadProviders();
      await loadBookings();
      document.getElementById("login-email").value = "";
      document.getElementById("login-password").value = "";
    } catch (err) {
      console.error("Login error:", err);
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
      await register({ name, telephone, email, password, role: "user" });
      alert("Registered successfully, please log in.");
      showSection("login-form");
      document.getElementById("reg-name").value = "";
      document.getElementById("reg-telephone").value = "";
      document.getElementById("reg-email").value = "";
      document.getElementById("reg-password").value = "";
    } catch (err) {
      document.getElementById("reg-error").textContent = err.message;
    }
  });

  document.getElementById("add-provider-btn").addEventListener("click", async () => {
    const name = document.getElementById("provider-name").value;
    const address = document.getElementById("provider-address").value;
    const tel = document.getElementById("provider-tel").value;
    if (!name || !address || !tel) {
      document.getElementById("provider-error").textContent = "All fields required";
      return;
    }
    try {
      await addProvider(name, address, tel);
      alert("Provider added successfully");
      document.getElementById("provider-name").value = "";
      document.getElementById("provider-address").value = "";
      document.getElementById("provider-tel").value = "";
      await loadProviders();
    } catch (err) {
      document.getElementById("provider-error").textContent = err.message;
    }
  });

  document.getElementById("create-booking").addEventListener("click", async () => {
    const providerId = document.getElementById("provider-select").value;
    const date = document.getElementById("booking-date").value;
    if (!providerId || !date) {
      document.getElementById("booking-error").textContent = "Please select provider and date";
      return;
    }
    try {
      await createBooking(providerId, date);
      alert("Booking created");
      document.getElementById("booking-date").value = "";
      await loadBookings();
    } catch (err) {
      document.getElementById("booking-error").textContent = err.message;
    }
  });
});
