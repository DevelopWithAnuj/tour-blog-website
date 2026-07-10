const loader = document.getElementById("pageLoader");
const blogDetails = document.getElementById("blogDetails");
const commentsDiv = document.getElementById("comments");
const commentInput = document.getElementById("commentInput");

// Get full blog object (NOT ID)
const blog = JSON.parse(localStorage.getItem("currentBlog"));
const blogs = JSON.parse(localStorage.getItem("blogs")) || [];

// Loader
window.addEventListener("load", () => {
  setTimeout(() => {
    if (loader) loader.style.display = "none";
  }, 500);
});

// Blog safety
if (!blog) {
  blogDetails.innerHTML = `
    <h2>Blog not found</h2>
    <a href="index.html">← Back</a>
  `;
} else {
  blogDetails.innerHTML = `
    <img src="${blog.image}" alt="${blog.title}">
    <div class="blog-detail-body">
      <h1>${blog.title}</h1>
      <p>${blog.content}</p>
    </div>
  `;
}

// ========================================
// COMMENTS
// ========================================
const commentKey = `comments_${blog?.id}`;
let comments = JSON.parse(localStorage.getItem(commentKey)) || [];

function renderComments() {
  if (comments.length === 0) {
    commentsDiv.innerHTML = `<p>No comments yet</p>`;
    return;
  }

  commentsDiv.innerHTML = comments
    .map(
      (c, i) => `
      <div class="comment">
        <strong>#${i + 1}</strong> ${c}
      </div>
    `
    )
    .join("");
}

function addComment() {
  const text = commentInput.value.trim();
  if (!text) return alert("Write something");

  comments.push(text);
  localStorage.setItem(commentKey, JSON.stringify(comments));
  commentInput.value = "";
  renderComments();
}

renderComments();

// ========================================
// LOGOUT
// ========================================
function logout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("role");
  window.location.href = "login.html";
}
