// ========================================
// HAMBURGER MENU TOGGLE
// ========================================
function setupHamburgerMenu() {
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("navMenu");

  if (!hamburger || !navMenu) return;

  hamburger.addEventListener("click", function () {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  // Close menu when a link is clicked
  const navLinks = navMenu.querySelectorAll("a");
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    });
  });

  // Close menu when logout button is clicked
  const logoutBtn = navMenu.querySelector("button");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    });
  }
}

// ========================================
// AUTH CHECK & ROLE REDIRECT
// ========================================
if (localStorage.getItem("isLoggedIn") !== "true") {
  window.location.href = "login.html";
}

const role = localStorage.getItem("role");

// ========================================
// LOGOUT
// ========================================
function logout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("role");
  window.location.href = "login.html";
}

// ========================================
// HERO ACTIONS
// ========================================
function scrollToBlogs() {
  document.getElementById("blogs")?.scrollIntoView({ behavior: "smooth" });
}
function scrollToTours() {
  document.getElementById("tours")?.scrollIntoView({ behavior: "smooth" });
}

function goDashboard() {
  if (role === "admin") {
    window.location.href = "admin-dashboard.html";
  } else {
    alert("Dashboard is available for admin only");
  }
}

// ========================================
// PAGE LOADER
// ========================================
window.addEventListener("load", () => {
  const loader = document.getElementById("pageLoader");
  if (loader) {
    loader.style.display = "none";
  }
  // ========================================
  // Setup Hamburger Menu
  // ========================================
  // SAFE CHECK: Only call if the function exists
  if (typeof setupHamburgerMenu === "function") {
    setupHamburgerMenu();
  } else {
    console.warn("setupHamburgerMenu is not defined on this page.");
  }


  // ========================================
  // Tour Lists Button Navigation
  // ========================================
  const tourListsBtn = document.getElementById("tour-lists");
  if (tourListsBtn) {
    tourListsBtn.addEventListener("click", function () {
      window.location.href = "./Our-Tour/our-tour.html";
    });
  }

  // Tour Card Navigation (with data-tour attributes)
  const tourCards = document.querySelectorAll(".tour-card");
  const tourRoutes = {
    "new-york": "./Our-Tour/new-York.html",
    "norway": "./Our-Tour/norway.html",
    "uae": "./Our-Tour/united-Arab.html"
  };

  tourCards.forEach(card => {
    const tourId = card.getAttribute("data-tour");
    const learnMoreBtn = card.querySelector(".btn-primary");
    
    if (learnMoreBtn && tourId && tourRoutes[tourId]) {
      learnMoreBtn.addEventListener("click", function() {
        window.location.href = tourRoutes[tourId];
      });
  }
});
});

// ========================================
// DEMO BLOG DATA (ONLY FIRST TIME)
// ========================================
let blogs = JSON.parse(localStorage.getItem("blogs"));

if (!blogs || blogs.length === 0) {
  blogs = [
    {
      id: 1,
      title: "A Week in the Himalayas",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
      content:
        "Snowy peaks, silent valleys, and peaceful monasteries. The Himalayas teach patience, humility, and the joy of slow travel.",
    },
    {
      id: 2,
      title: "Goa Beyond Beaches",
      image:
        "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=800&q=80",
      content:
        "Hidden cafés, Portuguese architecture, quiet villages, and soulful sunsets. Goa is more than parties.",
    },
    {
      id: 3,
      title: "Kerala: God's Own Country",
      image:
        "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=800&q=80",
      content:
        "Backwaters, houseboats, coconut trees, and spice plantations. Kerala is calm, green, and deeply cultural.",
    },
  ];

  localStorage.setItem("blogs", JSON.stringify(blogs));
}

// ========================================
// BLOG RENDERING (INDEX PAGE)
// ========================================
const blogContainer = document.getElementById("blogContainer");

function renderBlogs() {
  if (!blogContainer) return;

  // Empty state
  if (blogs.length === 0) {
    blogContainer.innerHTML = `
      <div class="empty-state">
        <h3>No blogs yet</h3>
        <p>New travel stories will appear here.</p>
      </div>
    `;
    return;
  }

  blogContainer.innerHTML = blogs
    .map(
      (blog, i) => `
      <article class="blog-card" style="animation-delay:${i * 120}ms">
        
        <div class="blog-img">
          <img src="${blog.image}" alt="${blog.title}">
        </div>

        <div class="blog-content">
          <h3>${blog.title}</h3>
          <p>${blog.content}</p>
        </div>

        <div class="blog-footer">
          <button class="read-btn" onclick="openBlog(${blog.id})">
            Read More →
          </button>
        </div>
      </article>
    `,
    )
    .join("");
}

renderBlogs();

// ========================================
// OPEN BLOG DETAILS
// ========================================
function openBlog(id) {
  const blog = blogs.find((b) => b.id === id);
  if (!blog) {
    alert("Blog not found");
    return;
  }

  localStorage.setItem("currentBlog", JSON.stringify(blog));
  window.location.href = "blog.html";
}

// ========================================
// BOOKING FORM SAVE (VERY IMPORTANT)
// ========================================
const bookingForm = document.getElementById("bookingForm");

bookingForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = bookingForm.querySelector('input[type="text"]').value.trim();
  const email = bookingForm.querySelector('input[type="email"]').value.trim();
  const date = bookingForm.querySelector('input[type="date"]').value;
  const destination = bookingForm.querySelector("select").value;

  if (!name || !email || !date || !destination) {
    alert("Please fill all booking details");
    return;
  }

  const booking = {
    id: "BOOK-" + Date.now(), // ✅ UNIQUE ID
    name,
    email,
    destination,
    checkIn: date,
    status: "Pending",
    time: new Date().toLocaleString(),
  };

  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  bookings.push(booking);
  localStorage.setItem("bookings", JSON.stringify(bookings));

  alert("Booking successful!");
  bookingForm.reset();
});

// ========================================
// CONTACT FORM
// ========================================
function handleContactSubmit(event) {
  event.preventDefault();

  const name = document.getElementById("contactName").value.trim();
  const email = document.getElementById("contactEmail").value.trim();
  const message = document.getElementById("contactMessage").value.trim();

  if (!name || !email || !message) {
    alert("Please fill all fields");
    return;
  }

  const messages = JSON.parse(localStorage.getItem("messages")) || [];
  messages.push({
    name,
    email,
    message,
    date: new Date().toLocaleString(),
  });

  localStorage.setItem("messages", JSON.stringify(messages));

  document.querySelector(".contact-form").reset();
  alert("Message sent successfully!");
}
