const intro = document.getElementById("intro");
const scene = document.getElementById("scene");
const openButton = document.getElementById("openButton");
const barrage = document.getElementById("barrage");
const bgm = document.getElementById("bgm");
const toast = document.getElementById("toast");
const eggOverlay = document.getElementById("eggOverlay");
const eggVideo = document.getElementById("eggVideo");
const eggStart = document.getElementById("eggStart");
const eggOrientationHint = document.getElementById("eggOrientationHint");
const themeButtons = document.querySelectorAll(".theme-btn");

const applyTheme = (theme) => {
  document.body.dataset.theme = theme;
  themeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.theme === theme);
  });
};

applyTheme("warm");

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyTheme(button.dataset.theme);
  });
});

const applyDeviceMode = () => {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  document.body.classList.toggle("mobile", isMobile);
  document.body.classList.toggle("desktop", !isMobile);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", applyDeviceMode);
} else {
  applyDeviceMode();
}

window.addEventListener("resize", applyDeviceMode);
window.addEventListener("orientationchange", applyDeviceMode);

const phrases = [
  "Mid-Autumn Festival",
  "願月光 守护著你「平安」",
  "露从今夜白，月是故乡明",
  "灯火可亲，人间至味是团圆",
  "中秋月 挂天上 映木楼照小窗",
  "“见一面吧 在秋天 在中秋 在浪漫的九月”"
];

for (let index = 0; index < 88; index += 1) {
  const text = document.createElement("span");
  const phrase = phrases[index % phrases.length];
  const row = index % 16;
  const size = 0.38 + ((index * 17) % 190) / 100;
  const depth = ((index * 29) % 720) - 520;

  text.textContent = `${phrase}　${phrase}`;
  text.style.setProperty("--x", `${-55 + ((index * 47) % 165)}%`);
  text.style.setProperty("--size", size.toFixed(2));
  text.style.setProperty("--depth", `${depth}px`);
  text.style.setProperty("--duration", `${8 + ((index * 13) % 7)}s`);
  text.style.setProperty("--delay", `${-((index * 19) % 16)}s`);
  text.style.setProperty("--tilt", "-2deg");
  text.style.setProperty("--row", row);
  barrage.appendChild(text);
}

let easterEggTimer = null;

const showEasterEgg = () => {
  if (!eggOverlay || !eggVideo) return;

  if (bgm) {
    bgm.pause();
    bgm.currentTime = 0;
    bgm.muted = true;
  }

  eggOverlay.classList.remove("is-playing");
  eggVideo.muted = false;
  eggVideo.pause();
  eggVideo.currentTime = 0;
  eggOverlay.classList.add("is-visible");
};

const playEasterEgg = async () => {
  if (!eggOverlay || !eggVideo) return;
  const fullScreenApi =
    eggOverlay.requestFullscreen ||
    eggOverlay.webkitRequestFullscreen ||
    eggOverlay.mozRequestFullScreen ||
    eggOverlay.msRequestFullscreen;

  let fullscreenRequest;
  if (typeof fullScreenApi === "function") {
    try {
      fullscreenRequest = Promise.resolve(fullScreenApi.call(eggOverlay));
    } catch (error) {
      console.warn("Fullscreen request failed:", error);
    }
  } else if (typeof eggVideo.webkitEnterFullscreen === "function") {
    try {
      eggVideo.webkitEnterFullscreen();
    } catch (error) {
      console.warn("Native video fullscreen request failed:", error);
    }
  }

  let playbackRequest;
  try {
    playbackRequest = eggVideo.play();
  } catch (error) {
    console.warn("Easter egg playback failed:", error);
  }

  if (fullscreenRequest) {
    try {
      await fullscreenRequest;
    } catch (error) {
      console.warn("Fullscreen request failed:", error);
    }
  }

  let orientationRequest;
  if (window.screen.orientation?.lock) {
    try {
      orientationRequest = Promise.resolve(window.screen.orientation.lock("landscape"));
    } catch (error) {
      console.warn("Landscape orientation lock failed:", error);
    }
  } else {
    console.warn("Landscape orientation lock is not supported by this browser.");
  }

  eggOverlay.classList.add("is-playing");
  if (orientationRequest) {
    try {
      await orientationRequest;
    } catch (error) {
      console.warn("Landscape orientation lock failed:", error);
    }
  }
  if (playbackRequest) {
    try {
      await playbackRequest;
    } catch (error) {
      console.warn("Easter egg autoplay was blocked:", error);
    }
  }
};

eggStart?.addEventListener("click", playEasterEgg);
window.addEventListener("orientationchange", () => {
  if (eggOrientationHint && window.matchMedia("(orientation: landscape)").matches) {
    eggOrientationHint.style.display = "none";
  } else if (eggOrientationHint && eggOverlay?.classList.contains("is-playing")) {
    eggOrientationHint.style.display = "";
  }
});

openButton.addEventListener("click", async () => {
  intro.classList.add("is-hidden");
  scene.classList.add("is-visible");

  if (easterEggTimer) {
    window.clearTimeout(easterEggTimer);
  }
  easterEggTimer = window.setTimeout(() => {
    showEasterEgg();
  }, 60000);

  if (toast) {
    toast.classList.add("is-visible");
    window.clearTimeout(toast._hideTimer);
    toast._hideTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2600);
  }

  if (bgm) {
    try {
      bgm.volume = 0.7;
      await bgm.play();
    } catch (error) {
      console.warn("BGM autoplay was blocked by the browser:", error);
    }
  }
});

if (eggVideo) {
  eggVideo.addEventListener("ended", () => {
    eggOverlay.classList.remove("is-visible", "is-playing");
    if (document.fullscreenElement === eggOverlay) {
      document.exitFullscreen?.();
    }
    window.screen.orientation?.unlock();
    if (bgm) {
      bgm.muted = false;
      bgm.currentTime = 0;
      bgm.play().catch(() => {});
    }
  });
}
