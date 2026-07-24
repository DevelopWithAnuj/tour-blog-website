// ========================================
// AUTHENTICATION & SESSION MANAGEMENT
// ========================================
if (localStorage.getItem("isLoggedIn") !== "true") {
  const pathPrefix = window.location.pathname.includes("/Our-Tour/")
    ? "../"
    : "./";
  window.location.href = pathPrefix + "login.html";
}

function logout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("role");
  const pathPrefix = window.location.pathname.includes("/Our-Tour/")
    ? "../"
    : "./";
  window.location.href = pathPrefix + "login.html";
}
window.logout = logout;

// ========================================
// HAMBURGER MENU TOGGLE (FIXED)
// ========================================
function setupHamburgerMenuNY() {
  const hamburger = document.getElementById("hamburger-ny");
  const navMenu = document.getElementById("navMenu-ny");

  if (!hamburger || !navMenu) {
    console.warn("Hamburger elements missing from this page layout.");
    return;
  }

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

// Safer setup: fires immediately if DOM is ready, otherwise falls back to load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupHamburgerMenuNY);
} else {
  setupHamburgerMenuNY();
}


// ========================================
// TOUR DATA (Central hub for all tours)
// ========================================
const tours = [
  {
    id: "new-york",
    title: "New York",
    description: "City that never sleeps — parks, museums and skyline.",
    image: "../assests/img-map.png",
    route: "./new-York.html",
  },
  {
    id: "norway",
    title: "Norway City",
    description: "Scenic fjords, northern lights and coastal drives.",
    image: "../assests/new-york1.png",
    route: "./norway.html",
  },
  {
    id: "uae",
    title: "United Arab",
    description: "Luxury, desert safaris and modern architecture.",
    image: "./assests/ua-bg.avif",
    route: "./united-Arab.html",
  },
];

// ========================================
// SHUFFLE FUNCTION (for future use)
// ========================================
function shuffleTours(toursArray) {
  return [...toursArray].sort(() => Math.random() - 0.5);
}

// ========================================
// RENDER TOURS DYNAMICALLY (for future use)
// ========================================
function renderToursOnIndex(container, toursArray = tours, shuffle = false) {
  const tourData = shuffle ? shuffleTours(toursArray) : toursArray;

  if (!container) return;

  container.innerHTML = tourData
    .map(
      (tour) => `
    <article class="tour-card" data-tour="${tour.id}">
      <img src="${tour.image}" alt="${tour.title}" />
      <h3>${tour.title}</h3>
      <p>${tour.description}</p>
      <button class="btn-primary">Learn More</button>
    </article>
  `,
    )
    .join("");

  attachTourListeners(container);
}

// ========================================
// ATTACH EVENT LISTENERS TO TOUR CARDS
// ========================================
function attachTourListeners(container = null) {
  const scope = container ? container : document;
  const tourCards = scope.querySelectorAll(".tour-card");

  tourCards.forEach((card) => {
    const tourId = card.getAttribute("data-tour");
    const learnMoreBtn = card.querySelector(".btn-primary");
    const tour = tours.find((t) => t.id === tourId);

    if (learnMoreBtn && tour) {
      learnMoreBtn.addEventListener("click", function () {
        window.location.href = tour.route;
      });
    }
  });
}

function initMapZoom() {
  const map = document.querySelector(".real-map");
  if (!map) return;

  const layer = map.querySelector(".map-zoom-layer");
  const levelText = map.querySelector(".map-zoom-level");
  const controls = map.querySelectorAll("[data-map-zoom]");
  let scale = 1;

  function updateZoom() {
    layer.style.transform = `scale(${scale})`;
    levelText.textContent = `${Math.round(scale * 100)}%`;
  }

  controls.forEach((control) => {
    control.addEventListener("click", function () {
      const action = control.getAttribute("data-map-zoom");

      if (action === "in") {
        scale = Math.min(2, scale + 0.25);
      } else if (action === "out") {
        scale = Math.max(1, scale - 0.25);
      } else {
        scale = 1;
      }

      updateZoom();
    });
  });
}

document.addEventListener("DOMContentLoaded", initMapZoom);

function initTourHubFilters() {
  const cards = Array.from(document.querySelectorAll(".tour-list-card"));
  const filterButtons = Array.from(document.querySelectorAll(".tour-filter-btn"));
  const searchInput = document.getElementById("tour-search");
  const countText = document.getElementById("tour-result-count");
  const emptyState = document.getElementById("tour-empty-state");

  if (!cards.length || !filterButtons.length) return;

  let activeFilter = "all";

  function setActiveButton(selectedButton) {
    filterButtons.forEach((button) => {
      button.classList.remove("bg-slate-950", "text-white");
      button.classList.add("bg-slate-100", "text-slate-700");
    });

    selectedButton.classList.remove("bg-slate-100", "text-slate-700");
    selectedButton.classList.add("bg-slate-950", "text-white");
  }

  function cardMatchesSearch(card, searchTerm) {
    const searchableText = [
      card.dataset.title,
      card.dataset.region,
      card.dataset.style,
      card.textContent,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(searchTerm);
  }

  function updateTourList() {
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";
    let visibleCount = 0;

    cards.forEach((card) => {
      const matchesFilter =
        activeFilter === "all" || card.dataset.region === activeFilter;
      const matchesSearch = !searchTerm || cardMatchesSearch(card, searchTerm);
      const shouldShow = matchesFilter && matchesSearch;

      card.classList.toggle("hidden", !shouldShow);
      if (shouldShow) visibleCount += 1;
    });

    if (countText) {
      countText.textContent = `Showing ${visibleCount} ${visibleCount === 1 ? "tour" : "tours"}`;
    }

    if (emptyState) {
      emptyState.classList.toggle("hidden", visibleCount !== 0);
    }
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.tourFilter || "all";
      setActiveButton(button);
      updateTourList();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", updateTourList);
  }

  updateTourList();
}

document.addEventListener("DOMContentLoaded", initTourHubFilters);
// ========================================
// NORWAY INTERACTIVE ROUTE MAP
// ========================================
const norwayRoute = [
  {
    id: 1,
    name: "Oslo",
    lat: 59.9139,
    lng: 10.7522,
    distance: "0 km",
    travelTime: "Start",
    transport: "Walk",
    description: "Norway's vibrant capital city.",
  },
  {
    id: 2,
    name: "Bergen",
    lat: 60.3913,
    lng: 5.3221,
    distance: "305 km",
    travelTime: "6h",
    transport: "Train",
    description: "Gateway to the Norwegian fjords.",
  },
  {
    id: 3,
    name: "Geiranger",
    lat: 62.1015,
    lng: 7.2057,
    distance: "280 km",
    travelTime: "5h",
    transport: "Car",
    description: "UNESCO-listed Geirangerfjord.",
  },
  {
    id: 4,
    name: "Ålesund",
    lat: 62.4722,
    lng: 6.1549,
    distance: "110 km",
    travelTime: "2h",
    transport: "Car",
    description: "Beautiful Art Nouveau town.",
  },
  {
    id: 5,
    name: "Trondheim",
    lat: 63.4305,
    lng: 10.3951,
    distance: "270 km",
    travelTime: "5h",
    transport: "Train",
    description: "Historic Viking city.",
  },
  {
    id: 6,
    name: "Lofoten",
    lat: 68.1467,
    lng: 13.6094,
    distance: "615 km",
    travelTime: "7h",
    transport: "Ferry",
    description: "Iconic Arctic islands.",
  },
];

function renderDestinationList() {
  const list = document.getElementById("destination-list");

  list.innerHTML = norwayRoute
    .map(
      (place) => `
<div class="destination-card p-5 rounded-2xl bg-slate-800 cursor-pointer"
     data-id="${place.id}">
    <h3 class="text-white font-bold">${place.name}</h3>
    <p class="text-slate-400 text-sm mt-2">${place.description}</p>
    <div class="mt-3 text-amber-400 text-sm">
        ${place.distance} • ${place.travelTime}
    </div>
</div>
`,
    )
    .join("");
}

function initNorwayMap() {
  const map = L.map("route-map").setView([63.5, 10], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
}

function addMarkers(map) {
  const points = [];

  norwayRoute.forEach((place) => {
    const marker = L.marker([place.lat, place.lng])
      .addTo(map)
      .bindPopup(`<b>${place.name}</b><br>${place.description}`);

    points.push([place.lat, place.lng]);
  });
}

function drawRoute(map) {
  L.polyline(points, {
    color: "#f59e0b",
    weight: 5,
  }).addTo(map);
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("route-map")) return;

  renderDestinationList();

  initNorwayMap();
});
