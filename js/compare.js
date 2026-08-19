// ==============================
// compare.js
// 比較画面・楽曲選択・試聴・Undo処理
// ==============================

// ==============================
// 1. 比較中の楽曲を画面に表示
// ==============================

function displaySongs() {
  leftTitle.textContent = currentLeftSong.title;
  rightTitle.textContent = currentRightSong.title;

  leftImage.src = currentLeftSong.image;
  rightImage.src = currentRightSong.image;

  leftImage.alt = currentLeftSong.title;
  rightImage.alt = currentRightSong.title;

  // 前回の画像タイプをリセット
  leftImage.classList.remove("mv-image", "jacket-image");
  rightImage.classList.remove("mv-image", "jacket-image");

  // 現在の画像タイプを適用
  if (currentLeftSong.imageType) {
    leftImage.classList.add(`${currentLeftSong.imageType}-image`);
  }

  if (currentRightSong.imageType) {
    rightImage.classList.add(`${currentRightSong.imageType}-image`);
  }

  // 試聴ボタンの表示を切り替える
  leftPreviewButton.style.display = currentLeftSong.youtubeUrl
    ? "block"
    : "none";

  rightPreviewButton.style.display = currentRightSong.youtubeUrl
    ? "block"
    : "none";
}

// ==============================
// 2. 2曲を比較する
// ==============================

function compareSongs(leftSong, rightSong) {
  currentLeftSong = leftSong;
  currentRightSong = rightSong;

  displaySongs();

  // Undo後は保存済みの選択履歴を再現する
  if (isReplaying && replayIndex < comparisonResults.length) {
    const savedResult = comparisonResults[replayIndex];

    const isSameOrder =
      savedResult.leftSong === leftSong.title &&
      savedResult.rightSong === rightSong.title;

    const isReverseOrder =
      savedResult.leftSong === rightSong.title &&
      savedResult.rightSong === leftSong.title;

    if (isSameOrder || isReverseOrder) {
      replayIndex++;

      // 保存済み履歴をすべて再現した場合は
      // ここでリプレイ状態を終了する
      if (replayIndex >= comparisonResults.length) {
        isReplaying = false;

        undoButton.disabled = comparisonResults.length === 0;
      }

      if (savedResult.selectedSong === leftSong.title) {
        return Promise.resolve(leftSong);
      }

      if (savedResult.selectedSong === rightSong.title) {
        return Promise.resolve(rightSong);
      }
    }

    // 履歴と現在の比較内容が一致しない場合
    console.error("比較履歴が一致しません。", {
      replayIndex,
      savedResult,
      currentLeft: leftSong.title,
      currentRight: rightSong.title,
      historyLength: comparisonResults.length,
    });
  }

  // 保存済み履歴をすべて再現したら、
  // 削除した直前の比較で通常操作へ戻る
  if (isReplaying && replayIndex >= comparisonResults.length) {
    isReplaying = false;

    undoButton.disabled = comparisonResults.length === 0;
  }

  // ユーザーの選択を待つ
  return new Promise(function (resolve) {
    comparisonResolve = resolve;
  });
}

// ==============================
// 3. 楽曲を選択
// ==============================

function selectSong(selectedSong) {
  // 比較待ちでない場合は何もしない
  if (comparisonResolve === null) {
    return;
  }

  comparisonResults.push({
    leftSong: currentLeftSong.title,
    rightSong: currentRightSong.title,
    selectedSong: selectedSong.title,
  });

  // 新マージ方式での比較なら、
  // 使用したマージタスクも同時に記録
  if (currentMergeTaskId !== null) {
    mergeTaskSelectionHistory.push(currentMergeTaskId);
  }

  pendingMergeTaskId = null;

  saveRankingProgress();

  undoButton.disabled = false;

  const resolve = comparisonResolve;

  comparisonResolve = null;

  resolve(selectedSong);
}

// ==============================
// 4. 左側の楽曲を選択
// ==============================

function selectLeftSong() {
  selectSong(currentLeftSong);
}

// ==============================
// 5. 右側の楽曲を選択
// ==============================

function selectRightSong() {
  selectSong(currentRightSong);
}

// ==============================
// 6. YouTubeで楽曲を確認
// ==============================

function openSongPreview(song) {
  if (!song.youtubeUrl) {
    alert("この曲はまだ試聴できません。");

    return;
  }

  window.open(song.youtubeUrl, "_blank", "noopener,noreferrer");
}

// ==============================
// 7. 一つ前の選択に戻る
// ==============================

function undoLastSelection() {
  if (comparisonResults.length === 0) {
    return;
  }

  // 最後の選択履歴を削除
  comparisonResults.pop();

  // Undoした比較のマージタスクIDを保存
  if (mergeTaskSelectionHistory.length > 0) {
    forcedNextMergeTaskId =
      mergeTaskSelectionHistory[mergeTaskSelectionHistory.length - 1];

    mergeTaskSelectionHistory.pop();

    // Undoでは現在表示中の未回答比較は破棄
    pendingMergeTaskId = null;
  } else {
    forcedNextMergeTaskId = null;
  }

  // 中断データも現在の比較履歴に更新
  saveRankingProgress();

  // 保存済み履歴を最初から再現する
  replayIndex = 0;
  isReplaying = true;

  // 古い比較待ちを解除
  comparisonResolve = null;

  // 再実行中の誤操作を防ぐ
  undoButton.disabled = true;

  // 同じ曲順でランキングを再計算
  startRanking(true);
}

// ==============================
// 8. 比較画面イベント
// ==============================

function setupCompareEvents() {
  // 左側の楽曲を選択
  leftCard.addEventListener("click", function () {
    selectLeftSong();
  });

  // 右側の楽曲を選択
  rightCard.addEventListener("click", function () {
    selectRightSong();
  });

  // 左側の曲をYouTubeで確認
  leftPreviewButton.addEventListener("click", function (event) {
    event.stopPropagation();

    openSongPreview(currentLeftSong);
  });

  // 右側の曲をYouTubeで確認
  rightPreviewButton.addEventListener("click", function (event) {
    event.stopPropagation();

    openSongPreview(currentRightSong);
  });

  // 一つ前の選択に戻る
  undoButton.addEventListener("click", function () {
    undoLastSelection();
  });
}
