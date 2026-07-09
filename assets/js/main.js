(function () {
  'use strict';

  /* ---------- nav hide/show on scroll ---------- */
  var nav = document.getElementById('nav');
  var lastScrollY = 0;
  var scrollDirection = 'none'; // 'up', 'down', or 'none'
  var navHidden = false;

  function updateNavVisibility() {
    var currentScrollY = window.scrollY || window.pageYOffset;
    var scrollDelta = currentScrollY - lastScrollY;

    // Determine scroll direction (with 5px threshold to avoid jitter)
    if (scrollDelta > 5 && scrollDirection !== 'down') {
      scrollDirection = 'down';
      if (nav && !navHidden) {
        nav.classList.add('nav--hidden');
        navHidden = true;
      }
    } else if (scrollDelta < -5 && scrollDirection !== 'up') {
      scrollDirection = 'up';
      if (nav && navHidden) {
        nav.classList.remove('nav--hidden');
        navHidden = false;
      }
    }

    lastScrollY = currentScrollY;
  }

  window.addEventListener('scroll', updateNavVisibility, { passive: true });

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var links  = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- reveal-on-scroll ---------- */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls    = document.querySelectorAll('.reveal');

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !reduceMotion) {
    gsap.registerPlugin(ScrollTrigger);

    revealEls.forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, y: 32 },
        {
          opacity: 1, y: 0,
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    /* ---------- nav background on scroll ---------- */
    if (nav) {
      ScrollTrigger.create({
        start: 80,
        onEnter:      function () { nav.classList.add('nav--scrolled'); },
        onLeaveBack:  function () { nav.classList.remove('nav--scrolled'); },
      });
    }

  } else {
    /* Fallback: IntersectionObserver or instant show */
    if ('IntersectionObserver' in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  /* ---------- current year in footer ---------- */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
