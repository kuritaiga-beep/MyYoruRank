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

// ------------------------------
// 3-1. ホーム画面
// ------------------------------

function showHomeScreen() {
  hideAllScreens();

  homeScreen.style.display = "block";

  history.replaceState(
    {
      screen: "home",
    },
    "",
    "#home",
  );
}

// ------------------------------
// 3-2. ランキング条件画面
// ------------------------------

function showSettingsScreen(shouldPushHistory = true) {
  hideAllScreens();

  createRankingAlbumFilterOptions();

  if (!hasInitializedRankingSettings) {
    applyRecommendedRankingFilters();

    hasInitializedRankingSettings = true;
  }

  updateRankingSongCount();

  settingsScreen.style.display = "block";

  if (shouldPushHistory) {
    pushScreenHistory("settings");
  } else {
    history.replaceState(
      {
        screen: "settings",
      },
      "",
      "#settings",
    );
  }
}

// ------------------------------
// 3-3. 比較画面
// ------------------------------

function showCompareScreen() {
  hideAllScreens();

  compareScreen.style.display = "block";

  pushScreenHistory("compare");
}

// ------------------------------
// 3-4. 結果画面
// ------------------------------

function showResultScreen(resultId = null) {
  const resultEditedBadge = document.getElementById("result-edited-badge");

  if (resultEditedBadge) {
    const rankingHistory = getRankingHistory();

    const selectedHistory = rankingHistory.find(function (history) {
      return history.id === resultId;
    });

    resultEditedBadge.hidden = selectedHistory?.edited !== true;
  }

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

// ------------------------------
// 3-5. 楽曲一覧画面
// ------------------------------

function showSongListScreen() {
  hideAllScreens();

  songListScreen.style.display = "block";

  pushScreenHistory("song-list");
}

// ==============================
// 4. 初期ブラウザ履歴
// 初期画面の決定はinitializeApp()で行う
// ==============================

// ==============================
// 5. ブラウザの戻る・進む
// ==============================

window.addEventListener("popstate", function (event) {
  if (!event.state) {
    return;
  }

  const screenName = event.state.screen;

  if (typeof window.discardRankingEditStateForNavigation === "function") {
    window.discardRankingEditStateForNavigation();
  }

  // 比較画面から別画面へ移動する場合は
  // 現在のランキングを中断して保存する
  if (compareScreen.style.display !== "none" && screenName !== "compare") {
    saveRankingProgress();

    rankingRunId++;

    comparisonResolve = null;

    updateResumeRankingButton();
  }

  switch (screenName) {
    case "home":
      hideAllScreens();

      homeScreen.style.display = "block";
      break;

    case "settings":
      hideAllScreens();

      settingsScreen.style.display = "block";
      break;

    case "compare":
      resumeRanking(false);
      break;

    case "song-list":
      hideAllScreens();

      songListScreen.style.display = "block";
      break;

    case "ranking-history":
      hideAllScreens();

      rankingHistoryScreen.style.display = "block";
      break;

    case "ranking-history-detail": {
      const rankingHistory = getRankingHistory();

      const rankingId = event.state.rankingId;

      showRankingHistoryDetail(rankingHistory, rankingId, false);

      break;
    }

    case "result": {
      const resultId = event.state.resultId;

      const rankingHistory = getRankingHistory();

      const savedRanking = rankingHistory.find(function (item) {
        return item.id === resultId;
      });

      if (savedRanking) {
        displayRanking(savedRanking.ranking);

        setRankingImageTarget(savedRanking.ranking, savedRanking.conditions);

        displayRankingConditions(savedRanking.conditions);

        hideAllScreens();

        resultScreen.style.display = "block";
      } else {
        console.warn("復元するランキングが見つかりませんでした:", resultId);

        showHomeScreen();
      }

      break;
    }
  }
});
