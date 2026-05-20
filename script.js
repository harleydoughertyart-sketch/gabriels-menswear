const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navLabel = document.querySelector("[data-nav-label]");
const nav = document.querySelector("[data-nav]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const syncHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

const syncMobileActions = () => {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  const showActions = window.scrollY > hero.offsetHeight - 80;
  document.body.classList.toggle("show-mobile-actions", showActions);
};

syncMobileActions();
window.addEventListener("scroll", syncMobileActions, { passive: true });
window.addEventListener("resize", syncMobileActions);

const setNavOpen = (isOpen) => {
  navToggle?.setAttribute("aria-expanded", String(isOpen));
  nav?.classList.toggle("is-open", isOpen);
  header?.classList.toggle("nav-active", isOpen);
  document.body.classList.toggle("nav-open", isOpen);
  if (navLabel) navLabel.textContent = isOpen ? "Close navigation" : "Open navigation";
};

const closeNav = () => setNavOpen(false);

navToggle?.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  setNavOpen(!isOpen);
});

nav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) closeNav();
});

window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const wasOpen = navToggle?.getAttribute("aria-expanded") === "true";
  closeNav();
  if (wasOpen) navToggle?.focus();
});

const scrollToHashTarget = () => {
  if (!window.location.hash) return;
  const id = decodeURIComponent(window.location.hash.slice(1));
  document.getElementById(id)?.scrollIntoView({ block: "start" });
};

const queueHashScroll = () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(scrollToHashTarget);
  });
  window.setTimeout(scrollToHashTarget, 320);
};

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", queueHashScroll, { once: true });
} else {
  queueHashScroll();
}

window.addEventListener("load", queueHashScroll);
window.addEventListener("hashchange", queueHashScroll);

const revealTargets = [...document.querySelectorAll("[data-reveal]")];

if (!prefersReducedMotion.matches) {
  revealTargets.forEach((element, index) => {
    element.style.setProperty("--reveal-delay", `${(index % 4) * 45}ms`);
    element.style.transitionDelay = `var(--reveal-delay)`;
  });
}

if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
  revealTargets.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.style.willChange = "opacity, transform";
        entry.target.classList.add("is-visible");
        entry.target.addEventListener(
          "transitionend",
          () => {
            entry.target.style.willChange = "auto";
          },
          { once: true },
        );
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.16 },
  );

  revealTargets.forEach((element) => revealObserver.observe(element));
}

if (window.lucide) {
  window.lucide.createIcons();
  document.querySelectorAll("svg.lucide").forEach((icon) => {
    icon.setAttribute("aria-hidden", "true");
    icon.setAttribute("focusable", "false");
  });
}
