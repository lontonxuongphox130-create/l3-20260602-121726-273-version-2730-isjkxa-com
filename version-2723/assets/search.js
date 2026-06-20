(function () {
  var form = document.querySelector('.big-search');
  var input = form ? form.querySelector('input[name="q"]') : null;
  var results = document.getElementById('search-results');
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function card(movie) {
    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + movie.url + '">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-glow"></span>',
      '    <span class="card-play">播放</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.summary) + '</p>',
      '    <div class="tag-row"><span>' + escapeHtml(movie.genre || '精选影片') + '</span></div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function render(term) {
    if (!results || !window.SEARCH_INDEX) {
      return;
    }

    var normalized = normalize(term);
    var matches = window.SEARCH_INDEX.filter(function (movie) {
      var text = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.summary
      ].join(' '));

      return !normalized || text.indexOf(normalized) !== -1;
    }).slice(0, 240);

    results.innerHTML = matches.map(card).join('');
  }

  if (input) {
    input.value = query;
    input.addEventListener('input', function () {
      render(input.value);
    });
  }

  render(query);
})();
