/**
 * jquery.lazy-lite.js
 * A tiny jQuery "Lazy" plugin (API-compatible with the subset we need):
 * - $('img.lazy').Lazy({ visibleOnly: true|false })
 * - $('div.lazy').Lazy({ visibleOnly: true|false })
 *
 * Conventions:
 * - <img class="lazy" data-src="REAL_URL" src="PLACEHOLDER">
 * - <div class="lazy" data-src="REAL_URL"></div>  -> background-image
 *
 * Notes:
 * - Uses IntersectionObserver when available; falls back to scroll/resize.
 * - Designed for static sites; safe to call multiple times.
 */
(function (factory) {
  if (typeof window === 'undefined') return;
  if (typeof window.jQuery === 'undefined') return;
  factory(window.jQuery, window);
})(function ($, window) {
  'use strict';

  var DEFAULTS = {
    visibleOnly: true,
    rootMargin: '200px 0px',
  };

  function isAlreadyLoaded(el) {
    var $el = $(el);
    if ($el.data('lazyLoaded')) return true;

    if (el.tagName && el.tagName.toLowerCase() === 'img') {
      var ds = $el.attr('data-src');
      if (!ds) return true; // nothing to do
      return $el.attr('src') === ds;
    }

    // div lazy background
    var dsd = $el.attr('data-src');
    if (!dsd) return true;
    return !!$el.data('lazyBgSet');
  }

  function markLoaded(el) {
    var $el = $(el);
    $el.data('lazyLoaded', true);
  }

  function loadOne(el) {
    if (!el || isAlreadyLoaded(el)) return;

    var $el = $(el);
    var tag = (el.tagName || '').toLowerCase();
    var src = $el.attr('data-src');
    if (!src) {
      markLoaded(el);
      return;
    }

    if (tag === 'img') {
      // Keep placeholder until real image is decoded.
      $el.one('load', function () {
        // If CSS uses background placeholders, removing background-image avoids "double" visuals.
        this.style.backgroundImage = 'none';
        markLoaded(this);
      });
      $el.one('error', function () {
        // Don't loop forever; mark as loaded to avoid repeated retries.
        markLoaded(this);
      });
      $el.attr('src', src);
      return;
    }

    // div background lazy
    $el.css({
      backgroundImage: "url('" + src + "')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    });
    $el.data('lazyBgSet', true);
    markLoaded(el);
  }

  function inViewport(el) {
    // Basic fallback check for older browsers.
    var rect = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
    if (!rect) return true;
    var vh = window.innerHeight || document.documentElement.clientHeight || 0;
    var vw = window.innerWidth || document.documentElement.clientWidth || 0;
    // treat anything near viewport as visible (roughly matches rootMargin)
    return (
      rect.bottom >= -200 &&
      rect.right >= 0 &&
      rect.top <= vh + 200 &&
      rect.left <= vw
    );
  }

  $.fn.Lazy = function (options) {
    var opts = $.extend({}, DEFAULTS, options || {});
    var $items = this;

    // If we don't require visibility, load immediately.
    if (!opts.visibleOnly) {
      $items.each(function () { loadOne(this); });
      return $items;
    }

    // IntersectionObserver path (modern browsers)
    if (typeof window.IntersectionObserver !== 'undefined') {
      var io = new window.IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          loadOne(entry.target);
          io.unobserve(entry.target);
        });
      }, { root: null, rootMargin: opts.rootMargin, threshold: 0.01 });

      $items.each(function () {
        if (isAlreadyLoaded(this)) return;
        io.observe(this);
      });

      return $items;
    }

    // Fallback: load on scroll/resize
    function tick() {
      $items.each(function () {
        if (isAlreadyLoaded(this)) return;
        if (inViewport(this)) loadOne(this);
      });
    }

    // Throttle-ish: schedule once per frame
    var scheduled = false;
    function schedule() {
      if (scheduled) return;
      scheduled = true;
      (window.requestAnimationFrame || window.setTimeout)(function () {
        scheduled = false;
        tick();
      }, 16);
    }

    $(window).on('scroll.lazyLite resize.lazyLite orientationchange.lazyLite', schedule);
    // initial
    tick();

    return $items;
  };
});


