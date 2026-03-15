/* ============================================================
   script.js — portfolio interactions
   No libraries, no build step.
   ============================================================ */

/* ── typing effect in hero ── */
(function () {
  const el = document.getElementById('tt');
  const words = [
    'backend systems',
    'full-stack apps',
    'automation tools',
    'REST APIs',
    'things that run in prod'
  ];
  let wi = 0, ci = 0, deleting = false;

  function tick() {
    const word = words[wi];
    // type forward, then delete
    el.textContent = deleting ? word.slice(0, --ci) : word.slice(0, ++ci);

    let delay = deleting ? 40 : 70;

    if (!deleting && ci === word.length) {
      delay = 2000;        // pause at end of word
      deleting = true;
    } else if (deleting && ci === 0) {
      deleting = false;
      wi = (wi + 1) % words.length;
      delay = 300;         // brief pause before next word
    }

    setTimeout(tick, delay);
  }

  setTimeout(tick, 900);
})();


/* ── navbar: add glass background on scroll, highlight active section ── */
(function () {
  const nav   = document.getElementById('nav');
  const links = document.querySelectorAll('.nav-links a');

  // swap navbar background once the page scrolls
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 55);
  }, { passive: true });

  // mark the nav link whose section is centred in the viewport
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { rootMargin: '-38% 0px -38% 0px' });

  document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));
})();


/* ── mobile hamburger menu ── */
(function () {
  const btn = document.getElementById('hbg');
  const nl  = document.getElementById('nl');

  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    nl.classList.toggle('open');
  });

  // close when a link is tapped
  nl.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      nl.classList.remove('open');
    });
  });

  // close when tapping outside the menu
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !nl.contains(e.target)) {
      btn.classList.remove('open');
      nl.classList.remove('open');
    }
  });
})();


/* ── scroll reveal — add .on to .fi / .fil / .fir elements as they enter view ── */
(function () {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('on');
        observer.unobserve(entry.target); // fire once
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.fi, .fil, .fir').forEach(el => observer.observe(el));
})();


/* ── animated stat counters — start counting when the stats section scrolls in ── */
(function () {
  let fired = false;

  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || fired) return;
    fired = true;

    document.querySelectorAll('.snum[data-target]').forEach(el => {
      const target   = +el.dataset.target;
      const suffix   = el.dataset.suffix || '';
      const duration = 1800;
      const start    = performance.now();

      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3); // ease out cubic
        el.textContent = Math.floor(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    });
  }, { threshold: 0.3 });

  observer.observe(document.getElementById('stats'));
})();


/* ── contact form → opens mailto with prefilled body ── */
document.getElementById('cf').addEventListener('submit', function (e) {
  e.preventDefault();

  const name    = document.getElementById('cn').value.trim();
  const email   = document.getElementById('ce').value.trim();
  const subject = document.getElementById('cs').value.trim() || 'Hey from your portfolio';
  const message = document.getElementById('cm').value.trim();

  const sub  = encodeURIComponent('[Portfolio] ' + subject + ' — ' + name);
  const body = encodeURIComponent(
    'Hi Sharath,\n\n' +
    'Name:  ' + name + '\n' +
    'Email: ' + email + '\n\n' +
    message + '\n\n—'
  );

  window.location.href = 'mailto:csharath301@protonmail.com?subject=' + sub + '&body=' + body;
});


/* ── scroll-to-top button visibility ── */
(function () {
  const btn = document.getElementById('st');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });
})();
