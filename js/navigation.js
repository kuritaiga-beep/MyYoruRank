// ==============================
// navigation.js
// 画面遷移・ブラウザ履歴
// ==============================

// ==============================
// 1. ブラウザ履歴に画面状態を保存
// ==============================

function pushScreenHistory(screenName, extraState = {}) {
  history.pushState(
    {
      screen: screenName,
      ...extraState,
    },
    "",
    `#${screenName}`,
  );
}

// ==============================
// 2. 全画面を非表示
// ==============================

function hideAllScreens() {
  homeScreen.style.display = "none";
  settingsScreen.style.display = "none";
  compareScreen.style.display = "none";
  resultScreen.style.display = "none";
  songListScreen.style.display = "none";
  rankingHistoryScreen.style.display = "none";
  rankingHistoryDetailScreen.style.display = "none";
}

// ==============================
// 3. 各画面を表示
// ==============================

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

  pushScreenHistory("settings");
}

function showCompareScreen() {
  hideAllScreens();

  compareScreen.style.display = "block";

  pushScreenHistory("compare");
}

function showResultScreen(resultId = null) {
  console.log("showResultScreen に渡された resultId:", resultId);

  hideAllScreens();

  resultScreen.style.display = "block";

  history.replaceState(
    {
      screen: "result",
      resultId: resultId,
    },
    "",
    "#result",
  );
}

function showSongListScreen() {
  hideAllScreens();

  songListScreen.style.display = "block";

  pushScreenHistory("song-list");
}

// ==============================
// 4. 初期ブラウザ履歴
// ==============================

history.replaceState(
  {
    screen: "home",
  },
  "",
  "#home",
);

// ==============================
// 5. ブラウザの戻る・進む
// ==============================

window.addEventListener("popstate", function (event) {
  if (!event.state) {
    return;
  }

  const screenName = event.state.screen;

  // 比較画面から別画面へ移動する場合は
  // 現在のランキングを中断して保存する
  if (compareScreen.style.display !== "none" && screenName !== "compare") {
    saveRankingProgress();

    rankingRunId++;

    comparisonResolve = null;

    updateResumeRankingButton();
  }

  if (screenName === "home") {
    hideAllScreens();
    homeScreen.style.display = "block";
  }

  if (screenName === "settings") {
    hideAllScreens();
    settingsScreen.style.display = "block";
  }

  if (screenName === "compare") {
    resumeRanking();
  }

  if (screenName === "song-list") {
    hideAllScreens();
    songListScreen.style.display = "block";
  }

  if (screenName === "ranking-history") {
    hideAllScreens();
    rankingHistoryScreen.style.display = "block";
  }

  if (screenName === "ranking-history-detail") {
    const rankingHistory =
      JSON.parse(localStorage.getItem("rankingHistory")) || [];

    const rankingId = event.state.rankingId;

    showRankingHistoryDetail(rankingHistory, rankingId, false);
  }

  if (screenName === "result") {
    const resultId = event.state.resultId;

    console.log("復元する結果ID:", resultId);

    const rankingHistory =
      JSON.parse(localStorage.getItem("rankingHistory")) || [];

    const savedRanking = rankingHistory.find(function (item) {
      return item.id === resultId;
    });

    console.log("見つかったランキング:", savedRanking);

    if (savedRanking) {
      displayRanking(savedRanking.ranking);

      displayRankingConditions(savedRanking.conditions);

      hideAllScreens();

      resultScreen.style.display = "block";
    } else {
      console.warn("復元するランキングが見つかりませんでした:", resultId);

      showHomeScreen();
    }
  }
});
