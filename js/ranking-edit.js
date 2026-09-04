// ==============================
// ranking-edit.js
// 完成ランキングの手動編集
// ==============================

// ==============================
// 1. DOM要素の取得
// ==============================

const editRankingButton = document.getElementById("edit-ranking-button");

const resultEditedBadge = document.getElementById("result-edited-badge");

const saveRankingImageButton = document.getElementById(
  "save-ranking-image-button",
);

const cancelRankingEditButton = document.getElementById(
  "cancel-ranking-edit-button",
);

const historyEditRankingButton = document.getElementById(
  "history-edit-ranking-button",
);

const historyCancelRankingEditButton = document.getElementById(
  "history-cancel-ranking-edit-button",
);

const historyRankingToggleButton = document.getElementById(
  "ranking-history-toggle-button",
);

const addRankingSongButton = document.getElementById("add-ranking-song-button");

const historyAddRankingSongButton = document.getElementById(
  "history-add-ranking-song-button",
);

const rankingSongAddPanel = document.getElementById("ranking-song-add-panel");

const rankingSongAddSearch = document.getElementById("ranking-song-add-search");

const rankingSongAddList = document.getElementById("ranking-song-add-list");

const rankingSongAddCancelButton = document.getElementById(
  "ranking-song-add-cancel-button",
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

// 編集元の画面
let rankingEditSource = null;

// ==============================
// 3. 編集モードを開始
// ==============================

function startRankingEditMode() {
  isRankingEditing = true;

  editRankingButton.textContent = "編集を確定";

  cancelRankingEditButton.hidden = false;

  addRankingSongButton.hidden = false;

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

  rankingEditSource = "result";

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

    if (workingRanking[index]?.manuallyAdded === true) {
      const deleteButton = document.createElement("button");

      deleteButton.type = "button";
      deleteButton.classList.add("ranking-delete-button");
      deleteButton.dataset.rankingIndex = index;
      deleteButton.textContent = "削除";

      deleteButton.addEventListener("click", function () {
        deleteRankingSong(index, renderWorkingRanking);
      });

      controls.appendChild(deleteButton);
    }

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

function moveRankingSong(
  fromIndex,
  toIndex,
  renderFunction = renderWorkingRanking,
) {
  if (!workingRanking) {
    return;
  }

  if (toIndex < 0 || toIndex >= workingRanking.length) {
    return;
  }

  const [movedSong] = workingRanking.splice(fromIndex, 1);

  workingRanking.splice(toIndex, 0, movedSong);

  hasRankingEditChanges = true;

  renderFunction();
}

// ==============================
// 手動追加した楽曲を削除
// ==============================

function deleteRankingSong(index, renderFunction) {
  if (!workingRanking) {
    return;
  }

  const targetSong = workingRanking[index];

  if (!targetSong || targetSong.manuallyAdded !== true) {
    return;
  }

  workingRanking.splice(index, 1);

  hasRankingEditChanges = true;

  renderFunction();
}

// ==============================
// 7. 編集内容を確定
// ==============================

function confirmRankingEditMode() {
  if (!workingRanking || editingRankingId === null) {
    return;
  }

  closeRankingSongAddPanel();

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

  resultEditedBadge.hidden = selectedHistory.edited !== true;

  // 確定後のランキングを正式表示
  displayRanking(selectedHistory.ranking);

  // 画像保存・共有対象も更新
  setRankingImageTarget(selectedHistory.ranking, selectedHistory.conditions);

  isRankingEditing = false;

  editRankingButton.textContent = "順位を編集";

  cancelRankingEditButton.hidden = true;

  addRankingSongButton.hidden = true;

  toggleRankingButton.disabled = false;
  saveRankingImageButton.disabled = false;
  restartButton.disabled = false;

  workingRanking = null;
  editingRankingId = null;
  hasRankingEditChanges = false;
}

// ==============================
// 履歴詳細の編集モードを開始
// ==============================

function startHistoryRankingEditMode() {
  const rankingId = history.state?.rankingId;

  const rankingHistory =
    JSON.parse(localStorage.getItem("rankingHistory")) || [];

  const selectedHistory = rankingHistory.find(function (rankingResult) {
    return rankingResult.id === rankingId;
  });

  if (!selectedHistory) {
    console.error("編集対象のランキングが見つかりません。", rankingId);
    return;
  }

  isRankingEditing = true;

  editingRankingId = selectedHistory.id;

  rankingEditSource = "history";

  workingRanking = selectedHistory.ranking.map(function (song) {
    return { ...song };
  });

  hasRankingEditChanges = false;

  historyEditRankingButton.textContent = "編集を確定";

  historyCancelRankingEditButton.hidden = false;

  historyAddRankingSongButton.hidden = false;

  // 編集時は全曲表示
  isShowingAllHistoryRanking = true;

  rankingHistoryDetailScreen.classList.add("show-all-ranking");

  historyRankingToggleButton.textContent = "トップ10だけ表示";

  // 編集中は画面移動などを無効化
  historyRankingToggleButton.disabled = true;

  rankingHistoryDetailBackButton.disabled = true;

  showHistoryRankingEditControls();
}

// ==============================
// 履歴詳細の順位変更ボタンを表示
// ==============================
function renderHistoryWorkingRanking() {
  if (!workingRanking) {
    return;
  }

  rankingHistoryDetailList.innerHTML = "";

  workingRanking.forEach(function (song, index) {
    const rankingItem = document.createElement("div");

    rankingItem.classList.add("ranking-item");

    if (index >= 10) {
      rankingItem.classList.add("ranking-hidden-item");
    }

    const rankingPosition = getRankingPosition(index);

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

    const rankingImage = rankingItem.querySelector(".ranking-image");

    if (rankingImage && song.imageType) {
      rankingImage.classList.add(`${song.imageType}-image`);
    }

    rankingHistoryDetailList.appendChild(rankingItem);
  });

  // 編集中は常に全曲表示
  isShowingAllHistoryRanking = true;

  rankingHistoryDetailScreen.classList.add("show-all-ranking");

  historyRankingToggleButton.textContent = "トップ10だけ表示";

  showHistoryRankingEditControls();
}

function showHistoryRankingEditControls() {
  const rankingItems =
    rankingHistoryDetailList.querySelectorAll(".ranking-item");

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

    if (workingRanking[index]?.manuallyAdded === true) {
      const deleteButton = document.createElement("button");

      deleteButton.type = "button";
      deleteButton.classList.add("ranking-delete-button");
      deleteButton.dataset.rankingIndex = index;
      deleteButton.textContent = "削除";

      deleteButton.addEventListener("click", function () {
        deleteRankingSong(index, renderHistoryWorkingRanking);
      });

      controls.appendChild(deleteButton);
    }

    rankingItem.appendChild(controls);

    const moveUpButton = controls.querySelector(".ranking-move-up-button");

    const moveDownButton = controls.querySelector(".ranking-move-down-button");

    moveUpButton.addEventListener("click", function () {
      moveRankingSong(index, index - 1, renderHistoryWorkingRanking);
    });

    moveDownButton.addEventListener("click", function () {
      moveRankingSong(index, index + 1, renderHistoryWorkingRanking);
    });
  });
}

// ==============================
// 履歴詳細の編集内容を確定
// ==============================

function confirmHistoryRankingEditMode() {
  if (!workingRanking || editingRankingId === null) {
    return;
  }

  closeRankingSongAddPanel();

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

  const confirmedRankingId = editingRankingId;

  isRankingEditing = false;

  historyEditRankingButton.textContent = "順位を編集";

  historyCancelRankingEditButton.hidden = true;

  historyAddRankingSongButton.hidden = true;

  historyRankingToggleButton.disabled = false;

  rankingHistoryDetailBackButton.disabled = false;

  workingRanking = null;

  editingRankingId = null;

  hasRankingEditChanges = false;

  // 確定後の保存データから履歴詳細を再表示
  showRankingHistoryDetail(rankingHistory, confirmedRankingId, false);

  historyRankingToggleButton.textContent = "全曲ランキングを表示";
}

// ==============================
// 履歴詳細の編集モードをキャンセル
// ==============================

function cancelHistoryRankingEditMode() {
  if (editingRankingId === null) {
    return;
  }

  closeRankingSongAddPanel();

  const rankingHistory =
    JSON.parse(localStorage.getItem("rankingHistory")) || [];

  const cancelledRankingId = editingRankingId;

  isRankingEditing = false;

  historyEditRankingButton.textContent = "順位を編集";

  historyCancelRankingEditButton.hidden = true;

  historyAddRankingSongButton.hidden = true;

  historyRankingToggleButton.disabled = false;

  rankingHistoryDetailBackButton.disabled = false;

  workingRanking = null;

  editingRankingId = null;

  hasRankingEditChanges = false;

  // 保存されている元ランキングから履歴詳細を再表示
  showRankingHistoryDetail(rankingHistory, cancelledRankingId, false);

  historyRankingToggleButton.textContent = "全曲ランキングを表示";
}

// ==============================
// 8. 編集モードをキャンセル
// ==============================

function cancelRankingEditMode() {
  if (editingRankingId === null) {
    return;
  }

  const rankingHistory =
    JSON.parse(localStorage.getItem("rankingHistory")) || [];

  const selectedHistory = rankingHistory.find(function (history) {
    return history.id === editingRankingId;
  });

  if (!selectedHistory) {
    console.error(
      "キャンセル対象のランキングが見つかりません。",
      editingRankingId,
    );

    return;
  }

  closeRankingSongAddPanel();

  document
    .querySelectorAll(".ranking-edit-controls")
    .forEach(function (controls) {
      controls.remove();
    });

  // 保存済みの元ランキングを再表示
  displayRanking(selectedHistory.ranking);

  setRankingImageTarget(selectedHistory.ranking, selectedHistory.conditions);

  isRankingEditing = false;

  editRankingButton.textContent = "順位を編集";

  cancelRankingEditButton.hidden = true;

  addRankingSongButton.hidden = true;

  // トップ10表示に戻す
  isShowingAllRanking = false;

  resultScreen.classList.remove("show-all-ranking");

  toggleRankingButton.textContent = "全曲ランキングを表示";

  toggleRankingButton.disabled = false;
  saveRankingImageButton.disabled = false;
  restartButton.disabled = false;

  workingRanking = null;
  editingRankingId = null;
  hasRankingEditChanges = false;
  rankingEditSource = null;
}

// ==============================
// 追加可能な楽曲を取得
// ==============================

function getAddableRankingSongs() {
  if (!workingRanking) {
    return [];
  }

  return songs.filter(function (song) {
    return !workingRanking.some(function (rankingSong) {
      return rankingSong.title === song.title;
    });
  });
}

// ==============================
// 追加可能な楽曲一覧を表示
// ==============================

function renderAddableRankingSongs(searchText = "") {
  const addableSongs = getAddableRankingSongs();

  const normalizedSearchText = searchText.trim().toLowerCase();

  const filteredSongs = addableSongs.filter(function (song) {
    return song.title.toLowerCase().includes(normalizedSearchText);
  });

  rankingSongAddList.innerHTML = "";

  if (filteredSongs.length === 0) {
    rankingSongAddList.innerHTML = `
      <p class="ranking-song-add-empty">
        追加できる楽曲はありません
      </p>
    `;

    return;
  }

  filteredSongs.forEach(function (song) {
    const songItem = document.createElement("button");

    songItem.type = "button";

    songItem.classList.add("ranking-song-add-item");

    songItem.textContent = song.title;

    songItem.addEventListener("click", function () {
      addSongToWorkingRanking(song);
    });

    rankingSongAddList.appendChild(songItem);
  });
}

// ==============================
// ランキングへ楽曲を追加
// ==============================

function addSongToWorkingRanking(song) {
  if (!workingRanking) {
    return;
  }

  workingRanking.push({
    title: song.title,
    image: song.image,
    imageType: song.imageType,
    manuallyAdded: true,
  });

  hasRankingEditChanges = true;

  closeRankingSongAddPanel();

  if (rankingEditSource === "history") {
    renderHistoryWorkingRanking();
    return;
  }

  renderWorkingRanking();
}

// ==============================
// 楽曲追加パネルを開く
// ==============================

function openRankingSongAddPanel() {
  if (!isRankingEditing || !workingRanking) {
    return;
  }

  rankingSongAddPanel.hidden = false;

  rankingSongAddSearch.value = "";

  renderAddableRankingSongs();
}

// ==============================
// 楽曲追加パネルを閉じる
// ==============================

function closeRankingSongAddPanel() {
  rankingSongAddPanel.hidden = true;

  rankingSongAddSearch.value = "";

  rankingSongAddList.innerHTML = "";
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

historyEditRankingButton.addEventListener("click", function () {
  if (isRankingEditing) {
    confirmHistoryRankingEditMode();
    return;
  }

  startHistoryRankingEditMode();
});

historyCancelRankingEditButton.addEventListener("click", function () {
  if (!isRankingEditing) {
    return;
  }

  cancelHistoryRankingEditMode();
});

addRankingSongButton.addEventListener("click", function () {
  openRankingSongAddPanel();
});

historyAddRankingSongButton.addEventListener("click", function () {
  openRankingSongAddPanel();
});

rankingSongAddCancelButton.addEventListener("click", function () {
  closeRankingSongAddPanel();
});

rankingSongAddSearch.addEventListener("input", function () {
  renderAddableRankingSongs(rankingSongAddSearch.value);
});
