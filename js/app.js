(() => {
  "use strict";

  const STORAGE_KEY = "journal_entries_v1";
  const MOOD_EMOJI = { 1: "😢", 2: "😕", 3: "😐", 4: "🙂", 5: "😄" };
  const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

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

  /* ===== 状態 ===== */

  const state = {
    currentView: "list",
    calendarYear: new Date().getFullYear(),
    calendarMonth: new Date().getMonth(), // 0-11
    selectedDay: null, // "YYYY-MM-DD" | null
    editingId: null,
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
  let selectedMood = null;

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
