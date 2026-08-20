/**
 * <site-sidebar active="book"></site-sidebar>
 *
 * Renders the Drimora sidebar + mobile top bar in one drop-in tag.
 * Attributes:
 *   active     - which nav item to highlight: home | tours | book | about | contact
 *   home-href  - defaults to "../index.html" (change if this page lives in a subfolder)
 */
(function () {
  function navLink(key, href, icon, label, active) {
    var isActive = key === active;
    if (isActive) {
      return (
        '<a href="' +
        href +
        '" class="flex items-center justify-between px-3.5 py-2.5 text-amber-400 font-semibold text-sm bg-amber-400/10 border border-amber-400/20 rounded-lg">' +
        '<span class="flex items-center gap-2.5"><i data-lucide="' +
        icon +
        '" class="w-4 h-4"></i>' +
        label +
        "</span>" +
        '<span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>' +
        "</a>"
      );
    }
    return (
      '<a href="' +
      href +
      '" class="flex items-center gap-2.5 px-3.5 py-2.5 text-slate-300 hover:text-amber-400 hover:bg-white/5 font-semibold text-sm rounded-lg transition-all duration-300">' +
      '<i data-lucide="' +
      icon +
      '" class="w-4 h-4"></i>' +
      label +
      "</a>"
    );
  }

  class SiteSidebar extends HTMLElement {
    connectedCallback() {
      var active = this.getAttribute("active") || "";
      var home = this.getAttribute("home-href") || "../index.html";

      this.innerHTML =
        '<div id="sidebar-backdrop" onclick="toggleSidebar()" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 hidden opacity-0 transition-opacity duration-300"></div>' +
        '<div class="md:hidden fixed top-0 left-0 right-0 z-30 h-16 bg-slate-950/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4">' +
        '<a href="' +
        home +
        '" class="text-2xl font-black text-amber-400">Drimora</a>' +
        '<button onclick="toggleSidebar()" class="p-2 text-slate-300 hover:text-white focus:outline-none" aria-label="Toggle Sidebar">' +
        '<i data-lucide="menu" class="w-6 h-6"></i>' +
        "</button>" +
        "</div>" +
        '<aside id="sidebar" class="fixed top-0 left-0 z-50 h-screen w-60 bg-slate-950/95 backdrop-blur-md border-r border-white/10 flex flex-col justify-between p-5 transition-transform duration-300 -translate-x-full md:translate-x-0">' +
        '<div class="flex flex-col gap-6">' +
        '<div class="flex items-center justify-between px-2 pt-2">' +
        '<a href="' +
        home +
        '" class="text-2xl font-black text-amber-400 transition-transform duration-300 hover:scale-105">Drimora</a>' +
        '<button onclick="toggleSidebar()" class="md:hidden text-slate-400 hover:text-white">' +
        '<i data-lucide="x" class="w-5 h-5"></i>' +
        "</button>" +
        "</div>" +
        '<nav class="flex flex-col gap-1.5">' +
        navLink("home", home + "#home", "home", "Home", active) +
        navLink("tours", home + "#tours", "compass", "Tours", active) +
        navLink("book", "booking.html", "ticket", "Book", active) +
        navLink("about", home + "#about", "info", "About", active) +
        navLink("contact", home + "#contact", "mail", "Contact", active) +
        "</nav>" +
        "</div>" +
        '<div class="pt-4 border-t border-white/10 no-print">' +
        '<button onclick="logout()" class="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-linear-to-r from-amber-400/20 to-orange-500/20 hover:from-amber-400/30 hover:to-orange-500/30 border border-amber-400/40 text-white font-semibold text-sm rounded-lg transition-all duration-300 cursor-pointer">' +
        '<i data-lucide="log-out" class="w-4 h-4"></i>Logout' +
        "</button>" +
        "</div>" +
        "</aside>";

      // Icons inside the sidebar need converting too — safe to call even if
      // the page calls lucide.createIcons() again later for its own content.
      if (window.lucide) window.lucide.createIcons();
    }
  }

  if (!customElements.get("site-sidebar")) {
    customElements.define("site-sidebar", SiteSidebar);
  }

  // Shared helpers used by the onclick handlers above — defined once here
  // instead of being copy-pasted into every page's own <script> block.
  window.toggleSidebar = function toggleSidebar() {
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
  };

  if (typeof window.logout !== "function") {
    window.logout = function () {
      window.location.href = "../index.html";
    };
  }
})();
