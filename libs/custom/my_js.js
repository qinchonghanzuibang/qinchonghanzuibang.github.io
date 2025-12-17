$(document).ready(function() {

  // Variables
  var $codeSnippets = $('.code-example-body'),
      $nav = $('.navbar'),
      $body = $('body'),
      $window = $(window),
      $popoverLink = $('[data-popover]'),
      navOffsetTop = $nav.offset().top,
      $document = $(document),
      entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
      }

  function init() {
    $window.on('scroll', onScroll)
    $window.on('resize', resize)
    $popoverLink.on('click', openPopover)
    $document.on('click', closePopover)
    // Smooth-scroll for:
    // - "#section"
    // - "/index.html#section" (same-page hash links used by the navbar)
    $('a[href*="#"]').on('click', smoothScroll)
    buildSnippets();
    initLazy();
  }

  function smoothScroll(e) {
    // Don't hijack modified clicks (new tab/window, etc.)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (e.button != null && e.button !== 0)) return;
    var href = this.getAttribute ? this.getAttribute('href') : null;
    if (!href || href.indexOf('#') === -1) return;

    // Only intercept if the link points to the current page (same origin + same path).
    var url = null;
    try { url = new URL(href, window.location.href); } catch (_e) { url = null; }
    if (!url || url.origin !== window.location.origin) return;

    function normPath(p) {
      if (!p) return '/';
      // treat "/index.html" and "/" as equivalent
      p = p.replace(/\/index\.html$/, '/');
      if (p.length > 1 && p.endsWith('/')) return p;
      return p;
    }

    if (normPath(url.pathname) !== normPath(window.location.pathname)) return;

    var target = url.hash || '';
    if (!target) return;

    e.preventDefault();
    $(document).off("scroll");
    var $target = $(target);
    // Smooth scroll for all in-page anchors (Bio/Publications/Vita/etc.)
    var reduceMotion = false;
    try {
      reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (_e) {}

    var duration = reduceMotion ? 0 : 420;
    var top = 0;
    if (target !== '#top') {
      if (!$target || !$target.length) {
        // If anchor doesn't exist, fall back to default hash behavior.
        window.location.hash = target;
        $(document).on("scroll", onScroll);
        return;
      }
      top = $target.offset().top - 40;
    }
    $('html, body').stop().animate({
        'scrollTop': top
    }, duration, 'swing', function () {
        window.location.hash = target;
        $(document).on("scroll", onScroll);
    });
  }

  function openPopover(e) {
    e.preventDefault()
    closePopover();
    var popover = $($(this).data('popover'));
    popover.toggleClass('open')
    e.stopImmediatePropagation();
  }

  function closePopover(e) {
    if($('.popover.open').length > 0) {
      $('.popover').removeClass('open')
    }
  }

  $("#button").click(function() {
    $('html, body').animate({
        scrollTop: $("#elementtoScrollToID").offset().top
    }, 2000);
});

  function resize() {
    $body.removeClass('has-docked-nav')
    navOffsetTop = $nav.offset().top
    onScroll()
  }

  function onScroll() {
    if(navOffsetTop < $window.scrollTop() && !$body.hasClass('has-docked-nav')) {
      $body.addClass('has-docked-nav')
    }
    if(navOffsetTop > $window.scrollTop() && $body.hasClass('has-docked-nav')) {
      $body.removeClass('has-docked-nav')
    }
  }

  function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }

  function buildSnippets() {
    $codeSnippets.each(function() {
      var newContent = escapeHtml($(this).html())
      $(this).html(newContent)
    })
  }

  // Lightweight lazy-loading initializer (works with jquery.lazy-lite.js)
  function initLazy() {
    var hasLazy = $.fn && $.fn.Lazy;
    if (hasLazy) {
      // Default: only load when near the viewport.
      $('img.lazy, div.lazy:not(.always-load)').Lazy({ visibleOnly: true });
      // Force-load: useful for hero covers or elements that should load immediately.
      $('img.lazy.always-load, div.lazy.always-load').Lazy({ visibleOnly: false });
    }

    // Hard fallback: after a short delay, ensure above-the-fold lazy images actually start loading.
    // This prevents "stuck on placeholder" if IntersectionObserver/plugins don't fire in some environments.
    setTimeout(function () {
      var vh = window.innerHeight || document.documentElement.clientHeight || 0;
      $('img.lazy[data-src]').each(function () {
        try {
          var rect = this.getBoundingClientRect ? this.getBoundingClientRect() : null;
          if (rect && rect.top > vh + 300) return; // not near viewport
          var ds = $(this).attr('data-src');
          if (!ds) return;
          var cur = $(this).attr('src') || '';
          if (/empty_300x200\.png$/.test(cur)) {
            $(this).attr('src', ds);
          }
        } catch (_e) {}
      });
    }, 1000);
  }

  init();

});