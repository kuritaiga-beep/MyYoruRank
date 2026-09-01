// ==============================
// ranking-edit.js
// 完成ランキングの手動編集
// ==============================

// ==============================
// 1. DOM要素の取得
// ==============================

const editRankingButton = document.getElementById("edit-ranking-button");

const saveRankingImageButton = document.getElementById(
  "save-ranking-image-button",
);

const cancelRankingEditButton = document.getElementById(
  "cancel-ranking-edit-button",
);

// ==============================
// 2. 編集状態
// ==============================

let isRankingEditing = false;

// 編集中のランキング
let workingRanking = null;

// 編集対象のランキングID
let editingRankingId = null;

// 編集内容に変更があったか
let hasRankingEditChanges = false;

// ==============================
// 3. 編集モードを開始
// ==============================

function startRankingEditMode() {
  isRankingEditing = true;

  editRankingButton.textContent = "編集を確定";

  cancelRankingEditButton.hidden = false;

  // 編集時は全曲ランキングを表示する
  isShowingAllRanking = true;

  resultScreen.classList.add("show-all-ranking");

  toggleRankingButton.textContent = "トップ10だけ表示";

  // 編集中は他の主要操作を無効化
  toggleRankingButton.disabled = true;
  saveRankingImageButton.disabled = true;
  restartButton.disabled = true;

  const resultId = history.state?.resultId;

  const rankingHistory =
    JSON.parse(localStorage.getItem("rankingHistory")) || [];

  const selectedHistory = rankingHistory.find(function (rankingResult) {
    return rankingResult.id === resultId;
  });

  if (!selectedHistory) {
    console.error("編集対象のランキングが見つかりません。", resultId);
    return;
  }

  editingRankingId = selectedHistory.id;

  hasRankingEditChanges = false;

  workingRanking = selectedHistory.ranking.map(function (song) {
    return { ...song };
  });

  showRankingEditControls();
}

// ==============================
// 4. 編集中ランキングを再表示
// ==============================

function renderWorkingRanking() {
  if (!workingRanking) {
    return;
  }

  displayRanking(workingRanking);

  // 編集中は常に全曲表示
  isShowingAllRanking = true;

  resultScreen.classList.add("show-all-ranking");

  toggleRankingButton.textContent = "トップ10だけ表示";

  showRankingEditControls();
}

// ==============================
// 5. 順位変更ボタンを表示
// ==============================

function showRankingEditControls() {
  const rankingItems = rankingList.querySelectorAll(".ranking-item");

  rankingItems.forEach(function (rankingItem, index) {
    const controls = document.createElement("div");

    controls.classList.add("ranking-edit-controls");

    controls.innerHTML = `
      <button
        type="button"
        class="ranking-move-up-button"
        data-ranking-index="${index}"
        ${index === 0 ? "disabled" : ""}
      >
        ↑
      </button>

      <button
        type="button"
        class="ranking-move-down-button"
        data-ranking-index="${index}"
        ${index === rankingItems.length - 1 ? "disabled" : ""}
      >
        ↓
      </button>
    `;

    rankingItem.appendChild(controls);

    const moveUpButton = controls.querySelector(".ranking-move-up-button");

    const moveDownButton = controls.querySelector(".ranking-move-down-button");

    moveUpButton.addEventListener("click", function () {
      moveRankingSong(index, index - 1);
    });

    moveDownButton.addEventListener("click", function () {
      moveRankingSong(index, index + 1);
    });
  });
}

// ==============================
// 6. 順位を1つ移動
// ==============================

function moveRankingSong(fromIndex, toIndex) {
  if (!workingRanking) {
    return;
  }

  if (toIndex < 0 || toIndex >= workingRanking.length) {
    return;
  }

  const [movedSong] = workingRanking.splice(fromIndex, 1);

  workingRanking.splice(toIndex, 0, movedSong);

  hasRankingEditChanges = true;

  renderWorkingRanking();
}

// ==============================
// 7. 編集内容を確定
// ==============================

function confirmRankingEditMode() {
  if (!workingRanking || editingRankingId === null) {
    return;
  }

  const rankingHistory =
    JSON.parse(localStorage.getItem("rankingHistory")) || [];

  const selectedHistory = rankingHistory.find(function (history) {
    return history.id === editingRankingId;
  });

  if (!selectedHistory) {
    console.error("確定対象のランキングが見つかりません。", editingRankingId);

    return;
  }

  if (hasRankingEditChanges) {
    selectedHistory.ranking = workingRanking.map(function (song) {
      return { ...song };
    });

    selectedHistory.edited = true;

    localStorage.setItem("rankingHistory", JSON.stringify(rankingHistory));
  }

  // 確定後のランキングを正式表示
  displayRanking(selectedHistory.ranking);

  // 画像保存・共有対象も更新
  setRankingImageTarget(selectedHistory.ranking, selectedHistory.conditions);

  isRankingEditing = false;

  editRankingButton.textContent = "順位を編集";

  cancelRankingEditButton.hidden = true;

  toggleRankingButton.disabled = false;
  saveRankingImageButton.disabled = false;
  restartButton.disabled = false;

  workingRanking = null;
  editingRankingId = null;
  hasRankingEditChanges = false;
}

// ==============================
// 8. 編集モードをキャンセル
// ==============================

function cancelRankingEditMode() {
  document
    .querySelectorAll(".ranking-edit-controls")
    .forEach(function (controls) {
      controls.remove();
    });

  isRankingEditing = false;

  editRankingButton.textContent = "順位を編集";

  cancelRankingEditButton.hidden = true;

  // トップ10表示に戻す
  isShowingAllRanking = false;

  resultScreen.classList.remove("show-all-ranking");

  toggleRankingButton.textContent = "全曲ランキングを表示";

  // 編集中に無効化した操作を戻す
  toggleRankingButton.disabled = false;
  saveRankingImageButton.disabled = false;
  restartButton.disabled = false;

  workingRanking = null;
  editingRankingId = null;
}

// ==============================
// 9. イベント登録
// ==============================

editRankingButton.addEventListener("click", function () {
  if (isRankingEditing) {
    confirmRankingEditMode();
    return;
  }

  startRankingEditMode();
});

cancelRankingEditButton.addEventListener("click", function () {
  if (!isRankingEditing) {
    return;
  }

  cancelRankingEditMode();
});
