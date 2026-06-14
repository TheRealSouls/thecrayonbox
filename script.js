(function () {
  "use strict";

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    var setMenu = function (open) {
      navMenu.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    navToggle.addEventListener("click", function () {
      setMenu(!navMenu.classList.contains("is-open"));
    });

    navMenu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navMenu.classList.contains("is-open")) {
        setMenu(false);
        navToggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) setMenu(false);
    });
  }

  var form = document.getElementById("enquiryForm");
  if (!form) return;

  var statusEl = document.getElementById("formStatus");
  var RECIPIENT = "thecrayonbox100@gmail.com";

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

  function value(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
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
      setStatus("Please check the highlighted fields and try again.", "is-error");
      firstInvalid.focus();
      return;
    }

    // No backend is connected. Hand the enquiry to the parent's email client so
    // nothing is faked. To send server-side instead, replace this block with a
    // fetch() POST to a form service or API and only report success when it resolves.
    var subject = "Childcare enquiry — " + (value("parentName") || "Website");
    var body = [
      "Parent / guardian: " + value("parentName"),
      "Email: " + value("email"),
      "Phone: " + value("phone"),
      "Child's age: " + (value("childAge") || "—"),
      "Service interested in: " + (value("service") || "—"),
      "",
      "Message:",
      value("message")
    ].join("\n");

    window.location.href = "mailto:" + RECIPIENT +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);

    setStatus(
      "Your email app should now open with your enquiry ready to send. " +
      "If it doesn’t, please email us directly at " + RECIPIENT + ".",
      "is-ok"
    );
  });
})();
