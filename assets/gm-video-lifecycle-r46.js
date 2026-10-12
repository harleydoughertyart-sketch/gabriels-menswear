/* Playback transport shared by page-specific visibility/scene owners. */
(() => {
  const states = new Map();
  let heartbeat = 0;
  let pageActive = true;
  function stop(v, s) {
    clearTimeout(s.retry); s.retry = 0;
    if (!v.paused) v.pause();
  }
  function retry(v, s) {
    if (!s.wanted || !pageActive || document.hidden || s.retry || s.attempts >= 3) return;
    s.retry = setTimeout(() => { s.retry = 0; play(v, s); }, 120);
  }
  function play(v, s) {
    if (!s.wanted || !pageActive || document.hidden) { stop(v, s); return; }
    if (!v.paused || s.pending || s.attempts >= 3) return;
    v.muted = true; v.playsInline = true;
    s.attempts++;
    const token = {};
    s.pending = token;
    setTimeout(() => { if (s.pending === token) { s.pending = null; retry(v,s); } }, 2000);
    Promise.resolve(v.play()).then(() => {
      if (s.pending === token) s.pending = null;
      s.attempts = 0;
      if (!s.wanted || !pageActive || document.hidden) stop(v, s);
    }, () => {
      if (s.pending === token) s.pending = null;
      retry(v, s);
    });
  }
  function get(v) {
    if (states.has(v)) return states.get(v);
    const s = { wanted: false, pending: null, retry: 0, attempts: 0, time: -1, moved: performance.now() };
    states.set(v, s);
    // Safari may pause a muted video when its layer is hidden. Re-entry must
    // not depend on another scroll or an IntersectionObserver threshold.
    v.addEventListener('pause', () => { if (s.wanted) retry(v, s); });
    v.addEventListener('canplay', () => { s.attempts = 0; play(v, s); });
    v.addEventListener('emptied', () => { s.pending = null; });
    return s;
  }
  function poll() {
    heartbeat = 0;
    let any = false;
    states.forEach((s, v) => {
      if (!s.wanted || !pageActive || document.hidden) return;
      any = true;
      // Only a desired visible video can be retried; hidden layers stay paused.
      if (v.paused && !s.pending) retry(v, s);
      if (v.currentTime !== s.time) { s.time = v.currentTime; s.moved = performance.now(); }
      else if (!v.paused && !s.pending && v.readyState >= 2 && performance.now()-s.moved>2500) {
        // A suspended decoder can report "playing" without advancing time.
        s.moved = performance.now(); v.pause(); retry(v,s);
      }
    });
    if (any) heartbeat = setTimeout(poll, 500);
  }
  function set(v, wanted) {
    const s = get(v);
    if (wanted !== s.wanted) { s.wanted = wanted; s.attempts = 0; s.moved = performance.now(); }
    if (!wanted || !pageActive || document.hidden) stop(v, s);
    else { play(v, s); if (!heartbeat) heartbeat = setTimeout(poll, 500); }
  }
  function restore() {
    states.forEach((s,v) => { s.attempts = 0; if (!pageActive || document.hidden) stop(v,s); else if (s.wanted) play(v,s); });
    if (pageActive && !document.hidden && !heartbeat) heartbeat = setTimeout(poll, 500);
  }
  addEventListener('pagehide', () => { pageActive = false; states.forEach((s,v) => { stop(v,s); s.pending=null; }); });
  addEventListener('pageshow', () => {
    pageActive = true;
    restore();
    // History restoration can land after the initial scroll read. Re-read
    // existing scene owners after restoration; do not move the visitor.
    const refresh = () => { dispatchEvent(new Event('resize')); dispatchEvent(new Event('scroll')); restore(); };
    requestAnimationFrame(() => requestAnimationFrame(refresh));
    setTimeout(refresh, 180);
  });
  document.addEventListener('visibilitychange', restore);
  addEventListener('touchend', restore, {passive:true});
  addEventListener('pointerup', restore, {passive:true});
  window.GMVideoLifecycle = Object.freeze({set});
})();
