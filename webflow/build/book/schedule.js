/* book/schedule: three small jobs, each safe to fail on its own. The booking state is read, never set:
   assets/booking.js marks <html data-booking> and cleans window.GM_BOOKING before the body is parsed.
   1. /book?booked=1 with a scheduler set (the address a provider can send people back to): inside the
      provider's frame, move the whole tab there and stop; otherwise fill the status box from its template,
      send book_confirmed once through window.gmTrack, and put the address bar back to /book so a reload or
      a shared link neither shows the note nor counts again.
   2. The walk-in door's hours line: today's hours in Holden (America/New_York) until closing time, then
      tomorrow's, from data-hours (the site's hours). Never "open now" or "closed". If Intl or the time
      zone fails it keeps the fallback words, which is also what shows without JS.
   3. Embed state only: Pick a time online opens the provider's calendar in place. The iframe is made on
      the first open, never before, so nothing third party loads with the page. If this script fails the
      door is still a plain link to the provider's page (booking.js wrote its href). */
(function () {
  var root = document.querySelector('[data-wf-key="schedule"]');
  if (!root) return;
  var B = window.GM_BOOKING || {};
  var state = document.documentElement.getAttribute("data-booking");
  if (state !== "link" && state !== "embed") state = "none";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------------------- 1. booked -- */
  var booked = false;
  try { booked = new URLSearchParams(window.location.search).get("booked") === "1"; } catch (e) { /* no note */ }
  if (booked && state !== "none") {
    if (window.top !== window.self) {
      try {
        window.top.location.href = window.location.href;
        return;
      } catch (e) { /* a frame on another site: show the note where we are */ }
    }
    var box = root.querySelector(".wf-book-schedule__status");
    var tpl = root.querySelector(".wf-book-schedule__booked-tpl");
    if (box && tpl && tpl.content) box.appendChild(tpl.content.cloneNode(true));
    try {
      var here = new URL(window.location.href);
      here.searchParams.delete("booked");
      window.history.replaceState(window.history.state, "", here.pathname + here.search + here.hash);
    } catch (e) { /* the address keeps ?booked=1 */ }
  }

  /* -------------------------------------------------------------------------------- 2. hours -- */
  (function () {
    var line = root.querySelector(".wf-book-schedule__hours[data-hours]");
    if (!line) return;
    var fallback = line.textContent;
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var rows = null;
    var clock = null;
    try {
      rows = JSON.parse(line.getAttribute("data-hours"));
      clock = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23"
      });
    } catch (e) { rows = null; }

    function minutes(hhmm) {
      var p = String(hhmm).split(":");
      return parseInt(p[0], 10) * 60 + parseInt(p[1] || "0", 10);
    }
    // "18:30" -> "6:30", "11:00" -> "11", "12:00" -> "12": 12-hour, no AM or PM, minutes only when not :00
    function clockFace(hhmm) {
      var m = minutes(hhmm);
      var h = Math.floor(m / 60) % 12 || 12;
      var mm = m % 60;
      return mm ? h + ":" + (mm < 10 ? "0" : "") + mm : String(h);
    }
    function hoursOn(day) {
      for (var i = 0; i < rows.length; i++) if (rows[i].days.indexOf(day) > -1) return rows[i];
      return null;
    }
    function nowInHolden() {
      var parts = clock.formatToParts(new Date());
      var v = {};
      for (var i = 0; i < parts.length; i++) v[parts[i].type] = parts[i].value;
      var h = parseInt(v.hour, 10) % 24;
      if (v.dayPeriod) h = (h % 12) + (/p/i.test(v.dayPeriod) ? 12 : 0); // an engine that ignored hourCycle
      var day = days.indexOf(v.weekday);
      if (day < 0 || isNaN(h)) throw new Error("no weekday or hour");
      return { day: day, mins: h * 60 + parseInt(v.minute, 10) };
    }

    function show() {
      var word = "";
      var span = null;
      if (rows) {
        try {
          var now = nowInHolden();
          var today = hoursOn(now.day);
          if (today && now.mins < minutes(today.close)) {
            word = line.getAttribute("data-today");
            span = today;
          } else {
            span = hoursOn((now.day + 1) % 7);
            word = span ? line.getAttribute("data-tomorrow") : "";
          }
        } catch (e) { span = null; }
      }
      line.textContent = "";
      if (span && word) {
        var w = document.createElement("span");
        w.className = "wf-book-schedule__day";
        w.textContent = word;
        line.appendChild(w);
        line.appendChild(document.createTextNode(" " + clockFace(span.open) + " to " + clockFace(span.close)));
      } else {
        line.textContent = fallback;
      }
      line.classList.add("wf-book-schedule__hours--set");
    }

    show();
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") show();
    });
  })();

  /* -------------------------------------------------------------------------------- 3. embed -- */
  if (state !== "embed" || !B.embed) return;
  var door = root.querySelector(".wf-book-schedule__door--online");
  var panel = root.querySelector(".wf-book-schedule__panel");
  if (!door || !panel) return;
  var frameBox = panel.querySelector(".wf-book-schedule__frame");
  var loading = panel.querySelector(".wf-book-schedule__loading");
  var closer = panel.querySelector(".wf-book-schedule__close");
  var heading = panel.querySelector("h2");
  var grid = root.querySelector(".wf-book-schedule__grid");
  var statement = root.querySelector(".wf-book-schedule__statement");
  var actions = root.querySelector(".wf-book-schedule__actions");
  var wide = window.matchMedia("(min-width: 861px)");
  var frame = null;

  door.setAttribute("aria-controls", panel.id);
  door.setAttribute("aria-expanded", "false");

  function makeFrame() {
    frame = document.createElement("iframe");
    frame.className = "wf-book-schedule__iframe";
    frame.title = heading ? heading.textContent : "";
    frame.setAttribute("allow", "payment");
    frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    frame.addEventListener("load", function () { if (loading) loading.hidden = true; });
    frame.src = B.embed;
    frameBox.appendChild(frame);
  }

  // Desktop: the two columns are centred on each other. Opening the panel makes the actions column far
  // taller, so each column is held where it was (measured just before) until the panel closes again.
  function hold(on) {
    if (!grid || !statement || !actions) return;
    if (on && wide.matches) {
      var top = grid.getBoundingClientRect().top;
      grid.style.setProperty("--wf-bs-hold-s", statement.getBoundingClientRect().top - top + "px");
      grid.style.setProperty("--wf-bs-hold-a", actions.getBoundingClientRect().top - top + "px");
      root.classList.add("wf-book-schedule--held");
    } else if (!on) {
      root.classList.remove("wf-book-schedule--held");
      grid.style.removeProperty("--wf-bs-hold-s");
      grid.style.removeProperty("--wf-bs-hold-a");
    }
  }

  // Phones: bring the door up under the fixed header, so the calendar under it gets the screen.
  function bringIntoView() {
    var bar = document.querySelector(".gm-bar");
    var under = (bar ? bar.getBoundingClientRect().height : 0) + 12;
    var by = door.getBoundingClientRect().top - under;
    if (Math.abs(by) > 2) window.scrollBy({ top: by, behavior: reduce ? "auto" : "smooth" });
  }

  function setOpen(open, refocus) {
    if (open === !panel.hidden) return;
    if (open) {
      hold(true);
      if (!frame) makeFrame();
      panel.hidden = false;
      door.setAttribute("aria-expanded", "true");
      if (!wide.matches) bringIntoView();
    } else {
      panel.hidden = true;
      door.setAttribute("aria-expanded", "false");
      hold(false);
      if (refocus) door.focus();
    }
    // book_click counts the press that opens the calendar, not the one that closes it: the shared click
    // handler reads data-event after this handler, so the attribute changes once this click is done.
    window.setTimeout(function () {
      if (open) door.removeAttribute("data-event");
      else door.setAttribute("data-event", "book_click");
    }, 0);
  }

  door.addEventListener("click", function (e) {
    // a new tab or window (ctrl, cmd, shift, middle button) still goes to the provider's own page
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    setOpen(panel.hidden, false);
  });
  if (closer) closer.addEventListener("click", function () { setOpen(false, true); });
  root.addEventListener("keydown", function (e) {
    if ((e.key === "Escape" || e.key === "Esc") && !panel.hidden && (e.target === door || panel.contains(e.target))) {
      setOpen(false, true);
    }
  });
})();

(() => {const root=document.querySelector('.wf-book-schedule');if(!root)return;const choices=root.querySelectorAll('input[name="fitting-for"]'),count=root.querySelector('.wf-book-group-count'),call=root.querySelector('.wf-book-call');function update(){const group=root.querySelector('input[name="fitting-for"]:checked').value==='group';root.dataset.group=String(group);count.hidden=!group;count.querySelector('input').disabled=!group;count.querySelector('input').required=group;call.firstChild.textContent=group?'Call about your group ':'Call me ';}choices.forEach(input=>input.addEventListener('change',update));update();})();

/* The booking form. FormSubmit emails the shop and, through _autoresponse, the customer; after its spam check,
   _next opens /booked, which shows the visit this saves as gm-booking (date, time, group, occasion; no name or email). */
(() => {const form=document.querySelector('#booking-preview');if(!form)return;const token=String(window.GM_FITTING_REQUEST?.token||'').trim(),ready=/^[a-zA-Z0-9-]{16,160}$/.test(token),button=form.querySelector('button[type=submit]'),status=form.querySelector('#book-request-status');form.querySelectorAll('fieldset').forEach(f=>f.disabled=false);if(ready){form.action='https://formsubmit.co/'+token;button.disabled=false;status.textContent='You’ll get a confirmation page and an email.';}form.addEventListener('submit',event=>{if(!ready){event.preventDefault();return;}if(event.defaultPrevented||form.querySelector('[name=_honey]').value){event.preventDefault();return;}const data=new FormData(form),booking={date:String(data.get('date')||''),time:String(data.get('time')||''),fitting_for:String(data.get('fitting-for')||''),group_size:String(data.get('group-size')||''),occasion:String(data.get('occasion')||''),saved:Date.now()};try{const [y,m,d]=booking.date.split('-').map(Number),[h,min]=booking.time.split(':').map(Number);form.querySelector('[name=appointment]').value=new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(Date.UTC(y,m-1,d))+' at '+new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit',timeZone:'UTC'}).format(Date.UTC(2000,0,1,h,min));}catch(e){}try{localStorage.setItem('gm-booking',JSON.stringify(booking));}catch(e){}window.gmTrack&&gmTrack('generate_lead',{form_name:'fitting_request',fitting_for:booking.fitting_for,occasion:booking.occasion});status.textContent='Finish the spam check in the new tab to confirm your fitting. If it doesn’t go through, your details are still here, or call (508) 829-5186.';});})();
