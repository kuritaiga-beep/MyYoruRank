// ==============================
// ranking-progress.js
// ランキング途中保存・復元・再開
// ==============================

// ==============================
// 1. ランキング途中状態を保存
// ==============================

function saveRankingProgress() {
  const progressData = {
    savedAt: new Date().toISOString(),

    songOrder: currentRankingSongOrder.map(function (song) {
      return song.title;
    }),

    comparisonResults: [...comparisonResults],

    mergeTaskSelectionHistory: [...mergeTaskSelectionHistory],

    pendingMergeTaskId: pendingMergeTaskId,

    conditions: currentRankingConditions,
  };

  localStorage.setItem("rankingProgress", JSON.stringify(progressData));
}

// ==============================
// 2. ランキング途中状態を読み込む
// ==============================

function loadRankingProgress() {
  const savedProgress = localStorage.getItem("rankingProgress");

  if (!savedProgress) {
    return null;
  }

  try {
    const rankingProgress = JSON.parse(savedProgress);

    const hasValidConditions =
      rankingProgress &&
      rankingProgress.conditions &&
      typeof rankingProgress.conditions === "object" &&
      !Array.isArray(rankingProgress.conditions) &&
      typeof rankingProgress.conditions.songCount === "number" &&
      Array.isArray(rankingProgress.conditions.albums) &&
      Array.isArray(rankingProgress.conditions.musicTypes) &&
      Array.isArray(rankingProgress.conditions.categories) &&
      Array.isArray(rankingProgress.conditions.mvStatus);

    const isValidRankingProgress =
      rankingProgress &&
      typeof rankingProgress === "object" &&
      !Array.isArray(rankingProgress) &&
      Array.isArray(rankingProgress.songOrder) &&
      rankingProgress.songOrder.every(function (songTitle) {
        return typeof songTitle === "string";
      }) &&
      Array.isArray(rankingProgress.comparisonResults) &&
      (rankingProgress.mergeTaskSelectionHistory === undefined ||
        Array.isArray(rankingProgress.mergeTaskSelectionHistory)) &&
      hasValidConditions;

    if (!isValidRankingProgress) {
      console.warn(
        "ランキング途中データの形式が正しくありません。",
        rankingProgress,
      );

      localStorage.removeItem("rankingProgress");

      updateResumeRankingButton();

      return null;
    }

    return rankingProgress;
  } catch (error) {
    console.error(
      "ランキング途中データの読み込みに失敗しました。",
      error,
    );

    localStorage.removeItem("rankingProgress");

    updateResumeRankingButton();

    return null;
  }
}

// ==============================
// 3. ランキング途中状態を復元
// ==============================

function restoreRankingProgress(savedProgress) {
  // 保存時の曲順を復元
  currentRankingSongOrder = savedProgress.songOrder
    .map(function (songTitle) {
      return songs.find(function (song) {
        return song.title === songTitle;
      });
    })
    .filter(function (song) {
      return song !== undefined;
    });

  // ランキング対象曲も復元
  rankingTargetSongs = [...currentRankingSongOrder];

  // 比較履歴を復元
  comparisonResults.length = 0;

  comparisonResults.push(...savedProgress.comparisonResults);

  // マージタスク選択履歴を復元
  mergeTaskSelectionHistory.length = 0;

  mergeTaskSelectionHistory.push(
    ...(savedProgress.mergeTaskSelectionHistory || []),
  );

  // 中断時に表示されていた未回答タスクを復元
  pendingMergeTaskId = savedProgress.pendingMergeTaskId || null;

  // ランキング条件を復元
  currentRankingConditions = savedProgress.conditions;

  // 保存済みの比較結果を最初から再現
  mergeTaskReplayIndex = 0;
  replayIndex = 0;
  isReplaying = true;
}

// ==============================
// 4. 保存したランキングを再開
// ==============================

function resumeRanking(shouldPushHistory = true) {
  const savedProgress = loadRankingProgress();

  if (!savedProgress) {
    return;
  }

  restoreRankingProgress(savedProgress);

  hideAllScreens();

  compareScreen.style.display = "block";

  if (shouldPushHistory) {
    pushScreenHistory("compare");
  }

  startRanking(true);
}

// ==============================
// 5. ランキング途中保存・再開イベント
// ==============================

function setupRankingProgressEvents() {
  // ホーム → ランキングを再開
  resumeRankingButton.addEventListener("click", function () {
    resumeRanking();
  });

  // ランキングを中断
  pauseRankingButton.addEventListener("click", function () {
    saveRankingProgress();

    rankingRunId++;

    comparisonResolve = null;

    showHomeScreen();

    updateResumeRankingButton();
  });
}
