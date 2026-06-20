(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var opened = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var slideIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    slideIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, itemIndex) {
      slide.classList.toggle('active', itemIndex === slideIndex);
    });
    dots.forEach(function (dot, itemIndex) {
      dot.classList.toggle('active', itemIndex === slideIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(slideIndex + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters(scope) {
    var input = scope.querySelector('[data-filter-input]');
    var yearSelect = scope.querySelector('[data-year-select]');
    var categorySelect = scope.querySelector('[data-category-select]');
    var list = document.querySelector('[data-filter-list]');
    var emptyTip = document.querySelector('[data-empty-tip]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function run() {
      var query = normalize(input && input.value);
      var year = yearSelect ? yearSelect.value : '';
      var category = categorySelect ? categorySelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardYear = card.getAttribute('data-year') || '';
        var cardCategory = card.getAttribute('data-category') || '';
        var match = true;

        if (query && text.indexOf(query) === -1) {
          match = false;
        }

        if (year && cardYear !== year) {
          match = false;
        }

        if (category && cardCategory !== category) {
          match = false;
        }

        card.classList.toggle('is-hidden', !match);

        if (match) {
          visible += 1;
        }
      });

      if (emptyTip) {
        emptyTip.style.display = visible ? 'none' : 'block';
      }
    }

    [input, yearSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', run);
        control.addEventListener('change', run);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && input) {
      input.value = q;
    }

    run();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(applyFilters);

  Array.prototype.slice.call(document.querySelectorAll('.player-wrap')).forEach(function (wrap) {
    var video = wrap.querySelector('video');
    var button = wrap.querySelector('.player-overlay');
    var url = wrap.getAttribute('data-video');
    var hlsInstance = null;

    function attach() {
      if (!video || !url || video.getAttribute('data-ready') === '1') {
        return;
      }

      video.setAttribute('data-ready', '1');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function play() {
      attach();
      wrap.classList.add('playing');
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          wrap.classList.remove('playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        wrap.classList.add('playing');
      });
      video.addEventListener('pause', function () {
        wrap.classList.remove('playing');
      });
      video.addEventListener('ended', function () {
        wrap.classList.remove('playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
