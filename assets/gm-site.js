/* Gabriel's Menswear: the shared script for the pages webflow builds (/tailoring, /weddings, /prom,
   /book). Loaded with defer after scrollcraft.js and before the page's own assets/wf/<page>.js.

   1. Mounts scrollcraft once for the page (flow reveals, stagger, --sc-p, the background drift).
   2. Darkens the fixed header while a section marked data-gm-dark is under it, the way the home page
      does for its navy and footage acts.
   Click tracking and window.gmTrack live in assets/gm-nav.js, which every page loads. */
(function () {
  if (window.ScrollCraft) window.ScrollCraft.mount(document.body);

  // The fixed bar inherits the drift colour, so it turns dark while a dark section occupies the top
  // of the viewport.
  (function () {
    var bar = document.querySelector(".gm-bar");
    var darks = document.querySelectorAll("[data-gm-dark]");
    if (!bar || !darks.length || !("IntersectionObserver" in window)) return;
    var active = new Set();
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) active.add(e.target);
          else active.delete(e.target);
        });
        bar.classList.toggle("gm-bar--ondark", active.size > 0);
      },
      { rootMargin: "0px 0px -92% 0px" }
    );
    darks.forEach(function (el) { io.observe(el); });
  })();
})();
