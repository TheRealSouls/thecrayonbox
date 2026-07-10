(function () {
  "use strict";

  function msg(key, fallback) {
    return (window.I18N && window.I18N.t) ? window.I18N.t(key) : fallback;
  }

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");
  var navBreakpoint = 1280;

  if (navToggle && navMenu) {
    var setMenu = function (open) {
      navMenu.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? msg("a11y.closeMenu", "Close menu") : msg("a11y.openMenu", "Open menu"));
      document.body.classList.toggle("nav-open", open);
    };

    navToggle.addEventListener("click", function () {
      setMenu(!navMenu.classList.contains("is-open"));
    });

    navMenu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });

    document.addEventListener("click", function (e) {
      if (!navMenu.classList.contains("is-open")) return;
      if (navMenu.contains(e.target) || navToggle.contains(e.target)) return;
      setMenu(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navMenu.classList.contains("is-open")) {
        setMenu(false);
        navToggle.focus();
      }
    });

    document.addEventListener("i18n:change", function () {
      setMenu(navMenu.classList.contains("is-open"));
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > navBreakpoint) setMenu(false);
    });
  }

  var form = document.getElementById("enquiryForm");
  if (!form) return;

  form.noValidate = true;

  var statusEl = document.getElementById("formStatus");
  var submitBtn = form.querySelector('button[type="submit"]');

  // Lazy-load reCAPTCHA only when the form is approached, to keep it off the
  // initial critical path (it is a large third-party script).
  var recaptchaRequested = false;
  function loadRecaptcha() {
    if (recaptchaRequested) return;
    recaptchaRequested = true;
    var s = document.createElement("script");
    s.src = "https://www.google.com/recaptcha/api.js";
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0] && entries[0].isIntersecting) { loadRecaptcha(); io.disconnect(); }
    }, { rootMargin: "500px" });
    io.observe(form);
  } else {
    loadRecaptcha();
  }
  form.addEventListener("focusin", loadRecaptcha, { once: true });

  var rules = [
    { id: "parentName", test: function (v) { return v.trim().length > 1; } },
    { id: "email",      test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); } },
    { id: "phone",      test: function (v) { return v.replace(/[^\d]/g, "").length >= 7; } },
    { id: "message",    test: function (v) { return v.trim().length > 3; } }
  ];

  function fieldEls(id) {
    return { input: document.getElementById(id), error: document.getElementById(id + "-error") };
  }

  function showError(id, show) {
    var els = fieldEls(id);
    if (!els.input) return;
    els.input.setAttribute("aria-invalid", show ? "true" : "false");
    if (els.error) {
      els.error.hidden = !show;
      if (show) els.input.setAttribute("aria-describedby", id + "-error");
      else els.input.removeAttribute("aria-describedby");
    }
  }

  rules.forEach(function (rule) {
    var els = fieldEls(rule.id);
    if (!els.input) return;
    els.input.addEventListener("input", function () {
      if (els.input.getAttribute("aria-invalid") === "true" && rule.test(els.input.value)) {
        showError(rule.id, false);
      }
    });
  });

  function setStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.remove("is-error", "is-ok");
    if (type) statusEl.classList.add(type);
  }

  function resetCaptcha() {
    if (typeof grecaptcha !== "undefined" && grecaptcha.reset) {
      try { grecaptcha.reset(); } catch (e) {}
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var firstInvalid = null;
    rules.forEach(function (rule) {
      var els = fieldEls(rule.id);
      var ok = els.input && rule.test(els.input.value);
      showError(rule.id, !ok);
      if (!ok && !firstInvalid) firstInvalid = els.input;
    });

    if (firstInvalid) {
      setStatus(msg("form.statusCheck", "Please check the highlighted fields and try again."), "is-error");
      firstInvalid.focus();
      return;
    }

    // reCAPTCHA: require a completed challenge before sending.
    var captchaErr = document.getElementById("captcha-error");
    if (typeof grecaptcha !== "undefined" && grecaptcha.getResponse) {
      if (!grecaptcha.getResponse()) {
        if (captchaErr) captchaErr.hidden = false;
        setStatus(msg("form.errCaptcha", "Please confirm you’re not a robot."), "is-error");
        return;
      }
      if (captchaErr) captchaErr.hidden = true;
    }

    // Submit to Formspree over AJAX so the parent stays on the page.
    if (submitBtn) submitBtn.disabled = true;
    setStatus(msg("form.statusSending", "Sending your enquiry…"), null);

    fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { "Accept": "application/json" }
    })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          resetCaptcha();
          setStatus(msg("form.statusSuccess", "Thanks! Your enquiry has been sent. We’ll be in touch soon."), "is-ok");
          return;
        }
        return res.json().then(function (data) {
          resetCaptcha();
          var detail = data && data.errors && data.errors.length
            ? data.errors.map(function (er) { return er.message; }).join(", ")
            : msg("form.statusError", "Sorry, something went wrong. Please call or email us instead.");
          setStatus(detail, "is-error");
        });
      })
      .catch(function () {
        setStatus(msg("form.statusError", "Sorry, something went wrong. Please call or email us instead."), "is-error");
      })
      .then(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
  });
})();

/* Facilities gallery carousel */
(function () {
  "use strict";

  var root = document.getElementById("galleryCarousel");
  if (!root) return;

  var track = document.getElementById("carouselTrack");
  var slides = Array.prototype.slice.call(track.children);
  var total = slides.length;
  if (!total) return;

  var prevBtn = root.querySelector(".carousel__arrow--prev");
  var nextBtn = root.querySelector(".carousel__arrow--next");
  var playBtn = root.querySelector(".carousel__playpause");
  var dotsWrap = root.querySelector(".carousel__dots");

  var index = 0;
  var timer = null;
  var paused = false;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var playing = !reduceMotion;
  var INTERVAL = 6000;

  function t(key, fallback) { return (window.I18N && window.I18N.t) ? window.I18N.t(key) : fallback; }

  var dots = [];
  for (var i = 0; i < total; i++) {
    var dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel__dot";
    dot.setAttribute("aria-label", (i + 1) + " / " + total);
    (function (n) { dot.addEventListener("click", function () { goTo(n, true); }); })(i);
    dotsWrap.appendChild(dot);
    dots.push(dot);
  }

  function render() {
    track.style.transform = "translateX(" + (-index * 100) + "%)";
    slides.forEach(function (s, i) { s.setAttribute("aria-hidden", i === index ? "false" : "true"); });
    dots.forEach(function (d, i) {
      if (i === index) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current");
    });
  }

  function updatePlayLabel() {
    if (!playBtn) return;
    playBtn.setAttribute("aria-label", playing ? t("a11y.pausePhotos", "Pause photo slideshow") : t("a11y.playPhotos", "Play photo slideshow"));
    var icon = playBtn.querySelector("i");
    if (icon) icon.className = playing ? "fa-solid fa-pause" : "fa-solid fa-play";
  }

  function sync() {
    if (timer) { clearInterval(timer); timer = null; }
    if (playing && !paused) {
      timer = setInterval(function () { index = (index + 1) % total; render(); }, INTERVAL);
      track.setAttribute("aria-live", "off");
    } else {
      track.setAttribute("aria-live", "polite");
    }
    updatePlayLabel();
  }

  function goTo(n, userAction) {
    index = (n + total) % total;
    render();
    if (userAction) { playing = false; sync(); }
  }

  if (prevBtn) prevBtn.addEventListener("click", function () { goTo(index - 1, true); });
  if (nextBtn) nextBtn.addEventListener("click", function () { goTo(index + 1, true); });
  if (playBtn) playBtn.addEventListener("click", function () { playing = !playing; sync(); });

  root.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { goTo(index - 1, true); e.preventDefault(); }
    else if (e.key === "ArrowRight") { goTo(index + 1, true); e.preventDefault(); }
  });

  root.addEventListener("mouseenter", function () { paused = true; sync(); });
  root.addEventListener("mouseleave", function () { paused = false; sync(); });
  root.addEventListener("focusin", function () { paused = true; sync(); });
  root.addEventListener("focusout", function () {
    if (!root.contains(document.activeElement)) { paused = false; sync(); }
  });

  var touchX = null;
  root.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  root.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1), true);
    touchX = null;
  });

  document.addEventListener("i18n:change", updatePlayLabel);
  document.addEventListener("visibilitychange", function () { paused = document.hidden; sync(); });

  render();
  sync();
})();
