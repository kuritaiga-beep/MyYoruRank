// ==============================
// 1. HTML要素の取得
// ==============================

// ----------
// 画面
// ----------

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


// ----------
// ホーム画面
// ----------

const startButton =
    document.getElementById("start-button");

const songListButton =
    document.getElementById("song-list-button");

const resumeRankingButton =
    document.getElementById("resume-ranking-button");


// ----------
// ランキング条件画面
// ----------

const rankingStartButton =
    document.getElementById("ranking-start-button");

const rankingAlbumFilterOptions =
    document.getElementById("ranking-album-filter-options");

const rankingSongCount =
    document.getElementById("ranking-song-count");

const rankingFilters =
    document.getElementById("ranking-filters");

const rankingFilterResetButton =
    document.getElementById("ranking-filter-reset-button");

const settingsHomeButton =
    document.getElementById("settings-home-button");


// ----------
// 比較画面
// ----------

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

const pauseRankingButton =
    document.getElementById("pause-ranking-button");


// ----------
// 結果画面
// ----------

const rankingList =
    document.getElementById("ranking-list");

const restartButton =
    document.getElementById("restart-button");


// ----------
// ランキング履歴画面
// ----------

const rankingHistoryScreen =
    document.getElementById("ranking-history-screen");

const rankingHistoryButton =
    document.getElementById("ranking-history-button");

const rankingHistoryHomeButton =
    document.getElementById("ranking-history-home-button");

const rankingHistoryList =
    document.getElementById("ranking-history-list");

const rankingHistoryDetailScreen =
    document.getElementById("ranking-history-detail-screen");

const rankingHistoryDetailSettings =
    document.getElementById("ranking-history-detail-settings");

const rankingHistoryDetailList =
    document.getElementById("ranking-history-detail-list");

const rankingHistoryDetailBackButton =
    document.getElementById("ranking-history-detail-back-button");


// ----------
// 楽曲一覧画面
// ----------

const songList =
    document.getElementById("song-list");

const songListHomeButton =
    document.getElementById("song-list-home-button");

const songListBackButton =
    document.getElementById("song-list-back-button");

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

const filterToggleButton =
    document.getElementById(
        "filter-toggle-button"
    );

const filterToggleIcon =
    document.getElementById(
        "filter-toggle-icon"
    );


// ----------
// デバッグ表示
// ----------

const imageErrorSummary =
    document.getElementById("image-error-summary");

const imageErrorCount =
    document.getElementById("image-error-count");
// ==========================
// 2. ランキング条件画面
// ==========================


// ==============================
// 3. 共通設定
// ==============================

// URLの末尾に「?debug=true」を付けると
// デバッグモードが有効になる
const isDebugMode =
    new URLSearchParams(window.location.search)
        .get("debug") === "true";


// ==============================
// 4. ランキングの共通状態
// ==============================

// 現在比較中の楽曲
let currentLeftSong = songs[0];
let currentRightSong = songs[1];

// ユーザーの選択を待つための関数
let comparisonResolve = null;

// 過去の選択履歴
let comparisonResults = [];

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

// 現在のランキングで使用する曲順
let currentRankingSongOrder = [];

// 今回のランキング条件
let currentRankingConditions = null;

// ランキング条件を初期化済みか
let hasInitializedRankingFilters = false;

let hasInitializedRankingSettings = false;




// ==============================
// 5. 画面切り替え
// ==============================

// ==============================
// ブラウザ履歴に画面状態を保存
// ==============================

function pushScreenHistory(
    screenName,
    extraState = {}
) {

    history.pushState(
        {
            screen: screenName,
            ...extraState
        },
        "",
        `#${screenName}`
    );

}

function hideAllScreens() {

    homeScreen.style.display = "none";
    settingsScreen.style.display = "none";
    compareScreen.style.display = "none";
    resultScreen.style.display = "none";
    songListScreen.style.display = "none";
    rankingHistoryScreen.style.display = "none";
    rankingHistoryDetailScreen.style.display = "none";

}

function showHomeScreen() {

    hideAllScreens();

    homeScreen.style.display = "block";

}

function showSettingsScreen() {

    hideAllScreens();

    createRankingAlbumFilterOptions();

    if (!hasInitializedRankingSettings) {

        applyRecommendedRankingFilters();

        hasInitializedRankingSettings = true;

    }

    updateRankingSongCount();

    settingsScreen.style.display = "block";

    pushScreenHistory(
        "settings"
    );

}


function showCompareScreen() {

    hideAllScreens();

    compareScreen.style.display = "block";

    pushScreenHistory("compare");

}

function showResultScreen(
    resultId = null
) {

    console.log(
        "showResultScreen に渡された resultId:",
        resultId
    );

    hideAllScreens();

    resultScreen.style.display =
        "block";

    history.replaceState(
        {
            screen: "result",
            resultId: resultId
        },
        "",
        "#result"
    );

}

function showSongListScreen() {

    hideAllScreens();

    songListScreen.style.display = "block";

    pushScreenHistory("song-list");

}

// ==============================
// ランキング再開ボタンの表示を更新
// ==============================

function updateResumeRankingButton() {

    const savedProgress =
        localStorage.getItem(
            "rankingProgress"
        );

    if (savedProgress) {

        resumeRankingButton.style.display =
            "block";

    } else {

        resumeRankingButton.style.display =
            "none";

    }

}

updateResumeRankingButton();

history.replaceState(
    {
        screen: "home"
    },
    "",
    "#home"
);

window.addEventListener(
    "popstate",
    function (event) {

        if (!event.state) {
            return;
        }

        const screenName =
            event.state.screen;

        // 比較画面から別画面へ移動する場合は
        // 現在のランキングを中断して保存する
        if (
            compareScreen.style.display !== "none" &&
            screenName !== "compare"
        ) {

            saveRankingProgress();

            rankingRunId++;

            comparisonResolve = null;

            updateResumeRankingButton();

        }

        if (screenName === "home") {

            hideAllScreens();

            homeScreen.style.display =
                "block";

        }

        if (screenName === "settings") {

            hideAllScreens();

            settingsScreen.style.display =
                "block";

        }

        if (screenName === "compare") {

            resumeRanking();

        }

        if (screenName === "song-list") {

            hideAllScreens();

            songListScreen.style.display =
                "block";

        }

        if (screenName === "ranking-history") {

            hideAllScreens();

            rankingHistoryScreen.style.display =
                "block";

        }

        if (screenName === "ranking-history-detail") {

            const rankingHistory =
                JSON.parse(
                    localStorage.getItem(
                        "rankingHistory"
                    )
                ) || [];

            const rankingId =
                event.state.rankingId;

            showRankingHistoryDetail(
                rankingHistory,
                rankingId,
                false
            );

        }

        if (screenName === "result") {

            const resultId =
                event.state.resultId;

            console.log(
                "復元する結果ID:",
                resultId
            );

            const rankingHistory =
                JSON.parse(
                    localStorage.getItem("rankingHistory")
                ) || [];

            const savedRanking =
                rankingHistory.find(function (item) {

                    return item.id === resultId;

                });

            console.log(
                "見つかったランキング:",
                savedRanking
            );

            if (savedRanking) {

                displayRanking(
                    savedRanking.ranking
                );

                displayRankingConditions(
                    savedRanking.conditions
                );

                hideAllScreens();

                resultScreen.style.display =
                    "block";

            } else {

                console.warn(
                    "復元するランキングが見つかりませんでした:",
                    resultId
                );

                showHomeScreen();

            }

        }

    }
);


// ==============================
// 6. 共通リセット処理
// ==============================

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
function resetSongListFilters() {

    if (
        typeof resetSongListFilterState ===
        "function"
    ) {

        resetSongListFilterState();

    }

}


// ==============================
// 7. イベント登録
// ==============================

function setupEventListeners() {

    // ----------
    // ホーム画面
    // ----------

    // ランキング条件画面を開く
    startButton.addEventListener(
        "click",
        function () {

            // 途中保存データがあるか確認
            const savedProgress =
                localStorage.getItem(
                    "rankingProgress"
                );

            // 途中データがある場合だけ確認
            if (savedProgress) {

                const shouldStartNewRanking =
                    window.confirm(
                        "途中のランキングが保存されています。\n破棄して新しくランキングを始めますか？"
                    );

                // キャンセルなら何もしない
                if (!shouldStartNewRanking) {
                    return;
                }

                // OKなら途中データを破棄
                localStorage.removeItem(
                    "rankingProgress"
                );

                updateResumeRankingButton();

            }

            resetRankingState();

            showSettingsScreen();

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


    // ----------
    // ランキング条件画面
    // ----------

    // ランキング条件フィルターの変更を反映
    rankingFilters.addEventListener(
        "change",
        function () {

            updateRankingSongCount();

        }
    );

    // ランキング条件をリセット
    rankingFilterResetButton.addEventListener(
        "click",
        function () {

            const rankingFilterInputs =
                rankingFilters.querySelectorAll(
                    'input[type="checkbox"]'
                );

            rankingFilterInputs.forEach(
                function (input) {

                    input.checked = false;

                }
            );

            updateRankingSongCount();

        }
    );

    // 条件を決めてランキング開始
    rankingStartButton.addEventListener(
        "click",
        function () {

            showCompareScreen();

            beginNewRanking();

        }
    );

    // ホーム画面へ戻る
    settingsHomeButton.addEventListener(
        "click",
        function () {

            resetRankingState();

            showHomeScreen();

        }
    );




    // ----------
    // 比較画面
    // ----------

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


    // ----------
    // 結果画面
    // ----------

    // ホーム画面へ戻る
    restartButton.addEventListener(
        "click",
        function () {

            resetRankingState();

            showHomeScreen();

        }
    );

    // ==============================
    // ランキング履歴画面
    // ==============================

    function displayRankingHistory(rankingHistory) {

        rankingHistoryList.innerHTML = "";

        if (rankingHistory.length === 0) {

            rankingHistoryList.innerHTML = `
                <p>
                    保存されたランキングはありません。
                </p>
            `;

            return;

        }

        rankingHistory.forEach(
            function (history) {

                const historyItem =
                    document.createElement("div");

                historyItem.classList.add(
                    "ranking-history-item"
                );

                historyItem.innerHTML = `
                    <div>
                        ${new Date(history.date)
                            .toLocaleString("ja-JP")}
                    </div>

                    <div>
                        対象曲数：${history.conditions.songCount}曲
                    </div>

                    <div>
                        1位：${history.ranking[0].title}
                    </div>

                    <button
                        type="button"
                        class="ranking-history-view-button"
                        data-ranking-id="${history.id}"
                    >
                        ランキングを見る
                    </button>

                    <button
                        type="button"
                        class="ranking-history-delete-button"
                        data-ranking-id="${history.id}"
                    >
                        削除
                    </button>
                `;

                const viewButton =
                    historyItem.querySelector(
                        ".ranking-history-view-button"
                    );

                const deleteButton = historyItem.querySelector(
                        ".ranking-history-delete-button"
                    );

                viewButton.addEventListener(
                    "click",
                    function () {

                        const rankingId =
                            Number(
                                viewButton.dataset.rankingId
                            );

                        showRankingHistoryDetail(
                            rankingHistory,
                            rankingId
                        );

                    }
                );

                deleteButton.addEventListener(
                    "click",
                    function () {

                        const rankingId =
                            Number(
                                deleteButton.dataset.rankingId
                            );

                        const shouldDelete =
                            window.confirm(
                                "このランキング履歴を削除しますか？"
                            );

                        if (!shouldDelete) {
                            return;
                        }

                        console.log(
                            "削除するランキングID:",
                            rankingId
                        );

                        const updatedRankingHistory =
                            rankingHistory.filter(
                                function (history) {

                                    return history.id !== rankingId;

                                }
                            );

                        localStorage.setItem(
                            "rankingHistory",
                            JSON.stringify(updatedRankingHistory)
                        );

                        displayRankingHistory(
                            updatedRankingHistory
                        );

                    }
                );

                rankingHistoryList.appendChild(
                    historyItem
                );

            }
        );

    }

    // ==============================
    // 保存ランキングの詳細を表示
    // ==============================

    function showRankingHistoryDetail(
        rankingHistory,
        rankingId,
        shouldPushHistory = true
    ) {

        const selectedHistory =
            rankingHistory.find(
                function (history) {

                    return history.id === rankingId;

                }
            );

        rankingHistoryDetailSettings.innerHTML = `
            <p>
                対象曲数：${selectedHistory.conditions.songCount}曲
            </p>

            <p>
                Type：
                ${
                    selectedHistory.conditions.musicTypes.length > 0
                        ? selectedHistory.conditions.musicTypes.join(" / ")
                        : "すべて"
                }
            </p>

            <p>
                MV：
                ${
                    selectedHistory.conditions.mvStatus.length > 0
                        ? selectedHistory.conditions.mvStatus.join(" / ")
                        : "すべて"
                }
            </p>

            <p>
                Category：
                ${
                    selectedHistory.conditions.categories.length > 0
                        ? selectedHistory.conditions.categories.join(" / ")
                        : "すべて"
                }
            </p>

            <p>
                Album：
                ${
                    selectedHistory.conditions.albums.length > 0
                        ? selectedHistory.conditions.albums.join(" / ")
                        : "すべて"
                }
            </p>
        `;

        rankingHistoryDetailList.innerHTML = "";

        selectedHistory.ranking.forEach(
            function (song, index) {

                const rankingItem =
                    document.createElement("div");

                rankingItem.classList.add(
                    "ranking-item"
                );

                const rankingPosition =
                    getRankingPosition(index);

                rankingItem.innerHTML = `
                    <span class="ranking-number">
                        ${rankingPosition}
                    </span>

                    <img
                        src="${song.image}"
                        alt="${song.title}"
                        class="ranking-image"
                    >

                    <span class="ranking-title">
                        ${song.title}
                    </span>
                `;

                const rankingImage =
                    rankingItem.querySelector(
                        ".ranking-image"
                    );

                if (
                    rankingImage &&
                    song.imageType
                ) {

                    rankingImage.classList.add(
                        `${song.imageType}-image`
                    );

                }

                rankingHistoryDetailList.appendChild(
                    rankingItem
                );
            }

        );

        hideAllScreens();

        rankingHistoryDetailScreen.style.display ="block";

        if (shouldPushHistory) {

            pushScreenHistory(
                "ranking-history-detail",
                {rankingId: rankingId}
            );

        }
    }

    window.showRankingHistoryDetail =
        showRankingHistoryDetail;

    // ホーム → ランキング履歴
    rankingHistoryButton.addEventListener(
        "click",
        function () {

            hideAllScreens();

            rankingHistoryScreen.style.display =
                "block";

            const rankingHistory =
                JSON.parse(
                    localStorage.getItem("rankingHistory")
                ) || [];

            displayRankingHistory(rankingHistory);

            pushScreenHistory("ranking-history");

        }
    );

    // ホーム → ランキングを再開
    resumeRankingButton.addEventListener(
        "click",
        function () {

            resumeRanking();

        }
    );

    // ランキングを中断
    pauseRankingButton.addEventListener(
        "click",
        function () {

            saveRankingProgress();

            rankingRunId++;

            comparisonResolve = null;

            hideAllScreens();

            homeScreen.style.display =
                "block";

            updateResumeRankingButton();

        }
    );


    // ランキング履歴 → ホーム
    rankingHistoryHomeButton.addEventListener(
        "click",
        function () {

            hideAllScreens();

            homeScreen.style.display =
                "block";

        }
    );

    // ランキング履歴詳細 → ランキング履歴
    rankingHistoryDetailBackButton.addEventListener(
        "click",
        function () {

            hideAllScreens();

            rankingHistoryScreen.style.display =
                "block";

        }
    );


    // ----------
    // 楽曲一覧画面
    // ----------

    // 楽曲一覧からホームへ戻る
    songListBackButton.addEventListener(
        "click",
        showHomeScreen
    );

    songListHomeButton.addEventListener(
        "click",
        showHomeScreen
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
// 8. 初期化
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


    setupEventListeners();

    resetRankingState();

    showHomeScreen();

}


// ==============================
// 9. アプリ起動
// ==============================

// すべてのJavaScriptファイルが読み込まれてから起動する
document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);