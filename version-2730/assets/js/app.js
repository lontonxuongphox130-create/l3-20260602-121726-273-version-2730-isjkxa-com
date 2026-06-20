(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-menu]');

    if (menuButton && menu) {
        menuButton.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    document.querySelectorAll('img').forEach(function (img) {
        img.addEventListener('error', function () {
            img.style.opacity = '0';
        }, { once: true });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function setHero(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                setHero(Number(dot.getAttribute('data-hero-dot') || 0));
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                setHero(current + 1);
            }, 5200);
        }
    }

    var searchInput = document.querySelector('[data-search-input]');
    var scope = document.querySelector('[data-search-scope]');
    if (searchInput && scope) {
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-title]'));
        searchInput.addEventListener('input', function () {
            var keyword = searchInput.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-tags') || '') + ' ' + (card.getAttribute('data-year') || '')).toLowerCase();
                card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
            });
        });
    }

    function startPlayer(box) {
        var video = box.querySelector('video');
        var url = box.getAttribute('data-video');
        if (!video || !url) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (!video.src) {
                video.src = url;
            }
        } else if (window.Hls && window.Hls.isSupported()) {
            if (!box.hlsReady) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(url);
                hls.attachMedia(video);
                box.hlsReady = true;
                box.hlsInstance = hls;
            }
        } else if (!video.src) {
            video.src = url;
        }

        box.classList.add('playing');
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {});
        }
    }

    document.querySelectorAll('[data-player]').forEach(function (box) {
        var button = box.querySelector('[data-play-button]');
        var video = box.querySelector('video');
        if (button) {
            button.addEventListener('click', function () {
                startPlayer(box);
            });
        }
        if (video) {
            video.addEventListener('click', function () {
                startPlayer(box);
            });
            video.addEventListener('play', function () {
                box.classList.add('playing');
            });
        }
    });
})();
