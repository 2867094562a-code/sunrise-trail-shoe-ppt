(function () {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");
  const fullscreen = document.getElementById("fullscreen");
  const counter = document.getElementById("counter");
  const progress = document.getElementById("progress");
  let index = 0;
  let lastWheel = 0;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let ignoreClickUntil = 0;

  function show(nextIndex) {
    const bounded = Math.max(0, Math.min(slides.length - 1, nextIndex));
    if (bounded === index && slides[index].classList.contains("active")) return;
    slides[index]?.classList.remove("active");
    slides[index]?.classList.add("exit-left");
    index = bounded;
    slides[index].classList.remove("exit-left");
    slides[index].classList.add("active");
    counter.textContent = `${index + 1} / ${slides.length}`;
    progress.style.width = `${((index + 1) / slides.length) * 100}%`;
    location.hash = `/${index + 1}`;
    window.dispatchEvent(new CustomEvent("slidechange", { detail: { index } }));
  }

  prev.addEventListener("click", () => show(index - 1));
  next.addEventListener("click", () => show(index + 1));
  fullscreen.addEventListener("click", (event) => {
    event.stopPropagation();
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      document.documentElement.requestFullscreen?.();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === " " || event.key === "PageDown" || event.key === "Enter" || event.key === "NumpadEnter") show(index + 1);
    if (event.key === "ArrowLeft" || event.key === "PageUp" || event.key === "Backspace") show(index - 1);
    if (event.key === "Home") show(0);
    if (event.key === "End") show(slides.length - 1);
    if (event.key.toLowerCase() === "f" && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  });

  window.addEventListener("wheel", (event) => {
    const now = Date.now();
    if (now - lastWheel < 560 || Math.abs(event.deltaY) < 24) return;
    lastWheel = now;
    show(index + (event.deltaY > 0 ? 1 : -1));
  }, { passive: true });

  document.addEventListener("click", (event) => {
    if (Date.now() < ignoreClickUntil) return;
    if (event.target.closest("button, a, canvas, [data-no-advance], .controls")) return;
    show(index + 1);
  });

  document.querySelectorAll(".interactive-colorways figure").forEach((figure) => {
    const select = () => {
      figure.parentElement.querySelectorAll("figure").forEach((item) => item.classList.toggle("is-selected", item === figure));
    };
    figure.addEventListener("click", (event) => {
      event.stopPropagation();
      select();
    });
    figure.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        select();
      }
    });
  });

  document.addEventListener("touchstart", (event) => {
    if (event.touches.length !== 1) return;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    touchStartTime = Date.now();
  }, { passive: true });

  document.addEventListener("touchend", (event) => {
    if (event.target.closest("button, a, canvas, [data-no-advance], .controls")) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    const elapsed = Date.now() - touchStartTime;
    if (Math.abs(dx) > 52 && Math.abs(dx) > Math.abs(dy)) {
      ignoreClickUntil = Date.now() + 500;
      show(index + (dx < 0 ? 1 : -1));
    } else if (Math.abs(dx) < 16 && Math.abs(dy) < 16 && elapsed < 420) {
      ignoreClickUntil = Date.now() + 500;
      show(index + 1);
    }
  }, { passive: true });

  const fromHash = Number((location.hash.match(/#\/(\d+)/) || [])[1]);
  if (fromHash) {
    index = 0;
    slides.forEach((slide) => slide.classList.remove("active"));
    slides[0].classList.add("active");
    show(fromHash - 1);
  } else {
    counter.textContent = `1 / ${slides.length}`;
    progress.style.width = `${(1 / slides.length) * 100}%`;
  }
})();
