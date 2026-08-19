// ==============================
// ranking.js
// ランキング処理・進捗表示・結果表示
// ==============================

// ==============================
// 0-1. 新マージ方式の状態
// ==============================

let mergeTasks = [];

let mergeTaskSelectionHistory = [];

let mergeTaskReplayIndex = 0;

let currentMergeTaskId = null;

let forcedNextMergeTaskId = null;

let pendingMergeTaskId = null;

// ==============================
// 0-2. マージタスクを作成
// ==============================

function createMergeTasks(songList) {
  mergeTasks = [];

  let taskCounter = 0;

  // ------------------------------
  // 再帰的にタスク木を作る
  // ------------------------------

  function buildTaskTree(list) {
    // 1曲だけなら、その曲をそのまま返す
    if (list.length === 1) {
      return {
        type: "song",
        song: list[0],
      };
    }

    const middleIndex = Math.floor(list.length / 2);

    const leftList = list.slice(0, middleIndex);

    const rightList = list.slice(middleIndex);

    const leftSource = buildTaskTree(leftList);

    const rightSource = buildTaskTree(rightList);

    const taskId = `merge-${taskCounter}`;

    taskCounter++;

    const task = {
      id: taskId,

      leftSource: leftSource,

      rightSource: rightSource,

      leftList: null,
      rightList: null,

      leftIndex: 0,
      rightIndex: 0,

      mergedList: [],

      status: "waiting",
    };

    mergeTasks.push(task);

    return {
      type: "task",
      id: taskId,
    };
  }

  // タスク木のルートを作成
  const rootSource = buildTaskTree(songList);

  console.log("作成したマージタスク:", mergeTasks);

  console.log("ルート:", rootSource);

  return rootSource;
}

// ==============================
// 0-3. 実行可能なマージタスクを取得
// ==============================

function getAvailableMergeTasks() {
  return mergeTasks.filter(function (task) {
    // すでに完了しているタスクは除外
    if (task.status === "completed") {
      return false;
    }

    // 左側の材料が準備できているか
    const isLeftReady = isMergeSourceReady(task.leftSource);

    // 右側の材料が準備できているか
    const isRightReady = isMergeSourceReady(task.rightSource);

    return isLeftReady && isRightReady;
  });
}

// ==============================
// 0-4. マージ元が使用可能か確認
// ==============================

function isMergeSourceReady(source) {
  // 1曲そのものなら最初から使用可能
  if (source.type === "song") {
    return true;
  }

  // 別のマージタスクなら、
  // そのタスクが完了している必要がある
  if (source.type === "task") {
    const sourceTask = mergeTasks.find(function (task) {
      return task.id === source.id;
    });

    return sourceTask !== undefined && sourceTask.status === "completed";
  }

  return false;
}

// ==============================
// 0-5. 実行可能なタスクから
//      ランダムに1つ選ぶ
// ==============================

function selectRandomMergeTask() {
  const availableTasks = getAvailableMergeTasks();

  // 実行可能なタスクがない
  if (availableTasks.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * availableTasks.length);

  const selectedTask = availableTasks[randomIndex];

  return selectedTask;
}

// ==============================
// 0-6. 次に進めるマージタスクを取得
// ==============================

function selectNextMergeTask() {
  const availableTasks = getAvailableMergeTasks();

  // 実行可能なタスクがない
  if (availableTasks.length === 0) {
    return null;
  }

  // ------------------------------
  // リプレイ中
  // ------------------------------

  if (isReplaying && mergeTaskReplayIndex < mergeTaskSelectionHistory.length) {
    const savedTaskId = mergeTaskSelectionHistory[mergeTaskReplayIndex];

    const savedTask = availableTasks.find(function (task) {
      return task.id === savedTaskId;
    });

    if (savedTask) {
      return savedTask;
    }

    console.error("保存されたマージタスクを再現できません。", {
      mergeTaskReplayIndex,
      savedTaskId,
      availableTaskIds: availableTasks.map(function (task) {
        return task.id;
      }),
    });

    return null;
  }

  // ------------------------------
  // 途中再開時は、中断時に表示されていた
  // 未回答タスクを最優先で再表示
  // ------------------------------

  if (pendingMergeTaskId !== null && !isReplaying) {
    const pendingTask = availableTasks.find(function (task) {
      return task.id === pendingMergeTaskId;
    });

    if (pendingTask) {
      pendingMergeTaskId = null;

      return pendingTask;
    }

    console.error("中断時のマージタスクを再現できません。", {
      pendingMergeTaskId,
      availableTaskIds: availableTasks.map(function (task) {
        return task.id;
      }),
    });

    pendingMergeTaskId = null;
  }

  // ------------------------------
  // Undo直後は、取り消した比較の
  // マージタスクを最優先で再表示
  // ------------------------------

  if (forcedNextMergeTaskId !== null && !isReplaying) {
    const forcedTask = availableTasks.find(function (task) {
      return task.id === forcedNextMergeTaskId;
    });

    if (forcedTask) {
      forcedNextMergeTaskId = null;

      return forcedTask;
    }

    console.error("Undo対象のマージタスクを再現できません。", {
      forcedNextMergeTaskId,
      availableTaskIds: availableTasks.map(function (task) {
        return task.id;
      }),
    });

    forcedNextMergeTaskId = null;
  }

  // ------------------------------
  // 通常時はランダム
  // ------------------------------

  return selectRandomMergeTask();
}

// ==============================
// 0-6. マージ元から並びを取得
// ==============================

function getMergeSourceList(source) {
  // 1曲そのもの
  if (source.type === "song") {
    return [source.song];
  }

  // 完了済みのマージタスク
  if (source.type === "task") {
    const sourceTask = mergeTasks.find(function (task) {
      return task.id === source.id;
    });

    if (sourceTask && sourceTask.status === "completed") {
      return [...sourceTask.mergedList];
    }
  }

  return null;
}

// ==============================
// 0-7. マージタスクを1比較だけ進める
// ==============================

async function advanceMergeTask(task) {
  // この呼び出しで何曲分マージが進んだか確認するため、
  // 開始時点の確定曲数を記録
  const mergedCountBefore = task.mergedList.length;

  // ------------------------------
  // 初回だけ左右の並びを準備
  // ------------------------------

  if (task.status === "waiting") {
    task.leftList = getMergeSourceList(task.leftSource);

    task.rightList = getMergeSourceList(task.rightSource);

    // まだ材料が揃っていない
    if (task.leftList === null || task.rightList === null) {
      return false;
    }

    task.status = "running";
  }

  // ------------------------------
  // 左右どちらかを使い切っていたら
  // 残りを追加して完了
  // ------------------------------

  if (task.leftIndex >= task.leftList.length) {
    while (task.rightIndex < task.rightList.length) {
      task.mergedList.push(task.rightList[task.rightIndex]);

      task.rightIndex++;
    }

    task.status = "completed";

    return task.mergedList.length - mergedCountBefore;
  }

  if (task.rightIndex >= task.rightList.length) {
    while (task.leftIndex < task.leftList.length) {
      task.mergedList.push(task.leftList[task.leftIndex]);

      task.leftIndex++;
    }

    task.status = "completed";

    return task.mergedList.length - mergedCountBefore;
  }

  // ------------------------------
  // 今回比較する2曲
  // ------------------------------

  const leftSong = task.leftList[task.leftIndex];

  const rightSong = task.rightList[task.rightIndex];

  // 今回の比較がどのマージタスクか記録
  currentMergeTaskId = task.id;

  // この比較が保存済み履歴のリプレイか確認
  const willReplay = isReplaying && replayIndex < comparisonResults.length;

  // 実際にユーザーの回答を待つ比較だけ、
  // 未回答タスクとして保存する
  if (!willReplay) {
    pendingMergeTaskId = task.id;

    saveRankingProgress();
  }

  const winner = await compareSongs(leftSong, rightSong);

  // ------------------------------
  // 選ばれた曲を確定
  // ------------------------------

  if (winner === leftSong) {
    task.mergedList.push(leftSong);

    task.leftIndex++;
  } else {
    task.mergedList.push(rightSong);

    task.rightIndex++;
  }

  // ------------------------------
  // 比較後に片側を使い切った場合
  // 残りを追加して完了
  // ------------------------------

  if (task.leftIndex >= task.leftList.length) {
    while (task.rightIndex < task.rightList.length) {
      task.mergedList.push(task.rightList[task.rightIndex]);

      task.rightIndex++;
    }

    task.status = "completed";
  } else if (task.rightIndex >= task.rightList.length) {
    while (task.leftIndex < task.leftList.length) {
      task.mergedList.push(task.leftList[task.leftIndex]);

      task.leftIndex++;
    }

    task.status = "completed";
  }

  return task.mergedList.length - mergedCountBefore;
}

// ==============================
// 0-8. ランダム化マージソートを実行
// ==============================

async function runRandomizedMergeSort(songList, currentRunId) {
  // ------------------------------
  // タスク木を作成
  // ------------------------------

  const rootSource = createMergeTasks(songList);

  // 1曲だけの場合
  if (rootSource.type === "song") {
    return [rootSource.song];
  }

  const rootTaskId = rootSource.id;

  // ------------------------------
  // ルートタスクが完成するまで繰り返す
  // ------------------------------

  while (true) {
    // 古いランキング処理なら終了
    if (currentRunId !== rankingRunId) {
      return [];
    }

    const rootTask = mergeTasks.find(function (task) {
      return task.id === rootTaskId;
    });

    // ルート完成 = ランキング完成
    if (rootTask && rootTask.status === "completed") {
      return [...rootTask.mergedList];
    }

    // ------------------------------
    // 次に進めるタスクを選択
    // ------------------------------

    const selectedTask = selectNextMergeTask();

    if (!selectedTask) {
      console.error("実行可能なマージタスクがありません。", {
        mergeTasks,
        mergeTaskSelectionHistory,
        mergeTaskReplayIndex,
      });

      return [];
    }

    // ------------------------------
    // タスクを1比較進める
    // ------------------------------

    const wasReplaying = isReplaying;

    const replayIndexBefore = replayIndex;

    const advancedSteps = await advanceMergeTask(selectedTask);

    // 比較待ち中に別ランキングになった場合
    if (currentRunId !== rankingRunId) {
      return [];
    }

    if (advancedSteps <= 0) {
      console.error("マージタスクを進められませんでした。", selectedTask);

      return [];
    }

    // ------------------------------
    // リプレイ時に実際に比較を再現した場合だけ
    // タスク履歴の位置も進める
    // ------------------------------

    if (wasReplaying && replayIndex > replayIndexBefore) {
      mergeTaskReplayIndex++;
    }

    // ------------------------------
    // 進捗
    // ------------------------------

    completedMergeSteps += advancedSteps;

    updateProgress();
  }
}

// ==============================
// 1. 比較処理の総ステップ数を計算
// ==============================

function calculateTotalMergeSteps(length) {
  if (length <= 1) {
    return 0;
  }

  const leftLength = Math.floor(length / 2);

  const rightLength = length - leftLength;

  return (
    length +
    calculateTotalMergeSteps(leftLength) +
    calculateTotalMergeSteps(rightLength)
  );
}

// ==============================
// 2. 進捗表示を更新
// ==============================

function updateProgress() {
  if (totalMergeSteps === 0) {
    progressPercent = 100;
  } else {
    progressPercent = Math.round((completedMergeSteps / totalMergeSteps) * 100);
  }

  // 計算誤差などで100%を超えないようにする
  progressPercent = Math.min(progressPercent, 100);

  progressText.textContent = `進捗 ${progressPercent}%`;

  progressFill.style.width = `${progressPercent}%`;
}


// ==============================
// 6. 楽曲の順番をシャッフル
// ==============================

function shuffleSongs(songListToShuffle) {
  const shuffledSongs = [...songListToShuffle];

  for (let i = shuffledSongs.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [shuffledSongs[i], shuffledSongs[randomIndex]] = [
      shuffledSongs[randomIndex],
      shuffledSongs[i],
    ];
  }

  return shuffledSongs;
}



// ==============================
// 8. ランキングを開始
// ==============================

async function startRanking(isReplay = false) {
  // ----------
  // ランキング処理を開始
  // ----------

  // 新しいランキング処理の番号を発行
  rankingRunId++;

  const currentRunId = rankingRunId;

  // ----------
  // 新マージ方式の状態を初期化
  // ----------

  currentMergeTaskId = null;

  mergeTaskReplayIndex = 0;

  // 新規ランキングのときだけ
  // 過去のタスク選択履歴を消す
  if (!isReplay) {
    mergeTaskSelectionHistory.length = 0;
  }

  // ----------
  // 進捗を初期化
  // ----------

  completedMergeSteps = 0;
  progressPercent = 0;

  totalMergeSteps = calculateTotalMergeSteps(rankingTargetSongs.length);

  progressText.textContent = "進捗 0%";

  progressFill.style.width = "0%";

  // ----------
  // ランキング対象が0曲の場合
  // ----------

  if (rankingTargetSongs.length === 0) {
    rankingList.innerHTML = `
            <p>
                ランキング対象の楽曲がありません。
            </p>
        `;

    showResultScreen();

    return;
  }

  // ----------
  // ランキング対象が1曲の場合
  // ----------

  if (rankingTargetSongs.length === 1) {
    const ranking = [...rankingTargetSongs];

    displayRanking(ranking);

    saveRankingResult(ranking);

    // 完了したので途中保存データを削除
    localStorage.removeItem("rankingProgress");

    displayRankingConditions();

    progressPercent = 100;

    progressText.textContent = "進捗 100%";

    progressFill.style.width = "100%";

    showResultScreen();

    return;
  }

  // ----------
  // ランキングを実行
  // ----------

  // 新しくランキングを開始するときだけシャッフル
  if (!isReplay) {
    currentRankingSongOrder = shuffleSongs(rankingTargetSongs);
  }

  const ranking = await runRandomizedMergeSort(
    [...currentRankingSongOrder],
    currentRunId,
  );

  // このランキング処理が古くなっていたら終了
  if (currentRunId !== rankingRunId) {
    return;
  }

  // ----------
  // ランキング結果を表示
  // ----------

  progressPercent = 100;

  progressText.textContent = "進捗 100%";

  progressFill.style.width = "100%";

  displayRanking(ranking);

  // 画像保存・共有用にランキングデータを渡す
  setRankingImageTarget(ranking, currentRankingConditions);

  const resultId = saveRankingResult(ranking);

  console.log("saveRankingResultから返ったID:", resultId);

  // 完了したので途中保存データを削除
  localStorage.removeItem("rankingProgress");

  // 再開ボタンの表示を更新
  updateResumeRankingButton();

  displayRankingConditions();

  showResultScreen(resultId);
}


// ==============================
// 10. ランキング結果を保存
// ==============================

function saveRankingResult(ranking) {
  const rankingHistory =
    JSON.parse(localStorage.getItem("rankingHistory")) || [];

  const rankingResult = {
    id: Date.now(),

    date: new Date().toISOString(),

    conditions: {
      songCount: currentRankingConditions.songCount,

      albums: [...currentRankingConditions.albums],

      musicTypes: [...currentRankingConditions.musicTypes],

      categories: [...currentRankingConditions.categories],

      mvStatus: [...currentRankingConditions.mvStatus],
    },

    ranking: ranking.map(function (song) {
      return {
        title: song.title,
        image: song.image,
        imageType: song.imageType,
      };
    }),
  };

  rankingHistory.unshift(rankingResult);

  localStorage.setItem("rankingHistory", JSON.stringify(rankingHistory));

  return rankingResult.id;
}

// ==============================
// ランキング途中状態を保存
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
// ランキング途中状態を読み込む
// ==============================

function loadRankingProgress() {
  const savedProgress = localStorage.getItem("rankingProgress");

  if (!savedProgress) {
    return null;
  }

  try {
    return JSON.parse(savedProgress);
  } catch (error) {
    console.error("ランキング途中データの読み込みに失敗しました。", error);

    localStorage.removeItem("rankingProgress");

    return null;
  }
}

// ==============================
// ランキング途中状態を復元
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
// 保存したランキングを再開
// ==============================

function resumeRanking() {
  const savedProgress = loadRankingProgress();

  if (!savedProgress) {
    return;
  }

  restoreRankingProgress(savedProgress);

  hideAllScreens();

  compareScreen.style.display = "block";

  startRanking(true);
}

