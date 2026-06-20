(function () {
    const cdnUrl = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
    let loaderPromise = null;

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (!loaderPromise) {
            loaderPromise = new Promise(function (resolve, reject) {
                const script = document.createElement('script');
                script.src = cdnUrl;
                script.async = true;
                script.onload = function () {
                    resolve(window.Hls);
                };
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
        return loaderPromise;
    }

    function showMessage(player, text) {
        const message = player.querySelector('.player-message');
        if (!message) {
            return;
        }
        message.textContent = text;
        message.hidden = false;
    }

    async function prepareVideo(player) {
        const video = player.querySelector('video');
        const button = player.querySelector('.play-layer');
        const url = player.getAttribute('data-video-url');
        if (!video || !url) {
            showMessage(player, '视频暂时无法加载');
            return;
        }
        if (button) {
            button.classList.add('is-hidden');
        }
        try {
            if (video.dataset.ready !== 'true') {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else {
                    const Hls = await loadHls();
                    if (Hls && Hls.isSupported()) {
                        const hls = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(url);
                        hls.attachMedia(video);
                        video._hls = hls;
                    } else {
                        video.src = url;
                    }
                }
                video.dataset.ready = 'true';
            }
            await video.play();
        } catch (error) {
            if (button) {
                button.classList.remove('is-hidden');
            }
            showMessage(player, '点击视频区域可继续播放');
        }
    }

    function setupPlayers() {
        const players = document.querySelectorAll('.movie-player');
        players.forEach(function (player) {
            const button = player.querySelector('.play-layer');
            const video = player.querySelector('video');
            if (button) {
                button.addEventListener('click', function () {
                    prepareVideo(player);
                });
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (video.paused) {
                        prepareVideo(player);
                    }
                });
            }
        });
    }

    document.addEventListener('DOMContentLoaded', setupPlayers);
}());
