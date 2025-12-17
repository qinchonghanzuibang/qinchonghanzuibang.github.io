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
    $('a[href^="#"]').on('click', smoothScroll)
    buildSnippets();
    initLazy();
  }

  function smoothScroll(e) {
    e.preventDefault();
    $(document).off("scroll");
    var target = this.hash,
        menu = target;
    $target = $(target);
    // Smooth scroll for "Back to top"
    var duration = (target === '#top') ? 420 : 0;
    var top = 0;
    if (target !== '#top' && $target && $target.length) {
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