// ==========================================================================
// 1. Global Element Selectors
// ==========================================================================
const loginCard = document.getElementById("loginCard");
const registerCard = document.getElementById("registerCard");
const pageLoader = document.getElementById("pageLoader");

const lBtn = document.getElementById("loginBtn");
const rBtn = document.getElementById("registerBtn");

const lMsg = document.getElementById("lMsg");
const rMsg = document.getElementById("rMsg");

// ==========================================================================
// 2. Authentication View Toggles
// ==========================================================================
function showRegister() {
  clearMessages();
  clearFields();
  loginCard?.classList.add("hidden");
  registerCard?.classList.remove("hidden");
}

function showLogin() {
  clearMessages();
  clearFields();
  registerCard?.classList.add("hidden");
  loginCard?.classList.remove("hidden");
}

// Helper utility to wipe forms clear when switching cards
function clearFields() {
  const inputs = document.querySelectorAll(".input-group input");
  inputs.forEach((input) => {
    input.value = "";
  });
}

// Helper utility to hide old alerts when switching cards
function clearMessages() {
  if (lMsg) {
    lMsg.innerText = "";
    lMsg.className = "msg";
  }
  if (rMsg) {
    rMsg.innerText = "";
    rMsg.className = "msg";
  }
}

// ==========================================================================
// 3. UI Component Feedback Animations (Shake & Messages)
// ==========================================================================
function shake() {
  const card = document.querySelector(".auth-card:not(.hidden)");
  if (!card) return;

  card.style.animation = "shake 0.4s ease";
  // Strip away keyframe style once finished so it can be re-triggered later
  setTimeout(() => {
    card.style.animation = "";
  }, 400);
}

function showMsg(el, text, type) {
  if (!el) return;
  el.innerText = text;
  el.className = "msg " + type; // Applies conditional styles (.error or .success)
}

// ==========================================================================
// 4. Async Button States
// ==========================================================================
function startLoading(btn, text = "Please wait...") {
  btn.disabled = true;
  btn.dataset.originalText = btn.innerText;
  btn.innerText = text;
}

function stopLoading(btn) {
  btn.disabled = false;
  btn.innerText = btn.dataset.originalText || "Submit";
}

// ==========================================================================
// 5. Registration Handler Engine
// ==========================================================================
rBtn.addEventListener("click", function () {
  const emailReg = document.getElementById("regEmail").value.trim();
  const passReg = document.getElementById("regPassword").value.trim();

  // Field Presence Verification
  if (!emailReg || !passReg) {
    shake();
    showMsg(rMsg, "All fields are required!", "error");
    return;
  }

  // Email Structural Integrity Check
  const emailChar = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
  if (!emailChar.test(emailReg)) {
    shake();
    showMsg(rMsg, "Invalid email structure!", "error");
    return;
  }

  // Strong Password Requirement Matrix
  const passChar = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  if (!passChar.test(passReg)) {
    shake();
    showMsg(
      rMsg,
      "Password must have: 8+ chars, 1 upper, 1 lower, 1 number & 1 special char(@$!%*?&)",
      "error",
    );
    return;
  }

  startLoading(rBtn, "Registering...");

  // Simulate server latency
  setTimeout(() => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Duplicate check
    if (users.find((u) => u.emailReg === emailReg)) {
      shake();
      showMsg(rMsg, "User already exists!", "error");
      stopLoading(rBtn);
      return;
    }

    // Role Distribution Rule
    const role = emailReg === "admin@gmail.com" ? "admin" : "user";

    users.push({ emailReg, passReg, role });
    localStorage.setItem("users", JSON.stringify(users));

    stopLoading(rBtn);
    showMsg(rMsg, "Account created successfully!", "success");

    // Smooth transition back to login screen
    setTimeout(() => {
      showLogin();
    }, 1000);
  }, 1200);
});

// ==========================================================================
// 6. Login Handler Engine
// ==========================================================================
lBtn.addEventListener("click", function () {
  const emailInput = document.getElementById("email").value.trim();
  const passwordInput = document.getElementById("password").value.trim();

  // Field Presence Verification
  if (!emailInput || !passwordInput) {
    shake();
    showMsg(lMsg, "All fields are required!", "error");
    return;
  }

  startLoading(lBtn, "Logging in...");

  // Simulate server latency
  setTimeout(() => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Search Database Match
    const user = users.find(
      (u) => u.emailReg === emailInput && u.passReg === passwordInput,
    );

    if (user) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role", user.role);

      showMsg(lMsg, "Success! Redirecting...", "success");

      // Activate the global fullscreen pageLoader overlay before page changes
      if (pageLoader) {
        pageLoader.classList.add("visible");
      }

      // Hard redirect route separation based on roles
      setTimeout(() => {
        window.location.href =
          user.role === "admin" ? "admin-dashboard.html" : "index.html";
      }, 1000);
    } else {
      shake();
      showMsg(lMsg, "Invalid email or password", "error");
      stopLoading(lBtn);
    }
  }, 1200);
});
