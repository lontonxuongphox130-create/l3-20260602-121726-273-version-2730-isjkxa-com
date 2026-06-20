(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenus() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        if (!value) {
          return;
        }
        var target = form.getAttribute("data-target") || form.getAttribute("action") || "./search.html";
        window.location.href = target + "?q=" + encodeURIComponent(value);
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  function setupLocalFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-local-filter]");
      var select = scope.querySelector("[data-sort-select]");
      var list = scope.querySelector("[data-filter-list]");
      if (!list) {
        return;
      }
      var items = Array.prototype.slice.call(list.children);
      function applyFilter() {
        var term = input ? input.value.trim().toLowerCase() : "";
        items.forEach(function (item) {
          var haystack = [
            item.getAttribute("data-title") || "",
            item.getAttribute("data-tags") || "",
            item.getAttribute("data-year") || ""
          ].join(" ").toLowerCase();
          item.setAttribute("data-filter-hidden", term && haystack.indexOf(term) === -1 ? "true" : "false");
        });
      }
      function applySort() {
        if (!select) {
          return;
        }
        var value = select.value;
        var sorted = items.slice();
        if (value === "rating") {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute("data-rating") || 0) - Number(a.getAttribute("data-rating") || 0);
          });
        }
        if (value === "year") {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
          });
        }
        if (value === "default") {
          sorted = items.slice();
        }
        sorted.forEach(function (item) {
          list.appendChild(item);
        });
      }
      if (input) {
        input.addEventListener("input", applyFilter);
      }
      if (select) {
        select.addEventListener("change", applySort);
      }
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a class=\"movie-thumb\" href=\"" + movie.url + "\">",
      "<img src=\"" + movie.image + "\" alt=\"" + escapeHtml(movie.title) + "\">",
      "<span class=\"movie-badge\">" + escapeHtml(movie.region) + "</span>",
      "<span class=\"movie-duration\">" + escapeHtml(movie.duration) + "</span>",
      "</a>",
      "<div class=\"movie-card-body\">",
      "<h3><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "<div class=\"movie-meta\"><span>★ " + movie.rating + "</span><span>" + movie.views + " 热度</span></div>",
      "<p class=\"movie-line\">" + escapeHtml(movie.oneLine) + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function setupSearchPage() {
    var page = document.querySelector("[data-search-page]");
    var results = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    var note = document.querySelector("[data-search-note]");
    if (!page || !results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = page.querySelector("input[name='q']");
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var lower = query.toLowerCase();
    var matches = window.SEARCH_MOVIES.filter(function (movie) {
      return [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" ")].join(" ").toLowerCase().indexOf(lower) !== -1;
    }).slice(0, 120);
    if (title) {
      title.textContent = "搜索结果";
    }
    if (note) {
      note.textContent = "与“" + query + "”相关的影片内容。";
    }
    if (!matches.length) {
      results.innerHTML = "<div class=\"search-empty\">未找到相关影片，请尝试其他关键词。</div>";
      return;
    }
    results.innerHTML = matches.map(movieCard).join("");
  }

  ready(function () {
    setupMenus();
    setupSearchForms();
    setupHero();
    setupLocalFilters();
    setupSearchPage();
  });
})();
