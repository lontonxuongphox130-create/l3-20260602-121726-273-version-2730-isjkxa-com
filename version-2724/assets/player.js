function initMoviePlayer(config) {
  var video = document.getElementById(config.videoId);
  var button = document.getElementById(config.buttonId);
  var overlay = document.getElementById(config.overlayId);
  var attached = false;
  var hlsInstance = null;

  if (!video || !config.source) {
    return;
  }

  function attachSource() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = config.source;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(config.source);
      hlsInstance.attachMedia(video);
      return;
    }
    video.src = config.source;
  }

  function start() {
    attachSource();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    video.setAttribute("controls", "controls");
    var playTask = video.play();
    if (playTask && typeof playTask.catch === "function") {
      playTask.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  function toggle() {
    if (video.paused) {
      start();
    } else {
      video.pause();
    }
  }

  if (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      start();
    });
  }
  if (overlay) {
    overlay.addEventListener("click", start);
    overlay.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        start();
      }
    });
  }
  video.addEventListener("click", toggle);
  video.addEventListener("error", function () {
    if (overlay) {
      overlay.classList.remove("is-hidden");
      var title = overlay.querySelector("strong");
      if (title) {
        title.textContent = "暂时无法播放，请稍后再试";
      }
    }
  });
  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
