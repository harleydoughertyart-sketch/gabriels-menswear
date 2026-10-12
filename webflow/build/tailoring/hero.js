/* Source selection only. Shared helpers own playback, pause, and cinema motion. */
(() => {
  const film = document.querySelector('.wf-tailoring-hero-film');
  if (!film) return;
  const mobile = matchMedia('(max-width: 650px)');
  const source = () => {
    // Literal paths: scripts/build-site.mjs only publishes files named in full.
    film.dataset.src = mobile.matches ? 'assets/tailoring-r4-hero-matched-r45-mobile.mp4' : 'assets/tailoring-r4-hero-matched-r45.mp4';
    film.dataset.poster = mobile.matches ? 'assets/tailoring-r4-hero-matched-r45-mobile-poster.webp' : 'assets/tailoring-r4-hero-matched-r45-poster.webp';
    film.poster = film.dataset.poster;
    window.GMPremium?.syncMedia();
  };
  source();
  mobile.addEventListener('change', source);
})();
