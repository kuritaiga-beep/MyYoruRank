// ==============================
// ranking.js
// ランキング生成・マージ処理・進捗管理
// ==============================

// ==============================
// 1. 新マージ方式の状態
// ==============================

let mergeTasks = [];

let mergeTaskSelectionHistory = [];

let mergeTaskReplayIndex = 0;

let currentMergeTaskId = null;

let forcedNextMergeTaskId = null;

let pendingMergeTaskId = null;

// ==============================
// 2. マージタスクを作成
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

  return rootSource;
}

// ==============================
// 3. 実行可能なマージタスクを取得
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
// 4. マージ元が使用可能か確認
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
// 5. 実行可能なタスクから
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
// 6. 次に進めるマージタスクを取得
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
// 7. マージ元から並びを取得
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
// 8. マージタスクを1比較だけ進める
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
// 9. ランダム化マージソートを実行
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
// 10. 比較処理の総ステップ数を計算
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
// 11. 進捗表示を更新
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
// 12. 楽曲の順番をシャッフル
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
// 13. ランキングを開始
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

  // 完了したので途中保存データを削除
  localStorage.removeItem("rankingProgress");

  // 再開ボタンの表示を更新
  updateResumeRankingButton();

  displayRankingConditions();

  showResultScreen(resultId);
}
