/* ============================================================
   UangKu Landing Page — interaksi & animasi
   ============================================================ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const raf = (fn) => requestAnimationFrame(fn);

  /* ---------- 1. Scroll progress + nav state + to-top ---------- */
  const nav = document.getElementById('nav');
  const scrollBar = document.getElementById('scrollBar');
  const toTop = document.getElementById('toTop');

  function onScroll() {
    const y = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollBar) scrollBar.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';
    if (nav) nav.classList.toggle('is-scrolled', y > 12);
    if (toTop) toTop.classList.toggle('is-show', y > 500);
  }
  window.addEventListener('scroll', () => raf(onScroll), { passive: true });
  onScroll();

  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* ---------- 2. Mobile menu ---------- */
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');

  function closeMenu() {
    burger.classList.remove('is-open');
    navLinks.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const open = !navLinks.classList.contains('is-open');
      burger.classList.toggle('is-open', open);
      navLinks.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
    });
    navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------- 3. Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- 4. Count-up stats ---------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();

    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      const val = (target * eased).toFixed(decimals);
      // format Indonesia: desimal pakai koma
      el.textContent = val.replace('.', ',') + suffix;
      if (p < 1) raf(tick);
    }
    if (reduceMotion) {
      el.textContent = target.toFixed(decimals).replace('.', ',') + suffix;
    } else {
      raf(tick);
    }
  }

  const counters = document.querySelectorAll('.count');
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          co.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => co.observe(c));
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- 5. Progress bar amplop ---------- */
  const envs = document.querySelectorAll('.env[data-progress]');
  envs.forEach((env) => env.style.setProperty('--w', env.dataset.progress + '%'));
  if ('IntersectionObserver' in window) {
    const po = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          po.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    envs.forEach((e) => po.observe(e));
  } else {
    envs.forEach((e) => e.classList.add('is-visible'));
  }

  /* ---------- 6. Phone screenshot slideshow ---------- */
  const screens = Array.from(document.querySelectorAll('.screen'));
  const dots = Array.from(document.querySelectorAll('.phone__dots .dot'));
  let screenIdx = 0;
  let screenTimer = null;

  function showScreen(i) {
    screenIdx = (i + screens.length) % screens.length;
    screens.forEach((s, n) => s.classList.toggle('is-active', n === screenIdx));
    dots.forEach((d, n) => d.classList.toggle('is-active', n === screenIdx));
  }
  function startSlideshow() {
    if (reduceMotion || screens.length < 2) return;
    stopSlideshow();
    screenTimer = setInterval(() => showScreen(screenIdx + 1), 3800);
  }
  function stopSlideshow() { if (screenTimer) { clearInterval(screenTimer); screenTimer = null; } }

  dots.forEach((d) => d.addEventListener('click', () => {
    showScreen(parseInt(d.dataset.goto, 10));
    startSlideshow(); // reset timer agar tidak langsung pindah
  }));
  startSlideshow();
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopSlideshow() : startSlideshow();
  });

  /* ---------- 7. Kalkulator amplop ---------- */
  const income = document.getElementById('income');
  const incomeOut = document.getElementById('incomeOut');
  const calcItems = document.querySelectorAll('.calc__item strong');
  const rupiah = (n) => 'Rp' + Math.round(n).toLocaleString('id-ID');

  function updateCalc() {
    if (!income) return;
    const value = parseInt(income.value, 10);
    if (incomeOut) incomeOut.textContent = rupiah(value);

    // persentase dari track (untuk warna gradient slider)
    const pct = ((value - income.min) / (income.max - income.min)) * 100;
    income.style.setProperty('--p', pct + '%');

    calcItems.forEach((el) => {
      const share = parseInt(el.dataset.pct, 10) / 100;
      el.textContent = rupiah(value * share);
    });
  }
  if (income) {
    income.addEventListener('input', updateCalc);
    updateCalc();
  }

  /* ---------- 8. Testimoni slider ---------- */
  const track = document.getElementById('testiTrack');
  const dotsWrap = document.getElementById('testiDots');
  const prevBtn = document.getElementById('testiPrev');
  const nextBtn = document.getElementById('testiNext');

  if (track && dotsWrap) {
    const items = track.children.length;
    let idx = 0;
    let auto = null;

    for (let i = 0; i < items; i++) {
      const b = document.createElement('button');
      b.className = 'tdot' + (i === 0 ? ' is-active' : '');
      b.type = 'button';
      b.setAttribute('aria-label', 'Testimoni ' + (i + 1));
      b.addEventListener('click', () => { go(i); restart(); });
      dotsWrap.appendChild(b);
    }
    const tdots = Array.from(dotsWrap.children);

    function go(i) {
      idx = (i + items) % items;
      track.style.transform = 'translateX(' + (-100 * idx) + '%)';
      tdots.forEach((d, n) => d.classList.toggle('is-active', n === idx));
    }
    function restart() {
      if (reduceMotion) return;
      clearInterval(auto);
      auto = setInterval(() => go(idx + 1), 5500);
    }

    prevBtn && prevBtn.addEventListener('click', () => { go(idx - 1); restart(); });
    nextBtn && nextBtn.addEventListener('click', () => { go(idx + 1); restart(); });
    restart();

    // swipe di layar sentuh
    let startX = null;
    track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) { go(idx + (dx < 0 ? 1 : -1)); restart(); }
      startX = null;
    }, { passive: true });
  }

  /* ---------- 9. Ganti periode harga ---------- */
  const switchEl = document.querySelector('.switch');
  if (switchEl) {
    const btns = switchEl.querySelectorAll('.switch__btn');
    const prices = document.querySelectorAll('.plan__price strong[data-month]');

    btns.forEach((btn) => btn.addEventListener('click', () => {
      const period = btn.dataset.period;
      btns.forEach((b) => b.classList.toggle('is-active', b === btn));
      switchEl.classList.toggle('is-year', period === 'year');

      prices.forEach((p) => {
        p.classList.add('is-swap');
        setTimeout(() => {
          p.textContent = period === 'year' ? p.dataset.year : p.dataset.month;
          p.classList.remove('is-swap');
        }, 220);
      });
    }));
  }

  /* ---------- 10. FAQ: hanya satu terbuka ---------- */
  const faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) faqItems.forEach((other) => { if (other !== item) other.open = false; });
    });
  });

  /* ---------- 11. Kartu galeri: efek tilt halus (desktop) ---------- */
  if (!reduceMotion && window.matchMedia('(hover:hover) and (min-width:861px)').matches) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      const frame = card.querySelector('.shot__frame');
      if (!frame) return;
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        frame.style.transform =
          'perspective(900px) rotateY(' + (x * 12) + 'deg) rotateX(' + (-y * 10) + 'deg) translateY(-6px)';
      });
      card.addEventListener('mouseleave', () => { frame.style.transform = ''; });
    });
  }

  /* ---------- 12. Newsletter (demo) ---------- */
  const newsForm = document.getElementById('newsForm');
  if (newsForm) {
    newsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = document.getElementById('newsMsg');
      const input = document.getElementById('email');
      if (msg) msg.textContent = 'Terima kasih! Cek inbox kamu untuk konfirmasi. 🎉';
      if (input) input.value = '';
      setTimeout(() => { if (msg) msg.textContent = ''; }, 5000);
    });
  }

  /* ---------- 13. Smooth scroll dengan offset nav ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });
})();
