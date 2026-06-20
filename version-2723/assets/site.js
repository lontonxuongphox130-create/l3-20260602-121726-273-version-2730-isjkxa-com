(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var index = 0;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }

      index = (next + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
      });
    });

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  var panels = document.querySelectorAll('[data-filter-panel]');

  panels.forEach(function (panel) {
    var search = panel.querySelector('.filter-search');
    var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter]'));
    var list = panel.parentElement.querySelector('[data-card-list]');
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];
    var activeFilter = 'all';
    var activeValue = 'all';

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function cardText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre')
      ].join(' '));
    }

    function applyFilter() {
      var term = normalize(search ? search.value : '');

      cards.forEach(function (card) {
        var text = cardText(card);
        var matchesText = !term || text.indexOf(term) !== -1;
        var matchesFilter = true;

        if (activeFilter !== 'all') {
          var target = normalize(card.getAttribute('data-' + activeFilter));
          matchesFilter = target.indexOf(normalize(activeValue)) !== -1;
        }

        card.classList.toggle('hidden-card', !(matchesText && matchesFilter));
      });
    }

    if (search) {
      search.addEventListener('input', applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('active');
        });

        button.classList.add('active');
        activeFilter = button.getAttribute('data-filter') || 'all';
        activeValue = button.getAttribute('data-value') || 'all';
        applyFilter();
      });
    });
  });
})();
