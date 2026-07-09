(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =====================================================
     HERO MICRO-INTERACTIONS
     1. Staggered entrance animation on load
     2. Animated stat counters
     3. Subtle mouse parallax on headline
     4. Scroll hint visibility
  ===================================================== */
  (function initHero() {
    var entranceEls = document.querySelectorAll('.hero-entrance');
    var scrollHint  = document.querySelector('.hero-scroll-hint');
    var heroCopy    = document.querySelector('.hero-copy');
    var heroSection = document.getElementById('s-hero');

    /* --- 1. Staggered entrance --- */
    function fireEntrance() {
      entranceEls.forEach(function (el) {
        el.classList.add('is-ready');
      });
      if (scrollHint) scrollHint.classList.add('is-ready');
    }

    if (reduceMotion) {
      fireEntrance();
    } else {
      // Small RAF delay so paint has settled before triggering transitions
      requestAnimationFrame(function () {
        requestAnimationFrame(fireEntrance);
      });
    }

    /* --- 2. Stat counter animation --- */
    function animateCounters() {
      var nums = document.querySelectorAll('.hero-stat-num[data-count]');
      nums.forEach(function (el) {
        var target = parseInt(el.getAttribute('data-count'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        var duration = 1200; // ms
        var start = null;
        var startVal = 0;

        function step(ts) {
          if (!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          // Ease out cubic
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = Math.floor(eased * target);
          el.textContent = current + suffix;
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
        }
        requestAnimationFrame(step);
      });

      // Static text (1:1)
      var textNums = document.querySelectorAll('.hero-stat-num[data-count-text]');
      textNums.forEach(function (el) {
        setTimeout(function () {
          el.style.transition = 'opacity .4s ease';
          el.style.opacity = '0';
          setTimeout(function () {
            el.textContent = el.getAttribute('data-count-text');
            el.style.opacity = '1';
          }, 200);
        }, 900);
      });
    }

    if (!reduceMotion) {
      // Fire counters after the entrance delay
      setTimeout(animateCounters, 800);
    } else {
      // Instant values
      document.querySelectorAll('.hero-stat-num[data-count]').forEach(function (el) {
        el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
      });
      document.querySelectorAll('.hero-stat-num[data-count-text]').forEach(function (el) {
        el.textContent = el.getAttribute('data-count-text');
      });
    }

    /* --- 3. Mouse parallax on headline --- */
    if (!reduceMotion && heroCopy && heroSection) {
      var heroRect = null;
      var targetX = 0, targetY = 0;
      var currentX = 0, currentY = 0;
      var rafId = null;
      var isInHero = true;

      function updateRect() {
        heroRect = heroSection.getBoundingClientRect();
      }
      updateRect();
      window.addEventListener('resize', updateRect, { passive: true });

      document.addEventListener('mousemove', function (e) {
        if (!isInHero) return;
        var cx = window.innerWidth  / 2;
        var cy = window.innerHeight / 2;
        targetX = (e.clientX - cx) / cx * -3.5; // max ±3.5px
        targetY = (e.clientY - cy) / cy * -2.0; // max ±2px
      }, { passive: true });

      // Stop parallax when hero scrolls out of view
      window.addEventListener('scroll', function () {
        isInHero = window.scrollY < (heroSection.offsetTop + heroSection.offsetHeight * 0.5);
      }, { passive: true });

      function lerp(a, b, t) { return a + (b - a) * t; }

      function parallaxLoop() {
        currentX = lerp(currentX, targetX, 0.06);
        currentY = lerp(currentY, targetY, 0.06);
        heroCopy.style.transform = 'translate(' + currentX.toFixed(2) + 'px,' + currentY.toFixed(2) + 'px)';
        rafId = requestAnimationFrame(parallaxLoop);
      }
      parallaxLoop();
    }

    /* --- 4. Hide scroll hint once user scrolls --- */
    if (scrollHint) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 80) {
          scrollHint.style.opacity = '0';
          scrollHint.style.pointerEvents = 'none';
        } else {
          scrollHint.style.opacity = '';
          scrollHint.style.pointerEvents = '';
        }
      }, { passive: true });
    }

  })();

  /* ---------- nav hide/show on scroll ---------- */
  var nav = document.getElementById('nav');
  var lastScrollY = 0;
  var scrollDirection = 'none';
  var navHidden = false;

  function updateNavVisibility() {
    var currentScrollY = window.scrollY || window.pageYOffset;
    var scrollDelta = currentScrollY - lastScrollY;
    if (scrollDelta > 5 && scrollDirection !== 'down') {
      scrollDirection = 'down';
      if (nav && !navHidden) { nav.classList.add('nav--hidden'); navHidden = true; }
    } else if (scrollDelta < -5 && scrollDirection !== 'up') {
      scrollDirection = 'up';
      if (nav && navHidden) { nav.classList.remove('nav--hidden'); navHidden = false; }
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
  var revealEls = document.querySelectorAll('.reveal');

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

    if (nav) {
      ScrollTrigger.create({
        start: 80,
        onEnter:     function () { nav.classList.add('nav--scrolled'); },
        onLeaveBack: function () { nav.classList.remove('nav--scrolled'); },
      });
    }

  } else {
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
