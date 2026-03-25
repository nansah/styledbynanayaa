/* ═══════════════════════════════════════════════════════════════════
   STYLED BY NANA YAA — MAIN JS
   ═══════════════════════════════════════════════════════════════════ */

/* ── Sticky Nav ─────────────────────────────────────────────────── */
const header = document.getElementById('site-header');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ── Mobile Menu ─────────────────────────────────────────────────── */
const burger     = document.getElementById('nav-burger');
const mobileMenu = document.getElementById('mobile-menu');

burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ── Scroll Reveal (IntersectionObserver) ────────────────────────── */
function setupReveal() {
  // Tag elements for reveal
  const groups = [
    { sel: '.section-header',    cls: '' },
    { sel: '.world-card',        cls: 'delay-{i}' },
    { sel: '.post--mosaic',      cls: 'delay-{i}' },
    { sel: '.home-shop-card',    cls: 'delay-{i}' },
    { sel: '.about-image-col',   cls: 'reveal--left' },
    { sel: '.about-text-col',    cls: '' },
    { sel: '.ig-tile',           cls: 'delay-{i}' },
    { sel: '.home-ebook-inner',  cls: '' },
    { sel: '.newsletter-inner',  cls: '' },
    { sel: '.full-quote',        cls: '' },
    { sel: '.intro-strip',       cls: '' },
  ];

  const delays = ['', 'delay-1', 'delay-2', 'delay-3', 'delay-4'];

  groups.forEach(({ sel, cls }) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('reveal');
      if (cls === 'reveal--left') el.classList.add('reveal--left');
      if (cls === 'delay-{i}') {
        const d = delays[i % delays.length];
        if (d) el.classList.add(d);
      }
    });
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

setupReveal();

/* ── Parallax ────────────────────────────────────────────────────── */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReduced) {
  const heroImg    = document.querySelector('.hero-img-col img');
  const worldCards = document.querySelectorAll('.world-card-bg');

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const sy = window.scrollY;

      // Hero image parallax — moves at 35% of scroll speed
      if (heroImg && sy < window.innerHeight * 1.2) {
        heroImg.style.transform = `translateY(${sy * 0.35}px)`;
      }

      // Pillar card backgrounds parallax
      worldCards.forEach(bg => {
        const rect   = bg.closest('.world-card').getBoundingClientRect();
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        bg.style.transform = `translateY(${center * 0.12}px)`;
      });

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial call
}

/* ── Active Nav Highlight ─────────────────────────────────────────── */
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) link.classList.add('active');
      });
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

const style = document.createElement('style');
style.textContent = `.nav-link.active { color: var(--gold) !important; }
.nav-link.active::after { width: 100% !important; }`;
document.head.appendChild(style);

/* ── Newsletter ──────────────────────────────────────────────────── */
if (new URLSearchParams(location.search).get('subscribed') === 'true') {
  window.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.newsletter-form');
    if (form) {
      form.innerHTML = '<p style="font-family:var(--font-serif);font-size:1.2rem;font-weight:300;color:var(--gold-light);letter-spacing:0.04em;">You\'re in. ✦ Welcome to the circle.</p>';
    }
    history.replaceState(null, '', location.pathname);
  });
}
