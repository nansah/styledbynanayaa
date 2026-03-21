/* ═══════════════════════════════════════════════════════════════════
   STYLED BY NANA YAA — MAIN JS
   ═══════════════════════════════════════════════════════════════════ */

/* ── Sticky Nav ─────────────────────────────────────────────────── */
const header = document.getElementById('site-header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  header.classList.toggle('scrolled', scrollY > 60);
  lastScroll = scrollY;
}, { passive: true });

/* ── Mobile Menu ─────────────────────────────────────────────────── */
const burger = document.getElementById('nav-burger');
const mobileMenu = document.getElementById('mobile-menu');

burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

// Close on link click
mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ── Scroll Reveal ───────────────────────────────────────────────── */
const revealElements = document.querySelectorAll(
  '.pillar, .post-card, .post--hero, .post--side, .about-text-col, .about-image-col, .ig-tile, .section-header, .ig-setup-banner'
);

revealElements.forEach(el => el.classList.add('fade-up'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealElements.forEach(el => observer.observe(el));

/* ── Newsletter Subscribe ────────────────────────────────────────── */
// Show success message if redirected back from Beehiiv after subscribing
if (new URLSearchParams(location.search).get('subscribed') === 'true') {
  window.addEventListener('DOMContentLoaded', function () {
    var form = document.querySelector('.newsletter-form');
    if (form) {
      form.innerHTML = '<p style="font-family:var(--font-serif);font-size:1.2rem;font-weight:300;color:var(--gold-light);letter-spacing:0.04em;">You\'re in. ✦ Welcome to the circle.</p>';
    }
    history.replaceState(null, '', location.pathname);
  });
}

/* ── Smooth Active Nav Highlight ─────────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(section => sectionObserver.observe(section));

/* ── Subtle Hero Parallax ────────────────────────────────────────── */
// Hero is now bright (not dark), parallax applies to the decorative circle
const heroDecorCircle = document.querySelector('.hero-decor-circle');
if (heroDecorCircle && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroDecorCircle.style.transform = `translateY(calc(-50% + ${scrolled * 0.15}px))`;
    }
  }, { passive: true });
}

/* ── Add .active style for nav ───────────────────────────────────── */
const style = document.createElement('style');
style.textContent = `
  .nav-link.active { color: var(--gold) !important; }
  .nav-link.active::after { width: 100% !important; }
`;
document.head.appendChild(style);
