// ==============================
// ranking-settings.js
// ランキング条件・対象曲の管理
// ==============================

// ==============================
// 5. ランキング対象を更新
// ==============================

function updateRankingTargetSongs() {
  const checkedAlbums = Array.from(
    document.querySelectorAll('input[name="ranking-album-filter"]:checked'),
  ).map(function (input) {
    return input.value;
  });

  const checkedMusicTypes = Array.from(
    document.querySelectorAll('input[name="ranking-music-type"]:checked'),
  ).map(function (input) {
    return input.value;
  });

  const checkedCategories = Array.from(
    document.querySelectorAll('input[name="ranking-song-category"]:checked'),
  ).map(function (input) {
    return input.value;
  });

  const checkedMvStatus = Array.from(
    document.querySelectorAll('input[name="ranking-mv-status"]:checked'),
  ).map(function (input) {
    return input.value;
  });

  rankingTargetSongs = songs.filter(function (song) {
    // Album
    const albumName =
      song.album && song.album.trim() !== "" ? song.album : "シングル";

    if (checkedAlbums.length > 0 && !checkedAlbums.includes(albumName)) {
      return false;
    }

    // Type
    if (
      checkedMusicTypes.length > 0 &&
      !checkedMusicTypes.includes(song.musicType)
    ) {
      return false;
    }

    // Category
    if (checkedCategories.length > 0) {
      const isSingle = !song.album || song.album.trim() === "";

      const isTribute = song.album === "トリビュート";

      const isAlbum = !isSingle && !isTribute;

      const matchesCategory =
        (checkedCategories.includes("album") && isAlbum) ||
        (checkedCategories.includes("single") && isSingle) ||
        (checkedCategories.includes("tribute") && isTribute);

      if (!matchesCategory) {
        return false;
      }
    }

    // MV
    if (checkedMvStatus.length > 0) {
      const hasMv = song.hasMV;

      const matchesMv =
        (checkedMvStatus.includes("true") && hasMv) ||
        (checkedMvStatus.includes("false") && !hasMv);

      if (!matchesMv) {
        return false;
      }
    }

    return true;
  });

  currentRankingConditions = {
    songCount: rankingTargetSongs.length,

    albums: [...checkedAlbums],

    musicTypes: [...checkedMusicTypes],

    categories: [...checkedCategories],

    mvStatus: [...checkedMvStatus],
  };
}

// ランキング条件のアルバムフィルターを生成する
function createRankingAlbumFilterOptions() {
  rankingAlbumFilterOptions.innerHTML = "";

  const groupedSongs = groupSongsByAlbum(songs);

  const albumNames = getOrderedAlbumNames(groupedSongs);

  albumNames.forEach(function (albumName) {
    const label = document.createElement("label");

    label.className = "filter-checkbox";

    const input = document.createElement("input");

    input.type = "checkbox";

    input.name = "ranking-album-filter";

    input.value = albumName;

    const span = document.createElement("span");

    if (albumName === "負け犬にアンコールはいらない") {
      span.innerHTML = "負け犬にアンコールは<br>いらない";
    } else {
      span.textContent = albumName;
    }

    label.appendChild(input);
    label.appendChild(span);

    rankingAlbumFilterOptions.appendChild(label);
  });
}

// ==============================
// ランキング条件を推奨設定にする
// ==============================

function applyRecommendedRankingFilters() {
  // すべてのチェックを一度外す
  const rankingCheckboxes = rankingFilters.querySelectorAll(
    'input[type="checkbox"]',
  );

  rankingCheckboxes.forEach(function (checkbox) {
    checkbox.checked = false;
  });

  // Vocalを選択
  const vocalCheckbox = rankingFilters.querySelector(
    'input[name="ranking-music-type"][value="vocal"]',
  );

  if (vocalCheckbox) {
    vocalCheckbox.checked = true;
  }

  // トリビュート以外のAlbumをすべて選択
  const albumCheckboxes = rankingFilters.querySelectorAll(
    'input[name="ranking-album-filter"]',
  );

  albumCheckboxes.forEach(function (checkbox) {
    checkbox.checked = checkbox.value !== "トリビュート";
  });
}

// ==============================
// 6. 選択中の楽曲数を更新
// ==============================

function updateRankingSongCount() {
  updateRankingTargetSongs();

  rankingSongCount.textContent = `選択中：${rankingTargetSongs.length}曲 / 全${songs.length}曲`;
}

// ==============================
// 7. 新しいランキングを開始
// ==============================

function beginNewRanking() {
  const savedProgress = localStorage.getItem("rankingProgress");

  // 途中ランキングがある場合は確認
  if (savedProgress) {
    const shouldStartNewRanking = window.confirm(
      "途中のランキングがあります。\n\n" +
        "新しくランキングを開始すると、現在の途中データは削除されます。\n\n" +
        "途中のランキングを再開したい場合は、ホームに戻り「ランキングを再開」ボタンを押してください。\n\n" +
        "新しくランキングを開始しますか？",
    );

    // キャンセルなら何もしない
    if (!shouldStartNewRanking) {
      return false;
    }

    // 途中データを削除
    localStorage.removeItem("rankingProgress");

    updateResumeRankingButton();
  }

  updateRankingTargetSongs();

  return true;
}

// ==============================
// 7-2. ランキング条件画面
// ==============================

function setupRankingSettingsEvents() {
  // ランキング条件フィルターの変更を反映
  rankingFilters.addEventListener("change", function () {
    updateRankingSongCount();
  });

  // ランキング条件をリセット
  rankingFilterResetButton.addEventListener("click", function () {
    const rankingFilterInputs = rankingFilters.querySelectorAll(
      'input[type="checkbox"]',
    );

    rankingFilterInputs.forEach(function (input) {
      input.checked = false;
    });

    updateRankingSongCount();
  });

  // 条件を決めてランキング開始
  rankingStartButton.addEventListener("click", function () {
    const didStart = beginNewRanking();

    if (!didStart) {
      return;
    }

    showCompareScreen();

    startRanking();
  });

  // ホーム画面へ戻る
  settingsHomeButton.addEventListener("click", function () {
    resetRankingState();

    showHomeScreen();
  });
}
