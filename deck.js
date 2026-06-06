(function () {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");
  const fullscreen = document.getElementById("fullscreen");
  const counter = document.getElementById("counter");
  const progress = document.getElementById("progress");
  const notesPanel = document.getElementById("notesPanel");
  const notesText = document.getElementById("notesText");
  const speakerNotes = [
    "开场先给出产品定位：这不是普通跑鞋渲染，而是一套可讲故事、可互动展示的越野跑鞋提案。",
    "这一页强调市场不是极窄的专业山地人群，而是城市跑者向轻越野迁移的机会。",
    "目标人群要讲清楚三类：进阶跑者、装备玩家、轻徒步旅行人群。三者都能被外观和功能同时打动。",
    "设计 DNA 页重点讲日照金山、雪线和速度感如何变成鞋身语言。",
    "CMF 页把颜色、材料、工艺拆开讲，说明它不是只靠配色，而是有识别系统。",
    "BOA 页讲上脚效率和科技感，现场可用旋钮作为视觉中心引导观众。",
    "结构页把厚底解释成分层性能，不是笨重，而是缓震、支撑和抓地分工。",
    "实验室页把功能转化为可信证据：压力路径、抓地测试、坡道场景。",
    "夜跑场景页讲传播价值：低光识别、社交图片、城市到山野。",
    "3D 页建议先用海报兜底，再拖动模型。机器性能差就点 LOW POWER。",
    "配色页可以依次点四张，说明同一个鞋型能承接不同场景情绪。",
    "多角度页点击图片放大，补齐后跟、顶视和另一侧的讲解视角。",
    "上市节奏页讲先用视觉破圈，再用试穿和功能内容转化。",
    "总结页把记忆点压缩成五个关键词，方便评委复述。",
    "结尾页让观众扫码看在线版本，也说明这份 deck 本身就是可交互产品展示。"
  ];
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
    if (notesText) notesText.textContent = speakerNotes[index] || "";
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
    if (event.key.toLowerCase() === "n") {
      event.preventDefault();
      notesPanel?.classList.toggle("is-open");
    }
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

  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.setAttribute("data-no-advance", "");
  lightbox.innerHTML = '<button type="button" aria-label="Close">×</button><img alt=""><strong></strong>';
  document.body.appendChild(lightbox);
  const lightboxImage = lightbox.querySelector("img");
  const lightboxLabel = lightbox.querySelector("strong");
  const closeLightbox = () => lightbox.classList.remove("is-open");
  lightbox.querySelector("button").addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    event.stopPropagation();
    if (event.target === lightbox) closeLightbox();
  });
  document.querySelectorAll(".view-grid figure").forEach((figure) => {
    figure.addEventListener("click", (event) => {
      event.stopPropagation();
      const image = figure.querySelector("img");
      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;
      lightboxLabel.textContent = figure.querySelector("figcaption")?.textContent || "";
      lightbox.classList.add("is-open");
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
    if (notesText) notesText.textContent = speakerNotes[0] || "";
  }
})();
