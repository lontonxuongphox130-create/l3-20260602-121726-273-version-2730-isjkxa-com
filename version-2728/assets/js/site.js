(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
      }
    });
  });

  const filterScope = document.querySelector('[data-filter-scope]');
  if (filterScope) {
    const textInput = filterScope.querySelector('[data-filter-text]');
    const yearSelect = filterScope.querySelector('[data-filter-year]');
    const regionSelect = filterScope.querySelector('[data-filter-region]');
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    let categoryValue = '';

    if (textInput && initialQuery) {
      textInput.value = initialQuery;
    }

    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function applyFilter() {
      const text = normalize(textInput ? textInput.value : '');
      const year = normalize(yearSelect ? yearSelect.value : '');
      const region = normalize(regionSelect ? regionSelect.value : '');
      const category = normalize(categoryValue);

      cards.forEach(function (card) {
        const content = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.category,
          card.dataset.tags,
          card.textContent
        ].join(' '));
        const matchText = !text || content.indexOf(text) !== -1;
        const matchYear = !year || normalize(card.dataset.year) === year;
        const matchRegion = !region || normalize(card.dataset.region) === region;
        const matchCategory = !category || normalize(card.dataset.category) === category;
        card.classList.toggle('hidden', !(matchText && matchYear && matchRegion && matchCategory));
      });
    }

    if (textInput) {
      textInput.addEventListener('input', applyFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }
    if (regionSelect) {
      regionSelect.addEventListener('change', applyFilter);
    }

    filterScope.querySelectorAll('[data-filter-category]').forEach(function (button) {
      button.addEventListener('click', function () {
        categoryValue = button.dataset.filterCategory || '';
        filterScope.querySelectorAll('[data-filter-category]').forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilter();
      });
    });

    const clearButton = filterScope.querySelector('[data-clear-search]');
    if (clearButton) {
      clearButton.addEventListener('click', function () {
        if (textInput) {
          textInput.value = '';
        }
        categoryValue = '';
        filterScope.querySelectorAll('[data-filter-category]').forEach(function (item, index) {
          item.classList.toggle('active', index === 0);
        });
        applyFilter();
      });
    }

    const firstCategoryButton = filterScope.querySelector('[data-filter-category]');
    if (firstCategoryButton) {
      firstCategoryButton.classList.add('active');
    }
    applyFilter();
  }

  const player = document.querySelector('[data-player]');
  if (player) {
    const streamUrl = player.getAttribute('data-stream');
    const overlay = document.querySelector('[data-player-overlay]');
    const playButton = document.querySelector('[data-play-button]');
    let loaded = false;
    let hls = null;

    function prepareVideo() {
      if (loaded || !streamUrl) {
        return;
      }
      if (player.canPlayType('application/vnd.apple.mpegurl')) {
        player.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(player);
      } else {
        player.src = streamUrl;
      }
      loaded = true;
    }

    function startVideo() {
      prepareVideo();
      player.controls = true;
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      const action = player.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startVideo);
    }
    if (playButton) {
      playButton.addEventListener('click', startVideo);
    }
    player.addEventListener('click', function () {
      if (!loaded) {
        startVideo();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }
})();
