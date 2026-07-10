// ========================================
// ADMIN AUTH
// ========================================
if (localStorage.getItem("role") !== "admin") {
  alert("Admin access only");
  window.location.href = "index.html";
}

// ========================================
// LOAD BOOKINGS
// ========================================
const table = document.getElementById("bookingTable");
const bookings = JSON.parse(localStorage.getItem("bookings")) || [];

if (bookings.length === 0) {
  table.innerHTML = `
    <tr>
      <td colspan="7" style="text-align:center; padding:30px;">
        No bookings yet
      </td>
    </tr>
  `;
} else {
  renderBookings();
}

function renderBookings() {
  table.innerHTML = bookings
    .map(
      b => `
    <tr>
      <td>${b.id}</td>
      <td>${b.destination}</td>
      <td>${b.checkIn}</td>
      <td>${b.checkOut}</td>
      <td>${b.travelers}</td>
      <td><span class="status pending">${b.status}</span></td>
      <td>${b.time}</td>
    </tr>
  `
    )
    .join("");
}

// ========================================
// LOGOUT
// ========================================
function logout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("role");
  window.location.href = "login.html";
}
