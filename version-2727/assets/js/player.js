(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var shell = document.querySelector('.player-shell');
        var video = document.getElementById('moviePlayer');
        var playButton = document.querySelector('[data-player-play]');

        if (!shell || !video || !playButton) {
            return;
        }

        var source = shell.getAttribute('data-video-source');
        var hlsInstance = null;
        var initialized = false;

        function startVideo() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    shell.classList.remove('is-playing');
                });
            }
        }

        function initializePlayer() {
            if (!source) {
                return;
            }

            shell.classList.add('is-playing');

            if (initialized) {
                startVideo();
                return;
            }

            initialized = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    capLevelToPlayerSize: true,
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, startVideo);
                hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                        hlsInstance = null;
                        video.src = source;
                        startVideo();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', startVideo, { once: true });
                video.load();
            } else {
                video.src = source;
                video.load();
                startVideo();
            }
        }

        playButton.addEventListener('click', initializePlayer);
        shell.addEventListener('click', function (event) {
            if (event.target === video) {
                return;
            }
            initializePlayer();
        });
        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                shell.classList.remove('is-playing');
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    });
})();
