/**
 * <site-header title="Our Tours" subtitle="Tour & Travel Lists" search="true"></site-header>
 *
 * Renders the Drimora content header: a sticky top bar for the main
 * content area. Sits below the fixed mobile top bar and beside the
 * fixed left sidebar (site-sidebar) on desktop — drop it as the first
 * child inside <main>, after <site-sidebar>.
 *
 * Attributes:
 *   title      - main heading text shown on the left
 *   subtitle   - small eyebrow label above the title (optional)
 *   search     - "true" to show a quick search input on the right (optional)
 */
(function () {
  class SiteHeader extends HTMLElement {
    connectedCallback() {
      // Keep the custom-element host in the sticky flow. The inner header
      // remains a normal block so its height is preserved while scrolling.
      this.style.display = "block";
      this.style.position = "sticky";
      this.classList.add("top-16", "md:top-0", "z-30");

      var title = this.getAttribute("title") || "";
      var subtitle = this.getAttribute("subtitle") || "";
      var showSearch = this.getAttribute("search") === "true";

      this.innerHTML =
        '<header class="border-b border-slate-200/80 bg-white/95 backdrop-blur-md">' +
        '<div class="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">' +
        "<div>" +
        (subtitle
          ? '<p class="text-xs font-bold uppercase tracking-wider text-amber-600">' +
            subtitle +
            "</p>"
          : "") +
        (title
          ? '<h1 class="mt-1 text-xl font-black text-slate-950 sm:text-2xl">' +
            title +
            "</h1>"
          : "") +
        "</div>" +
        (showSearch
          ? '<label class="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:w-72">' +
            '<span class="sr-only">Search</span>' +
            '<i data-lucide="search" class="w-4 h-4 shrink-0 text-slate-400"></i>' +
            '<input type="search" placeholder="Search..." class="w-full border-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400" />' +
            "</label>"
          : "") +
        "</div>" +
        "</header>";

      if (window.lucide) window.lucide.createIcons();
    }
  }

  if (!customElements.get("site-header")) {
    customElements.define("site-header", SiteHeader);
  }
})();
