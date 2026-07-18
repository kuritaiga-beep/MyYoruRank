// ==============================
// song-list.js
// 楽曲一覧画面
// アルバムごとのグループ表示とフィルター処理
// ==============================


// ==============================
// 1. 楽曲一覧の設定
// ==============================

// 表示したいアルバム順
const albumOrder = [
    "夏草が邪魔をする",
    "負け犬にアンコールはいらない",
    "だから僕は音楽を辞めた",
    "エルマ",
    "盗作",
    "創作",
    "幻燈",
    "二人称",
    "シングル",
    "トリビュート"
];

// 現在選択中のフィルター
let currentFilter = "all";


// ==============================
// 2. 楽曲一覧を生成
// ==============================

function createSongList() {

    songList.innerHTML = "";

    updateSongSummary();

    const groupedSongs =
        groupSongsByAlbum(songs);

    const orderedAlbumNames =
        getOrderedAlbumNames(groupedSongs);

    orderedAlbumNames.forEach(
        function (albumName) {

            const albumSongs =
                groupedSongs.get(albumName);

            const albumSection =
                createAlbumSection(
                    albumName,
                    albumSongs
                );

            songList.appendChild(
                albumSection
            );

        }
    );

    applySongListFilter(currentFilter);

}


// ==============================
// 3. 楽曲をアルバムごとに分類
// ==============================

function groupSongsByAlbum(songData) {

    const groupedSongs = new Map();

    songData.forEach(
        function (song) {

            const albumName =
                getDisplayAlbumName(song);

            if (!groupedSongs.has(albumName)) {

                groupedSongs.set(
                    albumName,
                    []
                );

            }

            groupedSongs
                .get(albumName)
                .push(song);

        }
    );

    return groupedSongs;

}

// ========================================
// 3.1 フィルター機能
// ========================================


// ----------------------------------------
// 3.1.1 フィルター状態の管理
// ----------------------------------------

// 楽曲一覧のフィルター状態
const currentSongListFilters = {
    search: "",
    musicTypes: [],
    mvStatuses: [],
    categories: [],
    albums: []
};


// 指定したnameのチェック済みvalueを配列で取得する
function getCheckedFilterValues(inputName) {
    const checkedInputs = document.querySelectorAll(
        `input[name="${inputName}"]:checked`
    );

    return Array.from(checkedInputs).map(function (input) {
        return input.value;
    });
}


// HTMLの入力内容をフィルター状態へ反映する
function updateSongListFilterState() {

    currentSongListFilters.search =
        songSearchInput.value
            .trim()
            .toLowerCase();

    currentSongListFilters.musicTypes =
        getCheckedFilterValues(
            "music-type"
        );

    currentSongListFilters.mvStatuses =
        getCheckedFilterValues(
            "mv-status"
        );

    currentSongListFilters.categories =
        getCheckedFilterValues(
            "song-category"
        );

    currentSongListFilters.albums =
        getCheckedFilterValues(
            "album-filter"
        );

    console.log(
        "現在のフィルター:",
        currentSongListFilters
    );

}


// ----------------------------------------
// 3.1.2 アルバムフィルターの自動生成
// ----------------------------------------

// アルバムフィルターを生成する
function createAlbumFilterOptions() {

    albumFilterOptions.innerHTML = "";

    const groupedSongs =
        groupSongsByAlbum(songs);

    const albumNames =
        getOrderedAlbumNames(groupedSongs);

    albumNames.forEach(function (albumName) {

        const label = document.createElement("label");

        label.className = "filter-checkbox";

        const input = document.createElement("input");

        input.type = "checkbox";
        input.name = "album-filter";
        input.value = albumName;

        const span = document.createElement("span");

        if (albumName === "負け犬にアンコールはいらない") {

            span.innerHTML =
                "負け犬にアンコールは<br>いらない";

        } else {

            span.textContent =
                albumName;

        }

        label.appendChild(input);
        label.appendChild(span);

        albumFilterOptions.appendChild(label);

    });

}


// ----------------------------------------
// 3.1.3 フィルターイベントの登録
// ----------------------------------------

// フィルター操作時のイベントを登録する
function setupSongListFilterEvents() {

    songSearchInput.addEventListener(
        "input",
        function () {

            updateSongListFilterState();
            applySongListFilters();

        }
    );


    musicTypeCheckboxes.forEach(
        function (checkbox) {

            checkbox.addEventListener(
                "change",
                function () {

                    updateSongListFilterState();
                    applySongListFilters();
                }
            );

        }
    );


    mvStatusCheckboxes.forEach(
        function (checkbox) {

            checkbox.addEventListener(
                "change",
                function () {

                    updateSongListFilterState();
                    applySongListFilters();
                }
            );

        }
    );


    songCategoryCheckboxes.forEach(
        function (checkbox) {

            checkbox.addEventListener(
                "change",
                function () {

                    updateSongListFilterState();
                    applySongListFilters();
                }
            );

        }
    );


    albumFilterOptions.addEventListener(
        "change",
        function (event) {

            if (
                event.target.matches(
                    'input[name="album-filter"]'
                )
            ) {

                updateSongListFilterState();
                applySongListFilters();

            }

        }
    );


    filterResetButton.addEventListener(
        "click",
        function () {

            resetSongListFilterState();

        }
    );

}


// ----------------------------------------
// 3.1.4 楽曲の絞り込み処理
// ----------------------------------------

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
    const normalizedTitle =
        String(song.title).toLowerCase();

    if (
        currentSongListFilters.search !== "" &&
        !normalizedTitle.includes(
            currentSongListFilters.search
        )
    ) {
        return false;
    }


    // Vocal / Instrumental
    const normalizedMusicType =
        String(song.musicType).toLowerCase();

    if (
        currentSongListFilters.musicTypes.length > 0 &&
        !currentSongListFilters.musicTypes.includes(
            normalizedMusicType
        )
    ) {
        return false;
    }


    // MVあり / MVなし
    const normalizedMvStatus =
        String(song.hasMV);

    if (
        currentSongListFilters.mvStatuses.length > 0 &&
        !currentSongListFilters.mvStatuses.includes(
            normalizedMvStatus
        )
    ) {
        return false;
    }


    // Category
    const songCategory =
        getSongCategory(song);

    if (
        currentSongListFilters.categories.length > 0 &&
        !currentSongListFilters.categories.includes(
            songCategory
        )
    ) {
        return false;
    }

    // Album
    const normalizedAlbumName =
        song.album === ""
            ? "シングル"
            : song.album;

    if (
        currentSongListFilters.albums.length > 0 &&
        !currentSongListFilters.albums.includes(
            normalizedAlbumName
        )
    ) {
        return false;
    }

    return true;

}



// 現在のフィルター条件を楽曲一覧へ反映する
function applySongListFilters() {

    const songCards =
        document.querySelectorAll(".song-item");

    let visibleSongCount = 0;

    songCards.forEach(function (card) {

        const songTitle =
            card.dataset.title;

        const song = songs.find(function (songItem) {
            return songItem.title === songTitle;
        });

        if (!song) {
            return;
        }

        const shouldShow =
            matchesSongFilters(song);

        card.style.display =
            shouldShow ? "" : "none";

        if (shouldShow) {
            visibleSongCount++;
        }

    });

    updateAlbumSectionVisibility();

    updateNoResultsMessage(
        visibleSongCount
    );

}

// 該当する楽曲がない場合のメッセージを表示する
function updateNoResultsMessage(
    visibleSongCount
) {

    let noResultsMessage =
        document.getElementById(
            "song-list-no-results"
        );

    if (!noResultsMessage) {

        noResultsMessage =
            document.createElement("p");

        noResultsMessage.id =
            "song-list-no-results";

        noResultsMessage.textContent =
            "該当する楽曲が見つかりませんでした。";

        const songList =
            document.getElementById(
                "song-list"
            );

        songList.appendChild(
            noResultsMessage
        );

    }

    noResultsMessage.style.display =
        visibleSongCount === 0
            ? "block"
            : "none";

}

// 表示中の曲がないアルバムを非表示にする
function updateAlbumSectionVisibility() {

    const albumSections =
        document.querySelectorAll(".album-section");

    albumSections.forEach(function (section) {

        const songCards =
            section.querySelectorAll(".song-item");

        const hasVisibleSong =
            Array.from(songCards).some(
                function (card) {

                    return (
                        card.style.display !==
                        "none"
                    );

                }
            );

        section.style.display =
            hasVisibleSong ? "" : "none";

    });

}


// ----------------------------------------
// 3.1.5 リセット処理
// ----------------------------------------

// 楽曲一覧のフィルターを初期状態へ戻す
function resetSongListFilterState() {

    songSearchInput.value = "";

    const filterCheckboxes =
        document.querySelectorAll(
            '#song-list-filters input[type="checkbox"]'
        );

    filterCheckboxes.forEach(
        function (checkbox) {

            checkbox.checked = false;

        }
    );

    currentSongListFilters.search = "";
    currentSongListFilters.musicTypes = [];
    currentSongListFilters.mvStatuses = [];
    currentSongListFilters.categories = [];
    currentSongListFilters.albums = [];

    applySongListFilters();

}


// ==============================
// 4. 一覧で表示するアルバム名を取得
// ==============================

function getDisplayAlbumName(song) {

    // albumが空文字の曲は
    // シングルとしてまとめる
    if (
        typeof song.album !== "string" ||
        song.album.trim() === ""
    ) {
        return "シングル";
    }

    return song.album.trim();

}


// ==============================
// 5. アルバムの表示順を作る
// ==============================

function getOrderedAlbumNames(
    groupedSongs
) {

    const orderedAlbumNames = [];

    // 指定済みのアルバム順で追加
    albumOrder.forEach(
        function (albumName) {

            if (groupedSongs.has(albumName)) {

                orderedAlbumNames.push(
                    albumName
                );

            }

        }
    );


    // albumOrderにない新しいアルバムも
    // 一覧から消えないよう最後に追加
    groupedSongs.forEach(
        function (_, albumName) {

            if (
                !orderedAlbumNames.includes(
                    albumName
                )
            ) {

                orderedAlbumNames.push(
                    albumName
                );

            }

        }
    );

    return orderedAlbumNames;

}


// ==============================
// 6. アルバムセクションを作成
// ==============================

function createAlbumSection(
    albumName,
    albumSongs
) {

    const section =
        document.createElement("section");

    section.className =
        "album-section";

    section.dataset.album =
        albumName;


    const title =
        document.createElement("h2");

    title.className =
        "album-title";

    title.textContent =
        albumName;


    const grid =
        document.createElement("div");

    grid.className =
        "album-grid";


    albumSongs.forEach(
        function (song) {

            const card =
                createSongCard(song);

            grid.appendChild(card);

        }
    );


    section.appendChild(title);
    section.appendChild(grid);

    // ページ上部へ戻るボタン
    const backToTopButton =
        document.createElement("button");

    backToTopButton.type =
        "button";

    backToTopButton.className =
        "back-to-top-button";

    backToTopButton.textContent =
        "↑ ページ上部へ戻る";

    backToTopButton.addEventListener(
        "click",
        function () {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );

    section.appendChild(
        backToTopButton
    );

    return section;

}


// ==============================
// 7. 楽曲カードを作成
// ==============================

function createSongCard(song) {

    const card =
        document.createElement("article");

    card.className =
        "song-item";

    card.dataset.musicType =
        song.musicType || "";

    card.dataset.hasMv =
        String(song.hasMV === true);

    card.dataset.imageType =
        song.imageType || "";

    card.dataset.album =
        getDisplayAlbumName(song);

    card.dataset.title =
        song.title || "";


    // ==============================
    // 楽曲画像
    // ==============================

    const image =
        document.createElement("img");

    image.src =
        song.image;

    image.alt =
        song.title;

    image.className =
        "song-list-image";

    if (song.imageType) {

        image.classList.add(
            `${song.imageType}-image`
        );

    }


    // ==============================
    // 楽曲情報
    // ==============================

    const info =
        document.createElement("div");

    info.className =
        "song-info";


    // 曲名

    const title =
        document.createElement("h3");

    title.textContent =
        song.title;


    // Album

    const albumLabel =
        document.createElement("p");

    albumLabel.className =
        "song-label";

    albumLabel.textContent =
        "Album";


    const albumValue =
        document.createElement("p");

    albumValue.className =
        "song-value";

    albumValue.textContent =
        getDisplayAlbumName(song);


    // Type

    const typeLabel =
        document.createElement("p");

    typeLabel.className =
        "song-label";

    typeLabel.textContent =
        "Type";


    const typeValue =
        document.createElement("p");

    typeValue.className =
        "song-value";

    typeValue.textContent =
        song.musicType === "instrumental"
            ? "Instrumental"
            : "Vocal";


    // MV

    const mvLabel =
        document.createElement("p");

    mvLabel.className =
        "song-label";

    mvLabel.textContent =
        "MV";


    const mvValue =
        document.createElement("p");

    mvValue.className =
        "song-value";

    mvValue.textContent =
        song.hasMV
            ? "○"
            : "－";

    mvValue.classList.add(
        song.hasMV
            ? "mv-yes"
            : "mv-no"
    );


    // ==============================
    // YouTubeリンク
    // ==============================

    let youtubeLink = null;

    if (song.youtubeUrl) {

        youtubeLink =
            document.createElement("a");

        youtubeLink.className =
            "youtube-link";

        youtubeLink.href =
            song.youtubeUrl;

        youtubeLink.target =
            "_blank";

        youtubeLink.rel =
            "noopener noreferrer";

        youtubeLink.textContent =
            "▶ YouTube";

    }


    // ==============================
    // カードへ追加
    // ==============================

    info.appendChild(title);

    info.appendChild(albumLabel);
    info.appendChild(albumValue);

    info.appendChild(typeLabel);
    info.appendChild(typeValue);

    info.appendChild(mvLabel);
    info.appendChild(mvValue);

    if (youtubeLink) {

        info.appendChild(
            youtubeLink
        );

    }

    card.appendChild(image);
    card.appendChild(info);

    return card;

}


// ==============================
// 8. フィルターを適用
// ==============================

function applySongListFilter(filter) {

    currentFilter = filter;

    const albumSections =
        document.querySelectorAll(
            ".album-section"
        );

    albumSections.forEach(
        function (section) {

            const cards =
                section.querySelectorAll(
                    ".song-item"
                );

            let visibleCardCount = 0;

            cards.forEach(
                function (card) {

                    const shouldShow =
                        matchesSongListFilter(
                            card,
                            filter
                        );

                    card.style.display =
                        shouldShow
                            ? ""
                            : "none";

                    if (shouldShow) {
                        visibleCardCount++;
                    }

                }
            );


            // 表示する曲がないアルバムは
            // 見出しごと非表示にする
            section.style.display =
                visibleCardCount > 0
                    ? ""
                    : "none";

        }
    );

}


// ==============================
// 9. カードがフィルター条件に合うか判定
// ==============================

function matchesSongListFilter(
    card,
    filter
) {

    if (filter === "all") {
        return true;
    }

    if (filter === "mv") {

        return (
            card.dataset.hasMv === "true"
        );

    }

    if (filter === "vocal") {

        return (
            card.dataset.musicType ===
            "vocal"
        );

    }

    if (filter === "instrumental") {

        return (
            card.dataset.musicType ===
            "instrumental"
        );

    }

    // 未定義のフィルターは
    // すべて表示にする
    return true;

}


// ==============================
// 10. 曲数サマリーを更新
// ==============================

function updateSongSummary() {

    totalSongCount.textContent =
        songs.length;

    mvSongCount.textContent =
        songs.filter(
            function (song) {

                return song.hasMV === true;

            }
        ).length;

    instrumentalSongCount.textContent =
        songs.filter(
            function (song) {

                return (
                    song.musicType ===
                    "instrumental"
                );

            }
        ).length;

    updateImageErrorCount();

}