/* Gabriel's Menswear: the shared script for the pages webflow builds (/tailoring, /weddings, /prom,
   /book). Loaded with defer after scrollcraft.js and before the page's own assets/wf/<page>.js.
   index.html keeps its own inline copy of the same tracker and does not load this file.

   1. Mounts scrollcraft once for the page (flow reveals, stagger, --sc-p, the background drift).
   2. Darkens the fixed header while a section marked data-gm-dark is under it, the way the home page
      does for its navy and footage acts.
   3. Conversion events: the home page's click tracker, unchanged. A link's data-event names the event;
      without one, tel: links send call_click and Google Maps links directions_click. link_location is
      the id of the closest section (or "header" / "footer").
   4. window.gmTrack(name, params): the same two sends for events a section script raises itself (a
      share button, a booking confirmation). */
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

  // Conversion events: every call, directions, and review-profile click
  // goes to GA4 directly (gtag) and to the dataLayer for GTM.
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a") : null;
    if (!a) return;
    var h = a.getAttribute("href") || "";
    var name = a.getAttribute("data-event");
    if (!name) {
      if (/^tel:/.test(h)) name = "call_click";
      else if (/google\.com\/maps/.test(h)) name = "directions_click";
    }
    if (!name) return;
    var sec = a.closest("section, header, footer");
    var loc = sec ? (sec.id || sec.getAttribute("aria-label") || sec.tagName.toLowerCase()) : "page";
    try { window.dataLayer && window.dataLayer.push({ event: name, link_location: loc }); } catch (_) {}
    try { window.gtag && window.gtag("event", name, { link_location: loc }); } catch (_) {}
  });

  window.gmTrack = function (name, params) {
    var p = {};
    for (var k in params || {}) if (Object.prototype.hasOwnProperty.call(params, k)) p[k] = params[k];
    var push = { event: name };
    for (var j in p) push[j] = p[j];
    try { window.dataLayer && window.dataLayer.push(push); } catch (_) {}
    try { window.gtag && window.gtag("event", name, p); } catch (_) {}
  };
})();
