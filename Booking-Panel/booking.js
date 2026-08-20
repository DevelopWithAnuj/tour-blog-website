function toggleSidebar() {
  var sidebar = document.getElementById("sidebar");
  var backdrop = document.getElementById("sidebar-backdrop");
  var opening = sidebar.classList.contains("-translate-x-full");
  sidebar.classList.toggle("-translate-x-full");
  if (opening) {
    backdrop.classList.remove("hidden");
    requestAnimationFrame(function () {
      backdrop.classList.remove("opacity-0");
    });
  } else {
    backdrop.classList.add("opacity-0");
    setTimeout(function () {
      backdrop.classList.add("hidden");
    }, 300);
  }
}

if (typeof logout !== "function") {
  window.logout = function () {
    window.location.href = "../index.html";
  };
}

(function () {
  var destInputs = Array.prototype.slice.call(
    document.querySelectorAll('input[name="destination"]'),
  );
  var pkgInputs = Array.prototype.slice.call(
    document.querySelectorAll('input[name="package"]'),
  );
  var adultsEl = document.getElementById("adultsCount");
  var childrenEl = document.getElementById("childrenCount");
  var checkin = document.getElementById("checkin");
  var checkout = document.getElementById("checkout");
  var livePrice = document.getElementById("livePrice");
  var state = { adults: 1, children: 0 };

  function selectedDestination() {
    return (
      destInputs.find(function (i) {
        return i.checked;
      }) || null
    );
  }
  function selectedPackage() {
    return (
      pkgInputs.find(function (i) {
        return i.checked;
      }) || pkgInputs[0]
    );
  }
  function computeTotal() {
    var dest = selectedDestination();
    var pkg = selectedPackage();
    var base = dest ? parseFloat(dest.dataset.price) : 0;
    var multiplier = parseFloat(pkg.dataset.multiplier || "1");
    var travelerUnits = state.adults + state.children * 0.5;
    return Math.round(base * multiplier * travelerUnits);
  }
  function updatePrice() {
    livePrice.textContent = "$" + computeTotal().toLocaleString();
  }

  destInputs.forEach(function (i) {
    i.addEventListener("change", updatePrice);
  });
  pkgInputs.forEach(function (i) {
    i.addEventListener("change", updatePrice);
  });
  checkin.addEventListener("change", updatePrice);
  checkout.addEventListener("change", updatePrice);

  document.querySelectorAll("[data-counter]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.dataset.counter;
      var step = parseInt(btn.dataset.step, 10);
      var min = key === "adults" ? 1 : 0;
      state[key] = Math.max(min, state[key] + step);
      (key === "adults" ? adultsEl : childrenEl).textContent = state[key];
      updatePrice();
    });
  });

  // Pre-select destination from ?tour= query param
  var params = new URLSearchParams(window.location.search);
  var tourParam = params.get("tour");
  if (tourParam) {
    var match = destInputs.find(function (i) {
      return i.value === tourParam;
    });
    if (match) match.checked = true;
  }
  updatePrice();

  var form = document.getElementById("tripForm");
  var formError = document.getElementById("formError");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var dest = selectedDestination();
    var pkg = selectedPackage();
    var validDates =
      checkin.value &&
      checkout.value &&
      new Date(checkout.value) > new Date(checkin.value);

    if (!dest || !validDates) {
      formError.classList.remove("hidden");
      formError.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    formError.classList.add("hidden");

    var booking = {
      destination: {
        id: dest.value,
        name: dest.dataset.name,
        img: dest.dataset.img,
        basePrice: parseFloat(dest.dataset.price),
      },
      checkin: checkin.value,
      checkout: checkout.value,
      adults: state.adults,
      children: state.children,
      package: {
        id: pkg.value,
        multiplier: parseFloat(pkg.dataset.multiplier),
      },
      traveler: {
        fullname: document.getElementById("fullname").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        requests: document.getElementById("requests").value,
      },
      total: computeTotal(),
      paid: false,
    };

    localStorage.setItem("drimoraBooking", JSON.stringify(booking));
    window.location.href = "payment.html";
  });
})();

lucide.createIcons();
