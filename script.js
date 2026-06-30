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
