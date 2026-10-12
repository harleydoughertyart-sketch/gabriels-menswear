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

/* Visit tracking, one listener for every page. GA4 records each page view with its landing page and
   traffic source by itself; this adds what people do on the page:
   - Clicks that matter. A link's data-event names its event; otherwise tel: links send call_click,
     Google Maps place links reviews_click, other Maps links directions_click, and links to the booking
     page book_click, with link_location and link_text.
   - tab_select (tab_name) when a tab is picked, such as the home page's Weddings / Prom / Tailoring.
   - faq_open (faq_question) the first time each FAQ answer is opened.
   - section_view (section_name) once per section, when it reaches the upper half of the screen, so
     reports show how far down each page people read.
   link_location and section_name are the id or label of the closest section, header, footer or the
   bottom action bar. Each event goes to GA4 directly (gtag) and to the dataLayer for GTM. */
(function () {
  function send(name, params) {
    var push = { event: name };
    for (var k in params) if (Object.prototype.hasOwnProperty.call(params, k)) push[k] = params[k];
    try { window.dataLayer && window.dataLayer.push(push); } catch (_) {}
    try { window.gtag && window.gtag('event', name, params); } catch (_) {}
  }
  function words(el) {
    return ((el && (el.innerText || el.textContent)) || '').replace(/\s+/g, ' ').trim().slice(0, 100);
  }
  function label(el) {
    if (!el) return 'page';
    var by = el.getAttribute('aria-labelledby');
    return el.id || el.getAttribute('aria-label') || (by && words(document.getElementById(by))) || el.tagName.toLowerCase();
  }
  // The section wins over a header inside it; only the site header itself reports "header".
  function where(el) {
    var sec = el.closest('section, footer, .gm-actions');
    return sec ? label(sec) : el.closest('header') ? 'header' : 'page';
  }
  // Section scripts raise their own events (a fitting request, a booking confirmation) through this.
  window.gmTrack = function (name, params) { send(name, params || {}); };

  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    var tab = e.target.closest('button[aria-controls][aria-selected]');
    if (tab) return send('tab_select', { tab_name: words(tab), link_location: where(tab) });
    var a = e.target.closest('a');
    if (!a) return;
    var h = a.getAttribute('href') || '';
    var name = a.getAttribute('data-event');
    if (!name) {
      if (/^tel:/.test(h)) name = 'call_click';
      else if (/google\.com\/maps\/place/.test(h)) name = 'reviews_click';
      else if (/google\.com\/maps/.test(h)) name = 'directions_click';
      else if (/^(?:https:\/\/gabrielsmenswear\.com)?\/book(?:\.html)?(?:[?#]|$)|^#booking-preview$/.test(h)) name = 'book_click';
    }
    if (name) send(name, { link_location: where(a), link_text: words(a) });
  });

  // toggle does not bubble, so listen in the capture phase.
  document.addEventListener('toggle', function (e) {
    var d = e.target;
    if (!d.open || !d.closest || !d.closest('.gm-faq, .gm-service-faq') || d.hasAttribute('data-gm-opened')) return;
    d.setAttribute('data-gm-opened', '');
    send('faq_open', { faq_question: words(d.querySelector('summary')) });
  }, true);

  if (!window.IntersectionObserver) return;
  var reached = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      reached.unobserve(entry.target);
      send('section_view', { section_name: label(entry.target) });
    });
  }, { rootMargin: '0px 0px -50% 0px' });
  document.querySelectorAll('section').forEach(function (sec) {
    if (!sec.parentElement.closest('section')) reached.observe(sec);
  });
})();
