(() => {
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gsap = window.gsap;
  // "Story mode" = the scroll-driven version. Falls back to the static page if
  // motion is reduced or the animation libraries didn't load.
  const story = root.classList.contains('story') && !!(gsap && window.ScrollTrigger && window.DrawSVGPlugin && window.Lenis);
  if (!story) root.classList.remove('story');

  /* ---------- Cycling tab title ---------- */
  const titleWords = ['Muhurtham', 'Kashi Yatra', 'Oonjal', 'Lunch', 'Reception', 'Come hungry'];
  let titleIndex = 0;
  setInterval(() => {
    if (document.hidden) return;
    document.title = `Shreya & Ashwin | ${titleWords[titleIndex++ % titleWords.length]}`;
  }, 2400);
  document.addEventListener('visibilitychange', () => {
    document.title = document.hidden ? 'Come back, lunch is getting cold' : 'Shreya & Ashwin · 16 November 2026';
  });

  /* ---------- Scroll reveals ---------- */
  if (story) $$('.moment.reveal').forEach((el) => el.classList.remove('reveal'));
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    // the reception frame is tall; wait until a good part of it is on screen so its text is seen arriving
    const late = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); late.unobserve(e.target); } });
    }, { threshold: 0.4 });
    reveals.forEach((el) => (el.classList.contains('rx-frame') ? late : io).observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Mini nav: appears after the hero, inverts over dark sections ---------- */
  const bar = $('.menu');
  const hero = $('.hero');
  // the menu is there from the first screen, so a guest who only wants the address can jump straight to it
  bar.classList.add('is-shown');
  const darkNow = new Set();
  const darkIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? darkNow.add(e.target) : darkNow.delete(e.target)));
    bar.classList.toggle('on-dark', darkNow.size > 0);
    // the dark bar takes the colour of the section under it (maroon invitation, navy evening)
    const under = [...darkNow].pop();
    if (under) bar.style.setProperty('--bar-dark', getComputedStyle(under).backgroundColor);
  }, { rootMargin: '0px 0px -94% 0px' });
  $$('[data-nav-dark]').forEach((el) => darkIO.observe(el));

  /* ---------- Menu: one button in the top-right corner, opens a small card of section links ---------- */
  const menuBtn = $('.menu-btn');
  const menuPanel = $('#menu-panel');
  function closeMenu() {
    bar.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
  }
  menuBtn.addEventListener('click', () => {
    const open = !bar.classList.contains('is-open');
    bar.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) menuPanel.querySelector('a').focus({ preventScroll: true });
  });
  menuPanel.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('click', (e) => { if (!bar.contains(e.target)) closeMenu(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && bar.classList.contains('is-open')) { closeMenu(); menuBtn.focus(); } });

  /* ---------- The map picture opens the visitor's own maps app ----------
     Apple devices: Apple Maps. Android: the geo: link, which offers the installed map apps.
     Anything else keeps the Google Maps link in the href. */
  const mapLink = $('.map-link');
  if (mapLink) {
    const venue = 'BAPS Swaminarayan Kala Kendra, Sector 10/12A, Mini Sea Shore Road, Vashi, Navi Mumbai 400703';
    const ua = navigator.userAgent;
    const apple = /iPhone|iPad|iPod|Macintosh/.test(ua) && !/Android/.test(ua);
    const android = /Android/.test(ua);
    if (apple) mapLink.href = 'https://maps.apple.com/?q=' + encodeURIComponent('BAPS Swaminarayan Kala Kendra') + '&address=' + encodeURIComponent(venue);
    else if (android) { mapLink.href = 'geo:0,0?q=' + encodeURIComponent(venue); mapLink.removeAttribute('target'); }
  }

  /* ---------- Gallery: a drifting carousel; tap a print to see it full screen, arrows step through ---------- */
  const viewer = $('#photo-viewer');
  if (viewer) {
    const originals = $$('.print:not(.is-clone)');
    const pvImg = $('.pv-img', viewer), pvCap = $('.pv-caption', viewer);
    const carousel = $('.carousel');
    // slide by exactly one set of prints (measured), so the loop never jumps by a stray pixel
    const track = $('.carousel-track');
    const setLoop = () => {
      const items = track.children, first = items[0], twin = items[originals.length];
      if (first && twin) track.style.setProperty('--loop', `${-(twin.offsetLeft - first.offsetLeft)}px`);
    };
    setLoop();
    new ResizeObserver(setLoop).observe(track);
    window.addEventListener('load', setLoop);
    let at = 0;
    const show = (i) => {
      at = (i + originals.length) % originals.length;
      const p = originals[at], btn = $('.print-btn', p), img = $('img', p), cap = $('figcaption', p).textContent.trim();
      pvImg.src = btn.dataset.full || img.src; pvImg.alt = img.alt || cap;
      pvCap.textContent = cap;
    };
    // a clone opens the matching original, so the arrows always walk the real set
    $$('.print').forEach((p) => $('.print-btn', p).addEventListener('click', () => {
      const src = $('img', p).getAttribute('src');
      const i = originals.findIndex((o) => $('img', o).getAttribute('src') === src);
      show(Math.max(0, i)); viewer.showModal(); carousel.classList.add('is-paused'); if (lenis) lenis.stop();
    }));
    $('.pv-prev', viewer).addEventListener('click', () => show(at - 1));
    $('.pv-next', viewer).addEventListener('click', () => show(at + 1));
    $('.pv-close', viewer).addEventListener('click', () => viewer.close());
    viewer.addEventListener('click', (e) => { if (e.target === viewer) viewer.close(); });
    viewer.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') show(at - 1); if (e.key === 'ArrowRight') show(at + 1); });
    viewer.addEventListener('close', () => {
      carousel.classList.remove('is-paused'); if (lenis) lenis.start();
      // the dialog hands focus back to the print; after a tap or click, let it go so the print
      // settles back into the row (keyboard users keep their place)
      const a = document.activeElement;
      if (a && carousel.contains(a) && !a.matches(':focus-visible')) a.blur();
    });
    // touch: pause while a finger is down, resume a moment after
    let resumeT = 0;
    carousel.addEventListener('touchstart', () => { clearTimeout(resumeT); carousel.classList.add('is-paused'); }, { passive: true });
    carousel.addEventListener('touchend', () => { resumeT = setTimeout(() => { if (!viewer.open) carousel.classList.remove('is-paused'); }, 1500); }, { passive: true });
  }

  /* ---------- Footer countdown to the Muhurtham: 16 November 2026, 9:00 AM India time ---------- */
  const cd = $('.footer-countdown');
  if (cd) {
    const start = new Date('2026-11-16T09:00:00+05:30').getTime();
    const dayEnd = new Date('2026-11-17T00:00:00+05:30').getTime();
    const cells = { d: $('[data-cd="d"]', cd), h: $('[data-cd="h"]', cd), m: $('[data-cd="m"]', cd), s: $('[data-cd="s"]', cd) };
    const done = $('.cd-done', cd);
    const pad = (n) => String(n).padStart(2, '0');
    const tick = () => {
      const now = Date.now();
      if (now >= start) {
        cd.classList.add('is-done');
        done.hidden = false;
        done.textContent = now < dayEnd ? 'Today’s the day' : 'Happily married';
        return false;
      }
      let t = Math.floor((start - now) / 1000);
      const d = Math.floor(t / 86400); t -= d * 86400;
      const h = Math.floor(t / 3600); t -= h * 3600;
      const m = Math.floor(t / 60); const sec = t - m * 60;
      cells.d.textContent = d; cells.h.textContent = pad(h); cells.m.textContent = pad(m); cells.s.textContent = pad(sec);
      return true;
    };
    if (tick()) { const iv = setInterval(() => { if (!tick()) clearInterval(iv); }, 1000); }
  }

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (story) {
    gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);
    ScrollTrigger.config({ ignoreMobileResize: true });
    // touch devices skip resize refreshes (to ignore the address bar), so re-measure ourselves
    // whenever the width really changes, otherwise pinned scenes keep a stale width
    let lastW = window.innerWidth, resizeT = 0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        if (window.innerWidth !== lastW) { lastW = window.innerWidth; ScrollTrigger.refresh(); }
      }, 200);
    });
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);

    $$('a[href^="#"]').forEach((a) =>
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        const target = id === '#top' ? 0 : $(id);
        if (target === null) return;
        e.preventDefault();
        // nearby sections glide; far ones (e.g. the hero straight to Location) jump, rather than
        // racing through the film and the pinned timeline on the way
        const y = target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY;
        const far = Math.abs(y - window.scrollY) > window.innerHeight * 3;
        lenis.scrollTo(target, far ? { immediate: true } : { duration: 1.6 });
      })
    );
  }

  if (story) {
    buildLoaderAndHero();
    buildMorning();
    buildDusk();
    buildLineDrawings();
    buildEnvelope();
  }

  /* ---------- Invitation: when the section arrives, the envelope opens and the cards rise out ---------- */
  function buildEnvelope() {
    const env = $('.envelope');
    if (!env || reduceMotion) return;
    const flap = $('.env-flap', env);
    const cards = [$('.env-pdf', env), $('.invite-stamp', env)];
    // start sealed: flap folded down over the pocket, cards tucked inside
    gsap.set(flap, { scaleY: -1 });
    flap.classList.add('is-closed');
    gsap.set(cards, { '--rise': '64%' });
    const tl = gsap.timeline({ paused: true })
      .to(flap, {
        scaleY: 1, duration: 0.8, ease: 'power2.inOut',
        // past halfway the inside of the flap shows, and it drops behind the cards
        onUpdate: () => flap.classList.toggle('is-closed', gsap.getProperty(flap, 'scaleY') < 0),
      }, 0.2)
      .to(cards[0], { '--rise': '0%', duration: 1, ease: 'power3.out' }, 0.85)
      .to(cards[1], { '--rise': '0%', duration: 1, ease: 'power3.out' }, 1.05);
    ScrollTrigger.create({ trigger: env, start: 'top 70%', once: true, onEnter: () => tl.play() });
  }


  /* ======================================================================
     Loader → hero film, scrubbed by scroll
     The film is a sequence of stills (assets/hero-frames). Scroll position
     picks the frame; the doorway starts small on white and grows to fill
     the screen as the doors open, then the text arrives on the mandapam wall.
     ====================================================================== */
  function buildLoaderAndHero() {
    const loader = $('#loader');
    const num = $('#loader-num');
    const canvas = $('#hero-canvas');
    const ctx = canvas.getContext('2d');
    const intro = $('.hero-intro');

    const FRAMES = 124;
    const IW = 1280, IH = 720;
    // where the closed doorway sits inside the first frame (fractions of the frame)
    const BOX = { x: 0.2, y: 0.05, w: 0.6, h: 0.93 };
    // by this frame the doorway fills the picture, so the zoom-to-full-screen must be done
    const FULL_BLEED_FRAME = 36;
    const src = (i) => `assets/hero-frames/f${String(i).padStart(3, '0')}.webp`;
    const phone = Math.min(window.innerWidth, window.innerHeight) < 700;
    const step = phone ? 2 : 1; // phones load every other frame to save data

    document.body.classList.add('is-loading');
    lenis.stop();

    /* --- load frames coarse-to-fine so scrubbing works early --- */
    const imgs = new Array(FRAMES);
    const order = [];
    const seen = new Set();
    const add = (i) => { if (!seen.has(i)) { seen.add(i); order.push(i); } };
    add(0); add(FRAMES - 1);
    for (const gap of [16, 8, 4, 2, 1]) for (let i = 0; i < FRAMES; i += gap) if (i % step === 0) add(i);
    const firstBatch = new Set(order.filter((i) => i % 16 === 0 || i === FRAMES - 1));
    let batchLoaded = 0;
    let batchDone;
    const batchReady = new Promise((r) => (batchDone = r));

    const load = (i) => new Promise((res) => {
      const im = new Image();
      im.decoding = 'async';
      im.onload = () => {
        imgs[i] = im;
        if (firstBatch.has(i) && ++batchLoaded === firstBatch.size) batchDone();
        if (firstBatch.has(i)) bump(15 + Math.round((batchLoaded / firstBatch.size) * 80));
        render();
        res();
      };
      im.onerror = () => { if (firstBatch.has(i) && ++batchLoaded === firstBatch.size) batchDone(); res(); };
      im.src = src(i);
    });
    let next = 0;
    const worker = async () => { while (next < order.length) await load(order[next++]); };
    for (let k = 0; k < 6; k++) worker();

    /* --- drawing --- */
    const state = { p: 0 };
    let W = 0, H = 0, introBottom = 0;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const nearest = (t) => {
      const i = Math.round(t);
      for (let d = 0; d < FRAMES; d++) {
        if (imgs[i - d]) return imgs[i - d];
        if (imgs[i + d]) return imgs[i + d];
      }
      return null;
    };

    function measure() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      const hr = hero.getBoundingClientRect();
      introBottom = intro.getBoundingClientRect().bottom - hr.top;
      render();
    }

    // frames play between these scroll points (0..1 of the pinned hero)
    const P_START = 0.04, P_END = 0.8;
    const P_STOP = 0.62;   // the film stops here: the frame on screen when the hero words begin to appear
    const P_FULL = P_START + (P_END - P_START) * (FULL_BLEED_FRAME / (FRAMES - 1));

    const MANDAP_CX = 665 / 1280;   // measured on the last frame: posts at ~329 and ~1001 of 1280
    let lastShift = null;
    function render() {
      if (!W) return;
      const p = state.p;
      const f = clamp((p - P_START) / (P_END - P_START), 0, 1) * (FRAMES - 1);
      const e = easeInOut(clamp((p - P_START * 0.5) / (P_FULL - P_START * 0.5), 0, 1));

      // "fit": the doorway sits below the names, as large as the space allows
      const top = introBottom + 6;
      const availW = W - 32;
      const availH = Math.max(120, H - top - (phone ? 44 : 60));
      const sFit = Math.min(availW / (BOX.w * IW), availH / (BOX.h * IH));
      const xFit = W / 2 - (BOX.x + BOX.w / 2) * IW * sFit;
      const yFit = top + availH / 2 - (BOX.y + BOX.h / 2) * IH * sFit;
      // "cover": the picture fills the screen
      const sCov = Math.max(W / IW, H / IH);
      // the mandapam's centre (midway between the posts) is right of the frame's centre, so centre
      // the picture on it where the screen has room, and nudge the text by whatever is left over
      // the doorway is centred in the film (640 of 1280) until about frame 90; only the final
      // mandapam sits right of centre, so glide the centre across in the last quarter of the film
      const fp = f / (FRAMES - 1);
      const cx = lerp(0.5, MANDAP_CX, easeInOut(clamp((fp - 0.72) / 0.28, 0, 1)));
      const xCov = clamp(W / 2 - cx * IW * sCov, W - IW * sCov, 0);
      const yCov = (H - IH * sCov) / 2;
      const shift = Math.round(xCov + cx * IW * sCov - W / 2);
      if (shift !== lastShift) { hero.style.setProperty('--mandap-x', shift + 'px'); lastShift = shift; }

      const sc = lerp(sFit, sCov, e);
      ctx.fillStyle = '#FCFCFC'; // the film's own paper white, so the frame edges disappear
      ctx.fillRect(0, 0, W, H);
      // blend the two loaded frames either side of the scroll position, so the film glides between
      // frames instead of stepping (matters most on phones, which load every other frame)
      const dx = lerp(xFit, xCov, e), dy = lerp(yFit, yCov, e), dw = IW * sc, dh = IH * sc;
      let lo = Math.floor(f), hi = Math.ceil(f);
      while (lo > 0 && !imgs[lo]) lo--;
      while (hi < FRAMES - 1 && !imgs[hi]) hi++;
      const a = imgs[lo], b = imgs[hi];
      if (a && b && a !== b) {
        ctx.drawImage(a, dx, dy, dw, dh);
        ctx.globalAlpha = clamp((f - lo) / (hi - lo), 0, 1);
        ctx.drawImage(b, dx, dy, dw, dh);
        ctx.globalAlpha = 1;
      } else {
        const im = a || b || nearest(f);
        if (im) ctx.drawImage(im, dx, dy, dw, dh);
      }
    }
    new ResizeObserver(measure).observe(canvas);
    measure();

    /* --- loader: count up as the first frames arrive, then light the lamp --- */
    const shown = { v: 0 };
    let target = 5;
    function bump(to) {
      target = Math.max(target, to);
      gsap.to(shown, { v: target, duration: 0.5, ease: 'power1.out', overwrite: true,
        onUpdate: () => (num.textContent = String(Math.round(shown.v)).padStart(3, '0')) });
    }
    bump(10);
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    const ready = Promise.race([
      Promise.all([batchReady, fonts, new Promise((r) => setTimeout(r, 1200))]),
      new Promise((r) => setTimeout(r, 7000)),
    ]);

    ready.then(() => {
      bump(100);
      measure();
      gsap.timeline({ delay: 0.5 })
        .to('.loader-flames', { scaleY: 1, opacity: 1, duration: 0.5, ease: 'back.out(3)' })
        .to('.loader-note', { opacity: 0, duration: 0.2 }, '<')
        .to(loader, { yPercent: -100, duration: 1, ease: 'power3.inOut' }, '+=0.35')
        .add(() => {
          document.body.classList.remove('is-loading');
          lenis.start();
        }, '-=0.3')
        .from('.hero-intro > *', { y: 30, autoAlpha: 0, stagger: 0.1, duration: 0.9, ease: 'power3.out' }, '-=0.45')
        .from(canvas, { autoAlpha: 0, y: 30, duration: 1, ease: 'power3.out' }, '<0.1')
        .from('.door-cue', { autoAlpha: 0, y: 10, duration: 0.6 }, '-=0.4')
        .add(() => loader.remove());
    });

    /* --- the invitation is pulled up one screen so it slides over the pinned film at the end,
           like the next card on a stack (the pin holds for that extra screen) --- */
    const invite = $('#invitation');
    const pullUp = () => { if (invite) invite.style.marginTop = -window.innerHeight + 'px'; };
    pullUp();
    ScrollTrigger.addEventListener('refreshInit', pullUp);

    /* --- scroll: play the film, swap the intro names for the full invitation --- */
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: hero, start: 'top top', end: '+=343%', pin: true, scrub: 1, anticipatePin: 1 },
    })
      // the film freezes on the frame where the words start to appear (P_STOP), so the picture holds
      // still while they rise; the rest of the film is never shown
      .to(state, { p: P_STOP, duration: P_STOP, onUpdate: render }, 0)
      .to('.door-cue', { autoAlpha: 0, duration: 0.05 }, 0)
      .to(intro, { autoAlpha: 0, y: -30, duration: 0.1 }, 0.03)
      .fromTo('.hero-copy', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.14, ease: 'power2.out' }, P_STOP)
      // once the words are in (1 unit = 320% of scroll), the last screen of scroll is the invitation covering it
      .to(['.hero-scene', '.hero-copy'], { scale: 0.92, autoAlpha: 0.35, duration: 100 / 320 }, P_STOP + 0.14)
      .to('.hero-scene', { borderRadius: 28, duration: 100 / 320 }, P_STOP + 0.14);

  }

  /* ======================================================================
     The morning: pinned, one moment after another
     ====================================================================== */
  function buildMorning() {
    const stage = $('#moments-stage');
    const items = $$('.moment', stage);
    const n = items.length;
    const ring = $('.dial-ring', stage);
    const medsBox = $('.dial-meds', stage);
    const sun = $('.dial-sun', stage);
    const rays = $('.dial-rays', stage);
    stage.classList.add('is-dial');
    // the section's title and intro live inside the pinned scene, so the dial starts turning
    // as soon as they are on screen (not after they've scrolled away)
    const head = $('#morning > .wrap.narrow');
    if (head) {
      head.classList.add('dial-head');
      $$('.reveal', head).forEach((el) => el.classList.add('is-in'));
      stage.prepend(head);
      $('#morning').classList.add('has-dial');
    }

    /* sundial ticks around the ring */
    const ticks = $('.dial-ticks', stage);
    for (let k = 0; k < 72; k++) {
      const a = (k * 5 * Math.PI) / 180, long = k % 6 === 0;
      const r1 = long ? 88 : 91, r2 = 96;
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', (Math.sin(a) * r1).toFixed(2)); l.setAttribute('y1', (-Math.cos(a) * r1).toFixed(2));
      l.setAttribute('x2', (Math.sin(a) * r2).toFixed(2)); l.setAttribute('y2', (-Math.cos(a) * r2).toFixed(2));
      l.setAttribute('stroke-width', long ? 2 : 1);
      l.setAttribute('vector-effect', 'non-scaling-stroke');
      ticks.appendChild(l);
    }

    /* each moment's drawing moves into a round medallion on the dial */
    const meds = items.map((li, i) => {
      const art = $('.moment-art', li);
      const time = $('.moment-time', li);
      const tag = time ? time.textContent.replace('Between ', '').replace(' and ', ' to ') : $('.moment-kicker', li).textContent;
      const med = document.createElement('div');
      med.className = 'med' + (li.classList.contains('moment-hero') ? ' med-hero' : '');
      med.style.setProperty('--blob', art.style.getPropertyValue('--blob'));
      med.innerHTML = `<div class="med-disc"></div><span class="med-tag"><span class="med-no">${String(i + 1).padStart(2, '0')}</span>${tag}</span>`;
      $('.med-disc', med).appendChild(art);
      medsBox.appendChild(med);
      return med;
    });
    const drawsIn = (li) => $$('.draw', li.__med || li);
    items.forEach((li, i) => { li.__med = meds[i]; });
    items.forEach((li, i) => i > 0 && gsap.set(drawsIn(li), { drawSVG: '0%' }));
    const drawn = new Set([0]);
    gsap.from(drawsIn(items[0]), {
      drawSVG: '0%', duration: 1.2, stagger: 0.15, ease: 'power1.inOut',
      scrollTrigger: { trigger: stage, start: 'top 70%', once: true },
    });

    /* geometry: a big ring whose top sits about a third of the way down the stage */
    const geo = { W: 0, H: 0, R: 0, cx: 0, cy: 0, med: 0, step: 34 };
    function layout() {
      const W = stage.clientWidth, H = stage.clientHeight;
      const phone = W < 700;
      const headBottom = head ? head.offsetTop + head.offsetHeight : H * 0.2;
      // centre the circle + words in the space between the title and the progress dots
      const textGap = phone ? 56 : 58;
      const room = H - 52 - headBottom;                       // 52 ≈ dots + breathing room at the bottom
      const minPad = phone ? 20 : 20;
      // the words under the circle are only a little wider than the circle itself; the circle
      // shrinks when the words need the room (text height depends on its width, so settle twice)
      let med = phone ? Math.min(W * 0.8, 330, H * 0.4) : Math.min(340, H * 0.4);
      let textH = 0;
      for (let k = 0; k < 2; k++) {
        stage.style.setProperty('--text-w', `${Math.round(Math.max(med * 1.35, phone ? 280 : 340))}px`);
        textH = Math.max(...items.map((li) => li.offsetHeight));
        med = Math.max(phone ? 150 : 170, Math.min(med, room - textGap - textH - 2 * minPad));
      }
      const group = med + textGap + textH;
      const topY = headBottom + Math.max(minPad, (room - group) / 2) + med / 2;
      // the half-circle rises from just below the bottom edge up to the medallions' path
      const R = H + (phone ? 24 : 60) - topY;
      // space the medallions so the neighbours sit comfortably on either side
      // neighbours sit far enough out that they never touch the big circle, however wide the screen
      const chord = Math.max(W * (phone ? 0.46 : 0.3), med * 0.92);
      const step = (Math.asin(Math.min(0.9, chord / R)) * 180) / Math.PI;
      Object.assign(geo, { W, H, R, cx: W / 2, cy: topY + R, med, step });
      // a half-disc: its flat edge sits on the circle's centre line, so only the top half shows
      ring.style.width = `${R * 2}px`;
      ring.style.height = `${R}px`;
      ring.style.left = `${geo.cx - R}px`;
      ring.style.top = `${geo.cy - R}px`;
      medsBox.style.setProperty('--med', `${med}px`);
      sun.style.left = `${geo.cx}px`;
      sun.style.top = `${topY - med / 2 - (phone ? 18 : 26)}px`;
      stage.style.setProperty('--text-top', `${topY + med / 2 + textGap}px`);
      render();
    }


    /* pos runs 0 → n-1 with the scroll; everything is placed from it */
    // progress dots along the bottom of the scene
    const dots = document.createElement('div');
    dots.className = 'dial-dots';
    dots.innerHTML = items.map(() => '<i></i>').join('');
    stage.appendChild(dots);
    const dotEls = [...dots.children];

    const state = { pos: 0 };
    let current = -1;
    function render() {
      if (!geo.W) return;
      const { R, cx, cy, med, step } = geo;
      const pos = state.pos;
      rays.style.transform = `rotate(${pos * 45}deg)`;
      meds.forEach((m, i) => {
        const d = i - pos;
        const ad = Math.abs(d);
        const ang = (d * step * Math.PI) / 180;
        const x = cx + R * Math.sin(ang), y = cy - R * Math.cos(ang);
        const sc = 1 - 0.42 * Math.min(1, ad);
        m.style.transform = `translate(${x - med / 2}px, ${y - med / 2}px) scale(${sc})`;
        // fade out as a medallion slides down past the flat edge of the half-circle
        const edge = 90 / step;
        m.style.opacity = Math.max(0, Math.min(1, (edge + 0.15 - ad) * 1.6));
        m.style.zIndex = 10 - Math.round(ad);
        m.classList.toggle('is-active', ad < 0.5);
      });
      items.forEach((li, i) => {
        const ad = Math.abs(i - state.pos);
        const o = Math.max(0, 1 - ad * 2.2);
        li.style.opacity = o;
        li.style.visibility = o > 0.01 ? 'visible' : 'hidden';
        li.style.transform = `translate(-50%, ${Math.min(1, ad) * 26}px)`;
      });
      const idx = Math.round(pos);
      if (idx !== current) {
        current = idx;
        dotEls.forEach((d, k) => d.classList.toggle('on', k === idx));
        items[idx].classList.add('is-in');           // lets the seven footprints appear
        meds[idx].classList.add('is-in');
        if (!drawn.has(idx)) { drawn.add(idx); gsap.to(drawsIn(items[idx]), { drawSVG: '100%', duration: 0.8, stagger: 0.08, ease: 'power1.inOut' }); }
      }
    }

    // Scroll plan (in "moment" units): hold on the first moment so it can be read, turn through
    // the rest, then a short hold on the last before the scene lets go. Nothing moves before the pin.
    const HOLD_START = 0.6, HOLD_END = 0.3;
    const total = HOLD_START + (n - 1) + HOLD_END;
    const perUnit = () => window.innerHeight * 0.55;
    const turn = gsap.timeline({ defaults: { ease: 'none' } })
      .to({}, { duration: HOLD_START })
      .to(state, { pos: n - 1, duration: n - 1, onUpdate: render })
      .to({}, { duration: HOLD_END });
    const snapPoints = items.map((_, i) => (HOLD_START + i) / total);
    const pinST = ScrollTrigger.create({
      trigger: stage, start: 'top top', end: () => `+=${total * perUnit()}`,
      pin: true, scrub: 0.5, animation: turn,
      // the top bar steps out of the way while the scene is locked, and comes back after
      onToggle: (self) => { $('.menu').classList.toggle('is-tucked', self.isActive); if (self.isActive) closeMenu(); },
    });

    /* Snap to the cards. ScrollTrigger's own snap fights the smooth scroller, so snapping is done
       through Lenis: when scrolling pauses inside the scene, glide to a card in the direction you
       were going (a small nudge is enough), without trapping you at either end. */
    let settled = 0, snapping = false, dir = 1, snapTimer = 0;
    const pointY = (i) => pinST.start + snapPoints[i] * (pinST.end - pinST.start);
    function snapToCard() {
      if (snapping || !pinST.isActive) return;
      const units = pinST.progress * total - HOLD_START;        // 0 = first card, n-1 = last card
      if (units > n - 1 + HOLD_END * 0.5 && dir > 0) return;     // leaving past the last card
      if (units < -HOLD_START * 0.5 && dir < 0) return;          // leaving back above the first
      let i = Math.round(units);
      if (dir > 0 && units - settled > 0.08) i = Math.ceil(units - 0.02);
      if (dir < 0 && settled - units > 0.08) i = Math.floor(units + 0.02);
      i = Math.max(0, Math.min(n - 1, i));
      const y = pointY(i);
      if (Math.abs(y - window.scrollY) < 2) { settled = i; return; }
      snapping = true;
      lenis.scrollTo(y, {
        duration: 0.75, easing: (t) => 1 - Math.pow(1 - t, 3),
        onComplete: () => { snapping = false; settled = i; },
      });
      setTimeout(() => { snapping = false; }, 1200);             // safety net if the glide is interrupted
    }
    lenis.on('scroll', (e) => {
      if (e.direction) dir = e.direction;
      if (snapping) return;
      clearTimeout(snapTimer);
      snapTimer = setTimeout(snapToCard, 140);
    });
    new ResizeObserver(layout).observe(stage);
    layout();
  }

  /* ======================================================================
     Morning → evening: the sun sets and the moon rises with the scroll
     ====================================================================== */
  function buildDusk() {
    const dusk = $('.dusk');
    const st = { trigger: dusk, start: 'top bottom', end: 'bottom top', scrub: true };
    gsap.fromTo('.dusk-sun', { yPercent: -10 }, { yPercent: 24, ease: 'none', scrollTrigger: st });
    gsap.fromTo('.dusk-moon', { yPercent: 14 }, { yPercent: -9, ease: 'none', scrollTrigger: { ...st } });
    gsap.fromTo('.birds', { x: -260 }, { x: 320, ease: 'none', scrollTrigger: { ...st } });
    // the stars come out as the maroon bands scroll in
    gsap.fromTo('.dusk-night', { autoAlpha: 0 }, { autoAlpha: 1, ease: 'none', scrollTrigger: { trigger: dusk, start: 'center bottom', end: 'bottom 85%', scrub: true } });
    // the clouds drift with the wind as you scroll, the big one slowest so the sky has depth
    [[-70, 110], [-40, 150], [-110, 170]].forEach(([from, to], i) => {
      const c = $$('.dusk-clouds image')[i];
      if (c) gsap.fromTo(c, { x: from }, { x: to, ease: 'none', scrollTrigger: { ...st } });
    });
    gsap.fromTo('.dusk-caption', { yPercent: 60, opacity: 0 }, { yPercent: -60, opacity: 1, ease: 'none', scrollTrigger: { trigger: dusk, start: 'top 80%', end: 'center center', scrub: true } });
    gsap.fromTo('.dusk-stars use', { opacity: 0 }, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: dusk, start: 'center center', end: 'bottom 60%', scrub: true } });
  }

  /* ======================================================================
     Everything else with .draw draws itself when it scrolls into view
     ====================================================================== */
  function buildLineDrawings() {
    $$('.draw').filter((el) => !el.closest('.hero, .moments')).forEach((el) => {
      gsap.from(el, {
        drawSVG: '0%', duration: 1.6, ease: 'power2.inOut',
        scrollTrigger: { trigger: el.closest('svg'), start: 'top 85%', once: true },
      });
    });
  }

  /* ---------- Invitation video modal ---------- */
  const modal = $('#video-modal');
  const video = $('#invite-video');
  const missing = $('#video-missing');
  video.querySelector('source').addEventListener('error', () => { missing.hidden = false; });

  $$('[data-open-video]').forEach((btn) =>
    btn.addEventListener('click', () => {
      if (typeof modal.showModal === 'function') modal.showModal();
      else modal.setAttribute('open', '');
      lenis && lenis.stop();
      video.load();
      const play = video.play();
      if (play && play.catch) play.catch(() => {});
    })
  );
  const closeModal = () => { video.pause(); modal.close ? modal.close() : modal.removeAttribute('open'); };

  /* ---------- Silent looping preview of the film inside the stamp ---------- */
  const preview = $('#invite-preview');
  let previewVisible = false;
  const playPreview = () => {
    if (reduceMotion || !previewVisible || modal.open) return;
    if (preview.preload === 'none') { preview.preload = 'auto'; preview.load(); }
    const p = preview.play();
    if (p && p.catch) p.catch(() => {});
  };
  if (preview && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      previewVisible = e.isIntersecting;
      previewVisible ? playPreview() : preview.pause();
    }, { rootMargin: '200px 0px' }).observe(preview);
  }
  $$('[data-open-video]').forEach((btn) => btn.addEventListener('click', () => preview && preview.pause()));
  modal.addEventListener('close', () => playPreview());
  modal.querySelector('[data-close-video]').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  modal.addEventListener('close', () => { video.pause(); lenis && lenis.start(); });

})();
