(function() {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function() {
      menu.classList.toggle("is-open");
    });
  }

  function setHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        show(i);
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function() {
          show(active + 1);
        }, 5000);
      });
    });

    timer = window.setInterval(function() {
      show(active + 1);
    }, 5000);
  }

  function setSearch() {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-no-result]");

    function run(value) {
      var keyword = value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function(card) {
        var text = (card.getAttribute("data-search-text") || card.textContent || "").toLowerCase();
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0 || !keyword;
      }
    }

    inputs.forEach(function(input) {
      if (initial) {
        input.value = initial;
      }
      input.addEventListener("input", function() {
        run(input.value);
      });
    });

    if (cards.length) {
      run(initial);
    }
  }

  ready(function() {
    setMenu();
    setHero();
    setSearch();
  });
})();

function initMoviePlayer(url) {
  var video = document.getElementById("movieVideo");
  var button = document.getElementById("playOverlay");
  if (!video || !url) {
    return;
  }

  var attached = false;
  var hls = null;

  function attach() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true });
      hls.loadSource(url);
      hls.attachMedia(video);
      return;
    }
    video.src = url;
  }

  function play() {
    attach();
    if (button) {
      button.classList.add("is-hidden");
    }
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function() {
        if (button) {
          button.classList.remove("is-hidden");
        }
      });
    }
  }

  if (button) {
    button.addEventListener("click", play);
  }

  video.addEventListener("click", function() {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener("play", function() {
    if (button) {
      button.classList.add("is-hidden");
    }
  });

  video.addEventListener("ended", function() {
    if (button) {
      button.classList.remove("is-hidden");
    }
  });

  window.addEventListener("beforeunload", function() {
    if (hls) {
      hls.destroy();
    }
  });
}
