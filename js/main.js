/* ═══════════════════════════════════════════════════════════════
   GridMind Website — main.js
   Nav, Dark Mode, Scroll Animations, Stat Counters, Form
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Dark Mode ──────────────────────────────────────────────
  function getPreferredTheme() {
    var stored = localStorage.getItem('gridmind-theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    // Update all toggle buttons
    var toggles = document.querySelectorAll('.nav__theme');
    toggles.forEach(function (btn) {
      btn.innerHTML = theme === 'dark' ? '&#9788;' : '&#9790;';
      btn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    });
  }

  window.toggleTheme = function () {
    var current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    var next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('gridmind-theme', next);
    applyTheme(next);
  };

  // Apply on load (before paint)
  applyTheme(getPreferredTheme());

  // ── Navigation ─────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    var nav = document.getElementById('nav');
    var hamburger = document.getElementById('hamburger');
    var overlay = document.getElementById('navOverlay');

    // Hamburger toggle
    if (hamburger) {
      hamburger.addEventListener('click', function () {
        nav.classList.toggle('is-open');
        document.body.style.overflow = nav.classList.contains('is-open') ? 'hidden' : '';
      });
    }

    // Close overlay on link click
    if (overlay) {
      overlay.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          nav.classList.remove('is-open');
          document.body.style.overflow = '';
        });
      });
    }

    // Theme toggle buttons
    document.querySelectorAll('.nav__theme').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        toggleTheme();
      });
    });

    // Scroll — add .scrolled to nav
    var hero = document.getElementById('hero');
    if (hero && nav) {
      var navObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            nav.classList.remove('scrolled');
          } else {
            nav.classList.add('scrolled');
          }
        });
      }, { threshold: 0.1 });
      navObserver.observe(hero);
    } else if (nav) {
      // Inner pages — always scrolled
      nav.classList.add('scrolled');
    }

    // Active page highlight
    var currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__links a').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === currentPath) {
        link.classList.add('active');
      }
    });

    // ── Scroll Animations ──────────────────────────────────────
    var animateElements = document.querySelectorAll('[data-animate]');
    if (animateElements.length > 0) {
      var scrollObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            scrollObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      });

      animateElements.forEach(function (el) {
        scrollObserver.observe(el);
      });
    }

    // ── Progress Bar Animation ─────────────────────────────────
    var progressBars = document.querySelectorAll('.progress-bar');
    if (progressBars.length > 0) {
      var pbObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            pbObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      progressBars.forEach(function (bar) {
        pbObserver.observe(bar);
      });
    }

    // ── Stat Counter Animation ─────────────────────────────────
    var counters = document.querySelectorAll('[data-count]');
    if (counters.length > 0) {
      var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      counters.forEach(function (el) {
        counterObserver.observe(el);
      });
    }

    function animateCounter(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var prefix = el.hasAttribute('data-count-prefix') ? el.getAttribute('data-count-prefix') : '';
      var isDecimal = target % 1 !== 0;
      var duration = 1500;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        // Ease out cubic
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = eased * target;

        if (isDecimal) {
          el.textContent = prefix + current.toFixed(1);
        } else if (target >= 1000) {
          el.textContent = prefix + Math.floor(current).toLocaleString('en-IN');
        } else {
          el.textContent = prefix + Math.floor(current);
        }

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          // Final value
          if (isDecimal) {
            el.textContent = prefix + target.toFixed(1);
          } else if (target >= 1000) {
            el.textContent = prefix + target.toLocaleString('en-IN');
          } else {
            el.textContent = prefix + target;
          }
        }
      }

      requestAnimationFrame(step);
    }

    // ── Contact Form ───────────────────────────────────────────
    var form = document.getElementById('contactForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var valid = true;

        // Validate required fields
        form.querySelectorAll('[required]').forEach(function (input) {
          var group = input.closest('.form-group');
          if (!input.value.trim()) {
            group.classList.add('has-error');
            valid = false;
          } else {
            group.classList.remove('has-error');
          }
        });

        // Email validation
        var emailInput = form.querySelector('input[type="email"]');
        if (emailInput && emailInput.value) {
          var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(emailInput.value)) {
            emailInput.closest('.form-group').classList.add('has-error');
            valid = false;
          }
        }

        if (!valid) return;

        // Submit via Formspree or show success
        var submitBtn = form.querySelector('.cta-btn');
        submitBtn.textContent = 'SENDING...';
        submitBtn.style.pointerEvents = 'none';

        // FormSubmit.co submission
        var formData = new FormData(form);
        fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        }).then(function (response) {
          if (response.ok || response.status === 200) {
            form.style.display = 'none';
            document.querySelector('.form-success').classList.add('is-visible');
          } else {
            submitBtn.textContent = 'SUBMIT INQUIRY';
            submitBtn.style.pointerEvents = '';
            alert('Something went wrong. Please try again or email satya@gridmindlabs.in directly.');
          }
        }).catch(function () {
          submitBtn.textContent = 'SUBMIT INQUIRY';
          submitBtn.style.pointerEvents = '';
          alert('Network error. Please email satya@gridmindlabs.in directly.');
        });
      });

      // Real-time validation on blur
      form.querySelectorAll('input, textarea, select').forEach(function (input) {
        input.addEventListener('blur', function () {
          var group = this.closest('.form-group');
          if (this.hasAttribute('required') && !this.value.trim()) {
            group.classList.add('has-error');
          } else {
            group.classList.remove('has-error');
          }
        });
        input.addEventListener('input', function () {
          this.closest('.form-group').classList.remove('has-error');
        });
      });
    }

    // ── SVG Stroke Animation ───────────────────────────────────
    var svgPaths = document.querySelectorAll('.arch-path');
    if (svgPaths.length > 0) {
      var svgObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-drawn');
            svgObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      svgPaths.forEach(function (path) {
        var length = path.getTotalLength ? path.getTotalLength() : 200;
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
        svgObserver.observe(path);
      });
    }

    // ── View Transitions (Progressive Enhancement) ─────────────
    if (document.startViewTransition) {
      document.querySelectorAll('a[href$=".html"]').forEach(function (link) {
        // Only internal links
        if (link.hostname === window.location.hostname || !link.hostname) {
          link.addEventListener('click', function (e) {
            e.preventDefault();
            var href = this.getAttribute('href');
            document.startViewTransition(function () {
              window.location.href = href;
            });
          });
        }
      });
    }
  });
})();
