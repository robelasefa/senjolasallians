/**
 * Senjo Lasallians – Main JavaScript
 * Auto-advancing carousel · Pill indicators · Nav scroll ·
 * Mobile menu · Typed text · Testimonials · Counters · Forms
 */

'use strict';

/* ── Utility helpers ─────────────────────────────────────────── */
const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ═══════════════════════════════════════════════════════════════
   1.  HEADER — scroll‑triggered background + active nav links
   ═══════════════════════════════════════════════════════════════ */
function initHeader() {
  const header = qs('#header');
  const navLinks = qsa('.nav-links a');

  if (!header) return;

  // Scroll class
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // Active nav link via IntersectionObserver
  const sections = qsa('main section[id]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  }, { rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h') || '72')}px 0px -50% 0px` });

  sections.forEach(s => observer.observe(s));

  // Smooth scroll for ALL nav links (same-page anchors)
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = qs(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion() ? 'instant' : 'smooth' });
      // Close mobile menu if open
      closeMobileMenu();
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
   2.  MOBILE MENU — drawer toggle + keyboard trap
   ═══════════════════════════════════════════════════════════════ */
function initMobileMenu() {
  const btn = qs('#mobile-menu-btn');
  const nav = qs('#nav-menu');
  if (!btn || !nav) return;

  const focusableEls = () => qsa('a, button', nav).filter(el => !el.disabled);

  function openMobileMenu() {
    nav.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close navigation menu');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenuFn() {
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open navigation menu');
    document.body.style.overflow = '';
  }

  // Expose globally so other modules can close it
  window._closeMobileMenu = closeMobileMenuFn;

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.contains('open');
    isOpen ? closeMobileMenuFn() : openMobileMenu();
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) closeMobileMenuFn();
  });

  // Trap focus inside open menu
  nav.addEventListener('keydown', e => {
    if (e.key !== 'Tab' || !nav.classList.contains('open')) return;
    const els = focusableEls();
    const first = els[0];
    const last = els[els.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (nav.classList.contains('open') && !nav.contains(e.target) && !btn.contains(e.target)) {
      closeMobileMenuFn();
    }
  });
}

function closeMobileMenu() {
  if (typeof window._closeMobileMenu === 'function') window._closeMobileMenu();
}

/* ═══════════════════════════════════════════════════════════════
   3.  HERO CAROUSEL — auto-advance every 5s with fade + pill
   ═══════════════════════════════════════════════════════════════ */
function initHeroCarousel() {
  const slides = qsa('.carousel-slide');
  const indicators = qsa('.carousel-indicators .indicator');
  if (!slides.length) return;

  let current = 0;
  let timer = null;
  const DELAY = 5000;
  const DURATION = 700; // matches CSS --dur-carousel
  let transitioning = false;

  function goTo(idx) {
    if (transitioning || idx === current) return;
    transitioning = true;

    const prev = current;
    current = (idx + slides.length) % slides.length;

    // Fade out old
    slides[prev].classList.remove('active');

    // Fade in new after one frame (allows CSS transition to fire)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        slides[current].classList.add('active');

        // Update indicators
        indicators.forEach((ind, i) => {
          const active = i === current;
          ind.classList.toggle('active', active);
          ind.setAttribute('aria-selected', String(active));
          ind.tabIndex = active ? 0 : -1;
        });

        setTimeout(() => { transitioning = false; }, DURATION);
      });
    });
  }

  function nextSlide() { goTo(current + 1); }

  function startAuto() {
    stopAuto();
    if (!prefersReducedMotion()) timer = setInterval(nextSlide, DELAY);
  }

  function stopAuto() { clearInterval(timer); timer = null; }

  // Indicator clicks
  indicators.forEach((ind, i) => {
    ind.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); });
    ind.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stopAuto(); goTo(i); startAuto(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); indicators[(i + 1) % indicators.length].focus(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); indicators[(i - 1 + indicators.length) % indicators.length].focus(); }
    });
  });

  // Pause on hover / focus
  const hero = qs('.hero');
  if (hero) {
    hero.addEventListener('mouseenter', stopAuto);
    hero.addEventListener('mouseleave', startAuto);
    hero.addEventListener('focusin', stopAuto);
    hero.addEventListener('focusout', startAuto);
  }

  // Swipe support (touch)
  let touchStartX = 0;
  const carousel = qs('.hero-carousel');
  if (carousel) {
    carousel.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) { stopAuto(); goTo(current + (dx < 0 ? 1 : -1)); startAuto(); }
    }, { passive: true });
  }

  startAuto();
}

/* ═══════════════════════════════════════════════════════════════
   4.  TYPED ANIMATION (hero heading)
   ═══════════════════════════════════════════════════════════════ */
function initTypedText() {
  const textEl = qs('.animated-text');
  if (!textEl) return;

  if (prefersReducedMotion()) {
    textEl.textContent = 'Sharing';
    return;
  }

  const words = ['Sharing', 'Compassion', 'Generosity', 'Kindness', 'Empathy', 'Faith'];
  let wordIdx = 0;

  function typeWord(word) {
    let i = 0;
    const typeId = setInterval(() => {
      textEl.textContent = word.substring(0, i + 1);
      i++;
      if (i >= word.length) {
        clearInterval(typeId);
        setTimeout(deleteWord, 2200);
      }
    }, 95);
  }

  function deleteWord() {
    const word = textEl.textContent;
    let j = word.length;
    const delId = setInterval(() => {
      textEl.textContent = word.substring(0, j - 1);
      j--;
      if (j <= 0) {
        clearInterval(delId);
        wordIdx = (wordIdx + 1) % words.length;
        setTimeout(() => typeWord(words[wordIdx]), 450);
      }
    }, 45);
  }

  typeWord(words[0]);
}

/* ═══════════════════════════════════════════════════════════════
   5.  TESTIMONIAL SLIDER
   ═══════════════════════════════════════════════════════════════ */
function initTestimonialSlider() {
  const slides = qsa('.testimonial-slide');
  const dots = qsa('.slider-dots .dot');
  const prevBtn = qs('#prev-btn');
  const nextBtn = qs('#next-btn');
  if (!slides.length) return;

  let current = 0;
  let timer = null;

  function showSlide(idx) {
    const next = (idx + slides.length) % slides.length;

    slides.forEach((s, i) => {
      const active = i === next;
      s.style.display = active ? 'block' : 'none';
      s.classList.toggle('active', active);
    });

    dots.forEach((d, i) => {
      const active = i === next;
      d.classList.toggle('active', active);
      d.setAttribute('aria-selected', String(active));
      d.tabIndex = active ? 0 : -1;
    });

    current = next;
  }

  function startAuto() {
    stopAuto();
    timer = setInterval(() => showSlide(current + 1), 6000);
  }

  function stopAuto() { clearInterval(timer); timer = null; }

  if (prevBtn) prevBtn.addEventListener('click', () => { stopAuto(); showSlide(current - 1); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { stopAuto(); showSlide(current + 1); startAuto(); });

  dots.forEach((d, i) => {
    d.addEventListener('click', () => { stopAuto(); showSlide(i); startAuto(); });
    d.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stopAuto(); showSlide(i); startAuto(); }
    });
  });

  const slider = qs('.testimonial-slider');
  if (slider) {
    slider.addEventListener('mouseenter', stopAuto);
    slider.addEventListener('mouseleave', startAuto);
    slider.addEventListener('focusin', stopAuto);
    slider.addEventListener('focusout', startAuto);
  }

  showSlide(0);
  startAuto();
}

/* ═══════════════════════════════════════════════════════════════
   6.  SCROLL ANIMATIONS (IntersectionObserver)
   ═══════════════════════════════════════════════════════════════ */
function initScrollAnimations() {
  const elements = qsa('.animate-element');
  if (!elements.length) return;

  if (prefersReducedMotion()) {
    elements.forEach(el => el.classList.add('animated'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => el.classList.add('animated'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════════════════════════════
   7.  COUNTER ANIMATION (impact stats)
   ═══════════════════════════════════════════════════════════════ */
function initCounters() {
  const counters = qsa('.counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-target'), 10);
      const dur = prefersReducedMotion() ? 0 : 1800;

      if (dur === 0) { el.textContent = target.toLocaleString(); observer.unobserve(el); return; }

      const start = performance.now();

      function step(now) {
        const progress = Math.min((now - start) / dur, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString();
      }

      requestAnimationFrame(step);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* ═══════════════════════════════════════════════════════════════
   8.  CONTACT FORM — client-side validation
   ═══════════════════════════════════════════════════════════════ */
function initContactForm() {
  const form = qs('#contactForm');
  if (!form) return;

  function showError(inputId, msg) {
    const el = qs(`#${inputId}-error`);
    const input = qs(`#${inputId}`);
    if (el) { el.textContent = msg; }
    if (input) { input.setAttribute('aria-invalid', 'true'); }
  }

  function clearError(inputId) {
    const el = qs(`#${inputId}-error`);
    const input = qs(`#${inputId}`);
    if (el) { el.textContent = ''; }
    if (input) { input.removeAttribute('aria-invalid'); }
  }

  function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  // Live validation on blur
  ['name', 'email', 'subject', 'message'].forEach(id => {
    const input = qs(`#${id}`);
    if (!input) return;
    input.addEventListener('blur', () => {
      if (!input.value.trim()) {
        showError(id, `${input.labels?.[0]?.textContent || id} is required.`);
      } else if (id === 'email' && !validateEmail(input.value.trim())) {
        showError(id, 'Please enter a valid email address.');
      } else {
        clearError(id);
      }
    });
    input.addEventListener('input', () => clearError(id));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    const fields = [
      { id: 'name', label: 'Full Name' },
      { id: 'email', label: 'Email Address' },
      { id: 'subject', label: 'Subject' },
      { id: 'message', label: 'Message' },
    ];

    fields.forEach(({ id, label }) => {
      const input = qs(`#${id}`);
      const val = input?.value.trim() || '';
      if (!val) {
        showError(id, `${label} is required.`);
        valid = false;
      } else if (id === 'email' && !validateEmail(val)) {
        showError(id, 'Please enter a valid email address.');
        valid = false;
      } else {
        clearError(id);
      }
    });

    if (!valid) {
      qs('[aria-invalid="true"]', form)?.focus();
      return;
    }

    // Success state
    const existing = qs('.form-success', form);
    if (existing) existing.remove();

    const msg = document.createElement('div');
    msg.className = 'form-success';
    msg.setAttribute('role', 'status');
    msg.setAttribute('aria-live', 'polite');
    msg.textContent = '✓ Thank you! Your message has been sent. We\'ll be in touch soon.';
    form.appendChild(msg);
    form.reset();
    msg.focus?.();
  });
}

/* ═══════════════════════════════════════════════════════════════
   9.  NEWSLETTER FORM
   ═══════════════════════════════════════════════════════════════ */
function initNewsletterForm() {
  const form = qs('#newsletterForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = qs('#newsletter-email', form);
    if (!input) return;

    const val = input.value.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!val || !emailRe.test(val)) {
      input.style.borderColor = 'var(--color-error)';
      return;
    }

    input.style.borderColor = '';
    const btn = qs('button[type="submit"]', form);
    if (btn) { btn.textContent = 'Subscribed ✓'; btn.disabled = true; }
    form.reset();
  });
}

/* ═══════════════════════════════════════════════════════════════
   10.  FOOTER YEAR
   ═══════════════════════════════════════════════════════════════ */
function setYear() {
  const el = qs('#currentYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* ═══════════════════════════════════════════════════════════════
   BOOTSTRAP
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initHeroCarousel();
  initTypedText();
  initTestimonialSlider();
  initScrollAnimations();
  initCounters();
  initContactForm();
  initNewsletterForm();
  setYear();
});