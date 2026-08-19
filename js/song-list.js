// ==============================
// song-list.js
// 楽曲一覧画面
// アルバムごとのグループ表示とフィルター処理
// ==============================

// ==============================
// 1. 楽曲一覧を生成
// ==============================

function createSongList() {
  songList.innerHTML = "";

  const groupedSongs = groupSongsByAlbum(songs);

  const orderedAlbumNames = getOrderedAlbumNames(groupedSongs);

  orderedAlbumNames.forEach(function (albumName) {
    const albumSongs = groupedSongs.get(albumName);

    const albumSection = createAlbumSection(albumName, albumSongs);

    songList.appendChild(albumSection);
  });

  applySongListFilters();
}

// ==============================
// 2. フィルター状態の管理
// ==============================

// 楽曲一覧のフィルター状態
const currentSongListFilters = {
  search: "",
  musicTypes: [],
  mvStatuses: [],
  categories: [],
  albums: [],
};

// 指定したnameのチェック済みvalueを配列で取得する
function getCheckedFilterValues(inputName) {
  const checkedInputs = document.querySelectorAll(
    `input[name="${inputName}"]:checked`,
  );

  return Array.from(checkedInputs).map(function (input) {
    return input.value;
  });
}

// HTMLの入力内容をフィルター状態へ反映する
function updateSongListFilterState() {
  currentSongListFilters.search = songSearchInput.value.trim().toLowerCase();

  currentSongListFilters.musicTypes = getCheckedFilterValues("music-type");

  currentSongListFilters.mvStatuses = getCheckedFilterValues("mv-status");

  currentSongListFilters.categories = getCheckedFilterValues("song-category");

  currentSongListFilters.albums = getCheckedFilterValues("album-filter");
}

// ==============================
// 3. アルバムフィルターを生成
// ==============================

function createAlbumFilterOptions() {
  albumFilterOptions.innerHTML = "";

  const groupedSongs = groupSongsByAlbum(songs);

  const albumNames = getOrderedAlbumNames(groupedSongs);

  albumNames.forEach(function (albumName) {
    const label = document.createElement("label");

    label.className = "filter-checkbox";

    const input = document.createElement("input");

    input.type = "checkbox";
    input.name = "album-filter";
    input.value = albumName;

    const span = document.createElement("span");

    if (albumName === "負け犬にアンコールはいらない") {
      span.innerHTML = "負け犬にアンコールは<br>いらない";
    } else {
      span.textContent = albumName;
    }

    label.appendChild(input);
    label.appendChild(span);

    albumFilterOptions.appendChild(label);
  });
}

// ==============================
// 4. フィルターイベントを登録
// ==============================

function setupSongListFilterEvents() {
  // 曲名検索
  songSearchInput.addEventListener("input", function () {
    updateSongListFilterState();

    applySongListFilters();
  });

  // Type
  musicTypeCheckboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      updateSongListFilterState();

      applySongListFilters();
    });
  });

  // MV
  mvStatusCheckboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      updateSongListFilterState();

      applySongListFilters();
    });
  });

  // Category
  songCategoryCheckboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      updateSongListFilterState();

      applySongListFilters();
    });
  });

  // Album
  albumFilterOptions.addEventListener("change", function (event) {
    if (event.target.matches('input[name="album-filter"]')) {
      updateSongListFilterState();

      applySongListFilters();
    }
  });

  // フィルターをリセット
  filterResetButton.addEventListener("click", function () {
    resetSongListFilterState();
  });
}

// ==============================
// 5. 楽曲の絞り込み
// ==============================

// 楽曲の収録区分を判定する
function getSongCategory(song) {
  if (song.album === "") {
    return "single";
  }

  if (song.album === "トリビュート") {
    return "tribute";
  }

  return "album";
}

// 1曲が現在のフィルター条件に一致するか判定する
function matchesSongFilters(song) {
  // 曲名検索
  const normalizedTitle = String(song.title).toLowerCase();

  if (
    currentSongListFilters.search !== "" &&
    !normalizedTitle.includes(currentSongListFilters.search)
  ) {
    return false;
  }

  // Vocal / Instrumental
  const normalizedMusicType = String(song.musicType).toLowerCase();

  if (
    currentSongListFilters.musicTypes.length > 0 &&
    !currentSongListFilters.musicTypes.includes(normalizedMusicType)
  ) {
    return false;
  }

  // MVあり / MVなし
  const normalizedMvStatus = String(song.hasMV);

  if (
    currentSongListFilters.mvStatuses.length > 0 &&
    !currentSongListFilters.mvStatuses.includes(normalizedMvStatus)
  ) {
    return false;
  }

  // Category
  const songCategory = getSongCategory(song);

  if (
    currentSongListFilters.categories.length > 0 &&
    !currentSongListFilters.categories.includes(songCategory)
  ) {
    return false;
  }

  // Album
  const normalizedAlbumName = song.album === "" ? "シングル" : song.album;

  if (
    currentSongListFilters.albums.length > 0 &&
    !currentSongListFilters.albums.includes(normalizedAlbumName)
  ) {
    return false;
  }

  return true;
}

// ==============================
// 6. フィルター結果を画面へ反映
// ==============================

function applySongListFilters() {
  const songCards = document.querySelectorAll(".song-item");

  let visibleSongCount = 0;
  let visibleMvCount = 0;
  let visibleInstrumentalCount = 0;

  songCards.forEach(function (card) {
    const songTitle = card.dataset.title;

    const song = songs.find(function (songItem) {
      return songItem.title === songTitle;
    });

    if (!song) {
      return;
    }

    const shouldShow = matchesSongFilters(song);

    card.style.display = shouldShow ? "" : "none";

    if (shouldShow) {
      visibleSongCount++;

      if (song.hasMV === true) {
        visibleMvCount++;
      }

      if (String(song.musicType).toLowerCase() === "instrumental") {
        visibleInstrumentalCount++;
      }
    }
  });

  updateAlbumSectionVisibility();

  updateNoResultsMessage(visibleSongCount);

  updateSongListSummary(
    visibleSongCount,
    visibleMvCount,
    visibleInstrumentalCount,
  );
}

// ==============================
// 7. フィルター結果の表示状態を更新
// ==============================

// 該当する楽曲がない場合のメッセージを表示する
function updateNoResultsMessage(visibleSongCount) {
  let noResultsMessage = document.getElementById("song-list-no-results");

  if (!noResultsMessage) {
    noResultsMessage = document.createElement("p");

    noResultsMessage.id = "song-list-no-results";

    noResultsMessage.textContent = "該当する楽曲が見つかりませんでした。";

    songList.appendChild(noResultsMessage);
  }

  noResultsMessage.style.display = visibleSongCount === 0 ? "block" : "none";
}

// 表示中の曲がないアルバムを非表示にする
function updateAlbumSectionVisibility() {
  const albumSections = document.querySelectorAll(".album-section");

  albumSections.forEach(function (section) {
    const songCards = section.querySelectorAll(".song-item");

    const hasVisibleSong = Array.from(songCards).some(function (card) {
      return card.style.display !== "none";
    });

    section.style.display = hasVisibleSong ? "" : "none";
  });
}

// ==============================
// 8. フィルターをリセット
// ==============================

function resetSongListFilterState() {
  songSearchInput.value = "";

  const filterCheckboxes = document.querySelectorAll(
    '#song-list-filters input[type="checkbox"]',
  );

  filterCheckboxes.forEach(function (checkbox) {
    checkbox.checked = false;
  });

  currentSongListFilters.search = "";
  currentSongListFilters.musicTypes = [];
  currentSongListFilters.mvStatuses = [];
  currentSongListFilters.categories = [];
  currentSongListFilters.albums = [];

  applySongListFilters();
}

// ==============================
// 9. 楽曲数サマリーを更新
// ==============================

function updateSongListSummary(
  visibleSongCount,
  visibleMvCount,
  visibleInstrumentalCount,
) {
  const totalSongCount = songs.length;

  const totalSongSummary = document.getElementById("total-song-count");

  const mvSongSummary = document.getElementById("mv-song-count");

  const instrumentalSongSummary = document.getElementById(
    "instrumental-song-count",
  );

  if (totalSongSummary) {
    totalSongSummary.textContent = `表示中：${visibleSongCount}曲 / 全${totalSongCount}曲`;
  }

  if (mvSongSummary) {
    mvSongSummary.textContent = `MVあり：${visibleMvCount}曲`;
  }

  if (instrumentalSongSummary) {
    instrumentalSongSummary.textContent = `インスト：${visibleInstrumentalCount}曲`;
  }
}

// ==============================
// 10. アルバムセクションを作成
// ==============================

function createAlbumSection(albumName, albumSongs) {
  const section = document.createElement("section");

  section.className = "album-section";

  section.dataset.album = albumName;

  const title = document.createElement("h2");

  title.className = "album-title";

  title.textContent = albumName;

  const grid = document.createElement("div");

  grid.className = "album-grid";

  albumSongs.forEach(function (song) {
    const card = createSongCard(song);

    grid.appendChild(card);
  });

  section.appendChild(title);
  section.appendChild(grid);

  // ページ上部へ戻るボタン
  const backToTopButton = document.createElement("button");

  backToTopButton.type = "button";

  backToTopButton.className = "back-to-top-button";

  backToTopButton.textContent = "↑ ページ上部へ戻る";

  backToTopButton.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  section.appendChild(backToTopButton);

  return section;
}

// ==============================
// 11. 楽曲カードを作成
// ==============================

function createSongCard(song) {
  const card = document.createElement("article");

  card.className = "song-item";

  card.dataset.musicType = song.musicType || "";

  card.dataset.hasMv = String(song.hasMV === true);

  card.dataset.imageType = song.imageType || "";

  card.dataset.album = getDisplayAlbumName(song);

  card.dataset.title = song.title || "";

  // ------------------------------
  // 楽曲画像
  // ------------------------------

  const image = document.createElement("img");

  image.src = song.image;

  image.alt = song.title;

  image.className = "song-list-image";

  if (song.imageType) {
    image.classList.add(`${song.imageType}-image`);
  }

  // ------------------------------
  // 楽曲情報
  // ------------------------------

  const info = document.createElement("div");

  info.className = "song-info";

  // 曲名
  const title = document.createElement("h3");

  title.textContent = song.title;

  // Album
  const albumLabel = document.createElement("p");

  albumLabel.className = "song-label";

  albumLabel.textContent = "Album";

  const albumValue = document.createElement("p");

  albumValue.className = "song-value";

  albumValue.textContent = getDisplayAlbumName(song);

  // Type
  const typeLabel = document.createElement("p");

  typeLabel.className = "song-label";

  typeLabel.textContent = "Type";

  const typeValue = document.createElement("p");

  typeValue.className = "song-value";

  typeValue.textContent =
    song.musicType === "instrumental" ? "Instrumental" : "Vocal";

  // MV
  const mvLabel = document.createElement("p");

  mvLabel.className = "song-label";

  mvLabel.textContent = "MV";

  const mvValue = document.createElement("p");

  mvValue.className = "song-value";

  mvValue.textContent = song.hasMV ? "○" : "－";

  mvValue.classList.add(song.hasMV ? "mv-yes" : "mv-no");

  // ------------------------------
  // YouTubeリンク
  // ------------------------------

  let youtubeLink = null;

  if (song.youtubeUrl) {
    youtubeLink = document.createElement("a");

    youtubeLink.className = "youtube-link";

    youtubeLink.href = song.youtubeUrl;

    youtubeLink.target = "_blank";

    youtubeLink.rel = "noopener noreferrer";

    youtubeLink.textContent = "▶ YouTube";
  }

  // ------------------------------
  // カードへ追加
  // ------------------------------

  info.appendChild(title);

  info.appendChild(albumLabel);
  info.appendChild(albumValue);

  info.appendChild(typeLabel);
  info.appendChild(typeValue);

  info.appendChild(mvLabel);
  info.appendChild(mvValue);

  if (youtubeLink) {
    info.appendChild(youtubeLink);
  }

  card.appendChild(image);
  card.appendChild(info);

  return card;
}

// ==============================
// 12. 楽曲一覧画面イベント
// ==============================

function setupSongListEvents() {
  // 楽曲一覧からホームへ戻る
  songListBackButton.addEventListener("click", showHomeScreen);

  songListHomeButton.addEventListener("click", showHomeScreen);

  // 楽曲一覧フィルターのイベント登録
  if (typeof setupSongListFilterEvents === "function") {
    setupSongListFilterEvents();
  }

  // フィルターパネルの開閉
  filterToggleButton.addEventListener("click", function () {
    const isExpanded =
      filterToggleButton.getAttribute("aria-expanded") === "true";

    filterToggleButton.setAttribute("aria-expanded", String(!isExpanded));

    songListFilters.hidden = isExpanded;

    filterToggleIcon.textContent = isExpanded ? "▼" : "▲";
  });
}
