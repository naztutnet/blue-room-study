const scenes = [
  { id: 1, title: "Первый кадр", promise: "От «Руси» до Киностудии", time: "2 мин", image: "assets/hero-01.jpg", type: "choice", question: "С какой точки начнём историю?", options: ["1915 · Товарищество «Русь»", "1939 · Здание студии", "1948 · Имя Горького"] },
  { id: 2, title: "Камера видит иначе", promise: "Выберите крупность плана", time: "2 мин", image: "assets/museum.jpg", type: "choice", question: "Что станет главным в вашем кадре?", options: ["Деталь", "Герой", "Пространство"] },
  { id: 3, title: "Костюм рассказывает", promise: "Прочитайте характер героя", time: "2 мин", image: "assets/hero-02.jpg", type: "choice", question: "Что эта деталь говорит о персонаже?", options: ["Власть", "Тайна", "Свобода"] },
  { id: 4, title: "Звук создаёт мир", promise: "Измените настроение сцены", time: "3 мин", image: "assets/hero-03.jpg", type: "sound", question: "Как прозвучит ваш эпизод?", options: ["Проектор", "Дождь", "Шаги"] },
  { id: 5, title: "Внутри павильона", promise: "Разберите кадр по слоям", time: "2 мин", image: "assets/museum.jpg", type: "layers", question: "Включите минимум два слоя", options: ["Камера", "Свет", "Декорация"] },
  { id: 6, title: "Ваш титр", promise: "Выберите роль в киногруппе", time: "3 мин", image: "assets/about-02.jpg", type: "final", question: "Кем вы будете в своём фильме?", options: ["Режиссёр", "Оператор", "Художник", "Звукорежиссёр"] }
];

const initialState = {
  view: "home",
  interest: "",
  currentScene: 1,
  completed: [],
  answers: {},
  movieTitle: "Свет после команды «Мотор!»"
};

let state = loadState();
const app = document.querySelector("#app");
const progress = document.querySelector("#filmProgress");
const backButton = document.querySelector("#backButton");
const resetButton = document.querySelector("#resetButton");
const bottomNav = document.querySelector("#bottomNav");

function loadState() {
  try {
    return { ...initialState, ...JSON.parse(localStorage.getItem("gorky-tour-state") || "{}") };
  } catch {
    return { ...initialState };
  }
}

function saveState() {
  localStorage.setItem("gorky-tour-state", JSON.stringify(state));
}

function setState(patch) {
  state = { ...state, ...patch };
  saveState();
  render();
}

function renderProgress() {
  progress.innerHTML = scenes.map(scene => {
    const classes = ["film-frame"];
    if (state.completed.includes(scene.id)) classes.push("is-complete");
    if (state.currentScene === scene.id && state.view === "scene") classes.push("is-current");
    return `<span class="${classes.join(" ")}" title="${scene.id}. ${scene.title}"></span>`;
  }).join("");
}

function render() {
  renderProgress();
  backButton.hidden = state.view === "home";
  bottomNav.hidden = ["home", "interest"].includes(state.view);
  bottomNav.style.display = bottomNav.hidden ? "none" : "grid";
  bottomNav.querySelectorAll("button").forEach(button => button.classList.toggle("is-active", button.dataset.nav === state.view));

  if (state.view === "home") app.innerHTML = homeTemplate();
  if (state.view === "interest") app.innerHTML = interestTemplate();
  if (state.view === "route") app.innerHTML = routeTemplate();
  if (state.view === "scene") app.innerHTML = sceneTemplate(scenes[state.currentScene - 1]);
  if (state.view === "poster") app.innerHTML = posterTemplate();
  bindCurrentView();
  app.scrollTop = 0;
}

function homeTemplate() {
  return `
    <div class="screen screen--flush">
      <div class="hero">
        <span class="hero__recording">Маршрут готов к записи</span>
        <p class="eyebrow eyebrow--light">Цифровая экскурсия · концепт</p>
        <h2>Внутри<br>кадра</h2>
        <p>Шесть сцен, в которых вы смотрите на Киностудию глазами киногруппы.</p>
      </div>
      <div class="panel">
        <div class="visit-card">
          <strong>Демо‑визит</strong><span class="visit-card__badge">≈ 14 мин</span>
          <p>Историческая площадка · точный павильон и маршрут согласуются с Киностудией.</p>
        </div>
        <button class="primary-button" type="button" data-action="start">Начать путешествие</button>
        <p class="small muted">Прототип использует демонстрационный маршрут и публичные материалы.</p>
      </div>
    </div>`;
}

function interestTemplate() {
  const items = [
    ["Истории фильмов", "Главные картины и люди", "◫"],
    ["Кинопрофессии", "Как работает съёмочная группа", "◎"],
    ["Костюм", "Образ героя через детали", "◇"],
    ["Технологии", "Камера, свет и виртуальная студия", "⌁"]
  ];
  return `
    <div class="screen">
      <p class="eyebrow">Настройка маршрута</p>
      <h2>Что вам интереснее?</h2>
      <p class="muted">Выбор повлияет на подсказки и финальную рекомендацию.</p>
      <div class="choice-grid">
        ${items.map(([title, text, icon]) => `
          <button class="choice ${state.interest === title ? "is-selected" : ""}" type="button" data-interest="${title}">
            <span class="choice__icon" aria-hidden="true">${icon}</span>
            <span><strong>${title}</strong><small>${text}</small></span>
          </button>`).join("")}
      </div>
      <button class="primary-button" type="button" data-action="continue" ${state.interest ? "" : "disabled"}>Показать маршрут</button>
    </div>`;
}

function routeTemplate() {
  const openThrough = Math.min(6, Math.max(1, state.completed.length + 1));
  return `
    <div class="screen screen--flush">
      <div class="route-head">
        <p class="eyebrow eyebrow--light">Ваш интерес · ${state.interest || "Кино"}</p>
        <h2>Шесть сцен<br>одного фильма</h2>
        <p>${state.completed.length} из 6 кадров уже в монтажной ленте</p>
      </div>
      <div class="route-list">
        ${scenes.map(scene => {
          const done = state.completed.includes(scene.id);
          const enabled = scene.id <= openThrough || done;
          return `<button class="route-card ${done ? "is-complete" : ""} ${scene.id === openThrough && !done ? "is-current" : ""}" type="button" data-scene="${scene.id}" ${enabled ? "" : "disabled"}>
            <span class="route-card__number">${String(scene.id).padStart(2, "0")}</span>
            <span><strong>${scene.title}</strong><small>${scene.promise} · ${scene.time}</small></span>
            <span class="route-card__state" aria-hidden="true">${done ? "✓" : enabled ? "→" : "·"}</span>
          </button>`;
        }).join("")}
      </div>
    </div>`;
}

function sceneTemplate(scene) {
  return `
    <div class="screen screen--flush">
      <div class="scene-image">
        <img src="${scene.image}" alt="${scene.title}">
        <span class="scene-image__label">Сцена ${String(scene.id).padStart(2, "0")} · Концепция</span>
      </div>
      <div class="scene-body">
        <div class="scene-body__meta"><span>${scene.promise}</span><span>${scene.time}</span></div>
        <h2>${scene.title}</h2>
        <p>${sceneIntro(scene.id)}</p>
        <div class="question">${scene.question}</div>
        ${interactionTemplate(scene)}
      </div>
    </div>`;
}

function sceneIntro(id) {
  return {
    1: "История студии начинается в 1915 году с товарищества «Русь». Выберите временную точку — экскурсовод откроет связанный с ней поворот.",
    2: "Одна и та же площадка рассказывает разные истории — всё решает граница кадра.",
    3: "Художник по костюмам проектирует не одежду, а характер, эпоху и движение героя.",
    4: "Закройте глаза на секунду: звук способен превратить нейтральный кадр в ожидание, тревогу или движение.",
    5: "Съёмочный павильон — система слоёв. Включайте их по одному, чтобы увидеть работу команды.",
    6: "Фильм начинается с решения: какую роль вы берёте на себя и как назовёте историю?"
  }[id];
}

function interactionTemplate(scene) {
  const selected = state.answers[scene.id];
  if (scene.type === "sound") {
    return `<div class="sound-grid">${scene.options.map((item, index) => `<button class="sound-button ${selected === item ? "is-selected" : ""}" type="button" data-sound="${index}" data-answer="${item}"><span aria-hidden="true">${["▤","≋","●"][index]}</span>${item}</button>`).join("")}</div>${completeButton(scene)}`;
  }
  if (scene.type === "layers") {
    const layers = Array.isArray(selected) ? selected : [];
    return `<div class="layers"><img src="assets/museum.jpg" alt="Съёмочная площадка"><span class="layer-mark layer-mark--camera ${layers.includes("Камера") ? "is-visible" : ""}">Камера · точка взгляда</span><span class="layer-mark layer-mark--light ${layers.includes("Свет") ? "is-visible" : ""}">Свет · объём</span><span class="layer-mark layer-mark--decor ${layers.includes("Декорация") ? "is-visible" : ""}">Декорация · мир</span></div><div class="chips">${scene.options.map(item => `<button class="chip ${layers.includes(item) ? "is-selected" : ""}" type="button" data-layer="${item}">${item}</button>`).join("")}</div>${completeButton(scene, layers.length < 2)}`;
  }
  if (scene.type === "final") {
    return `<div class="chips">${scene.options.map(item => `<button class="chip ${selected === item ? "is-selected" : ""}" type="button" data-answer="${item}">${item}</button>`).join("")}</div><label class="small" for="movieTitle">Название вашего фильма</label><input class="title-input" id="movieTitle" maxlength="42" value="${escapeHtml(state.movieTitle)}"><button class="primary-button" type="button" data-action="finish" ${selected ? "" : "disabled"}>Собрать афишу</button>`;
  }
  return `<div class="chips">${scene.options.map(item => `<button class="chip ${selected === item ? "is-selected" : ""}" type="button" data-answer="${item}">${item}</button>`).join("")}</div>${completeButton(scene)}`;
}

function completeButton(scene, forcedDisabled = false) {
  const disabled = forcedDisabled || !state.answers[scene.id];
  const label = scene.id === 5 ? "Добавить кадр в ленту" : "Зафиксировать выбор";
  return `<button class="primary-button" type="button" data-action="complete" ${disabled ? "disabled" : ""}>${label}</button>`;
}

function posterTemplate() {
  const role = state.answers[6] || "Автор фильма";
  return `
    <div class="screen screen--flush">
      <div class="poster" id="posterPreview">
        <div class="poster__top"><span>Киностудия Горького</span><span>Мой фильм · 2026</span></div>
        <h2>${escapeHtml(state.movieTitle)}</h2>
        <p class="poster__role">${role} · ${state.interest || "Мир кино"}</p>
        <div class="poster__credit"><span>6 сцен внутри кадра<br>Историческая площадка</span><span class="poster__mark">КГ</span></div>
      </div>
      <div class="poster-actions">
        <button class="secondary-button" type="button" data-action="download">Скачать</button>
        <button class="primary-button" type="button" data-action="share">Поделиться</button>
      </div>
      <div class="panel">
        <p class="eyebrow">Продолжить знакомство</p>
        <h3>${recommendation()}</h3>
        <p class="muted small">Рекомендация сформирована по выбранному интересу. В рабочей версии ведёт на действующую билетную страницу.</p>
        <button class="secondary-button" type="button" data-action="tickets">Посмотреть программу</button>
      </div>
    </div>`;
}

function recommendation() {
  return {
    "Истории фильмов": "Путешествие в мир кино",
    "Кинопрофессии": "Секреты кино",
    "Костюм": "История кинокостюма",
    "Технологии": "Кино: из прошлого в будущее"
  }[state.interest] || "Путешествие в мир кино";
}

function bindCurrentView() {
  app.querySelector('[data-action="start"]')?.addEventListener("click", () => setState({ view: "interest" }));
  app.querySelectorAll("[data-interest]").forEach(button => button.addEventListener("click", () => setState({ interest: button.dataset.interest })));
  app.querySelector('[data-action="continue"]')?.addEventListener("click", () => setState({ view: "route" }));
  app.querySelectorAll("[data-scene]").forEach(button => button.addEventListener("click", () => setState({ view: "scene", currentScene: Number(button.dataset.scene) })));

  app.querySelectorAll("[data-answer]").forEach(button => button.addEventListener("click", () => {
    const sceneId = state.currentScene;
    setState({ answers: { ...state.answers, [sceneId]: button.dataset.answer } });
  }));

  app.querySelectorAll("[data-layer]").forEach(button => button.addEventListener("click", () => {
    const layers = Array.isArray(state.answers[5]) ? [...state.answers[5]] : [];
    const value = button.dataset.layer;
    const next = layers.includes(value) ? layers.filter(item => item !== value) : [...layers, value];
    setState({ answers: { ...state.answers, 5: next } });
  }));

  app.querySelectorAll("[data-sound]").forEach(button => button.addEventListener("click", () => playSound(Number(button.dataset.sound))));
  app.querySelector('[data-action="complete"]')?.addEventListener("click", completeCurrentScene);
  app.querySelector('[data-action="finish"]')?.addEventListener("click", () => {
    const input = app.querySelector("#movieTitle");
    const title = input?.value.trim() || initialState.movieTitle;
    const completed = Array.from(new Set([...state.completed, 6])).sort();
    setState({ movieTitle: title, completed, view: "poster" });
  });
  app.querySelector('[data-action="download"]')?.addEventListener("click", downloadPoster);
  app.querySelector('[data-action="share"]')?.addEventListener("click", sharePoster);
  app.querySelector('[data-action="tickets"]')?.addEventListener("click", () => showToast("В рабочей версии откроется билетная страница"));
}

function completeCurrentScene() {
  const completed = Array.from(new Set([...state.completed, state.currentScene])).sort();
  const nextScene = Math.min(6, state.currentScene + 1);
  setState({ completed, currentScene: nextScene, view: state.currentScene === 6 ? "poster" : "route" });
}

function goBack() {
  if (state.view === "interest") setState({ view: "home" });
  else if (state.view === "scene" || state.view === "poster") setState({ view: "route" });
  else setState({ view: "home" });
}

backButton.addEventListener("click", goBack);
resetButton.addEventListener("click", () => {
  if (window.confirm("Начать демонстрационный маршрут заново?")) {
    localStorage.removeItem("gorky-tour-state");
    state = { ...initialState, completed: [], answers: {} };
    render();
  }
});

bottomNav.addEventListener("click", event => {
  const button = event.target.closest("button[data-nav]");
  if (!button) return;
  if (button.dataset.nav === "poster" && !state.completed.includes(6)) return showToast("Афиша откроется после шестой сцены");
  if (button.dataset.nav === "scene") {
    const firstOpen = Math.min(6, state.completed.length + 1);
    return setState({ view: "scene", currentScene: firstOpen });
  }
  setState({ view: button.dataset.nav });
});

function playSound(index) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return showToast("Звук не поддерживается этим браузером");
  const ctx = new AudioContext();
  const now = ctx.currentTime;
  if (index === 0) {
    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 110 + i * 8;
      gain.gain.setValueAtTime(.0001, now + i * .12);
      gain.gain.exponentialRampToValueAtTime(.17, now + i * .12 + .01);
      gain.gain.exponentialRampToValueAtTime(.0001, now + i * .12 + .07);
      osc.connect(gain).connect(ctx.destination); osc.start(now + i * .12); osc.stop(now + i * .12 + .08);
    }
  } else if (index === 1) {
    const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const source = ctx.createBufferSource(); const filter = ctx.createBiquadFilter(); const gain = ctx.createGain();
    source.buffer = buffer; filter.type = "lowpass"; filter.frequency.value = 1800; gain.gain.value = .16;
    source.connect(filter).connect(gain).connect(ctx.destination); source.start();
  } else {
    [0, .34, .68].forEach((offset, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.frequency.value = 62 - i * 4; gain.gain.setValueAtTime(.25, now + offset); gain.gain.exponentialRampToValueAtTime(.0001, now + offset + .18);
      osc.connect(gain).connect(ctx.destination); osc.start(now + offset); osc.stop(now + offset + .2);
    });
  }
}

async function downloadPoster() {
  const canvas = document.querySelector("#posterCanvas");
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#2F59B3"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#EA3D52"; ctx.beginPath(); ctx.arc(990, 350, 240, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.16)";
  for (let y = 90; y < 1260; y += 120) for (let x = 70; x < 1000; x += 150) ctx.fillRect(x, y, 110, 72);
  ctx.fillStyle = "#FFFFFF"; ctx.font = "32px Arial"; ctx.fillText("КИНОСТУДИЯ ГОРЬКОГО · МОЙ ФИЛЬМ", 70, 80);
  ctx.font = "bold 82px Arial"; wrapCanvasText(ctx, state.movieTitle.toUpperCase(), 70, 760, 890, 92);
  ctx.font = "34px Arial"; ctx.fillText(`${state.answers[6] || "Автор фильма"} · ${state.interest || "Мир кино"}`, 70, 1110);
  ctx.font = "26px Arial"; ctx.fillText("6 СЦЕН ВНУТРИ КАДРА · 2026", 70, 1250);
  const link = document.createElement("a"); link.download = "moy-film-gorky-studio.png"; link.href = canvas.toDataURL("image/png"); link.click();
  showToast("Афиша сохранена");
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" "); let line = ""; let row = 0;
  words.forEach(word => {
    const test = `${line}${word} `;
    if (ctx.measureText(test).width > maxWidth && line) { ctx.fillText(line.trim(), x, y + row * lineHeight); line = `${word} `; row++; }
    else line = test;
  });
  ctx.fillText(line.trim(), x, y + row * lineHeight);
}

async function sharePoster() {
  const text = `Мой фильм на Киностудии Горького: «${state.movieTitle}». Роль — ${state.answers[6] || "автор"}.`;
  try {
    if (navigator.share) await navigator.share({ title: "Внутри кадра", text });
    else { await navigator.clipboard.writeText(text); showToast("Текст для публикации скопирован"); }
  } catch (error) {
    if (error.name !== "AbortError") showToast("Не удалось открыть меню публикации");
  }
}

function showToast(message) {
  document.querySelector(".toast")?.remove();
  const toast = document.createElement("div"); toast.className = "toast"; toast.textContent = message; document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

render();
