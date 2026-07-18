const startButton = document.getElementById("start-button");

const homeScreen = document.getElementById("home-screen");

const compareScreen = document.getElementById("compare-screen");

const resultScreen = document.getElementById("result-screen");

const rankingList = document.getElementById("ranking-list");

const restartButton = document.getElementById("restart-button");

const progressText = document.getElementById("progress-text");

const progressFill = document.querySelector(".progress-fill");

const leftPreviewButton =
    document.getElementById("left-preview-button");

const rightPreviewButton =
    document.getElementById("right-preview-button");

const checkButton = document.getElementById("check-button");

const checkScreen = document.getElementById("check-screen");

const checkList = document.getElementById("check-list");

const filterButtons =
    document.querySelectorAll(".filter-button");

const totalSongCount =
    document.getElementById("total-song-count");

const mvSongCount =
    document.getElementById("mv-song-count");

const instrumentalSongCount =
    document.getElementById("instrumental-song-count");

const imageErrorCount =
    document.getElementById("image-error-count");

const backHomeButton =
    document.getElementById("back-home-button");

startButton.addEventListener("click", function () {

    homeScreen.style.display = "none";

    compareScreen.style.display = "block";

    startRanking();

});

checkButton.addEventListener("click", function () {

    createCheckList();

    homeScreen.style.display = "none";
    checkScreen.style.display = "block";

});

backHomeButton.addEventListener("click", function () {

    checkScreen.style.display = "none";
    homeScreen.style.display = "block";

});

let currentLeftSong = songs[0];
let currentRightSong = songs[1];

let comparisonResolve = null;

const comparisonResults = [];

let replayIndex = 0;
let isReplaying = false;

// ランキング処理を識別する番号
let rankingRunId = 0;

let completedMergeSteps = 0;

let progressPercent = 0;

const totalMergeSteps = calculateTotalMergeSteps(songs.length);

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

function updateProgress() {

    progressPercent = Math.round(
        (completedMergeSteps / totalMergeSteps) * 100
    );

    progressText.textContent = `進捗 ${progressPercent}%`;
    progressFill.style.width = `${progressPercent}%`;

}

    // HTMLの要素を取得
const leftTitle = document.getElementById("left-title");
const rightTitle = document.getElementById("right-title");

const leftImage = document.getElementById("left-image");
const rightImage = document.getElementById("right-image");

// 曲を画面に表示
function displaySongs() {

    leftTitle.textContent = currentLeftSong.title;
    rightTitle.textContent = currentRightSong.title;

    leftImage.src = currentLeftSong.image;
    rightImage.src = currentRightSong.image;

    // 前の曲の画像タイプをリセット
    leftImage.classList.remove("mv-image", "jacket-image");
    rightImage.classList.remove("mv-image", "jacket-image");

    // 現在の曲の画像タイプを付け直す
    if (currentLeftSong.imageType) {
        leftImage.classList.add(currentLeftSong.imageType + "-image");
    }

    if (currentRightSong.imageType) {
        rightImage.classList.add(currentRightSong.imageType + "-image");
    }

    // YouTubeボタンの表示・非表示
    leftPreviewButton.style.display =
        currentLeftSong.youtubeUrl ? "block" : "none";

    rightPreviewButton.style.display =
        currentRightSong.youtubeUrl ? "block" : "none";

}

function compareSongs(leftSong, rightSong) {

    currentLeftSong = leftSong;
    currentRightSong = rightSong;

    displaySongs();

    // 戻るための再実行中は、保存済みの選択を自動で再現する
    if (
        isReplaying &&
        replayIndex < comparisonResults.length
    ) {

        const savedResult = comparisonResults[replayIndex];

        const isSameComparison =
            savedResult.leftSong === leftSong.title &&
            savedResult.rightSong === rightSong.title;

        if (isSameComparison) {

            replayIndex++;

            if (savedResult.selectedSong === leftSong.title) {
                return Promise.resolve(leftSong);
            }

            return Promise.resolve(rightSong);

        }

        // 履歴と実際の比較が一致しなかった場合は自動再生を止める
        console.error("比較履歴が一致しません。", {
            savedResult,
            leftSong: leftSong.title,
            rightSong: rightSong.title
        });

        isReplaying = false;

    }

    // 保存済みの履歴をすべて再現したら、通常の比較に戻る
    if (isReplaying) {
        isReplaying = false;
    }

    return new Promise(function (resolve) {
        comparisonResolve = resolve;
    });

}

async function mergeSort(songList, currentRunId) {

    if (songList.length <= 1) {
        return songList;
    }

    const middleIndex = Math.floor(songList.length / 2);

    const leftList = songList.slice(0, middleIndex);
    const rightList = songList.slice(middleIndex);

    const sortedLeftList = await mergeSort(
        leftList,
        currentRunId
    );

    const sortedRightList = await mergeSort(
        rightList,
        currentRunId
    );

    return await merge(
        sortedLeftList,
        sortedRightList,
        currentRunId
    );

}

async function merge(leftList, rightList, currentRunId) {

    const mergedList = [];

    let leftIndex = 0;
    let rightIndex = 0;

    while (
        leftIndex < leftList.length &&
        rightIndex < rightList.length
    ) {

        // 古いランキング処理になっていたら終了する
        if (currentRunId !== rankingRunId) {
        return [];
        }

        const winner = await compareSongs(
            leftList[leftIndex],
            rightList[rightIndex]
        );

        // 比較待ちの間に古い処理になっていたら終了する
        if (currentRunId !== rankingRunId) {
        return [];
        }

        if (winner === leftList[leftIndex]) {
            mergedList.push(leftList[leftIndex]);
            leftIndex++;
        } else {
            mergedList.push(rightList[rightIndex]);
            rightIndex++;
        }

        completedMergeSteps++;
        updateProgress();

    }

    while (leftIndex < leftList.length) {
    mergedList.push(leftList[leftIndex]);
    leftIndex++;

    completedMergeSteps++;
    updateProgress();

    }
    

    while (rightIndex < rightList.length) {
    mergedList.push(rightList[rightIndex]);
    rightIndex++;

    completedMergeSteps++;
    updateProgress();

    }

    return mergedList;

}

function displayRanking(ranking) {

    rankingList.innerHTML = "";

    ranking.forEach(function (song, index) {

        const rankingItem = document.createElement("div");

        rankingItem.classList.add("ranking-item");

        rankingItem.innerHTML = `
            <span class="ranking-number">
                ${index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}位`}
            </span>

            <img
                src="${song.image}"
                alt="${song.title}"
                class="ranking-image"
            >

            <span class="ranking-title">${song.title}</span>
         
        `;
    
        rankingList.appendChild(rankingItem);

    });

}

async function startRanking() {

    // 新しいランキング処理の番号を発行
    rankingRunId++;

    // 今回の処理番号を保存
    const currentRunId = rankingRunId;

    completedMergeSteps = 0;
    progressPercent = 0;

    progressText.textContent = "進捗 0%";
    progressFill.style.width = "0%";

    const ranking = await mergeSort(shuffleSongs(songs), currentRunId);

    // この処理が古くなっていたら、結果画面を表示せず終了する
    if (currentRunId !== rankingRunId) {
        return;
    }

    progressPercent = 100;
    progressText.textContent = "進捗 100%";
    progressFill.style.width = "100%";

    displayRanking(ranking);

    compareScreen.style.display = "none";
    resultScreen.style.display = "block";

}

function shuffleSongs(songList) {

    const shuffledSongs = [...songList];

    for (let i = shuffledSongs.length - 1; i > 0; i--) {

        const randomIndex =
            Math.floor(Math.random() * (i + 1));

        [
            shuffledSongs[i],
            shuffledSongs[randomIndex]
        ] = [
            shuffledSongs[randomIndex],
            shuffledSongs[i]
        ];

    }

    return shuffledSongs;

}

// 左右のカード
const leftCard = document.getElementById("left-card");
const rightCard = document.getElementById("right-card");

// 一つ前の選択に戻るボタン
const undoButton = document.getElementById("undo-button");

leftPreviewButton.addEventListener("click", function (event) {

    event.stopPropagation();

    if (!currentLeftSong.youtubeUrl) {
        alert("この曲はまだ試聴できません。");
        return;
    }

    window.open(currentLeftSong.youtubeUrl, "_blank");

});

rightPreviewButton.addEventListener("click", function (event) {

    event.stopPropagation();

    if (!currentRightSong.youtubeUrl) {
        alert("この曲はまだ試聴できません。");
        return;
    }

    window.open(currentRightSong.youtubeUrl, "_blank");

});

// 左を選択
leftCard.addEventListener("click", function () {

    if (comparisonResolve === null) {
        return;
    }

    comparisonResults.push({
    leftSong: currentLeftSong.title,
    rightSong: currentRightSong.title,
    selectedSong: currentLeftSong.title
    });

    undoButton.disabled = false;

    comparisonResolve(currentLeftSong);
    comparisonResolve = null;

});

// 右を選択
rightCard.addEventListener("click", function () {

    if (comparisonResolve === null) {
        return;
    }

    comparisonResults.push({
    leftSong: currentLeftSong.title,
    rightSong: currentRightSong.title,
    selectedSong: currentRightSong.title
    });

    undoButton.disabled = false;

    comparisonResolve(currentRightSong);
    comparisonResolve = null;

});

undoButton.addEventListener("click", function () {

    if (comparisonResults.length === 0) {
        return;
    }

    comparisonResults.pop();

    replayIndex = 0;
    isReplaying = true;

    undoButton.disabled = true;

    startRanking();

});

restartButton.addEventListener("click", function () {

    comparisonResults.length = 0;
    comparisonResolve = null;

    resultScreen.style.display = "none";

    homeScreen.style.display = "block";

});

function createCheckList() {

    checkList.innerHTML = "";

    totalSongCount.textContent = songs.length;

    mvSongCount.textContent =
        songs.filter(function (song) {
            return song.hasMV;
        }).length;

    instrumentalSongCount.textContent =
        songs.filter(function (song) {
            return song.musicType === "instrumental";
        }).length;

    imageErrorCount.textContent = "0";

    let errorCount = 0;

    const albums = {};

    songs.forEach(function (song) {

        if (!albums[song.album]) {
            albums[song.album] = [];
        }

        albums[song.album].push(song);

    });

    Object.keys(albums).forEach(function (albumName) {

        const albumSection = document.createElement("section");
        albumSection.className = "album-section";

        const albumTitle = document.createElement("h2");
        albumTitle.className = "album-title";
        albumTitle.textContent = albumName;

        const albumGrid = document.createElement("div");
        albumGrid.className = "album-grid";

        albums[albumName].forEach(function (song) {

            const card = document.createElement("div");

            card.className = "check-card";

            card.dataset.hasMv = song.hasMV;

            card.dataset.musicType = song.musicType;

            card.innerHTML = `
                <img
                    class="check-image"
                    src="${song.image}"
                    alt="${song.title}"
                >

                <p class="image-error">
                    ⚠ 画像が見つかりません
                    <span class="image-path">${song.image}</span>
                </p>

                <h3>${song.title}</h3>

                <p>アルバム：${song.album}</p>

                <p>画像：${song.imageType}</p>

                <p>種類：${song.musicType}</p>

                <p>MV:${song.hasMV ? "○" : "x"}</p>

                <p>YouTube:${song.youtubeUrl ? "○" : "x"}</p>

                ${
                    song.hasMV === true && song.imageType === "jacket"
                        ? `
                            <p class="data-warning">
                                ⚠ MVありなのに画像がjacketです
                            </p>
                        `
                        : ""
                }

                ${
                    song.youtubeUrl
                        ? `<button
                            class="check-preview-button"
                            type="button"
                            onclick="window.open('${song.youtubeUrl}', '_blank')"
                        >
                            ▶ YouTube
                        </button>
                        `
                        : ""
                }
            `;

            const checkImage = card.querySelector(".check-image");
            const imageError = card.querySelector(".image-error");

            checkImage.addEventListener("error", function () {

                checkImage.style.display = "none";
                imageError.style.display = "block";

                errorCount++;

                imageErrorCount.textContent = errorCount;
            });

            albumGrid.appendChild(card);

        });

        albumSection.appendChild(albumTitle);
        albumSection.appendChild(albumGrid);

        checkList.appendChild(albumSection);

    });

}

filterButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const selectedFilter = button.dataset.filter;

        filterButtons.forEach(function (otherButton) {
            otherButton.classList.remove("active");
        });

        button.classList.add("active");

        const cards = document.querySelectorAll(".check-card");

        cards.forEach(function (card) {

            const hasMV = card.dataset.hasMv === "true";
            const musicType = card.dataset.musicType;

            if (selectedFilter === "all") {
                card.style.display = "block";
            }

            if (selectedFilter === "mv") {
                card.style.display = hasMV ? "block" : "none";
            }

            if (selectedFilter === "vocal") {
                card.style.display =
                    musicType === "vocal"
                        ? "block"
                        : "none";
            }

            if (selectedFilter === "instrumental") {
                card.style.display =
                    musicType === "instrumental"
                        ? "block"
                        : "none";
            }

        });

    });

});