(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector('.menu-toggle');
        var nav = document.getElementById('mobileNav');
        if (!button || !nav) {
            return;
        }

        button.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }

        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
                show(index);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function getParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    function setupFilters() {
        var bars = Array.prototype.slice.call(document.querySelectorAll('[data-filter-bar]'));
        bars.forEach(function (bar) {
            var root = bar.parentElement || document;
            var input = bar.querySelector('.js-search');
            var year = bar.querySelector('.js-filter-year');
            var type = bar.querySelector('.js-filter-type');
            var count = bar.querySelector('[data-filter-count]');
            var empty = root.querySelector('[data-empty-state]');
            var items = Array.prototype.slice.call(root.querySelectorAll('.filter-item'));

            if (!items.length) {
                return;
            }

            var initialQuery = getParam('q');
            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function matchItem(item) {
                var query = input ? input.value.trim().toLowerCase() : '';
                var yearValue = year ? year.value : '';
                var typeValue = type ? type.value : '';
                var haystack = (item.getAttribute('data-search') || '').toLowerCase();
                var itemYear = item.getAttribute('data-year') || '';
                var itemType = item.getAttribute('data-type') || '';

                var queryOk = !query || haystack.indexOf(query) !== -1;
                var yearOk = !yearValue || itemYear.indexOf(yearValue) !== -1;
                var typeOk = !typeValue || itemType.indexOf(typeValue) !== -1;
                return queryOk && yearOk && typeOk;
            }

            function apply() {
                var visible = 0;
                items.forEach(function (item) {
                    var ok = matchItem(item);
                    item.classList.toggle('is-hidden', !ok);
                    if (ok) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = '显示 ' + visible + ' 项';
                }
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            [input, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            apply();
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
