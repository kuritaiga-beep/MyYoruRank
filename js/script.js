// ==============================
// 1. HTML要素の取得
// ==============================

// 画面
const homeScreen =
    document.getElementById("home-screen");

const settingsScreen =
    document.getElementById("settings-screen");


const compareScreen =
    document.getElementById("compare-screen");

const resultScreen =
    document.getElementById("result-screen");

const songListScreen =
    document.getElementById("song-list-screen");


// ホーム画面
const startButton =
    document.getElementById("start-button");

const rankingStartButton =
    document.getElementById("ranking-start-button");

const songListHomeButton =
    document.getElementById( "song-list-home-button");

const songListButton =
    document.getElementById("song-list-button");


// 比較画面
const progressText =
    document.getElementById("progress-text");

const progressFill =
    document.querySelector(".progress-fill");

const leftCard =
    document.getElementById("left-card");

const rightCard =
    document.getElementById("right-card");

const leftTitle =
    document.getElementById("left-title");

const rightTitle =
    document.getElementById("right-title");

const leftImage =
    document.getElementById("left-image");

const rightImage =
    document.getElementById("right-image");

const leftPreviewButton =
    document.getElementById("left-preview-button");

const rightPreviewButton =
    document.getElementById("right-preview-button");

const undoButton =
    document.getElementById("undo-button");


// 結果画面
const rankingList =
    document.getElementById("ranking-list");

const restartButton =
    document.getElementById("restart-button");


// 楽曲一覧画面
const songList =
    document.getElementById("song-list");

const songListFilters =
    document.getElementById("song-list-filters");

const songSearchInput =
    document.getElementById("song-search-input");

const filterResetButton =
    document.getElementById("filter-reset-button");

const albumFilterOptions =
    document.getElementById("album-filter-options");

const musicTypeCheckboxes =
    document.querySelectorAll(
        'input[name="music-type"]'
    );

const mvStatusCheckboxes =
    document.querySelectorAll(
        'input[name="mv-status"]'
    );

const songCategoryCheckboxes =
    document.querySelectorAll(
        'input[name="song-category"]'
    );

const totalSongCount =
    document.getElementById("total-song-count");

const mvSongCount =
    document.getElementById("mv-song-count");

const instrumentalSongCount =
    document.getElementById("instrumental-song-count");

const imageErrorSummary =
    document.getElementById("image-error-summary");

const imageErrorCount =
    document.getElementById("image-error-count");

const songListBackButton =
    document.getElementById("song-list-back-button");

const filterToggleButton =
    document.getElementById(
        "filter-toggle-button"
    );

const filterToggleIcon =
    document.getElementById(
        "filter-toggle-icon"
    );


// ==============================
// 2. 共通設定
// ==============================

// URLの末尾に「?debug=true」を付けると
// デバッグモードが有効になる
const isDebugMode =
    new URLSearchParams(window.location.search)
        .get("debug") === "true";


// ==============================
// 3. ランキングの共通状態
// ==============================

// 現在比較中の楽曲
let currentLeftSong = songs[0];
let currentRightSong = songs[1];

// ユーザーの選択を待つための関数
let comparisonResolve = null;

// 過去の選択履歴
const comparisonResults = [];

// 「一つ前に戻る」処理で使用
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

// ランキング条件
const rankingSettings = {

    album: "all",

    includeTribute: false,

    includeInstrumental: false

};

// ==============================
// 4. 画面切り替え
// ==============================

function hideAllScreens() {

    homeScreen.style.display = "none";
    compareScreen.style.display = "none";
    resultScreen.style.display = "none";
    songListScreen.style.display = "none";

}

function showHomeScreen() {

    hideAllScreens();

    homeScreen.style.display = "block";

}

function returnToHomeScreen() {

    showHomeScreen();

}

function showCompareScreen() {

    hideAllScreens();

    compareScreen.style.display = "block";

}

function showResultScreen() {

    hideAllScreens();

    resultScreen.style.display = "block";

}

function showSongListScreen() {

    hideAllScreens();

    songListScreen.style.display = "block";

}


// ==============================
// 5. 共通リセット処理
// ==============================

function resetRankingState() {

    // 実行中の古いランキング処理を無効にする
    rankingRunId++;

    comparisonResolve = null;

    comparisonResults.length = 0;

    replayIndex = 0;
    isReplaying = false;

    completedMergeSteps = 0;
    progressPercent = 0;

    undoButton.disabled = true;

    progressText.textContent = "進捗 0%";
    progressFill.style.width = "0%";

}

function resetSongListFilters() {

    if (
        typeof resetSongListFilterState ===
        "function"
    ) {

        resetSongListFilterState();

    }

}


// ==============================
// 6. イベント登録
// ==============================

function setupEventListeners() {

    // ランキング開始
    startButton.addEventListener(
        "click",
        function () {

            resetRankingState();

            homeScreen.style.display = "none";

            settingsScreen.style.display = "block";

        }
    );

    // 条件を決めてランキング開始
    rankingStartButton.addEventListener(
        "click",
        function () {

            settingsScreen.style.display = "none";

            showCompareScreen();

            beginNewRanking();

        }
    );


    // 楽曲一覧を開く
    songListButton.addEventListener(
        "click",
        function () {

            resetSongListFilters();

            createAlbumFilterOptions();

            createSongList();

            songListFilters.hidden = true;

            filterToggleButton.setAttribute(
                "aria-expanded",
                "false"
            );

            filterToggleIcon.textContent = "▼";

            showSongListScreen();

        }
    );


    // 楽曲一覧からホームへ戻る
    songListBackButton.addEventListener(
        "click",
        returnToHomeScreen
    );

    songListHomeButton.addEventListener(
        "click",
        returnToHomeScreen
    );


    // 結果画面からホームへ戻る
    restartButton.addEventListener(
        "click",
        function () {

            resetRankingState();

            showHomeScreen();

        }
    );


    // 左側の楽曲を選択
    leftCard.addEventListener(
        "click",
        function () {

            selectLeftSong();

        }
    );


    // 右側の楽曲を選択
    rightCard.addEventListener(
        "click",
        function () {

            selectRightSong();

        }
    );


    // 左側の曲をYouTubeで確認
    leftPreviewButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            openSongPreview(currentLeftSong);

        }
    );


    // 右側の曲をYouTubeで確認
    rightPreviewButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            openSongPreview(currentRightSong);

        }
    );


    // 一つ前の選択に戻る
    undoButton.addEventListener(
        "click",
        function () {

            undoLastSelection();

        }
    );


    // 楽曲一覧フィルターのイベント登録
    if (
        typeof setupSongListFilterEvents ===
        "function"
    ) {

        setupSongListFilterEvents();

    }

    // フィルターパネルの開閉
    filterToggleButton.addEventListener(
        "click",
        function () {

            const isExpanded =
                filterToggleButton.getAttribute(
                    "aria-expanded"
                ) === "true";

            filterToggleButton.setAttribute(
                "aria-expanded",
                String(!isExpanded)
            );

            songListFilters.hidden =
                isExpanded;

            filterToggleIcon.textContent =
                isExpanded ? "▼" : "▲";

        }
);

}


// ==============================
// 7. 初期化
// ==============================

function initializeApp() {

    // ranking.jsの関数を使用して
    // ランキング全体の進捗数を計算する
    totalMergeSteps =
        calculateTotalMergeSteps(songs.length);

    // 画像エラー件数は
    // デバッグモードでのみ表示する
    if (imageErrorSummary) {

        imageErrorSummary.style.display =
            isDebugMode ? "block" : "none";

    }

    resetRankingState();

    setupEventListeners();

    showHomeScreen();

}


// ==============================
// 8. アプリ起動
// ==============================

// すべてのJavaScriptファイルが読み込まれてから起動する
document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);