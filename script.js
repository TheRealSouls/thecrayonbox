/* ==========================================================================
   The Crayon Box — site behaviour
   - Mobile navigation toggle
   - Footer year
   - Accessible enquiry-form validation + honest submission handling
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Current year in footer ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------- Mobile navigation ---------- */
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

    // Close the menu after choosing a link (mobile)
    navMenu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navMenu.classList.contains("is-open")) {
        setMenu(false);
        navToggle.focus();
      }
    });

    // Reset state when resizing up to desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) setMenu(false);
    });
  }

  /* ---------- Enquiry form ---------- */
  var form = document.getElementById("enquiryForm");
  if (!form) return;

  var statusEl = document.getElementById("formStatus");

  // Recipient for the mailto fallback (the genuine action this form performs).
  var RECIPIENT = "thecrayonbox100@gmail.com";

  // Fields that must be completed, with their validation rules.
  var rules = [
    { id: "parentName", test: function (v) { return v.trim().length > 1; } },
    { id: "email",      test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); } },
    { id: "phone",      test: function (v) { return v.replace(/[^\d]/g, "").length >= 7; } },
    { id: "message",    test: function (v) { return v.trim().length > 3; } }
  ];

  function fieldEls(id) {
    return {
      input: document.getElementById(id),
      error: document.getElementById(id + "-error")
    };
  }

  function showError(id, show) {
    var els = fieldEls(id);
    if (!els.input) return;
    els.input.setAttribute("aria-invalid", show ? "true" : "false");
    if (els.error) {
      els.error.hidden = !show;
      if (show) {
        els.input.setAttribute("aria-describedby", id + "-error");
      } else {
        els.input.removeAttribute("aria-describedby");
      }
    }
  }

  // Clear an error as soon as the user fixes the field.
  rules.forEach(function (rule) {
    var els = fieldEls(rule.id);
    if (els.input) {
      els.input.addEventListener("input", function () {
        if (els.input.getAttribute("aria-invalid") === "true" && rule.test(els.input.value)) {
          showError(rule.id, false);
        }
      });
    }
  });

  function setStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.remove("is-error", "is-ok");
    if (type) statusEl.classList.add(type);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validate
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

    /* ----------------------------------------------------------------------
       SUBMISSION
       ----------------------------------------------------------------------
       There is currently NO backend connected to this form. To avoid faking a
       send, we hand the enquiry to the parent's own email app via a mailto:
       link, pre-filled with their answers. The status message below describes
       exactly what happens — it does NOT claim the message was received by
       The Crayon Box.

       >>> TO CONNECT A REAL BACKEND <<<
       Replace the mailto block below with a fetch() POST to your handler, e.g.
       a form service (Formspree / Netlify Forms / Web3Forms) or your own API:

         fetch("https://formspree.io/f/XXXXXXXX", {
           method: "POST",
           headers: { "Accept": "application/json" },
           body: new FormData(form)
         })
         .then(function (r) {
           if (r.ok) { form.reset(); setStatus("Thanks! Your enquiry has been sent.", "is-ok"); }
           else { setStatus("Sorry, something went wrong. Please call or email us.", "is-error"); }
         })
         .catch(function () { setStatus("Network error. Please call or email us.", "is-error"); });

       Only show a success message once the request actually succeeds.
       ---------------------------------------------------------------------- */

    var get = function (id) {
      var el = document.getElementById(id);
      return el ? el.value.trim() : "";
    };

    var subject = "Childcare enquiry — " + (get("parentName") || "Website");
    var bodyLines = [
      "Parent / guardian: " + get("parentName"),
      "Email: " + get("email"),
      "Phone: " + get("phone"),
      "Child's age: " + (get("childAge") || "—"),
      "Service interested in: " + (get("service") || "—"),
      "",
      "Message:",
      get("message")
    ];

    var mailto = "mailto:" + RECIPIENT +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(bodyLines.join("\n"));

    // Open the user's email client with everything pre-filled.
    window.location.href = mailto;

    setStatus(
      "Your email app should now open with your enquiry ready to send. " +
      "If it doesn’t, please email us directly at " + RECIPIENT + ".",
      "is-ok"
    );
  });
})();
