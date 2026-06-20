(function () {
    const body = document.body;
    const base = body ? body.dataset.base || './' : './';

    function resolveUrl(path) {
        if (!path) {
            return '#';
        }
        if (/^(https?:)?\/\//.test(path)) {
            return path;
        }
        return base + path;
    }

    function setupMenu() {
        const button = document.querySelector('.menu-toggle');
        const nav = document.querySelector('.mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            const expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!expanded));
            nav.hidden = expanded;
            document.body.classList.toggle('menu-open', !expanded);
        });
    }

    function setupSearch() {
        const inputs = document.querySelectorAll('.site-search');
        const items = window.MOVIE_SEARCH_INDEX || [];
        inputs.forEach(function (input) {
            const panel = input.parentElement ? input.parentElement.querySelector('.search-panel') : null;
            if (!panel) {
                return;
            }
            input.addEventListener('input', function () {
                const keyword = input.value.trim().toLowerCase();
                if (!keyword) {
                    panel.hidden = true;
                    panel.innerHTML = '';
                    return;
                }
                const result = items.filter(function (item) {
                    const haystack = [item.title, item.meta, item.tags].join(' ').toLowerCase();
                    return haystack.includes(keyword);
                }).slice(0, 10);
                if (!result.length) {
                    panel.innerHTML = '<div class="search-item"><strong>未找到相关影片</strong><span>换一个关键词试试</span></div>';
                    panel.hidden = false;
                    return;
                }
                panel.innerHTML = result.map(function (item) {
                    return '<a class="search-item" href="' + resolveUrl(item.url) + '"><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.meta) + '</span></a>';
                }).join('');
                panel.hidden = false;
            });
            document.addEventListener('click', function (event) {
                if (!input.parentElement || input.parentElement.contains(event.target)) {
                    return;
                }
                panel.hidden = true;
            });
        });
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    function setupHero() {
        const hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        const photos = Array.from(hero.querySelectorAll('[data-hero-photo]'));
        const features = Array.from(hero.querySelectorAll('[data-hero-feature]'));
        if (!photos.length || !features.length) {
            return;
        }
        let index = 0;
        function activate(nextIndex) {
            index = nextIndex % photos.length;
            photos.forEach(function (item, itemIndex) {
                item.classList.toggle('active', itemIndex === index);
            });
            features.forEach(function (item, itemIndex) {
                item.classList.toggle('active', itemIndex === index);
            });
        }
        features.forEach(function (item, itemIndex) {
            item.addEventListener('mouseenter', function () {
                activate(itemIndex);
            });
            item.addEventListener('focus', function () {
                activate(itemIndex);
            });
        });
        window.setInterval(function () {
            activate(index + 1);
        }, 5200);
    }

    function setupCatalogFilter() {
        const wrapper = document.querySelector('[data-catalog-filter]');
        if (!wrapper) {
            return;
        }
        const input = wrapper.querySelector('input');
        const select = wrapper.querySelector('select');
        const cards = Array.from(document.querySelectorAll('[data-card]'));
        function applyFilter() {
            const keyword = input ? input.value.trim().toLowerCase() : '';
            const year = select ? select.value : '';
            cards.forEach(function (card) {
                const text = [card.dataset.title, card.dataset.genre, card.dataset.year].join(' ').toLowerCase();
                const matchKeyword = !keyword || text.includes(keyword);
                const matchYear = !year || card.dataset.year === year;
                card.classList.toggle('is-hidden', !(matchKeyword && matchYear));
            });
        }
        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (select) {
            select.addEventListener('change', applyFilter);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupSearch();
        setupHero();
        setupCatalogFilter();
    });
}());
