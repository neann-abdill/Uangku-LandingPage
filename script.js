(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(s, c) { return (c || document).querySelector(s); }
  function $all(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* ---------- 1. Progress + nav + to-top ---------- */
  var nav = $("#nav");
  var bar = $("#progressBar");
  var toTop = $("#toTop");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var doc = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (doc > 0 ? (y / doc) * 100 : 0) + "%";
    if (nav) nav.classList.toggle("is-scrolled", y > 12);
    if (toTop) toTop.classList.toggle("is-show", y > 600);
  }
  window.addEventListener("scroll", function () { requestAnimationFrame(onScroll); }, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });

  /* ---------- 2. Mobile menu ---------- */
  var burger = $("#burger");
  var links = $("#navLinks");
  function closeMenu() {
    if (!links || !burger) return;
    links.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  }
  if (burger && links) {
    burger.addEventListener("click", function () {
      var open = !links.classList.contains("is-open");
      links.classList.toggle("is-open", open);
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    $all("a", links).forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  /* ---------- 3. Active nav link ---------- */
  var secIds = ["amplop", "fitur", "catatan", "cara", "cerita", "faq"];
  var navAs = $all(".nav__links a");
  if ("IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var id = "#" + en.target.id;
          navAs.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === id); });
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    secIds.forEach(function (id) { var el = document.getElementById(id); if (el) so.observe(el); });
  }

  /* ---------- 4. Reveal ---------- */
  var reveals = $all(".manifesto__text, .manifesto__stats, .amplop__left, .env, .fitur__left, .feat__item, .ledger__copy, .sheet, .ledger__phone, .sim__box, .cara__head, .steps li, .galeri__head, .shot, .cerita__left, .slider, .faq__grid > div, .faq__list details, .unduh__box");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-visible");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- 5. Count up ---------- */
  function animateCount(el) {
    var target = parseFloat(el.dataset.target);
    var decimals = parseInt(el.dataset.decimals || "0", 10);
    var suffix = el.dataset.suffix || "";
    function fmt(v) { return v.toFixed(decimals).replace(".", ",") + suffix; }
    if (reduce) { el.textContent = fmt(target); return; }
    var start = performance.now(), dur = 1400;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counts = $all(".count");
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counts.forEach(function (c) { co.observe(c); });
  } else {
    counts.forEach(animateCount);
  }

  /* ---------- 6. Envelope percent + bars ---------- */
  var pcts = $all("[data-countpct]");
  var wbars = $all("[data-w]");
  function animatePct(el) {
    var target = parseInt(el.dataset.countpct, 10);
    if (reduce) { el.textContent = target + "%"; return; }
    var start = performance.now(), dur = 1200;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + "%";
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window) {
    var po = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        if (el.hasAttribute("data-countpct")) animatePct(el);
        if (el.hasAttribute("data-w")) el.style.width = el.dataset.w + "%";
        po.unobserve(el);
      });
    }, { threshold: 0.4 });
    pcts.forEach(function (el) { po.observe(el); });
    wbars.forEach(function (el) { po.observe(el); });
  } else {
    pcts.forEach(function (el) { el.textContent = el.dataset.countpct + "%"; });
    wbars.forEach(function (el) { el.style.width = el.dataset.w + "%"; });
  }

  /* ---------- 7. Feature filter + accordion ---------- */
  var chips = $all(".chip");
  var items = $all(".feat__item");
  var featCount = $("#featCount");
  function updateCount() {
    if (!featCount) return;
    var n = items.filter(function (it) { return !it.classList.contains("is-hidden"); }).length;
    featCount.textContent = n + " dari " + items.length;
  }
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("is-active"); c.setAttribute("aria-pressed", "false"); });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      var f = chip.dataset.filter;
      items.forEach(function (it) {
        var show = f === "semua" || it.dataset.cat === f;
        it.classList.toggle("is-hidden", !show);
        if (show && !reduce) {
          it.style.animation = "none";
          void it.offsetWidth;
          it.style.animation = "slideIn .45s ease both";
        }
      });
      updateCount();
    });
  });
  updateCount();
  $all(".feat__head").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".feat__item");
      var open = card.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  /* ---------- 8. Sheet total count on view ---------- */
  var sheet = $("#sheet");
  var sheetTotal = $("#sheetTotal");
  function animateRupiah(el, target) {
    if (reduce) { el.textContent = "Rp" + target.toLocaleString("id-ID"); return; }
    var start = performance.now(), dur = 1300;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = "Rp" + Math.round(target * eased).toLocaleString("id-ID");
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (sheet && sheetTotal && "IntersectionObserver" in window) {
    var sho = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateRupiah(sheetTotal, 400000); sho.disconnect(); }
      });
    }, { threshold: 0.4 });
    sho.observe(sheet);
  }

  /* ---------- 9. Simulation ---------- */
  var gaji = $("#gaji");
  var pMakan = $("#pMakan"), pTransport = $("#pTransport"), pJajan = $("#pJajan"), pDarurat = $("#pDarurat");
  var gajiLabel = $("#gajiLabel");
  var verdict = $("#verdict"), simNote = $("#simNote");
  var presets = {
    kos: { makan: 45, transport: 15, jajan: 15, darurat: 25 },
    kerja: { makan: 35, transport: 20, jajan: 20, darurat: 25 },
    keluarga: { makan: 40, transport: 15, jajan: 10, darurat: 35 }
  };
  function rupiah(n) { return "Rp" + Math.round(n).toLocaleString("id-ID"); }
  function renderSim() {
    if (!gaji) return;
    var g = parseInt(gaji.value, 10);
    var m = parseInt(pMakan.value, 10), t = parseInt(pTransport.value, 10);
    var j = parseInt(pJajan.value, 10), d = parseInt(pDarurat.value, 10);
    var total = m + t + j + d;
    if (gajiLabel) gajiLabel.textContent = rupiah(g);
    var lm = $("#pMakanLabel"), lt = $("#pTransportLabel"), lj = $("#pJajanLabel"), ld = $("#pDaruratLabel");
    if (lm) lm.textContent = m + "%";
    if (lt) lt.textContent = t + "%";
    if (lj) lj.textContent = j + "%";
    if (ld) ld.textContent = d + "%";
    function set(a, b, pct, val) {
      var ae = $(a), be = $(b);
      if (ae) ae.textContent = rupiah(val);
      if (be) be.style.width = Math.max(0, Math.min(100, pct)) + "%";
    }
    set("#aMakan", "#bMakan", m, g * m / 100);
    set("#aTransport", "#bTransport", t, g * t / 100);
    set("#aJajan", "#bJajan", j, g * j / 100);
    set("#aDarurat", "#bDarurat", d, g * d / 100);
    if (simNote) {
      if (total === 100) {
        simNote.textContent = "Total 100% : pas satu gaji.";
        simNote.classList.remove("is-warn");
      } else if (total > 100) {
        simNote.textContent = "Total " + total + "% : kelebihan " + (total - 100) + "%, kurangi salah satu.";
        simNote.classList.add("is-warn");
      } else {
        simNote.textContent = "Total " + total + "% : sisa " + (100 - total) + "% belum punya alamat.";
        simNote.classList.add("is-warn");
      }
    }
    if (verdict) {
      if (total !== 100) {
        verdict.textContent = "Total belum 100%. Sesuaikan dulu supaya simulasi valid.";
      } else if (d >= 20 && j <= 20) {
        verdict.textContent = "Porsi seimbang. Darurat di atas 20%, tanggal tua aman.";
      } else if (d < 10) {
        verdict.textContent = "Darurat di bawah 10%. Satu kejadian tak terduga bisa mengacaukan bulanmu.";
      } else if (j > 25) {
        verdict.textContent = "Jajan di atas 25%. Seru di awal, deg-degan di akhir. Pertimbangkan geser ke darurat.";
      } else {
        verdict.textContent = "Porsi cukup sehat. Jaga konsistensi catat tiap hari.";
      }
    }
  }
  [gaji, pMakan, pTransport, pJajan, pDarurat].forEach(function (el) {
    if (el) el.addEventListener("input", renderSim);
  });
  $all(".sim__presets button").forEach(function (b) {
    b.addEventListener("click", function () {
      $all(".sim__presets button").forEach(function (x) { x.classList.remove("is-active"); });
      b.classList.add("is-active");
      var p = presets[b.dataset.preset];
      if (p && pMakan) {
        pMakan.value = p.makan; pTransport.value = p.transport;
        pJajan.value = p.jajan; pDarurat.value = p.darurat;
        renderSim();
      }
    });
  });
  renderSim();

  /* ---------- 10. Steps progress ---------- */
  var steps = $("#steps");
  var caraBar = $("#caraBar");
  function stepScroll() {
    if (!steps) return;
    var r = steps.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / r.height));
    if (caraBar) caraBar.style.width = (p * 100) + "%";
    var lis = $all("li", steps);
    var active = p < 0.33 ? 0 : p < 0.66 ? 1 : 2;
    lis.forEach(function (li, i) { li.classList.toggle("is-active", i <= active); });
  }
  window.addEventListener("scroll", function () { requestAnimationFrame(stepScroll); }, { passive: true });
  stepScroll();

  /* ---------- 11. Slider ---------- */
  var slides = $("#slides");
  var list = $all(".slide", slides || document);
  var idx = 0, timer = null;
  var countEl = $("#slideCount"), sbar = $("#sliderBar"), dots = $("#dots");
  function buildDots() {
    if (!dots) return;
    dots.innerHTML = "";
    list.forEach(function (_, i) {
      var d = document.createElement("button");
      d.setAttribute("aria-label", "Ke cerita " + (i + 1));
      if (i === 0) d.classList.add("is-active");
      d.addEventListener("click", function () { go(i); restart(); });
      dots.appendChild(d);
    });
  }
  function paint() {
    if (!slides) return;
    slides.style.transform = "translateX(-" + idx * 100 + "%)";
    if (countEl) countEl.textContent = (idx + 1) + " / " + list.length;
    $all("button", dots || document).forEach(function (d, i) {
      d.classList.toggle("is-active", i === idx);
    });
    if (sbar) {
      sbar.style.transition = "none";
      sbar.style.width = "0";
      if (!reduce) {
        void sbar.offsetWidth;
        sbar.style.transition = "width 6s linear";
        sbar.style.width = "100%";
      } else {
        sbar.style.width = "100%";
      }
    }
  }
  function go(i) {
    idx = (i + list.length) % list.length;
    paint();
  }
  function restart() {
    if (timer) clearInterval(timer);
    if (!reduce && list.length > 1) timer = setInterval(function () { go(idx + 1); }, 6000);
  }
  var prev = $("#prevSlide"), next = $("#nextSlide");
  if (prev) prev.addEventListener("click", function () { go(idx - 1); restart(); });
  if (next) next.addEventListener("click", function () { go(idx + 1); restart(); });
  if (slides) {
    var sx = 0, dx = 0, drag = false;
    slides.addEventListener("pointerdown", function (e) { drag = true; sx = e.clientX; });
    window.addEventListener("pointerup", function (e) {
      if (!drag) return;
      drag = false;
      dx = e.clientX - sx;
      if (Math.abs(dx) > 40) { go(idx + (dx < 0 ? 1 : -1)); restart(); }
    });
  }
  buildDots();
  paint();
  restart();

  /* ---------- 12. Gallery cursor zoom origin ---------- */
  $all("[data-zoom]").forEach(function (fig) {
    var img = $("img", fig);
    fig.addEventListener("pointermove", function (e) {
      var r = fig.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width) * 100;
      var y = ((e.clientY - r.top) / r.height) * 100;
      fig.style.setProperty("--zx", x.toFixed(1) + "%");
      fig.style.setProperty("--zy", y.toFixed(1) + "%");
      if (img && reduce) img.style.transform = "scale(1.4)";
    });
    fig.addEventListener("pointerleave", function () {
      if (img && reduce) img.style.transform = "";
    });
  });

  /* ---------- 13. Tilt on hero visual ---------- */
  var tilt = $("[data-tilt]");
  if (tilt && !reduce && window.matchMedia("(pointer:fine)").matches) {
    tilt.addEventListener("pointermove", function (e) {
      var r = tilt.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = "perspective(900px) rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (-y * 6).toFixed(2) + "deg)";
    });
    tilt.addEventListener("pointerleave", function () { tilt.style.transform = ""; });
  }

  /* ---------- 14. Toast ---------- */
  var toast = $("#toast"), toastT = null;
  function showToast(msg) {
    if (!toast || !msg) return;
    toast.textContent = msg;
    toast.classList.add("is-show");
    if (toastT) clearTimeout(toastT);
    toastT = setTimeout(function () { toast.classList.remove("is-show"); }, 2600);
  }
  $all("[data-toast]").forEach(function (el) {
    el.addEventListener("click", function () { showToast(el.dataset.toast); });
  });

  /* ---------- 15. Year ---------- */
  var year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
