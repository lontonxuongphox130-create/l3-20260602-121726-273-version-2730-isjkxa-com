(function () {
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const menuPanel = document.querySelector('[data-nav-panel]');

  function updateHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuButton && menuPanel) {
    menuButton.addEventListener('click', function () {
      menuPanel.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;
    let timer = null;

    function setSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    }

    function restartHero() {
      if (timer) {
        window.clearInterval(timer);
      }
      startHero();
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        setSlide(dotIndex);
        restartHero();
      });
    });

    startHero();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters(scope) {
    const input = scope.querySelector('[data-filter-input]');
    const category = scope.querySelector('[data-filter-category]');
    const year = scope.querySelector('[data-filter-year]');
    const grid = scope.parentElement.querySelector('[data-filter-grid]') || document.querySelector('[data-filter-grid]');
    const empty = scope.parentElement.querySelector('[data-empty-state]');
    const cards = grid ? Array.from(grid.querySelectorAll('[data-card]')) : [];
    const query = normalize(input ? input.value : '');
    const categoryValue = normalize(category ? category.value : '');
    const yearValue = normalize(year ? year.value : '');
    let visible = 0;

    cards.forEach(function (card) {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.category,
        card.dataset.region,
        card.dataset.year,
        card.dataset.type,
        card.dataset.tags
      ].join(' '));
      const matchesQuery = !query || haystack.includes(query);
      const matchesCategory = !categoryValue || normalize(card.dataset.category) === categoryValue;
      const matchesYear = !yearValue || normalize(card.dataset.year) === yearValue;
      const show = matchesQuery && matchesCategory && matchesYear;
      card.hidden = !show;
      if (show) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    const controls = Array.from(scope.querySelectorAll('input, select'));
    controls.forEach(function (control) {
      control.addEventListener('input', function () {
        applyFilters(scope);
      });
      control.addEventListener('change', function () {
        applyFilters(scope);
      });
    });

    const searchPage = document.querySelector('[data-search-page]');
    if (searchPage && scope.closest('[data-search-page]')) {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      const input = scope.querySelector('[data-filter-input]');
      if (q && input) {
        input.value = q;
      }
    }

    applyFilters(scope);
  });
})();
