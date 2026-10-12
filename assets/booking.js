/* Gabriel's Menswear: online booking. This file is the one setting.

   To attach a scheduler, fill in provider and url below (and embed, if you want the
   calendar inside the page), save, and deploy. Nothing else on the site changes.
   Every "Book a fitting" button on the site lands on /book#schedule, which reads this file.

   provider  leave "" for none: /book shows Call to book and Walk in, and never mentions
             online booking. Otherwise one of: "calendly", "square", "acuity", "google",
             "setmore", "booksy", or "other" (any scheduler with a public booking page).
   url       the provider's public booking page, starting https:// (Calendly: your event
             type's scheduling link; Square Appointments: your online booking site's link;
             Acuity: your scheduling page link; Google Calendar: your appointment
             schedule's booking page link; Setmore: your Booking Page URL; Booksy: your
             business's Booksy booking page).
   embed     optional, and only for calendly, acuity, google or setmore: the address inside
             src="..." in the provider's iframe embed code (for Calendly, the scheduling
             link itself). With it, "Pick a time online" opens the calendar inside /book
             instead of going to the provider's page. Square and Booksy embeds open their
             own window or run a script, so those two always use url.

   The provider's own confirmation (its screen, and its email or text) is the booking
   confirmation; /book adds no form of its own. If the provider can send people back to
   a page after booking, use https://gabrielsmenswear.com/book?booked=1 so /book shows a
   short "booked" note and counts it in GA4 (book_confirmed). */
window.GM_BOOKING = {
  provider: "",
  url: "",
  embed: ""
};

/* Below this line: checks the setting and tells /book which state to show. Leave it as is. */
(function (b) {
  var embedHosts = {
    calendly: ["calendly.com"],
    acuity: ["acuityscheduling.com", "as.me"],
    google: ["calendar.google.com"],
    setmore: ["setmore.com"]
  };
  var providers = ["calendly", "square", "acuity", "google", "setmore", "booksy", "other"];
  function secure(u) {
    try { var x = new URL(String(u || "").trim()); return x.protocol === "https:" ? x : null; } catch (e) { return null; }
  }
  function onHost(x, hosts) {
    if (hosts === undefined) return false;
    for (var i = 0; i < hosts.length; i++) {
      var h = hosts[i];
      if (x.hostname === h || x.hostname.slice(-(h.length + 1)) === "." + h) return true;
    }
    return false;
  }
  var p = String(b.provider || "").toLowerCase().trim();
  var page = secure(b.url);
  var frame = secure(b.embed);
  var state = "none";
  if (p) {
    if (providers.indexOf(p) < 0 || page === null) {
      console.warn("booking.js: provider or url not recognized, so /book shows call and walk in only");
    } else {
      state = "link";
      if (frame && onHost(frame, embedHosts[p])) state = "embed";
      else if (String(b.embed || "").trim()) {
        console.warn(embedHosts[p]
          ? "booking.js: embed ignored (it must be an https address on " + p + "'s own domain), so /book uses url"
          : "booking.js: " + p + " has no iframe embed, so /book uses url");
      }
    }
  }
  b.provider = state === "none" ? "" : p;
  b.url = state === "none" ? "" : page.href;
  b.embed = state === "embed" ? frame.href : "";
  b.state = state;
  document.documentElement.setAttribute("data-booking", state);
  if (state === "none") return;
  function wire() {
    var links = document.querySelectorAll("a[data-booking-link]");
    for (var i = 0; i < links.length; i++) links[i].setAttribute("href", b.url);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
})(window.GM_BOOKING);
