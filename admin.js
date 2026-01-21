// ========================================
// ADMIN AUTH
// ========================================
if (localStorage.getItem("role") !== "admin") {
  alert("Admin access only");
  window.location.href = "index.html";
}

// ========================================
// IMAGE PREVIEW
// ========================================
let imageBase64 = "";

const fileInput = document.getElementById("imageFile");
const preview = document.getElementById("preview");

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    imageBase64 = reader.result;
    preview.src = imageBase64;
    preview.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
});

// ========================================
// ADD BLOG
// ========================================
function handleAddBlog(event) {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();

  if (!title || !imageBase64 || content.length < 50) {
    alert("Fill all fields properly");
    return;
  }

  const blogs = JSON.parse(localStorage.getItem("blogs")) || [];

  blogs.push({
    id: Date.now(),
    title,
    image: imageBase64,
    content,
  });

  localStorage.setItem("blogs", JSON.stringify(blogs));

  alert("Blog added");
  document.querySelector(".admin-form").reset();
  preview.classList.add("hidden");
  imageBase64 = "";
}

// ========================================
// LOGOUT
// ========================================
function logout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("role");
  window.location.href = "login.html";
}
