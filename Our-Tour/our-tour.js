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
  const resultsGrid = document.getElementById("tour-results-grid");
  const cards = resultsGrid
    ? Array.from(resultsGrid.querySelectorAll(".tour-list-card"))
    : [];
  const searchInputs = Array.from(document.querySelectorAll("[data-tour-search]"));
  const filterControls = Array.from(document.querySelectorAll("[data-filter]"));
  const sortControls = Array.from(document.querySelectorAll("[data-sort='tours']"));
  const priceRanges = Array.from(document.querySelectorAll("[data-price-range]"));
  const priceLabels = Array.from(document.querySelectorAll("[data-price-label]"));
  const chipButtons = Array.from(document.querySelectorAll("[data-chip-filter]"));
  const activeChipList = document.getElementById("active-filter-chips");
  const countText = document.getElementById("tour-result-count");
  const feedbackText = document.getElementById("tour-live-feedback");
  const emptyState = document.getElementById("tour-empty-state");
  const mobileSheet = document.getElementById("mobile-filter-sheet");
  const openMobileButton = document.querySelector("[data-open-mobile-filters]");
  const closeMobileButton = document.querySelector("[data-close-mobile-filters]");
  const clearButtons = Array.from(document.querySelectorAll("[data-clear-filters]"));
  const saveButtons = Array.from(document.querySelectorAll("[data-save-search]"));
  const applyButtons = Array.from(document.querySelectorAll("[data-apply-filters]"));

  if (!cards.length) return;

  const filterLabels = {
    activities: "Activity",
    budget: "Budget",
    continent: "Continent",
    country: "Country",
    destination: "Destination",
    difficulty: "Difficulty",
    duration: "Duration",
    group: "Group",
    month: "Month",
    rating: "Rating",
    season: "Season",
    style: "Style",
  };

  const state = {
    filters: {},
    maxPrice: 6000,
    search: "",
    sort: "recommended",
  };

  function formatCurrency(value) {
    return `$${Number(value).toLocaleString("en-US")}`;
  }

  function prettifyValue(value) {
    return value
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function getFilterValue(name) {
    return state.filters[name] || "";
  }

  function syncMatchingControls(sourceControl) {
    filterControls.forEach((control) => {
      if (control === sourceControl) return;
      if (control.dataset.filter === sourceControl.dataset.filter) {
        control.value = sourceControl.value;
      }
    });
  }

  function syncSortControls(sourceControl) {
    sortControls.forEach((control) => {
      if (control !== sourceControl) control.value = sourceControl.value;
    });
  }

  function syncPriceRanges(sourceRange) {
    priceRanges.forEach((range) => {
      if (range !== sourceRange) range.value = sourceRange.value;
    });
  }

  function getSearchableText(card) {
    const searchableText = [
      card.dataset.title,
      card.dataset.destination,
      card.dataset.country,
      card.dataset.continent,
      card.dataset.budget,
      card.dataset.duration,
      card.dataset.season,
      card.dataset.style,
      card.dataset.activities,
      card.dataset.group,
      card.dataset.difficulty,
      card.dataset.months,
      card.textContent,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText;
  }

  function cardMatchesFilter(card, name, value) {
    if (!value) return true;

    if (name === "rating") {
      return Number(card.dataset.rating || 0) >= Number(value);
    }

    if (name === "month") {
      return (card.dataset.months || "").split(" ").includes(value);
    }

    const cardValue = (card.dataset[name] || "").toLowerCase();
    return cardValue.split(" ").includes(value) || cardValue.includes(value);
  }

  function cardMatchesState(card) {
    const matchesSearch =
      !state.search || getSearchableText(card).includes(state.search);
    const matchesPrice = Number(card.dataset.price || 0) <= state.maxPrice;
    const matchesFilters = Object.entries(state.filters).every(([name, value]) =>
      cardMatchesFilter(card, name, value),
    );

    return matchesSearch && matchesPrice && matchesFilters;
  }

  function sortCards(visibleCards) {
    const sortedCards = [...cards].sort((firstCard, secondCard) => {
      if (state.sort === "rating") {
        return Number(secondCard.dataset.rating) - Number(firstCard.dataset.rating);
      }

      if (state.sort === "price-low") {
        return Number(firstCard.dataset.price) - Number(secondCard.dataset.price);
      }

      if (state.sort === "price-high") {
        return Number(secondCard.dataset.price) - Number(firstCard.dataset.price);
      }

      if (state.sort === "duration") {
        const durationOrder = { short: 1, week: 2, extended: 3 };
        return (
          (durationOrder[firstCard.dataset.duration] || 9) -
          (durationOrder[secondCard.dataset.duration] || 9)
        );
      }

      return cards.indexOf(firstCard) - cards.indexOf(secondCard);
    });

    sortedCards.forEach((card) => resultsGrid.appendChild(card));
    return visibleCards;
  }

  function updatePriceLabels() {
    priceLabels.forEach((label) => {
      label.textContent = formatCurrency(state.maxPrice);
    });
  }

  function updateQuickChips() {
    const hasAnyFilter =
      Object.keys(state.filters).length > 0 || state.search || state.maxPrice < 6000;

    chipButtons.forEach((button) => {
      const isAllToursChip = button.dataset.chipValue === "";
      const isActive = isAllToursChip
        ? !hasAnyFilter
        : getFilterValue(button.dataset.chipFilter) === button.dataset.chipValue;

      button.classList.toggle("bg-slate-950", isActive);
      button.classList.toggle("text-white", isActive);
      button.classList.toggle("border", !isActive);
      button.classList.toggle("border-slate-200", !isActive);
      button.classList.toggle("bg-white", !isActive);
      button.classList.toggle("text-slate-700", !isActive);
    });
  }

  function renderActiveChips() {
    if (!activeChipList) return;

    activeChipList.innerHTML = "";

    const chips = Object.entries(state.filters)
      .filter(([, value]) => value)
      .map(([name, value]) => ({
        label: `${filterLabels[name] || prettifyValue(name)}: ${prettifyValue(value)}`,
        name,
      }));

    if (state.search) {
      chips.unshift({ label: `Search: ${state.search}`, name: "search" });
    }

    if (state.maxPrice < 6000) {
      chips.push({ label: `Under ${formatCurrency(state.maxPrice)}`, name: "price" });
    }

    if (!chips.length) {
      const emptyChip = document.createElement("span");
      emptyChip.className = "text-sm font-semibold text-slate-400";
      emptyChip.textContent = "No active filters";
      activeChipList.appendChild(emptyChip);
      return;
    }

    chips.forEach((chip) => {
      const chipButton = document.createElement("button");
      chipButton.type = "button";
      chipButton.className =
        "inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100";
      chipButton.dataset.clearChip = chip.name;
      chipButton.textContent = chip.label;

      const closeText = document.createElement("span");
      closeText.setAttribute("aria-hidden", "true");
      closeText.textContent = "x";
      chipButton.appendChild(closeText);
      activeChipList.appendChild(chipButton);
    });
  }

  function updateTourList() {
    const visibleCards = cards.filter(cardMatchesState);
    let visibleCount = 0;

    cards.forEach((card) => {
      const shouldShow = visibleCards.includes(card);
      card.classList.toggle("is-filtered-out", !shouldShow);
      card.setAttribute("aria-hidden", String(!shouldShow));
      if (shouldShow) {
        visibleCount += 1;
      }
    });

    sortCards(visibleCards);
    updatePriceLabels();
    updateQuickChips();
    renderActiveChips();

    if (countText) {
      countText.textContent = `Showing ${visibleCount} ${visibleCount === 1 ? "tour" : "tours"}`;
      countText.classList.remove("filter-count-pop");
      void countText.offsetWidth;
      countText.classList.add("filter-count-pop");
    }

    if (feedbackText) {
      feedbackText.textContent =
        visibleCount === cards.length
          ? "Showing all curated tours"
          : `${visibleCount} ${visibleCount === 1 ? "tour matches" : "tours match"} your filters`;
    }

    if (emptyState) {
      emptyState.classList.toggle("hidden", visibleCount !== 0);
    }
  }

  function closeMobileFilters() {
    if (!mobileSheet) return;
    mobileSheet.classList.remove("is-open");
    mobileSheet.setAttribute("aria-hidden", "true");
    document.body.classList.remove("overflow-hidden");
  }

  filterControls.forEach((control) => {
    control.addEventListener("change", () => {
      const filterName = control.dataset.filter;
      state.filters[filterName] = control.value;
      if (!control.value) delete state.filters[filterName];
      syncMatchingControls(control);
      updateTourList();
    });
  });

  searchInputs.forEach((input) => {
    input.addEventListener("input", () => {
      state.search = input.value.trim().toLowerCase();
      searchInputs.forEach((searchInput) => {
        if (searchInput !== input) searchInput.value = input.value;
      });
      updateTourList();
    });
  });

  priceRanges.forEach((range) => {
    range.addEventListener("input", () => {
      state.maxPrice = Number(range.value);
      syncPriceRanges(range);
      updateTourList();
    });
  });

  sortControls.forEach((control) => {
    control.addEventListener("change", () => {
      state.sort = control.value;
      syncSortControls(control);
      updateTourList();
    });
  });

  chipButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filterName = button.dataset.chipFilter;
      const filterValue = button.dataset.chipValue;
      if (filterValue) {
        state.filters[filterName] = filterValue;
      } else {
        delete state.filters[filterName];
      }

      filterControls.forEach((control) => {
        if (control.dataset.filter === filterName) control.value = filterValue;
      });

      updateTourList();
    });
  });

  if (activeChipList) {
    activeChipList.addEventListener("click", (event) => {
      const chipButton = event.target.closest("[data-clear-chip]");
      if (!chipButton) return;

      const chipName = chipButton.dataset.clearChip;

      if (chipName === "search") {
        state.search = "";
        searchInputs.forEach((input) => {
          input.value = "";
        });
      } else if (chipName === "price") {
        state.maxPrice = 6000;
        priceRanges.forEach((range) => {
          range.value = "6000";
        });
      } else {
        delete state.filters[chipName];
        filterControls.forEach((control) => {
          if (control.dataset.filter === chipName) control.value = "";
        });
      }

      updateTourList();
    });
  }

  clearButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.filters = {};
      state.maxPrice = 6000;
      state.search = "";
      state.sort = "recommended";

      filterControls.forEach((control) => {
        control.value = "";
      });
      searchInputs.forEach((input) => {
        input.value = "";
      });
      priceRanges.forEach((range) => {
        range.value = "6000";
      });
      sortControls.forEach((control) => {
        control.value = "recommended";
      });

      updateTourList();
    });
  });

  saveButtons.forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.setItem("drimoraSavedTourSearch", JSON.stringify(state));
      button.textContent = "Saved";
      window.setTimeout(() => {
        button.textContent = button.closest("#mobile-filter-sheet")
          ? "Save"
          : "Save Search";
      }, 1400);
    });
  });

  applyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      closeMobileFilters();

      if (button.tagName !== "A") {
        document.getElementById("tour-list")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  if (openMobileButton && mobileSheet) {
    openMobileButton.addEventListener("click", () => {
      mobileSheet.classList.add("is-open");
      mobileSheet.setAttribute("aria-hidden", "false");
      document.body.classList.add("overflow-hidden");
    });
  }

  if (closeMobileButton) {
    closeMobileButton.addEventListener("click", closeMobileFilters);
  }

  if (mobileSheet) {
    mobileSheet.addEventListener("click", (event) => {
      if (event.target === mobileSheet) closeMobileFilters();
    });
  }

  updateTourList();
}

document.addEventListener("DOMContentLoaded", initTourHubFilters);

function initFeaturedTours() {
  const wishlistButtons = Array.from(
    document.querySelectorAll("[data-wishlist-tour]"),
  );
  const bookButtons = Array.from(
    document.querySelectorAll("[data-featured-book]"),
  );
  let savedWishlist = [];

  try {
    savedWishlist = JSON.parse(
      localStorage.getItem("drimoraWishlistTours") || "[]",
    );
  } catch (error) {
    savedWishlist = [];
  }

  const wishlist = new Set(savedWishlist);

  function persistWishlist() {
    localStorage.setItem(
      "drimoraWishlistTours",
      JSON.stringify(Array.from(wishlist)),
    );
  }

  function updateWishlistButton(button) {
    const tourId = button.dataset.wishlistTour;
    const isSaved = wishlist.has(tourId);

    button.setAttribute("aria-pressed", String(isSaved));
    button.classList.toggle("bg-rose-600", isSaved);
    button.classList.toggle("text-white", isSaved);
    button.classList.toggle("bg-white/95", !isSaved);
    button.classList.toggle("text-slate-700", !isSaved);
  }

  wishlistButtons.forEach((button) => {
    updateWishlistButton(button);

    button.addEventListener("click", () => {
      const tourId = button.dataset.wishlistTour;

      if (wishlist.has(tourId)) {
        wishlist.delete(tourId);
      } else {
        wishlist.add(tourId);
      }

      persistWishlist();
      updateWishlistButton(button);
      button.classList.remove("wishlist-pop");
      void button.offsetWidth;
      button.classList.add("wishlist-pop");
    });
  });

  bookButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetUrl = button.dataset.featuredBook;
      const defaultText = button.textContent;

      button.textContent = "Checking dates";
      button.classList.add("scale-95");

      window.setTimeout(() => {
        button.textContent = "Opening booking";
      }, 450);

      window.setTimeout(() => {
        button.classList.remove("scale-95");
        button.textContent = defaultText;
        window.location.href = targetUrl;
      }, 850);
    });
  });
}

document.addEventListener("DOMContentLoaded", initFeaturedTours);
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

let routeMap = null;
let routeMarkers = [];

function renderDestinationList() {
  const list = document.getElementById("destination-list");

  if (!list) return;

  list.innerHTML = norwayRoute
    .map(
      (place) => `
<button
  type="button"
  class="destination-card w-full rounded-2xl border border-white/10 bg-slate-800 p-5 text-left transition hover:bg-slate-700"
  data-id="${place.id}"
>
  <div class="flex items-start justify-between gap-3">
    <div>
      <h3 class="text-white font-bold">${place.name}</h3>
      <p class="text-slate-400 text-sm mt-2">${place.description}</p>
    </div>
    <span class="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">${place.travelTime}</span>
  </div>
  <div class="mt-3 text-amber-400 text-sm">
    ${place.distance} • ${place.transport}
  </div>
</button>
`,
    )
    .join("");

  list.querySelectorAll(".destination-card").forEach((card) => {
    card.addEventListener("click", () => focusDestination(Number(card.dataset.id)));
  });
}

function initNorwayMap() {
  const mapContainer = document.getElementById("route-map");
  if (!mapContainer || typeof L === "undefined") return;

  routeMap = L.map("route-map").setView([63.5, 10], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(routeMap);

  addMarkers(routeMap);
  drawRoute(routeMap);

  if (routeMarkers.length) {
    const bounds = L.latLngBounds(routeMarkers.map((marker) => marker.getLatLng()));
    routeMap.fitBounds(bounds, { padding: [40, 40] });
  }
}

function addMarkers(map) {
  routeMarkers = norwayRoute.map((place) => {
    const marker = L.marker([place.lat, place.lng], { title: place.name })
      .addTo(map)
      .bindPopup(`<div class="text-sm"><strong>${place.name}</strong><br>${place.description}</div>`);

    marker.placeId = place.id;
    marker.on("click", () => focusDestination(place.id));
    return marker;
  });
}

function drawRoute(map) {
  const points = norwayRoute.map((place) => [place.lat, place.lng]);

  L.polyline(points, {
    color: "#f59e0b",
    weight: 5,
    opacity: 0.85,
  }).addTo(map);
}

function focusDestination(placeId) {
  const place = norwayRoute.find((item) => item.id === placeId);
  if (!place || !routeMap) return;

  const marker = routeMarkers.find((item) => item.placeId === placeId);
  if (marker) {
    routeMap.panTo(marker.getLatLng());
    marker.openPopup();
  }

  document.querySelectorAll(".destination-card").forEach((card) => {
    const isActive = Number(card.dataset.id) === placeId;
    card.classList.toggle("active", isActive);
    card.classList.toggle("ring-2", isActive);
    card.classList.toggle("ring-amber-400", isActive);
    card.classList.toggle("bg-slate-700", isActive);
    card.classList.toggle("bg-slate-800", !isActive);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("route-map")) return;

  renderDestinationList();
  initNorwayMap();
  focusDestination(1);
});
