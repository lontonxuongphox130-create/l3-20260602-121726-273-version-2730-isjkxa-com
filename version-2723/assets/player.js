(function () {
  function startPlayer(shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.player-overlay');
    var stream = video ? video.getAttribute('data-stream') : '';

    if (!video || !stream) {
      return;
    }

    function playVideo() {
      if (overlay) {
        overlay.classList.add('hide');
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (!video.getAttribute('src')) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        video.load();
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      } else {
        video.src = stream;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        video.load();
      }
    } else {
      playVideo();
    }
  }

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var overlay = shell.querySelector('.player-overlay');

    shell.addEventListener('click', function (event) {
      if (event.target && event.target.tagName === 'VIDEO') {
        return;
      }

      startPlayer(shell);
    });

    if (overlay) {
      overlay.addEventListener('click', function (event) {
        event.preventDefault();
        startPlayer(shell);
      });
    }
  });
})();
