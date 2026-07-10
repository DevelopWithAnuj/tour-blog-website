const table = document.getElementById("blogTable");
let blogs = JSON.parse(localStorage.getItem("blogs")) || [];

function renderTable() {
  if (!table) return;

  if (blogs.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 40px; opacity: 0.6;">
          No blogs yet. <a href="admin.html" style="color: #facc15;">Create one now</a>
        </td>
      </tr>
    `;
    return;
  }

  table.innerHTML = blogs
    .map(
      (b, i) => `
    <tr>
      <td>${b.title}</td>
      <td><img src="${b.image}" alt="${
        b.title
      }" width="80" style="height: 60px; object-fit: cover;"></td>
      <td>${b.content.slice(0, 40)}...</td>
      <td>
        <button onclick="editBlog(${i})">Edit</button>
        <button onclick="deleteBlog(${i})" style="background: #e74c3c;">Delete</button>
      </td>
    </tr>
  `
    )
    .join("");
}

function deleteBlog(index) {
  if (confirm("Are you sure? This cannot be undone.")) {
    blogs.splice(index, 1);
    localStorage.setItem("blogs", JSON.stringify(blogs));
    renderTable();
    alert("Blog deleted successfully");
  }
}

function editBlog(index) {
  const newTitle = prompt("Edit title", blogs[index].title);
  if (!newTitle) return;

  const newContent = prompt("Edit content", blogs[index].content);
  if (!newContent) return;

  blogs[index] = {
    ...blogs[index],
    title: newTitle,
    content: newContent,
  };

  localStorage.setItem("blogs", JSON.stringify(blogs));
  renderTable();
  alert("Blog updated successfully");
}

renderTable();

// ========================================
// NAVIGATION
// ========================================
function logout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("role");
  window.location.href = "login.html";
}
