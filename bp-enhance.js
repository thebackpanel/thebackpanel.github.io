/* ============================================================================
 * bp-enhance.js — BACKPANEL progressive enhancement layer
 * ----------------------------------------------------------------------------
 * Vanilla JS, zero dependencies. Loaded with `defer` (runs after HTML parse,
 * before DOMContentLoaded), so the site renders and works with zero JS by
 * default; this file only *enhances*.
 *
 * Privacy-first: no cookies, no localStorage of PII, no fingerprinting.
 * Analytics providers (Umami / Plausible) are only *forwarded to* if whoever
 * deploys the site has already injected their snippet — this file never loads
 * any third-party script itself.
 * ========================================================================== */
(function () {
  'use strict';

  /* -- 0. Debug helper (localhost only) ------------------------------------ */
  var HOST = (typeof location !== 'undefined' && location.hostname) || '';
  var IS_LOCALHOST =
    HOST === 'localhost' ||
    HOST === '127.0.0.1' ||
    HOST === '[::1]' ||
    HOST.slice(-'.localhost'.length) === '.localhost';

  function debug() {
    if (!IS_LOCALHOST) return;
    try {
      // eslint-disable-next-line no-console
      console.debug.apply(console, ['[bp]'].concat(Array.prototype.slice.call(arguments)));
    } catch (e) { /* ignore */ }
  }

  /* -- 1. Event queue + dispatcher ------------------------------------------
   * window._bpq  : durable queue; events are recorded here even when no
   *                provider snippet is present.
   * window.bpTrack(event, data): pushes to _bpq, then best-effort forwards to
   *                window.umami.track(event, data) and
   *                window.plausible(event, { props: data }) when available.
   */
  window._bpq = window._bpq || [];

  window.bpTrack = function (event, data) {
    var payload = { event: event, data: data || {}, ts: new Date().toISOString() };
    try {
      window._bpq.push(payload);
    } catch (e) { /* queue failure must never break the page */ }
    try {
      if (window.umami && typeof window.umami.track === 'function') {
        window.umami.track(event, data || {});
      }
    } catch (e) { debug('umami.track failed', e); }
    try {
      if (typeof window.plausible === 'function') {
        window.plausible(event, { props: data || {} });
      }
    } catch (e) { debug('plausible failed', e); }
    debug('track', payload);
  };

  function pageName() {
    try {
      return location.pathname || '/';
    } catch (e) {
      return '/';
    }
  }

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  /* -- 2. Declarative click tracking ----------------------------------------
   * Any element with [data-event] auto-tracks a click:
   *   <button data-event="cta_click" id="heroCta">Get wrapped</button>
   */
  function bindDataEvents() {
    document.addEventListener(
      'click',
      function (e) {
        var el = e.target && e.target.closest ? e.target.closest('[data-event]') : null;
        if (!el) return;
        var name = el.getAttribute('data-event');
        if (!name) return;
        var text = ((el.textContent || '').trim().replace(/\s+/g, ' ') || '').slice(0, 80);
        window.bpTrack(name, { id: el.id || null, text: text, page: pageName() });
      },
      false
    );
  }

  /* -- 3. Outbound link tracking + rel hardening ----------------------------
   * External http(s) links (host !== location.host) fire 'outbound_click'
   * and get rel="noopener" added when the token is missing.
   */
  function bindOutboundLinks() {
    var links = document.querySelectorAll('a[href^="http"]');
    Array.prototype.forEach.call(links, function (a) {
      var href = a.getAttribute('href');
      var isExternal = false;
      try {
        isExternal = new URL(href, document.baseURI).host !== location.host;
      } catch (e) {
        isExternal = false;
      }
      if (!isExternal) return;
      // Harden: ensure noopener is present, preserving existing rel tokens.
      try {
        var rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
        if (rel.indexOf('noopener') === -1) {
          rel.push('noopener');
          a.setAttribute('rel', rel.join(' '));
        }
      } catch (e) { /* never break rendering */ }
      a.addEventListener(
        'click',
        function () {
          window.bpTrack('outbound_click', { href: href, page: pageName() });
        },
        false
      );
    });
  }

  /* -- 4. Pricing views (once per tier) -------------------------------------
   * Elements with [data-tier] fire 'pricing_view' { tier } the first time
   * they intersect the viewport.
   */
  function bindPricingViews() {
    var tiers = document.querySelectorAll('[data-tier]');
    if (!tiers.length) return;
    if (!('IntersectionObserver' in window)) {
      debug('no IntersectionObserver; skipping pricing_view');
      return;
    }
    var seen = new Set();
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var tier = entry.target.getAttribute('data-tier');
          if (tier && !seen.has(entry.target)) {
            seen.add(entry.target);
            window.bpTrack('pricing_view', { tier: tier, page: pageName() });
          }
          io.unobserve(entry.target); // once per element
        });
      },
      { threshold: 0.4 }
    );
    Array.prototype.forEach.call(tiers, function (el) {
      io.observe(el);
    });
  }

  /* -- 5. Forms: lifecycle events + honeypot spam guard ----------------------
   * Tracked forms: #leadForm, #pitchForm, #stackForm (when present).
   *  - first 'input'  -> 'form_start' { form } (once per form)
   *  - 'submit'       -> 'form_submit' { form }
   * Honeypot guard runs as a document-level CAPTURE listener so it executes
   * before app.js submit handlers: if input[name=company_website] has a
   * value, the submitter is a spam bot -> preventDefault +
   * stopImmediatePropagation (app.js never fires).
   */
  var FORM_SELECTOR = '#leadForm,#pitchForm,#stackForm';

  // Capture-phase guard: registered immediately (not waiting for ready) so it
  // is guaranteed to run before any bubble-phase submit handler in app.js.
  document.addEventListener(
    'submit',
    function (e) {
      var form = e.target;
      if (!form || !form.matches || !form.matches(FORM_SELECTOR)) return;
      var honeypot = null;
      try {
        honeypot = form.querySelector('input[name="company_website"]');
      } catch (err) { /* ignore */ }
      if (honeypot && honeypot.value) {
        e.preventDefault();
        e.stopImmediatePropagation();
        debug('honeypot blocked spam submit on', form.id || form);
        window.bpTrack('form_spam_blocked', { form: form.id || null, page: pageName() });
      }
    },
    true // capture: must win over app.js bubble listeners
  );

  function bindForms() {
    var forms = document.querySelectorAll(FORM_SELECTOR);
    Array.prototype.forEach.call(forms, function (form) {
      var formId = form.id || 'unknown';
      form.addEventListener(
        'input',
        function () {
          window.bpTrack('form_start', { form: formId, page: pageName() });
        },
        { once: true }
      );
      form.addEventListener('submit', function () {
        // NOTE: if the honeypot guard above blocked this submit, this bubble
        // listener never runs (stopImmediatePropagation). Good.
        window.bpTrack('form_submit', { form: formId, page: pageName() });
      });
    });
  }

  /* -- 6. pitch_url live validation ------------------------------------------
   * Uses the URL constructor + http(s) protocol check and reports via
   * setCustomValidity, so native form validation blocks bad submits before
   * any submit handler (app.js included) runs.
   */
  function bindPitchUrlValidation() {
    var input = document.querySelector('input[name="pitch_url"]');
    if (!input) return;
    input.addEventListener('input', function () {
      var value = (input.value || '').trim();
      if (!value) {
        input.setCustomValidity(''); // empty: leave to `required` if set
        return;
      }
      var ok = false;
      try {
        var url = new URL(value);
        ok = url.protocol === 'http:' || url.protocol === 'https:';
      } catch (e) {
        ok = false;
      }
      input.setCustomValidity(ok ? '' : 'Please enter a valid http(s) URL, e.g. https://example.com/pitch');
    });
  }

  /* -- 7. Reveal on scroll ----------------------------------------------------
   * Adds .reveal to 'article.card, .proof-item, .trust'; an
   * IntersectionObserver adds .in on first intersection (CSS animates the
   * transition). Skipped entirely under prefers-reduced-motion.
   */
  function bindReveal() {
    var reduceMotion = false;
    try {
      reduceMotion =
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) { /* ignore */ }
    if (reduceMotion) {
      debug('reduced motion: reveal disabled');
      return; // content stays fully visible; no classes, no observer
    }
    var els = document.querySelectorAll('article.card, .proof-item, .trust');
    if (!els.length) return;
    Array.prototype.forEach.call(els, function (el) {
      el.classList.add('reveal');
    });
    if (!('IntersectionObserver' in window)) {
      // Fallback: no observer -> show everything immediately.
      Array.prototype.forEach.call(els, function (el) {
        el.classList.add('in');
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );
    Array.prototype.forEach.call(els, function (el) {
      io.observe(el);
    });
  }

  /* -- 8. Service worker registration -----------------------------------------
   * On window load, register 'sw.js' via a RELATIVE path so it works both at
   * the domain root and under a subpath (e.g. username.github.io/repo/).
   * Only on https: or localhost (SW requirement). Errors are silent.
   */
  function registerServiceWorker() {
    window.addEventListener('load', function () {
      try {
        var secure = location.protocol === 'https:' || IS_LOCALHOST;
        if (!('serviceWorker' in navigator) || !secure) return;
        navigator.serviceWorker.register('sw.js').catch(function () {
          /* silent: offline support is optional enhancement */
        });
      } catch (e) { /* silent */ }
    });
  }

  /* -- Boot ------------------------------------------------------------------ */
  onReady(function () {
    bindDataEvents();
    bindOutboundLinks();
    bindPricingViews();
    bindForms();
    bindPitchUrlValidation();
    bindReveal();
  });
  registerServiceWorker();
})();

/* ============================================================================
 * CTA VARIANT TEST (Fix 9 — measurement only, no copy changes outside variant)
 * ----------------------------------------------------------------------------
 * How to run:
 *   - Default (control): load page with no param -> `wrapped` variant, no text change.
 *   - Challenger:        load page with `?cta=quote` -> hero + floating CTAs read
 *                        "Get a Quote" (hero keeps its trailing "→" if present).
 *   - Any other `cta` value falls back to `wrapped` (default, no text change).
 * What fires (via window.bpTrack when present, else no-op):
 *   - `cta_variant_view` { variant } — once per pageview, on load.
 *   - `cta_click` { variant, event } — on click of a[data-event="cta_hero"] or
 *     a[data-event="cta_floating"]; `event` echoes the element's data-event.
 *     Existing delegated [data-event] handler is untouched (this uses a
 *     separate capture listener, no preventDefault/stopPropagation).
 * Where data lands:
 *   - Umami custom event (umami.track) and Plausible custom event
 *     (plausible(event, { props })) when those snippets are configured;
 *     otherwise (or additionally) appended to window._bpq queue for inspection.
 * Notes: query param only — no cookies, no storage. prefers-reduced-motion:
 *   N/A (no motion in this section). Exposes window.__bpCtaVariant and
 *   document.documentElement.dataset.ctaVariant for debugging/reuse.
 * ========================================================================== */
(function () {
  'use strict';

  function safeTrack(event, data) {
    try {
      if (typeof window.bpTrack === 'function') window.bpTrack(event, data);
    } catch (e) { /* never break the page */ }
  }

  function getVariant() {
    try {
      var v = new URLSearchParams(location.search).get('cta');
      if (v === 'quote') return 'quote';
    } catch (e) { /* ignore; fall through to default */ }
    return 'wrapped';
  }

  var variant = getVariant();

  try {
    window.__bpCtaVariant = variant;
  } catch (e) { /* ignore */ }
  try {
    document.documentElement.dataset.ctaVariant = variant;
  } catch (e) { /* ignore */ }

  function applyQuoteCopy() {
    try {
      var hero = document.querySelector('a[data-event="cta_hero"]');
      if (hero) {
        var orig = hero.textContent || '';
        var hasArrow = orig.indexOf('\u2192') !== -1;
        hero.textContent = hasArrow ? 'Get a Quote \u2192' : 'Get a Quote';
      }
      var floating = document.querySelector('a[data-event="cta_floating"]');
      if (floating) floating.textContent = 'Get a Quote';
    } catch (e) { /* never break rendering */ }
  }

  function boot() {
    if (variant === 'quote') applyQuoteCopy();
    safeTrack('cta_variant_view', { variant: variant });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Separate capture listener: augments clicks with { variant }, leaves the
  // existing bubble-phase [data-event] handler in bp-enhance.js untouched.
  document.addEventListener(
    'click',
    function (e) {
      var el =
        e.target && e.target.closest
          ? e.target.closest('a[data-event="cta_hero"],a[data-event="cta_floating"]')
          : null;
      if (!el) return;
      safeTrack('cta_click', {
        variant: variant,
        event: el.getAttribute('data-event'),
      });
    },
    true
  );
})();
