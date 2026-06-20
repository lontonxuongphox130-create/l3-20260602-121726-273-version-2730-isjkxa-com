import { H as Hls } from '../assets/hls-player.mjs';

function setupPlayer(shell) {
  const video = shell.querySelector('[data-player-video]');
  const button = shell.querySelector('[data-play-button]');
  const status = shell.querySelector('[data-player-status]');
  const source = video ? video.dataset.src : '';
  let initialized = false;
  let hls = null;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function initialize() {
    if (!video || !source || initialized) {
      return;
    }

    initialized = true;
    setStatus('正在加载播放源');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setStatus('播放源已就绪');
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus('播放源已就绪');
      });
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus('播放遇到问题，请稍后重试');
          if (hls) {
            hls.destroy();
            hls = null;
          }
          video.src = source;
        }
      });
      return;
    }

    video.src = source;
    setStatus('使用浏览器原生播放');
  }

  async function play() {
    initialize();
    if (!video) {
      return;
    }
    try {
      await video.play();
      if (button) {
        button.classList.add('is-hidden');
      }
      setStatus('正在播放');
    } catch (error) {
      setStatus('点击视频控件开始播放');
    }
  }

  if (button) {
    button.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
      setStatus('正在播放');
    });
    video.addEventListener('pause', function () {
      setStatus('已暂停');
    });
    video.addEventListener('ended', function () {
      setStatus('播放结束');
      if (button) {
        button.classList.remove('is-hidden');
      }
    });
  }
}

document.querySelectorAll('[data-player]').forEach(setupPlayer);
