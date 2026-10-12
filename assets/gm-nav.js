/* Gabriel's Menswear: the phone menu. Every page loads this file (index.html and privacy.html too), so
   the menu works the same everywhere; assets/gm-nav.css has the looks and the markup. Up to 860px the
   header's links fold into a panel that the Menu button opens and closes. Escape, a tap outside, a
   link inside, or Tab past the last link closes it; Escape puts focus back on the button. */
(function () {
  var nav = document.querySelector(".gm-nav");
  var btn = nav && nav.querySelector(".gm-nav__toggle");
  var list = nav && nav.querySelector(".gm-nav__list");
  if (!btn || !list) return;

  function isOpen() {
    return btn.getAttribute("aria-expanded") === "true";
  }
  function set(open, refocus) {
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    nav.classList.toggle("gm-nav--open", open);
    if (!open && refocus) btn.focus();
  }

  btn.addEventListener("click", function () {
    set(!isOpen());
  });
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Escape" || e.key === "Esc") && isOpen()) set(false, nav.contains(document.activeElement));
  });
  document.addEventListener("click", function (e) {
    if (isOpen() && !nav.contains(e.target)) set(false);
  });
  nav.addEventListener("focusout", function (e) {
    if (isOpen() && e.relatedTarget && !nav.contains(e.relatedTarget)) set(false);
  });
  list.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("a")) set(false);
  });

  // Turning a tablet or widening a window past the phone layout closes the panel.
  var wide = window.matchMedia("(min-width: 861px)");
  function onWide() {
    if (wide.matches && isOpen()) set(false);
  }
  if (wide.addEventListener) wide.addEventListener("change", onWide);
  else if (wide.addListener) wide.addListener(onWide);
})();

/* Persistent contact actions: one shared dock, kept outside animated page surfaces. */
(function () {
  if (document.querySelector('.gm-actions')) return;
  var dock = document.createElement('nav');
  dock.className = 'gm-actions';
  dock.setAttribute('aria-label', 'Visit or contact Gabriel');
  var bookingHref = /^\/book(?:\.html)?\/?$/.test(location.pathname) ? '#booking-preview' : '/book#booking-preview';
  dock.innerHTML = '<a class="gm-actions__link gm-actions__link--primary" href="' + bookingHref + '">Book a fitting</a><a class="gm-actions__link" href="https://www.google.com/maps/dir/?api=1&amp;destination=1363%20Main%20St%2C%20Holden%2C%20MA%2001520" target="_blank" rel="noopener noreferrer">Directions</a>';
  document.body.appendChild(dock);
  document.documentElement.classList.add('gm-has-actions');
})();
