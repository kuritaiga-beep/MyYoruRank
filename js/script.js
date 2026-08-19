// ==============================
// script.js
// アプリ共通状態・初期化・全体イベント管理
// ==============================

// ==============================
// 1. HTML要素の取得
// ==============================

// ------------------------------
// 1-1. 画面
// ------------------------------

const homeScreen = document.getElementById("home-screen");

const settingsScreen = document.getElementById("settings-screen");

const compareScreen = document.getElementById("compare-screen");

const resultScreen = document.getElementById("result-screen");

const songListScreen = document.getElementById("song-list-screen");

const rankingHistoryScreen = document.getElementById("ranking-history-screen");

const rankingHistoryDetailScreen = document.getElementById(
  "ranking-history-detail-screen",
);

// ------------------------------
// 1-2. ホーム画面
// ------------------------------

const startButton = document.getElementById("start-button");

const songListButton = document.getElementById("song-list-button");

const resumeRankingButton = document.getElementById("resume-ranking-button");

// ------------------------------
// 1-3. ランキング条件画面
// ------------------------------

const rankingStartButton = document.getElementById("ranking-start-button");

const rankingAlbumFilterOptions = document.getElementById(
  "ranking-album-filter-options",
);

const rankingSongCount = document.getElementById("ranking-song-count");

const rankingFilters = document.getElementById("ranking-filters");

const rankingFilterResetButton = document.getElementById(
  "ranking-filter-reset-button",
);

const settingsHomeButton = document.getElementById("settings-home-button");

// ------------------------------
// 1-4. 比較画面
// ------------------------------

const progressText = document.getElementById("progress-text");

const progressFill = document.querySelector(".progress-fill");

const leftCard = document.getElementById("left-card");

const rightCard = document.getElementById("right-card");

const leftTitle = document.getElementById("left-title");

const rightTitle = document.getElementById("right-title");

const leftImage = document.getElementById("left-image");

const rightImage = document.getElementById("right-image");

const leftPreviewButton = document.getElementById("left-preview-button");

const rightPreviewButton = document.getElementById("right-preview-button");

const undoButton = document.getElementById("undo-button");

const pauseRankingButton = document.getElementById("pause-ranking-button");

// ------------------------------
// 1-5. 結果画面
// ------------------------------

const rankingList = document.getElementById("ranking-list");

const restartButton = document.getElementById("restart-button");

const resultConditionsToggleButton = document.getElementById(
  "result-ranking-conditions-toggle",
);

const resultConditionsToggleText = document.getElementById(
  "result-ranking-conditions-toggle-text",
);

const resultConditionsToggleIcon = document.getElementById(
  "result-ranking-conditions-toggle-icon",
);

const resultConditionsContent = document.getElementById(
  "result-ranking-settings-content",
);

// ------------------------------
// 1-6. 楽曲一覧画面
// ------------------------------

const songList = document.getElementById("song-list");

const songListHomeButton = document.getElementById("song-list-home-button");

const songListBackButton = document.getElementById("song-list-back-button");

const songListFilters = document.getElementById("song-list-filters");

const songSearchInput = document.getElementById("song-search-input");

const filterResetButton = document.getElementById("filter-reset-button");

const albumFilterOptions = document.getElementById("album-filter-options");

const musicTypeCheckboxes = document.querySelectorAll(
  'input[name="music-type"]',
);

const mvStatusCheckboxes = document.querySelectorAll('input[name="mv-status"]');

const songCategoryCheckboxes = document.querySelectorAll(
  'input[name="song-category"]',
);

const totalSongCount = document.getElementById("total-song-count");

const mvSongCount = document.getElementById("mv-song-count");

const instrumentalSongCount = document.getElementById(
  "instrumental-song-count",
);

const filterToggleButton = document.getElementById("filter-toggle-button");

const filterToggleIcon = document.getElementById("filter-toggle-icon");

// ------------------------------
// 1-7. デバッグ表示
// ------------------------------

const imageErrorSummary = document.getElementById("image-error-summary");

const imageErrorCount = document.getElementById("image-error-count");

// ==============================
// 2. 共通設定
// ==============================

// URLの末尾に「?debug=true」を付けると
// デバッグモードが有効になる
const isDebugMode =
  new URLSearchParams(window.location.search).get("debug") === "true";

// ==============================
// 3. ランキング共通状態
// ==============================

// 現在比較中の楽曲
let currentLeftSong = songs[0];
let currentRightSong = songs[1];

// ユーザーの選択を待つための関数
let comparisonResolve = null;

// 過去の選択履歴
let comparisonResults = [];

// Undo / Replay
let replayIndex = 0;
let isReplaying = false;

// 古いランキング処理を停止するための番号
let rankingRunId = 0;

// 進捗管理
let completedMergeSteps = 0;
let progressPercent = 0;
let totalMergeSteps = 0;

// ランキング対象の楽曲
let rankingTargetSongs = [];

// 現在のランキングで使用する曲順
let currentRankingSongOrder = [];

// 今回のランキング条件
let currentRankingConditions = null;

// ランキング条件の初期化状態
let hasInitializedRankingFilters = false;
let hasInitializedRankingSettings = false;

// ==============================
// 4. ランキング再開ボタン
// ==============================

function updateResumeRankingButton() {
  const savedProgress = localStorage.getItem("rankingProgress");

  if (savedProgress) {
    resumeRankingButton.style.display = "block";
  } else {
    resumeRankingButton.style.display = "none";
  }
}

updateResumeRankingButton();

// ==============================
// 5. 共通リセット処理
// ==============================

// ------------------------------
// 5-1. ランキング状態をリセット
// ------------------------------

function resetRankingState() {
  // 実行中の古いランキング処理を無効にする
  rankingRunId++;

  // 比較状態
  comparisonResolve = null;
  comparisonResults.length = 0;
  replayIndex = 0;
  isReplaying = false;

  // 進捗状態
  completedMergeSteps = 0;
  progressPercent = 0;

  // UI
  undoButton.disabled = true;

  progressText.textContent = "進捗 0%";
  progressFill.style.width = "0%";
}

// ------------------------------
// 5-2. 楽曲一覧フィルターをリセット
// ------------------------------

function resetSongListFilters() {
  if (typeof resetSongListFilterState === "function") {
    resetSongListFilterState();
  }
}

// ==============================
// 6. イベント登録
// ==============================

// ------------------------------
// 6-1. ホーム画面
// ------------------------------

function setupHomeEvents() {
  // ランキング条件画面を開く
  startButton.addEventListener("click", function () {
    // 途中保存データがあるか確認
    const savedProgress = localStorage.getItem("rankingProgress");

    // 途中データがある場合だけ確認
    if (savedProgress) {
      const shouldStartNewRanking = window.confirm(
        "途中のランキングが保存されています。\n破棄して新しくランキングを始めますか？",
      );

      // キャンセルなら何もしない
      if (!shouldStartNewRanking) {
        return;
      }

      // OKなら途中データを破棄
      localStorage.removeItem("rankingProgress");

      updateResumeRankingButton();
    }

    resetRankingState();

    showSettingsScreen();
  });

  // 楽曲一覧を開く
  songListButton.addEventListener("click", function () {
    resetSongListFilters();

    createAlbumFilterOptions();

    createSongList();

    songListFilters.hidden = true;

    filterToggleButton.setAttribute("aria-expanded", "false");

    filterToggleIcon.textContent = "▼";

    showSongListScreen();
  });
}

// ------------------------------
// 6-2. 全イベントを登録
// ------------------------------

function setupEventListeners() {
  setupHomeEvents();

  setupRankingSettingsEvents();

  setupCompareEvents();

  setupResultEvents();

  setupRankingHistoryEvents();

  setupRankingProgressEvents();

  setupSongListEvents();
}

// ==============================
// 7. 初期化
// ==============================

function initializeApp() {
  // ranking.jsの関数を使用して
  // ランキング全体の進捗数を計算する
  totalMergeSteps = calculateTotalMergeSteps(songs.length);

  // 画像エラー件数は
  // デバッグモードでのみ表示する
  if (imageErrorSummary) {
    imageErrorSummary.style.display = isDebugMode ? "block" : "none";
  }

  setupEventListeners();

  resetRankingState();

  showHomeScreen();
}

// ==============================
// 8. アプリ起動
// ==============================

// すべてのJavaScriptファイルが読み込まれてから起動する
document.addEventListener("DOMContentLoaded", initializeApp);
