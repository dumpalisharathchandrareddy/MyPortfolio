/* ============================================================
   script.js — portfolio interactions
   No libraries, no build step.
   ============================================================ */

/* ── page load animation ── */
setTimeout(() => document.body.classList.add('page-loaded'), 100);


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
  const nav = document.getElementById('nav');
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
  const nl = document.getElementById('nl');

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
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const start = performance.now();

      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
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

  const name = document.getElementById('cn').value.trim();
  const email = document.getElementById('ce').value.trim();
  const subject = document.getElementById('cs').value.trim() || 'Hey from your portfolio';
  const message = document.getElementById('cm').value.trim();

  const sub = encodeURIComponent('[Portfolio] ' + subject + ' — ' + name);
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


/* ── scroll progress bar ── */
(function () {
  const bar = document.getElementById('progress-bar');
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    bar.style.width = (scrolled * 100) + '%';
  }, { passive: true });
})();


/* ── cursor trail ── */
(function () {
  // skip on touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  const TRAIL_COUNT = 8;
  const dots = [];
  const positions = Array.from({ length: TRAIL_COUNT }, () => ({ x: -100, y: -100 }));
  let mouseX = -100, mouseY = -100;

  // create trail dot elements
  for (let i = 0; i < TRAIL_COUNT; i++) {
    const dot = document.createElement('div');
    dot.className = 'trail-dot';
    document.body.appendChild(dot);
    dots.push(dot);
  }

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function animate() {
    // shift positions: slot 0 follows mouse, rest follow previous
    positions.unshift({ x: mouseX, y: mouseY });
    positions.pop();

    dots.forEach((dot, i) => {
      dot.style.left = positions[i].x + 'px';
      dot.style.top = positions[i].y + 'px';
      dot.style.opacity = (1 - i / TRAIL_COUNT) * 0.6;
    });

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();


/* ── mobile bottom nav: highlight active section ── */
(function () {
  const mobItems = document.querySelectorAll('.mbn-item');
  if (!mobItems.length) return;

  const sectionIds = Array.from(mobItems).map(item => item.dataset.sec);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        mobItems.forEach(item => {
          item.classList.toggle('active', item.dataset.sec === id);
        });
      }
    });
  }, { rootMargin: '-38% 0px -38% 0px' });

  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
})();

// mouse tilt effect on project cards
// card subtly tilts toward wherever the cursor is pointing
const cards = document.querySelectorAll('.pcard');

cards.forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    // max tilt 8 degrees
    const rotateX = ((y - cy) / cy) * -8;
    const rotateY = ((x - cx) / cx) * 8;

    card.style.transform =
      `translateY(-8px) scale(1.013) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    // smooth reset back to flat
    card.style.transform = '';
    card.style.transition = 'transform 0.5s ease';
    setTimeout(() => { card.style.transition = ''; }, 500);
  });
});
