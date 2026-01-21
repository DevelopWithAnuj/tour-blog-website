const loginCard = document.getElementById("loginCard");
const registerCard = document.getElementById("registerCard");

// ---------------- CARD TOGGLE ----------------
function showRegister() {
  loginCard?.classList.add("hidden");
  registerCard?.classList.remove("hidden");
}

function showLogin() {
  registerCard?.classList.add("hidden");
  loginCard?.classList.remove("hidden");
}

// ---------------- SHAKE ----------------
function shake() {
  const card = document.querySelector(".auth-card:not(.hidden)");
  if (!card) return;

  card.style.animation = "shake 0.4s";
  setTimeout(() => (card.style.animation = ""), 400);
}

// ---------------- LOADING ----------------
function showMsg(el, text, type) {
  if (!el) return;
  el.innerText = text;
  el.className = "msg " + type;
}

// ---- type: "Please wait..." or custom text ----
function startLoading(btn, text = "Please wait...") {
  btn.disabled = true;
  btn.dataset.originalText = btn.innerText;
  btn.innerText = text;
}

function stopLoading(btn) {
  btn.disabled = false;
  btn.innerText = btn.dataset.originalText || "Submit";
}


// ---------------- REGISTER ----------------
const rBtn = document.getElementById("registerBtn");

rBtn.addEventListener("click", function () {
  const emailReg = document.getElementById("regEmail").value.trim();
  const passReg = document.getElementById("regPassword").value.trim();
  const rMsg = document.getElementById("rMsg");

  if (!emailReg || !passReg) {
    shake();
    showMsg(rMsg, "All fields are required!", "error");
    return;
  }

  const emailChar = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  if (!emailChar.test(emailReg)) {
    showMsg(rMsg, "Invalid email!", "error");
    return;
  }

  const passChar =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  if (!passChar.test(passReg)) {
    showMsg(rMsg,
      "Password must have: 8+ chars, 1 upper, 1 lower, 1 number & 1 special char(@$!%*?&)", "error");
    return;
  }

  startLoading(rBtn, "Registering...");

  setTimeout(() => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.find((u) => u.emailReg === emailReg)) {
      shake();
      showMsg(rMsg, "User already exists", "error");
      stopLoading(rBtn);
      return;
    }

    const role = emailReg === "admin@gmail.com" ? "admin" : "user";
    users.push({ emailReg, passReg, role });
    localStorage.setItem("users", JSON.stringify(users));

    stopLoading(rBtn);
    showMsg(rMsg, "Account created successfully", "success");
    showLogin();
  }, 1200);
});


// ---------------- LOGIN ----------------
const lBtn = document.getElementById("loginBtn");

lBtn.addEventListener("click", function () {
  const emailInput = document.getElementById("email").value.trim();
  const passwordInput = document.getElementById("password").value.trim();
  const lMsg = document.getElementById("lMsg");

  if (!emailInput || !passwordInput) {
    shake();
    showMsg(lMsg, "All fields are required!", "error");
    return;
  }

  startLoading(lBtn, "Logging in...");

  setTimeout(() => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(
      (u) => u.emailReg === emailInput && u.passReg === passwordInput
    );

    if (user) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role", user.role);

      window.location.href =
        user.role === "admin" ? "admin-dashboard.html" : "index.html";
    } else {
      shake();
      showMsg(lMsg, "Invalid credentials", "error");
      stopLoading(lBtn);
    }
  }, 1200);
});
