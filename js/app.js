(() => {
  "use strict";

  const STORAGE_KEY = "journal_entries_v1";
  const MOOD_EMOJI = { 1: "😢", 2: "😕", 3: "😐", 4: "🙂", 5: "😄" };
  const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

  const GENERAL_PROMPTS = [
    "今日、一番小さく感じた「よかったこと」は何ですか？",
    "今日ありがとうと伝えたい人は誰ですか？",
    "今日の自分を一言で表すと？",
    "最近、心がふっと軽くなった瞬間は？",
    "今日食べたもので、一番おいしかったものは？",
    "今、少し気になっていることを書き出してみましょう",
    "今日、誰かの優しさを感じた出来事は？",
    "今週やり遂げたいことを1つ挙げるなら？",
    "最近笑ったのはいつ、どんな時でしたか？",
    "今日の天気や空の様子はどうでしたか？",
    "今、一番リラックスできる場所はどこですか？",
    "最近学んだこと、気づいたことはありますか？",
    "今日一日を振り返って、自分を褒めるとしたら？",
    "最近読んだ本や見た映画で印象に残っているものは？",
    "今、挑戦してみたいことは何ですか？",
    "今日、誰かに親切にできたことはありますか？",
    "最近感じたちょっとした幸せは？",
    "今の自分に必要な休息はどんなものですか？",
    "今日一番印象に残った会話は？",
    "1年後の自分に伝えたいことは？",
    "最近悩んでいることを、誰かに話すように書いてみましょう",
    "今日の気分を天気にたとえると？",
    "最近お気に入りになった音楽や香りは？",
    "今日、五感で感じた心地よいものは？",
    "今、感謝していることを3つ書き出してみましょう",
    "最近、少し無理をしていないか振り返ってみましょう",
    "今日出会った小さな発見は？",
    "自分にとって「今日の勝利」と呼べることは？",
    "最近、誰かと過ごした時間で心が温まったのは？",
    "今の自分を励ますとしたら、どんな言葉をかけますか？",
    "今日、思わず立ち止まって見とれたものは？",
    "最近、体調や気分の変化で気づいたことは？",
    "今週の終わりに、どんな気持ちでいたいですか？",
    "今日一番集中できた時間は何をしていた時ですか？",
    "最近、自分にご褒美をあげたことはありますか？",
    "今、心配ごとより楽しみなことを考えてみましょう",
    "今日、誰かの言葉に励まされたことは？",
    "最近チャレンジしてみて良かったことは？",
    "今日という日を色にたとえると何色ですか？",
    "今、少し先延ばしにしていることは何ですか？",
    "最近の自分の成長を感じた瞬間は？",
    "今日、静かに過ごせた時間はありましたか？",
    "この一週間で一番心に残っている出来事は？",
    "今の暮らしの中で、変えてみたいことは？",
    "今日、自分を大切にできたと思う瞬間は？",
  ];

  const SEASONAL_PROMPTS = {
    spring: [
      "今年の桜を見て感じたことは？",
      "春の陽気で心地よかった瞬間は？",
      "新生活や新しい環境で感じていることは？",
      "春に食べたくなる旬の食べ物は？",
      "最近感じた春の匂いや風は？",
      "この春、挑戦したい新しいことは？",
      "春服やお気に入りの装いについて書いてみましょう",
      "花粉や気候の変化で気づいたことは？",
      "春休みや連休にしたいことは？",
      "芽吹き始めた植物や自然の変化に気づきましたか？",
    ],
    summer: [
      "今年の夏、楽しみにしていることは？",
      "最近食べた冷たい食べ物や飲み物は？",
      "花火や夏祭りの思い出はありますか？",
      "暑さの中で見つけた涼しさは？",
      "夏休みにやってみたいことは？",
      "セミの声や夏の音で印象に残っているものは？",
      "海や川、水辺での過ごし方について書いてみましょう",
      "夏バテ対策や体調管理で意識していることは？",
      "夕立や夕焼けなど、夏の空模様の思い出は？",
      "冷房の効いた部屋で過ごす時間について",
    ],
    autumn: [
      "紅葉を見て感じたことは？",
      "秋に食べたい旬の味覚は？",
      "涼しくなってきて感じる変化は？",
      "読書の秋、最近読みたい本は？",
      "秋の夜長にしたいことは？",
      "運動会や文化祭など、秋のイベントの思い出は？",
      "金木犀など秋の香りについて",
      "衣替えで気づいたことは？",
      "秋の澄んだ空気や空について",
      "実りの季節、今年得られた成果は？",
    ],
    winter: [
      "今年一年を振り返って、印象に残っていることは？",
      "年末年始に楽しみにしていることは？",
      "温かい飲み物や食べ物で癒されたものは？",
      "雪や冬の景色について感じたことは？",
      "クリスマスや年越しの思い出は？",
      "新しい年に向けて叶えたい目標は？",
      "寒い日に心が温まった出来事は？",
      "冬支度で最近したことは？",
      "こたつや暖房の効いた部屋での過ごし方は？",
      "この一年、自分を支えてくれたものは？",
    ],
  };

  /* ===== ストレージ層 ===== */

  const Store = {
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.error("日記データの読み込みに失敗しました", e);
        return [];
      }
    },
    save(entries) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        return true;
      } catch (e) {
        console.error("日記データの保存に失敗しました", e);
        showToast("保存に失敗しました。空き容量を確認してください。");
        return false;
      }
    },
  };

  let entries = Store.load();

  function generateId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function sortedByDateDesc(list) {
    return [...list].sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }

  /* ===== 日付ユーティリティ ===== */

  function todayStr() {
    const d = new Date();
    return formatDate(d);
  }

  function formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function formatDateLabel(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    const weekday = WEEKDAYS[dt.getDay()];
    return `${y}年${m}月${d}日（${weekday}）`;
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  }

  function seasonForMonth(monthIndex) {
    // monthIndex: 0-11 (0 = 1月)
    if (monthIndex >= 2 && monthIndex <= 4) return "spring"; // 3-5月
    if (monthIndex >= 5 && monthIndex <= 7) return "summer"; // 6-8月
    if (monthIndex >= 8 && monthIndex <= 10) return "autumn"; // 9-11月
    return "winter"; // 12-2月
  }

  const SEASON_LABEL = { spring: "春", summer: "夏", autumn: "秋", winter: "冬" };

  function todayPromptPool() {
    const season = seasonForMonth(new Date().getMonth());
    return GENERAL_PROMPTS.concat(SEASONAL_PROMPTS[season]);
  }

  function todayPromptIndex(pool) {
    return hashString(todayStr()) % pool.length;
  }

  /* ===== 状態 ===== */

  const state = {
    currentView: "list",
    calendarYear: new Date().getFullYear(),
    calendarMonth: new Date().getMonth(), // 0-11
    selectedDay: null, // "YYYY-MM-DD" | null
    editingId: null,
    promptPool: [],
    promptIndex: null,
  };

  /* ===== タブ切り替え ===== */

  const headerTitle = document.getElementById("header-title");
  const tabTitles = { list: "一覧", search: "検索", new: "新規の日記" };

  function switchView(target) {
    state.currentView = target;
    document.querySelectorAll(".view").forEach((el) => {
      el.classList.toggle("hidden", el.dataset.view !== target);
    });
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.target === target);
    });
    headerTitle.textContent = state.editingId && target === "new" ? "日記を編集" : tabTitles[target];

    if (target === "list") renderCalendarAndList();
    if (target === "search") renderSearchResults();
  }

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.target === "new" && state.editingId) {
        resetForm();
      }
      switchView(btn.dataset.target);
    });
  });

  /* ===== 日記の庭（育成カード） ===== */

  const FLOWER_ICONS = ["🌸", "🌼", "🌻", "🍎"];
  const MAX_RENDERED_FLOWERS = 200;
  const ENTRIES_PER_FLOWER = 10;

  const GROWTH_STAGES = [
    { min: 0, emoji: "🌰", label: "たね" },
    { min: 50, emoji: "🌱", label: "発芽" },
    { min: 300, emoji: "🌿", label: "若葉" },
    { min: 1000, emoji: "🪴", label: "苗木" },
    { min: 3000, emoji: "🌳", label: "木" },
    { min: 8000, emoji: "🌳", label: "満開の大樹" },
  ];

  const gardenTreeEl = document.getElementById("garden-tree");
  const gardenStageLabelEl = document.getElementById("garden-stage-label");
  const gardenProgressFillEl = document.getElementById("garden-progress-fill");
  const gardenProgressHintEl = document.getElementById("garden-progress-hint");
  const gardenStatEntriesEl = document.getElementById("garden-stat-entries");
  const gardenStatWaterEl = document.getElementById("garden-stat-water");
  const gardenFlowersEl = document.getElementById("garden-flowers");
  const gardenFlowersHintEl = document.getElementById("garden-flowers-hint");

  function getGrowthStage(totalChars) {
    let index = 0;
    for (let i = 0; i < GROWTH_STAGES.length; i++) {
      if (totalChars >= GROWTH_STAGES[i].min) index = i;
    }
    return index;
  }

  function renderGardenCard() {
    const totalEntries = entries.length;
    const totalChars = entries.reduce((sum, e) => sum + (e.body || "").length, 0);

    const stageIndex = getGrowthStage(totalChars);
    const stage = GROWTH_STAGES[stageIndex];
    const isMaxStage = stageIndex === GROWTH_STAGES.length - 1;
    const nextStage = GROWTH_STAGES[stageIndex + 1];

    gardenTreeEl.textContent = stage.emoji;
    gardenTreeEl.classList.toggle("in-bloom", isMaxStage);
    gardenStageLabelEl.textContent = stage.label;

    if (isMaxStage) {
      gardenProgressFillEl.style.width = "100%";
      gardenProgressHintEl.textContent = "満開の大樹に成長しました🌸";
    } else {
      const progress = ((totalChars - stage.min) / (nextStage.min - stage.min)) * 100;
      gardenProgressFillEl.style.width = `${Math.max(4, Math.min(100, progress))}%`;
      gardenProgressHintEl.textContent = `次の「${nextStage.label}」まであと${(nextStage.min - totalChars).toLocaleString()}ml`;
    }

    gardenStatEntriesEl.textContent = totalEntries.toLocaleString();
    gardenStatWaterEl.textContent = `${totalChars.toLocaleString()}ml`;

    if (totalEntries === 0) {
      gardenFlowersEl.classList.add("empty");
      gardenFlowersEl.innerHTML = "はじめての日記を書くと、ここに花が咲きます";
      gardenFlowersHintEl.textContent = "";
      return;
    }

    gardenFlowersEl.classList.remove("empty");
    const flowerCount = Math.floor(totalEntries / ENTRIES_PER_FLOWER);
    const shown = Math.min(flowerCount, MAX_RENDERED_FLOWERS);
    let html = "";
    for (let i = 0; i < shown; i++) {
      html += `<span class="garden-flower">${FLOWER_ICONS[i % FLOWER_ICONS.length]}</span>`;
    }
    if (flowerCount > MAX_RENDERED_FLOWERS) {
      html += `<span class="garden-flower-more">+${(flowerCount - MAX_RENDERED_FLOWERS).toLocaleString()}</span>`;
    }
    gardenFlowersEl.innerHTML = html;

    const remaining = ENTRIES_PER_FLOWER - (totalEntries % ENTRIES_PER_FLOWER);
    gardenFlowersHintEl.textContent = `次の花まであと${remaining}冊`;
  }

  /* ===== カレンダー & 一覧 ===== */

  const calendarGrid = document.getElementById("calendar-grid");
  const monthLabel = document.getElementById("month-label");
  const entryListEl = document.getElementById("entry-list");
  const listEmptyEl = document.getElementById("list-empty");
  const activeFilterEl = document.getElementById("active-filter");
  const activeFilterText = document.getElementById("active-filter-text");

  document.getElementById("prev-month").addEventListener("click", () => {
    state.calendarMonth--;
    if (state.calendarMonth < 0) { state.calendarMonth = 11; state.calendarYear--; }
    state.selectedDay = null;
    renderCalendarAndList();
  });

  document.getElementById("next-month").addEventListener("click", () => {
    state.calendarMonth++;
    if (state.calendarMonth > 11) { state.calendarMonth = 0; state.calendarYear++; }
    state.selectedDay = null;
    renderCalendarAndList();
  });

  document.getElementById("clear-day-filter").addEventListener("click", () => {
    state.selectedDay = null;
    renderCalendarAndList();
  });

  function entriesInMonth(year, month) {
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    return entries.filter((e) => e.date.startsWith(prefix));
  }

  function renderCalendarAndList() {
    renderGardenCard();

    const { calendarYear: year, calendarMonth: month } = state;
    monthLabel.textContent = `${year}年${month + 1}月`;

    const monthEntries = entriesInMonth(year, month);
    const entryDays = new Set(monthEntries.map((e) => e.date));

    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = todayStr();

    let html = WEEKDAYS.map((w) => `<div class="cal-weekday">${w}</div>`).join("");

    for (let i = 0; i < firstDow; i++) {
      html += `<div class="cal-day empty"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const classes = ["cal-day"];
      if (entryDays.has(dateStr)) classes.push("has-entry");
      if (dateStr === today) classes.push("today");
      if (dateStr === state.selectedDay) classes.push("selected");
      html += `<button type="button" class="${classes.join(" ")}" data-date="${dateStr}">${day}</button>`;
    }

    calendarGrid.innerHTML = html;

    calendarGrid.querySelectorAll(".cal-day:not(.empty)").forEach((btn) => {
      btn.addEventListener("click", () => {
        const date = btn.dataset.date;
        state.selectedDay = state.selectedDay === date ? null : date;
        renderCalendarAndList();
      });
    });

    let listSource;
    if (state.selectedDay) {
      listSource = entries.filter((e) => e.date === state.selectedDay);
      activeFilterEl.classList.remove("hidden");
      activeFilterText.textContent = formatDateLabel(state.selectedDay);
    } else {
      listSource = monthEntries;
      activeFilterEl.classList.add("hidden");
    }

    renderEntryList(entryListEl, sortedByDateDesc(listSource), listEmptyEl);
  }

  function renderEntryList(container, list, emptyEl, highlightQuery) {
    container.innerHTML = "";
    if (list.length === 0) {
      if (emptyEl) emptyEl.classList.remove("hidden");
      return;
    }
    if (emptyEl) emptyEl.classList.add("hidden");

    const frag = document.createDocumentFragment();
    list.forEach((entry) => {
      const card = document.createElement("div");
      card.className = "entry-card";
      card.dataset.id = entry.id;

      const title = entry.title?.trim() || "（タイトルなし）";
      let snippet = entry.body || "";
      if (highlightQuery) {
        const idx = snippet.toLowerCase().indexOf(highlightQuery.toLowerCase());
        if (idx > -1) {
          const start = Math.max(0, idx - 20);
          snippet = (start > 0 ? "…" : "") + snippet.slice(start, idx + highlightQuery.length + 40);
        }
      }

      card.innerHTML = `
        <div class="entry-mood">${MOOD_EMOJI[entry.mood] || "📝"}</div>
        <div class="entry-main">
          <div class="entry-date">${formatDateLabel(entry.date)}</div>
          <p class="entry-title">${escapeHtml(title)}</p>
          <p class="entry-snippet">${highlightMatch(escapeHtml(snippet), highlightQuery)}</p>
        </div>
      `;
      card.addEventListener("click", () => openForEdit(entry.id));
      frag.appendChild(card);
    });
    container.appendChild(frag);
  }

  function highlightMatch(escapedText, query) {
    if (!query) return escapedText;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return escapedText.replace(new RegExp(`(${escapedQuery})`, "ig"), "<mark>$1</mark>");
  }

  /* ===== 検索 ===== */

  const searchInput = document.getElementById("search-input");
  const searchResultsEl = document.getElementById("search-results");
  const searchEmptyEl = document.getElementById("search-empty");
  const searchHintEl = document.getElementById("search-hint");

  searchInput.addEventListener("input", renderSearchResults);

  function renderSearchResults() {
    const query = searchInput.value.trim();
    if (!query) {
      searchResultsEl.innerHTML = "";
      searchEmptyEl.classList.add("hidden");
      searchHintEl.classList.remove("hidden");
      return;
    }
    searchHintEl.classList.add("hidden");

    const q = query.toLowerCase();
    const matches = sortedByDateDesc(
      entries.filter((e) =>
        (e.body || "").toLowerCase().includes(q) ||
        (e.title || "").toLowerCase().includes(q)
      )
    );
    renderEntryList(searchResultsEl, matches, searchEmptyEl, query);
  }

  /* ===== 新規 / 編集フォーム ===== */

  const entryForm = document.getElementById("entry-form");
  const dateInput = document.getElementById("entry-date");
  const titleInput = document.getElementById("entry-title");
  const bodyInput = document.getElementById("entry-body");
  const moodPicker = document.getElementById("mood-picker");
  const deleteBtn = document.getElementById("delete-entry-btn");
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  const promptCard = document.getElementById("prompt-card");
  const promptText = document.getElementById("prompt-text");
  const promptSeason = document.getElementById("prompt-season");
  let selectedMood = null;

  function renderPrompt() {
    promptText.textContent = state.promptPool[state.promptIndex];
  }

  function showTodayPrompt() {
    const season = seasonForMonth(new Date().getMonth());
    state.promptPool = todayPromptPool();
    state.promptIndex = todayPromptIndex(state.promptPool);
    promptSeason.textContent = `（${SEASON_LABEL[season]}）`;
    promptCard.classList.remove("hidden");
    renderPrompt();
  }

  document.getElementById("prompt-shuffle").addEventListener("click", () => {
    if (state.promptPool.length <= 1) return;
    let next;
    do {
      next = Math.floor(Math.random() * state.promptPool.length);
    } while (next === state.promptIndex);
    state.promptIndex = next;
    renderPrompt();
  });

  document.getElementById("prompt-use").addEventListener("click", () => {
    titleInput.value = state.promptPool[state.promptIndex];
    bodyInput.focus();
  });

  moodPicker.addEventListener("click", (e) => {
    const btn = e.target.closest(".mood-btn");
    if (!btn) return;
    selectedMood = Number(btn.dataset.mood);
    moodPicker.querySelectorAll(".mood-btn").forEach((b) => {
      b.setAttribute("aria-checked", String(b === btn));
    });
  });

  function resetForm() {
    state.editingId = null;
    entryForm.reset();
    dateInput.value = todayStr();
    selectedMood = null;
    moodPicker.querySelectorAll(".mood-btn").forEach((b) => b.setAttribute("aria-checked", "false"));
    deleteBtn.classList.add("hidden");
    cancelEditBtn.classList.add("hidden");
    if (state.currentView === "new") headerTitle.textContent = "新規の日記";
    showTodayPrompt();
  }

  function openForEdit(id) {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    state.editingId = id;
    dateInput.value = entry.date;
    titleInput.value = entry.title || "";
    bodyInput.value = entry.body || "";
    selectedMood = entry.mood || null;
    moodPicker.querySelectorAll(".mood-btn").forEach((b) => {
      b.setAttribute("aria-checked", String(Number(b.dataset.mood) === selectedMood));
    });
    deleteBtn.classList.remove("hidden");
    cancelEditBtn.classList.remove("hidden");
    promptCard.classList.add("hidden");
    switchView("new");
  }

  cancelEditBtn.addEventListener("click", () => {
    resetForm();
    switchView("list");
  });

  deleteBtn.addEventListener("click", () => {
    if (!state.editingId) return;
    if (!confirm("この日記を削除しますか？この操作は取り消せません。")) return;
    entries = entries.filter((e) => e.id !== state.editingId);
    Store.save(entries);
    resetForm();
    switchView("list");
    showToast("日記を削除しました");
  });

  entryForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!dateInput.value) {
      showToast("日付を入力してください");
      return;
    }

    const now = Date.now();
    if (state.editingId) {
      const entry = entries.find((en) => en.id === state.editingId);
      entry.date = dateInput.value;
      entry.title = titleInput.value.trim();
      entry.body = bodyInput.value;
      entry.mood = selectedMood;
      entry.updatedAt = now;
    } else {
      entries.push({
        id: generateId(),
        date: dateInput.value,
        title: titleInput.value.trim(),
        body: bodyInput.value,
        mood: selectedMood,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (Store.save(entries)) {
      const wasEditing = !!state.editingId;
      resetForm();
      switchView("list");
      state.calendarYear = Number(dateInput.value.slice(0, 4));
      state.calendarMonth = Number(dateInput.value.slice(5, 7)) - 1;
      showToast(wasEditing ? "日記を更新しました" : "日記を保存しました");
    }
  });

  /* ===== トースト ===== */

  let toastTimer = null;
  function showToast(message) {
    const el = document.getElementById("toast");
    el.textContent = message;
    el.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add("hidden"), 2200);
  }

  /* ===== 初期化 ===== */

  resetForm();
  switchView("list");

  /* ===== Service Worker 登録 ===== */

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch((err) => {
        console.error("Service Worker の登録に失敗しました", err);
      });
    });
  }
})();
