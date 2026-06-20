document.addEventListener('DOMContentLoaded', function () {
  setupMobileMenu();
  setupImageFallbacks();
  setupHeroCarousel();
  setupFilters();
  setupPlayers();
});

function setupMobileMenu() {
  var button = document.querySelector('[data-menu-button]');
  var nav = document.querySelector('[data-site-nav]');

  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', function () {
    nav.classList.toggle('open');
  });
}

function setupImageFallbacks() {
  var images = document.querySelectorAll('img.movie-cover, .hero-poster img, .detail-poster img, .rank-thumb img');

  images.forEach(function (image) {
    image.addEventListener('error', function () {
      var parent = image.parentElement;

      if (parent) {
        parent.classList.add('cover-fallback');
      }

      image.style.display = 'none';
    });
  });
}

function setupHeroCarousel() {
  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));

  if (slides.length <= 1) {
    return;
  }

  var current = 0;

  function show(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      show(dotIndex);
    });
  });

  window.setInterval(function () {
    show(current + 1);
  }, 5600);
}

function setupFilters() {
  var panels = document.querySelectorAll('[data-filter-panel]');

  panels.forEach(function (panel) {
    var scope = document.querySelector(panel.getAttribute('data-filter-panel')) || document;
    var searchInput = panel.querySelector('[data-filter-search]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var note = panel.querySelector('[data-filter-note]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function run() {
      var keyword = normalize(searchInput && searchInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var region = normalize(regionSelect && regionSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre')
        ].join(' '));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || String(card.getAttribute('data-year')) === year;
        var matchType = !type || normalize(card.getAttribute('data-type')).indexOf(type) !== -1;
        var matchRegion = !region || normalize(card.getAttribute('data-region')).indexOf(region) !== -1;
        var ok = matchKeyword && matchYear && matchType && matchRegion;

        card.classList.toggle('hidden-by-filter', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (note) {
        note.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    [searchInput, yearSelect, typeSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', run);
        control.addEventListener('change', run);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && searchInput) {
      searchInput.value = query;
    }

    run();
  });
}

function setupPlayers() {
  var videos = document.querySelectorAll('video[data-hls-src]');

  videos.forEach(function (video) {
    var hlsSrc = video.getAttribute('data-hls-src');
    var fallbackSrc = video.getAttribute('data-mp4-src');

    if (!hlsSrc) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsSrc;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });

      hls.loadSource(hlsSrc);
      hls.attachMedia(video);
      return;
    }

    if (fallbackSrc) {
      video.src = fallbackSrc;
    }
  });
}
