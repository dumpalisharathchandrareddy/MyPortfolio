/* ============================================================
   script.js
   No libraries. No build step.
   ============================================================ */

/* roundRect polyfill — Safari < 15.4 and older Chrome don't have it */
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    this.beginPath();
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    this.closePath();
  };
}

/* add 'loaded' so hero animates in */
setTimeout(() => document.body.classList.add('loaded'), 80);


/* bubble overlay canvas — fixed above sections, pointer-events none */
try {
  (function () {
    const canvas = document.getElementById('bubble-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', () => { resize(); init(); }, { passive: true });

    const isMobile = window.innerWidth < 768;

    /* ── Code symbols for bubbles ── */
    const CODE_SYMS = [
      'async', 'await', '.then()', 'const', 'let', '=>',
      'git push', 'npm run', 'docker up', 'import',
      '{ }', '[ ]', '()', '//', '/**/', '</>',
      'fetch()', '.map()', 'useState', 'useEffect',
      'SELECT *', 'JOIN', 'WHERE', 'POST /api',
      '200 OK', '404', '500', 'JWT', 'OAuth',
    ];

    const COLORS = [
      { stroke: 'rgba(15,240,252,', fill: 'rgba(15,240,252,', text: '#0ff0fc' },
      { stroke: 'rgba(181,55,242,', fill: 'rgba(181,55,242,', text: '#b537f2' },
      { stroke: 'rgba(255,45,120,', fill: 'rgba(255,45,120,', text: '#ff2d78' },
    ];

    /* ── Bubbles ── */
    let bubbles = [];

    function makeBubble(scattered) {
      const r = Math.random() * 30 + 18;
      return {
        x: Math.random() * W,
        y: scattered ? Math.random() * H : H + r + Math.random() * 200,
        r,
        vy: -(Math.random() * 0.45 + 0.15),
        vx: (Math.random() - 0.5) * 0.18,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.007 + 0.003,
        sym: CODE_SYMS[Math.floor(Math.random() * CODE_SYMS.length)],
        alpha: Math.random() * 0.25 + 0.55,
        pulse: Math.random() * Math.PI * 2,
        ci: Math.floor(Math.random() * 3),
      };
    }

    function drawBubbles() {
      bubbles.forEach(b => {
        b.wobble += b.wobbleSpeed;
        b.x += b.vx + Math.sin(b.wobble) * 0.18;
        b.y += b.vy;
        b.pulse += 0.018;

        if (b.y < -b.r * 3) {
          b.y = H + b.r + Math.random() * 120;
          b.x = Math.random() * W;
          b.sym = CODE_SYMS[Math.floor(Math.random() * CODE_SYMS.length)];
          b.ci = Math.floor(Math.random() * 3);
          b.alpha = Math.random() * 0.25 + 0.55;
        }
        if (b.x < -b.r * 2) b.x = W + b.r;
        if (b.x > W + b.r * 2) b.x = -b.r;

        const pr = Math.sin(b.pulse) * 0.08 + 1;
        const r = b.r * pr;
        const c = COLORS[b.ci];
        const a = b.alpha;

        ctx.save();
        ctx.globalAlpha = 1;

        /* circle */
        ctx.beginPath();
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.fillStyle = c.fill + (a * 0.22) + ')';
        ctx.strokeStyle = c.stroke + a + ')';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        /* glass shine */
        ctx.beginPath();
        ctx.arc(b.x - r * 0.22, b.y - r * 0.28, r * 0.5, Math.PI * 1.1, Math.PI * 1.75);
        ctx.strokeStyle = 'rgba(255,255,255,' + (a * 0.28) + ')';
        ctx.lineWidth = 1;
        ctx.stroke();

        /* text */
        ctx.globalAlpha = a;
        ctx.font = `bold ${Math.max(9, r * 0.42)}px JetBrains Mono, monospace`;
        ctx.fillStyle = c.text;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.sym, b.x, b.y);

        ctx.restore();
      });
    }

    /* ── Brackets ── */
    const BRACKETS = ['{ }', '</>', '()', '[]', '=>', '||', '&&', '??', '...'];
    let brackets = [];

    function makeBracket(scattered) {
      return {
        x: Math.random() * W,
        y: scattered ? Math.random() * H : H + 20,
        vy: -(Math.random() * 0.22 + 0.06),
        vx: (Math.random() - 0.5) * 0.1,
        alpha: Math.random() * 0.35 + 0.3,
        sym: BRACKETS[Math.floor(Math.random() * BRACKETS.length)],
        size: Math.random() * 11 + 9,
        ci: Math.floor(Math.random() * 3),
        rot: Math.random() * 0.3 - 0.15,
        rotSpeed: (Math.random() - 0.5) * 0.002,
      };
    }

    function drawBrackets() {
      brackets.forEach(b => {
        b.y += b.vy;
        b.x += b.vx;
        b.rot += b.rotSpeed;
        if (b.y < -20) Object.assign(b, makeBracket(false));

        ctx.save();
        ctx.globalAlpha = b.alpha;
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        ctx.font = `${b.size}px JetBrains Mono, monospace`;
        ctx.fillStyle = COLORS[b.ci].text;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.sym, 0, 0);
        ctx.restore();
      });
    }

    /* ── Code fragment cards ── */
    const FRAGS = [
      ['const server = express()', 'app.listen(3000)'],
      ['SELECT * FROM users', 'WHERE active = true'],
      ['docker build -t app .', 'docker run -p 8080:80'],
      ['git commit -m "fix"', 'git push origin main'],
      ['async function fetch()', 'return await api.get()'],
      ['model.fit(X_train)', 'accuracy: 0.9682'],
    ];

    let cards = [];

    function makeCard(scattered) {
      const idx = Math.floor(Math.random() * FRAGS.length);
      return {
        x: Math.random() * W,
        y: scattered ? Math.random() * H : H + 80 + Math.random() * 200,
        vy: -(Math.random() * 0.18 + 0.05),
        vx: (Math.random() - 0.5) * 0.07,
        alpha: Math.random() * 0.2 + 0.25,
        lines: FRAGS[idx],
        fp: Math.random() * Math.PI * 2,
        ci: Math.floor(Math.random() * 3),
        w: 165 + Math.random() * 55,
      };
    }

    function drawCards() {
      cards.forEach(card => {
        card.fp += 0.004;
        card.x += card.vx + Math.sin(card.fp) * 0.1;
        card.y += card.vy;
        if (card.y < -80) Object.assign(card, makeCard(false));

        const pad = 10, lh = 14;
        const ch = pad * 2 + card.lines.length * lh;
        const c = COLORS[card.ci];

        ctx.save();
        ctx.globalAlpha = card.alpha;

        ctx.beginPath();
        ctx.roundRect(card.x, card.y, card.w, ch, 6);
        ctx.fillStyle = 'rgba(4,4,14,0.88)';
        ctx.strokeStyle = c.stroke + '0.6)';
        ctx.lineWidth = 0.8;
        ctx.fill();
        ctx.stroke();

        /* terminal dots */
        ['rgba(255,90,85,0.8)', 'rgba(255,189,46,0.8)', 'rgba(40,200,64,0.8)'].forEach((col, di) => {
          ctx.beginPath();
          ctx.arc(card.x + 8 + di * 10, card.y + 8, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = col;
          ctx.globalAlpha = card.alpha;
          ctx.fill();
        });

        ctx.font = '9px JetBrains Mono, monospace';
        card.lines.forEach((line, li) => {
          ctx.globalAlpha = card.alpha;
          ctx.fillStyle = li === 0 ? c.text : 'rgba(200,200,230,0.8)';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(line, card.x + pad, card.y + pad + 6 + li * lh);
        });

        ctx.restore();
      });
    }

    /* ── Init + loop ── */
    function init() {
      const bc = isMobile ? 6 : 16;
      const br = isMobile ? 8 : 20;
      const cc = isMobile ? 2 : 5;
      bubbles = Array.from({ length: bc }, () => makeBubble(true));
      brackets = Array.from({ length: br }, () => makeBracket(true));
      cards = Array.from({ length: cc }, () => makeCard(true));
    }

    init();

    /* roundRect polyfill for this canvas context */
    if (!ctx.roundRect) {
      ctx.roundRect = function (x, y, w, h, r) {
        r = Math.min(r, w / 2, h / 2);
        this.moveTo(x + r, y);
        this.lineTo(x + w - r, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r);
        this.lineTo(x + w, y + h - r);
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.lineTo(x + r, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r);
        this.lineTo(x, y + r);
        this.quadraticCurveTo(x, y, x + r, y);
        this.closePath();
      };
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      drawBrackets();
      drawCards();
      drawBubbles();
      requestAnimationFrame(draw);
    }

    draw();
  })();
} catch (e) {
  console.warn('Bubble canvas error:', e);
}

/* background canvas — mesh nodes + laptop (stays behind sections) */
try {
  (function () {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, frame = 0;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', () => { resize(); initLayers(); }, { passive: true });

    const isMobile = window.innerWidth < 768;

    let scrollY = 0;
    let prevScrollY = 0;
    let scrollDelta = 0;
    let mouseX = W / 2;
    let mouseY = H / 2;
    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
    window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });

    /* ── Layer 1: Neural mesh nodes ── */
    let meshNodes = [];
    function initMesh() {
      const count = isMobile ? 28 : 50;
      meshNodes = Array.from({ length: count }, () => ({
        ax: Math.random(), ay: Math.random(),
        angle: Math.random() * Math.PI * 2,
        speed: (Math.random() * 0.18 + 0.06) * (Math.random() > 0.5 ? 1 : -1) * 0.001,
        rx: Math.random() * 0.14 + 0.03,
        ry: Math.random() * 0.1 + 0.02,
        phase: Math.random() * Math.PI * 2,
        size: Math.random() * 1.1 + 0.3,
      }));
    }

    function meshNodePos(n) {
      const a = n.angle + frame * n.speed;
      const x = n.ax * W + Math.cos(a) * n.rx * Math.min(W, H);
      // very subtle parallax — nodes near top drift slightly, nodes near bottom stay put
      const pl = (scrollY % H) * 0.03 * (0.5 - n.ay);
      const y = n.ay * H + Math.sin(a + n.phase) * n.ry * Math.min(W, H) + pl;
      return { x, y };
    }

    function nodeColor(y, alpha) {
      const ny = y / H;
      if (ny < 0.38) return `rgba(15,240,252,${alpha})`;
      if (ny < 0.68) return `rgba(181,55,242,${alpha})`;
      return `rgba(255,45,120,${alpha})`;
    }

    function drawMesh() {
      const CDIST = isMobile ? 90 : 130;
      const positions = meshNodes.map(meshNodePos);

      for (let i = 0; i < meshNodes.length; i++) {
        for (let j = i + 1; j < meshNodes.length; j++) {
          const dx = positions[i].x - positions[j].x;
          const dy = positions[i].y - positions[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CDIST) {
            ctx.beginPath();
            ctx.moveTo(positions[i].x, positions[i].y);
            ctx.lineTo(positions[j].x, positions[j].y);
            ctx.strokeStyle = nodeColor((positions[i].y + positions[j].y) / 2, (1 - dist / CDIST) * 0.1);
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      positions.forEach((pos, i) => {
        const dxM = mouseX - pos.x;
        const dyM = mouseY - pos.y;
        const dm = Math.sqrt(dxM * dxM + dyM * dyM);
        const pull = Math.max(0, 1 - dm / 200) * 5;
        const rx = pos.x + (dxM / Math.max(dm, 1)) * pull;
        const ry = pos.y + (dyM / Math.max(dm, 1)) * pull;
        const sz = meshNodes[i].size + Math.sin(frame * 0.018 + meshNodes[i].phase) * 0.35;
        ctx.beginPath();
        ctx.arc(rx, ry, sz, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor(ry, 0.45);
        ctx.fill();
      });
    }

    /* ── Layer 3: Floating laptop ── */
    // One laptop silhouette drifts slowly in the background
    let laptop = {
      x: W * 0.78, y: H * 0.38,
      angle: 0,
      floatPhase: 0,
      alpha: isMobile ? 0 : 0.07,   // invisible on mobile
      scale: Math.min(W, H) * 0.0014,
    };

    function drawLaptop() {
      if (laptop.alpha <= 0) return;

      laptop.floatPhase += 0.006;
      // slow parallax drift on scroll
      const floatY = Math.sin(laptop.floatPhase) * 18 - (scrollY % (H * 2)) * 0.02;
      const floatX = Math.cos(laptop.floatPhase * 0.7) * 8;
      const s = laptop.scale;
      const cx = laptop.x + floatX;
      const cy = laptop.y + floatY;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.sin(laptop.floatPhase * 0.4) * 0.04);
      ctx.globalAlpha = laptop.alpha;

      const W2 = 220 * s, H2 = 140 * s;

      // screen back (slightly tilted open ~110deg)
      ctx.save();
      ctx.rotate(-0.28);

      // screen bezel
      ctx.beginPath();
      ctx.roundRect(-W2 / 2, -H2, W2, H2, 8 * s);
      ctx.fillStyle = 'rgba(10,10,20,0.9)';
      ctx.strokeStyle = 'rgba(15,240,252,0.5)';
      ctx.lineWidth = 1.5 * s;
      ctx.fill();
      ctx.stroke();

      // screen glow
      const grad = ctx.createRadialGradient(0, -H2 * 0.5, 0, 0, -H2 * 0.5, W2 * 0.6);
      grad.addColorStop(0, 'rgba(15,240,252,0.08)');
      grad.addColorStop(1, 'rgba(15,240,252,0)');
      ctx.fillStyle = grad;
      ctx.fill();

      // fake code lines on screen
      const lineColors = ['rgba(15,240,252,', 'rgba(181,55,242,', 'rgba(255,45,120,'];
      for (let i = 0; i < 8; i++) {
        const lw = (Math.random() * 0.4 + 0.4) * (W2 * 0.55);
        const lx = -W2 * 0.35 + (i % 3) * W2 * 0.06;
        const ly = -H2 + 16 * s + i * 13 * s;
        const ci = i % 3;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + lw, ly);
        ctx.strokeStyle = lineColors[ci] + '0.55)';
        ctx.lineWidth = 1.5 * s;
        ctx.stroke();
      }

      // camera dot
      ctx.beginPath();
      ctx.arc(0, -H2 + 4 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15,240,252,0.4)';
      ctx.fill();

      ctx.restore();

      // base/keyboard
      ctx.beginPath();
      ctx.roundRect(-W2 / 2 - 8 * s, 0, W2 + 16 * s, 10 * s, 3 * s);
      ctx.fillStyle = 'rgba(10,10,20,0.85)';
      ctx.strokeStyle = 'rgba(15,240,252,0.4)';
      ctx.lineWidth = 1.2 * s;
      ctx.fill();
      ctx.stroke();

      // keyboard rows
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 12; col++) {
          const kx = -W2 * 0.46 + col * W2 * 0.079;
          const ky = 2 * s + row * 2.5 * s;
          ctx.beginPath();
          ctx.roundRect(kx, ky, W2 * 0.065, 1.8 * s, 0.5 * s);
          ctx.fillStyle = 'rgba(15,240,252,0.15)';
          ctx.fill();
        }
      }

      // trackpad
      ctx.beginPath();
      ctx.roundRect(-W2 * 0.12, 12.5 * s, W2 * 0.24, 6 * s, 2 * s);
      ctx.strokeStyle = 'rgba(15,240,252,0.25)';
      ctx.lineWidth = 0.8 * s;
      ctx.stroke();

      ctx.restore();
    }

    /* ── Layer 4: Floating code fragment cards ── */
    const FRAGMENTS = [
      ['const server = express()', 'app.listen(3000)'],
      ['SELECT * FROM users', 'WHERE active = true'],
      ['docker build -t app .', 'docker run -p 8080:8080'],
      ['npm install', 'npm run dev'],
      ['git commit -m "fix"', 'git push origin main'],
      ['async function fetch()', 'return await api.get()'],
      ['model.fit(X_train)', 'accuracy: 0.9682'],
      ['kubectl apply -f', 'deployment.yaml'],
    ];

    let codeCards = [];
    function initCodeCards() {
      const count = isMobile ? 2 : 5;
      codeCards = Array.from({ length: count }, (_, i) => makeCodeCard(true, i / count));
    }

    function makeCodeCard(scattered, progress) {
      const idx = Math.floor(Math.random() * FRAGMENTS.length);
      return {
        x: Math.random() * W,
        y: scattered ? Math.random() * H : H + 100 + Math.random() * 300,
        vy: -(Math.random() * 0.2 + 0.05),
        vx: (Math.random() - 0.5) * 0.08,
        alpha: Math.random() * 0.18 + 0.06,
        lines: FRAGMENTS[idx],
        floatPhase: Math.random() * Math.PI * 2,
        ci: Math.floor(Math.random() * 3),
        w: 160 + Math.random() * 60,
      };
    }

    function drawCodeCards() {
      codeCards.forEach(card => {
        card.floatPhase += 0.004;
        card.x += card.vx + Math.sin(card.floatPhase) * 0.1;
        card.y += card.vy + Math.max(-1.2, Math.min(0, scrollDelta * 0.06));

        if (card.y < -80) Object.assign(card, makeCodeCard(false, 0));

        const c = BUBBLE_COLORS[card.ci];
        const pad = 10;
        const lh = 14;
        const ch = pad * 2 + card.lines.length * lh;

        ctx.save();
        ctx.globalAlpha = card.alpha;

        // card bg
        ctx.beginPath();
        ctx.roundRect(card.x, card.y, card.w, ch, 6);
        ctx.fillStyle = 'rgba(4,4,14,0.85)';
        ctx.strokeStyle = c.stroke + '0.35)';
        ctx.lineWidth = 0.7;
        ctx.fill();
        ctx.stroke();

        // terminal dots
        ['rgba(255,90,85,0.7)', 'rgba(255,189,46,0.7)', 'rgba(40,200,64,0.7)'].forEach((col, di) => {
          ctx.beginPath();
          ctx.arc(card.x + 8 + di * 10, card.y + 8, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = col;
          ctx.fill();
        });

        // code lines
        ctx.font = '9px JetBrains Mono, monospace';
        card.lines.forEach((line, li) => {
          ctx.fillStyle = li === 0 ? c.text : 'rgba(200,200,230,0.7)';
          ctx.globalAlpha = card.alpha;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(line, card.x + pad, card.y + pad + 6 + li * lh);
        });

        ctx.restore();
      });
    }

    /* ── Layer 5: Bracket particles ── */
    const BRACKETS = ['{ }', '< />', '()', '[]', '=>', '||', '&&', '??', '...'];
    let brackets = [];
    function initBrackets() {
      const count = isMobile ? 10 : 22;
      brackets = Array.from({ length: count }, () => makeBracket(true));
    }

    function makeBracket(scattered) {
      return {
        x: Math.random() * W,
        y: scattered ? Math.random() * H : H + 20,
        vy: -(Math.random() * 0.22 + 0.06),
        vx: (Math.random() - 0.5) * 0.1,
        alpha: Math.random() * 0.2 + 0.05,
        sym: BRACKETS[Math.floor(Math.random() * BRACKETS.length)],
        size: Math.random() * 10 + 9,
        ci: Math.floor(Math.random() * 3),
        rot: Math.random() * 0.3 - 0.15,
        rotSpeed: (Math.random() - 0.5) * 0.002,
      };
    }

    function drawBrackets() {
      brackets.forEach(b => {
        b.y += b.vy;
        b.x += b.vx;
        b.rot += b.rotSpeed;
        if (b.y < -20) Object.assign(b, makeBracket(false));

        const c = BUBBLE_COLORS[b.ci];
        ctx.save();
        ctx.globalAlpha = b.alpha;
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        ctx.font = `${b.size}px JetBrains Mono, monospace`;
        ctx.fillStyle = c.text;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.sym, 0, 0);
        ctx.restore();
      });
    }

    /* ── Init layers ── */
    function initLayers() {
      laptop.x = W * 0.78;
      laptop.y = H * 0.35;
      laptop.scale = Math.min(W, H) * 0.0014;
      laptop.alpha = window.innerWidth < 768 ? 0 : 0.07;
      initMesh();
    }

    initLayers();

    /* ── Background draw loop — mesh + laptop only ── */
    function draw() {
      frame++;
      ctx.clearRect(0, 0, W, H);
      drawMesh();
      drawLaptop();
      requestAnimationFrame(draw);
    }

    draw();
  })()
} catch (e) {
  console.warn('Canvas background error:', e);
}


/* ============================================================
   TYPING EFFECT
   Cycles through a list of phrases with typewriter delete loop.
   ============================================================ */
(function () {
  const el = document.getElementById('tt');
  if (!el) return;

  const words = [
    'backend systems',
    'full-stack apps',
    'automation tools',
    'REST APIs',
    'things that run in prod',
  ];

  let wi = 0, ci = 0, deleting = false;

  function tick() {
    const word = words[wi];
    el.textContent = deleting ? word.slice(0, --ci) : word.slice(0, ++ci);

    let delay = deleting ? 38 : 68;

    if (!deleting && ci === word.length) {
      delay = 2100;
      deleting = true;
    } else if (deleting && ci === 0) {
      deleting = false;
      wi = (wi + 1) % words.length;
      delay = 320;
    }

    setTimeout(tick, delay);
  }

  setTimeout(tick, 950);
})();


/* ============================================================
   WORD-SPLIT TITLE ANIMATION
   Wraps each word in .word-wrap > .word-span with stagger.
   CSS transitions fire when parent gets .on from IO.
   ============================================================ */
function splitWords(el) {
  if (el.dataset.split) return;
  el.dataset.split = '1';

  const text = el.textContent.trim();
  const words = text.split(/\s+/);
  el.textContent = '';

  words.forEach((word, i) => {
    const wrap = document.createElement('span');
    wrap.className = 'word-wrap';

    const inner = document.createElement('span');
    inner.className = 'word-span';
    inner.textContent = word;
    inner.style.transitionDelay = (i * 62) + 'ms';

    wrap.appendChild(inner);
    el.appendChild(wrap);
    if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
  });
}


/* ============================================================
   SMOOTH SCROLL + SCROLL-DRIVEN ANIMATIONS
   One rAF loop handles all parallax/scroll effects.
   Actual window.scrollY drives nav + IO triggers (instant).
   Lerped currentScrollY drives cosmetic parallax (buttery).
   ============================================================ */
let currentScrollY = 0;
let targetScrollY = 0;

window.addEventListener('scroll', () => {
  targetScrollY = window.scrollY;
  document.documentElement.style.setProperty('--scroll-y', window.scrollY + 'px');
}, { passive: true });

// get how far an element has traveled through the viewport (0→1)
function scrollProgress(el) {
  const rect = el.getBoundingClientRect();
  const windowH = window.innerHeight;
  const progress = (windowH - rect.top) / (windowH + rect.height);
  return Math.max(0, Math.min(1, progress));
}

// cache DOM refs — grabbed once, not every frame
const heroSection = document.getElementById('hero');
const heroWrap = heroSection?.querySelector('.hero-wrap');
const aboutSection = document.getElementById('about');
const statsWrap = document.querySelector('.stats-sticky-wrap');
const statsSection = document.getElementById('stats');
const statCards = statsSection ? Array.from(statsSection.querySelectorAll('.scard')) : [];


/* sequential stats highlight driven by scroll position */
function updateStats() {
  if (!statsWrap || !statCards.length) return;

  const wrapTop = statsWrap.getBoundingClientRect().top + window.scrollY;
  const wrapTravel = statsWrap.offsetHeight - window.innerHeight;

  if (wrapTravel <= 0) {
    statCards.forEach(c => c.classList.add('active'));
    return;
  }

  const progress = Math.max(0, Math.min(1,
    (window.scrollY - wrapTop) / wrapTravel
  ));

  const n = statCards.length;
  statCards.forEach((card, i) => {
    const start = i / n;
    const isLast = i === n - 1 && progress >= start;
    const isActive = (progress >= start && progress < (i + 1) / n) || isLast;
    card.classList.toggle('active', isActive);
  });
}


/* main animation loop — hero shrink/fade + stats highlight + Apple parallax */
function loop() {
  currentScrollY += (targetScrollY - currentScrollY) * 0.08;
  document.documentElement.style.setProperty('--smooth-scroll', currentScrollY + 'px');

  const sy = window.scrollY;
  const vh = window.innerHeight;

  // ── Hero: scale + fade as user scrolls away (existing) ──
  if (heroWrap) {
    const p = Math.max(0, Math.min(1, sy / (vh * 0.6)));
    heroSection.style.setProperty('--hero-scroll', p);
  }

  // ── Apple-style depth parallax ──
  // Each section container drifts at a slightly different rate than the page.
  // When section is below viewport centre → shifted down (+).
  // When section is above viewport centre → shifted up (–).
  // Net effect: content "rises into place" like layers peeling apart.
  document.querySelectorAll('section[id]').forEach(sec => {
    const rect = sec.getBoundingClientRect();
    const secMid = rect.top + rect.height * 0.5;
    const vhMid = vh * 0.5;
    // normalised distance from centre: –1 (above) … 0 (centred) … +1 (below)
    const dist = Math.max(-1, Math.min(1, (secMid - vhMid) / vh));
    // 28px max shift — subtle depth, not a jarring jump
    sec.style.setProperty('--par', (dist * 28).toFixed(2));
  });

  updateStats();
  requestAnimationFrame(loop);
}

loop();


/* ============================================================
   NAVBAR — glass on scroll, active section highlight
   ============================================================ */
(function () {
  const nav = document.getElementById('nav');
  const links = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 55);
  }, { passive: true });

  // Always highlight exactly ONE nav link — whichever section
  // has its top closest to (but still above) 40% down the viewport.
  const sections = Array.from(document.querySelectorAll('section[id]'));

  function updateActiveLink() {
    const scrollY = window.scrollY;
    const trigger = window.innerHeight * 0.4; // 40% down viewport

    let active = sections[0];
    for (const sec of sections) {
      if (sec.getBoundingClientRect().top <= trigger) {
        active = sec;
      }
    }

    links.forEach(l =>
      l.classList.toggle('active',
        l.getAttribute('href') === '#' + active.id
      )
    );
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink(); // run on load too
})();


/* ============================================================
   MOBILE HAMBURGER
   ============================================================ */
(function () {
  const btn = document.getElementById('hbg');
  const nl = document.getElementById('nl');
  if (!btn) return;

  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    nl.classList.toggle('open');
  });

  nl.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      nl.classList.remove('open');
    });
  });

  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !nl.contains(e.target)) {
      btn.classList.remove('open');
      nl.classList.remove('open');
    }
  });
})();


/* ============================================================
   SCROLL REVEAL — .fi .fil .fir get .on when entering viewport.
   Section titles get word-split + .on for staggered entrance.
   ============================================================ */
(function () {
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('on');
        revealIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.fi, .fil, .fir, .pcard').forEach(el => revealIO.observe(el));

  // titles: split words, then reveal
  const titleIO = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        splitWords(entry.target);
        requestAnimationFrame(() => entry.target.classList.add('on'));
        titleIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -20px 0px' });

  document.querySelectorAll('.sec-title').forEach(el => titleIO.observe(el));
})();


/* ============================================================
   STAT COUNTERS
   Eased count-up animation fires once when stats enters view.
   ============================================================ */
(function () {
  let fired = false;

  const io = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || fired) return;
    fired = true;

    document.querySelectorAll('.snum[data-target]').forEach(el => {
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const start = performance.now();

      function step(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3); // ease out cubic
        el.textContent = Math.floor(eased * target) + suffix;
        if (t < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    });
  }, { threshold: 0.3 });

  const statsEl = document.getElementById('stats');
  if (statsEl) io.observe(statsEl);
})();


/* ============================================================
   CONTACT FORM → mailto
   Assembles a prefilled email URL and opens the mail client.
   ============================================================ */
document.getElementById('cf').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('cn').value.trim();
  const email = document.getElementById('ce').value.trim();
  const subject = document.getElementById('cs').value.trim() || 'Hey from your portfolio';
  const message = document.getElementById('cm').value.trim();

  const sub = encodeURIComponent('[Portfolio] ' + subject + ' — ' + name);
  const body = encodeURIComponent(
    'Hi Sharath,\n\nName:  ' + name +
    '\nEmail: ' + email +
    '\n\n' + message + '\n\n—'
  );

  window.location.href = 'mailto:csharath301@protonmail.com?subject=' + sub + '&body=' + body;
});


/* ============================================================
   SCROLL-TO-TOP BUTTON
   ============================================================ */
(function () {
  const btn = document.getElementById('st');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 420);
  }, { passive: true });
})();


/* ============================================================
   SCROLL PROGRESS BAR
   Direct width assignment, no CSS transition — zero lag.
   ============================================================ */
(function () {
  const bar = document.getElementById('progress-bar');
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    bar.style.width = (pct * 100) + '%';
  }, { passive: true });
})();


/* ============================================================
   CURSOR TRAIL
   8 fading dots trail behind cursor movement.
   Only runs on devices that support hover (non-touch).
   ============================================================ */
(function () {
  if (window.matchMedia('(hover: none)').matches) return;

  const COUNT = 8;
  const dots = [];
  const positions = Array.from({ length: COUNT }, () => ({ x: -100, y: -100 }));
  let mouseX = -100, mouseY = -100;

  for (let i = 0; i < COUNT; i++) {
    const d = document.createElement('div');
    d.className = 'trail-dot';
    document.body.appendChild(d);
    dots.push(d);
  }

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function animateTrail() {
    positions.unshift({ x: mouseX, y: mouseY });
    positions.pop();

    dots.forEach((dot, i) => {
      dot.style.left = positions[i].x + 'px';
      dot.style.top = positions[i].y + 'px';
      dot.style.opacity = (1 - i / COUNT) * 0.55;
    });

    requestAnimationFrame(animateTrail);
  }

  requestAnimationFrame(animateTrail);
})();


/* ============================================================
   MOBILE BOTTOM NAV — highlight active section
   ============================================================ */
(function () {
  const items = document.querySelectorAll('.mbn-item');
  if (!items.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        items.forEach(item =>
          item.classList.toggle('active', item.dataset.sec === entry.target.id)
        );
      }
    });
  }, { rootMargin: '-38% 0px -38% 0px' });

  items.forEach(item => {
    const el = document.getElementById(item.dataset.sec);
    if (el) io.observe(el);
  });
})();


/* ============================================================
   PROJECT CARD MOUSE TILT
   Card tilts toward cursor — max 8 degrees.
   Resets smoothly on mouse leave.
   ============================================================ */
(function () {
  document.querySelectorAll('.pcard').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -8;
      const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 8;

      card.style.transform =
        `translateY(-8px) scale(1.018) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition =
        'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      card.style.transform = '';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });
})();

/* ============================================================
   MAGNETIC BUTTONS
   Hero CTA buttons softly attract toward cursor — premium feel.
   ============================================================ */
(function () {
  const btns = document.querySelectorAll('.hero-cta .btn');
  btns.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.28;
      const dy = (e.clientY - cy) * 0.28;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
      btn.style.transform = '';
      setTimeout(() => { btn.style.transition = ''; }, 500);
    });
  });
})();



/* ============================================================
   HERO NAME GLOW PULSE
   Adds a subtle glow throb to hero-name-l2 on idle.
   ============================================================ */
(function () {
  const name2 = document.querySelector('.hero-name-l2');
  if (!name2) return;
  let dir = 1, intensity = 0;
  let raf;
  function pulse() {
    intensity += dir * 0.008;
    if (intensity >= 1) { intensity = 1; dir = -1; }
    if (intensity <= 0) { intensity = 0; dir = 1; }
    name2.style.filter = `drop-shadow(0 0 ${12 + intensity * 24}px rgba(15,240,252,${0.18 + intensity * 0.22}))`;
    raf = requestAnimationFrame(pulse);
  }
  // start after hero loads
  setTimeout(pulse, 1200);
})();


/* ============================================================
   SMOOTH CURSOR SPOTLIGHT
   Subtle radial gradient follows mouse — depth/volume feeling.
   ============================================================ */
(function () {
  if (window.innerWidth < 768) return; // desktop only
  const spotlight = document.createElement('div');
  spotlight.id = 'spotlight';
  spotlight.style.cssText = `
    position:fixed; inset:0; z-index:1; pointer-events:none;
    background: radial-gradient(circle 380px at 50% 50%,
      rgba(15,240,252,0.04) 0%, transparent 70%);
    transition: opacity 0.4s;
    opacity: 0;
  `;
  document.body.appendChild(spotlight);

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    spotlight.style.opacity = '1';
  }, { passive: true });

  (function animSpot() {
    cx += (mx - cx) * 0.07;
    cy += (my - cy) * 0.07;
    spotlight.style.background =
      `radial-gradient(circle 380px at ${cx}px ${cy}px,
        rgba(15,240,252,0.04) 0%, transparent 70%)`;
    requestAnimationFrame(animSpot);
  })();
})();