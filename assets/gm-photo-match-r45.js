/* Per-photograph display correction. Original files and actual suit colours are retained. */
(() => {
  const looks = [
    // asset family, saturation, red/green/blue gains, midtone exponent
    ['home-wedding-walk', .88, .985, .997, 1.02, .99],
    ['prom-r14-new', .88, .99, .985, 1.018, .99],
    ['prom-existing-suit-r40', .88, 1.012, 1.004, .981, 1],
    ['weddings-r13-groom', .88, .973, 1.004, 1.035, .98],
    ['weddings-r13-groomsman', .91, 1.005, .989, 1.012, .99],
    ['weddings-r13-guest', .96, 1.005, 1, .995, .99],
    ['gabriel-portrait-cool', .94, .998, 1, 1.008, .99],
    ['tailoring-r11-cloth', .98, 1, 1, 1, .99],
    ['tailoring-r11-cuff', .94, .993, 1, 1.011, .99],
    ['tailoring-r11-stitch', .92, .992, 1, 1.013, .98]
  ];
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = 'position:absolute;pointer-events:none';
  svg.innerHTML = '<defs>' + looks.map(([asset,sat,r,g,b,gamma],i) =>
    `<filter id="gm-photo-r45-${i}" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="${sat}"/><feComponentTransfer><feFuncR type="gamma" amplitude="${r}" exponent="${gamma}" offset="0"/><feFuncG type="gamma" amplitude="${g}" exponent="${gamma}" offset="0"/><feFuncB type="gamma" amplitude="${b}" exponent="${gamma}" offset="0"/></feComponentTransfer></filter>`
  ).join('') + '</defs>';
  document.body.append(svg);
  const style = document.createElement('style');
  style.dataset.photoMatch = 'r45';
  style.textContent = looks.map(([asset],i) =>
    `main img[src*="/${asset}"]{filter:url("#gm-photo-r45-${i}")}`
  ).join('\n');
  document.head.append(style);
})();
