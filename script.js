const startButton = document.getElementById("start-button");

const homeScreen = document.getElementById("home-screen");

const compareScreen = document.getElementById("compare-screen");

const resultScreen = document.getElementById("result-screen");

const rankingList = document.getElementById("ranking-list");

const restartButton = document.getElementById("restart-button");

const progressText = document.getElementById("progress-text");

const progressFill = document.querySelector(".progress-fill");

startButton.addEventListener("click", function () {

    homeScreen.style.display = "none";

    compareScreen.style.display = "block";

    startRanking();

});

// 曲データ（今は10曲だけ）
const songs = [
    { title: "春泥棒", image: "assets/icon.jpg" },
    { title: "左右盲", image: "assets/icon.jpg" },
    { title: "花に亡霊", image: "assets/icon.jpg" },
    { title: "都落ち", image: "assets/icon.jpg" },
    { title: "藍二乗", image: "assets/icon.jpg" },
    { title: "盗作", image: "assets/icon.jpg" },
    { title: "ただ君に晴れ", image: "assets/icon.jpg" },
    { title: "だから僕は音楽を辞めた", image: "assets/icon.jpg" },
    { title: "晴る", image: "assets/icon.jpg" },
    { title: "老人と海", image: "assets/icon.jpg" }
];

let currentLeftSong = songs[0];
let currentRightSong = songs[1];

let comparisonResolve = null;

const comparisonResults = [];

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

}

function compareSongs(leftSong, rightSong) {

    currentLeftSong = leftSong;
    currentRightSong = rightSong;

    displaySongs();

    return new Promise(function (resolve) {
        comparisonResolve = resolve;
    });

}

async function mergeSort(songList) {

    if (songList.length <= 1) {
        return songList;
    }

    const middleIndex = Math.floor(songList.length / 2);

    const leftList = songList.slice(0, middleIndex);
    const rightList = songList.slice(middleIndex);

    const sortedLeftList = await mergeSort(leftList);
    const sortedRightList = await mergeSort(rightList);

    return await merge(sortedLeftList, sortedRightList);

}

async function merge(leftList, rightList) {

    const mergedList = [];

    let leftIndex = 0;
    let rightIndex = 0;

    while (
        leftIndex < leftList.length &&
        rightIndex < rightList.length
    ) {

        const winner = await compareSongs(
            leftList[leftIndex],
            rightList[rightIndex]
        );

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

    completedMergeSteps = 0;
    progressPercent = 0;

    progressText.textContent = "進捗 0%";
    progressFill.style.width = "0%";

    const ranking = await mergeSort([...songs]);

    progressPercent = 100;
    progressText.textContent = "進捗 100%";
    progressFill.style.width = "100%";

    displayRanking(ranking);

    compareScreen.style.display = "none";
    resultScreen.style.display = "block";

}

// 左右のカード
const leftCard = document.getElementById("left-card");
const rightCard = document.getElementById("right-card");

// 左を選択
leftCard.addEventListener("click", function () {

    if (comparisonResolve === null) {
        return;
    }

    comparisonResults.push({
        winner: currentLeftSong.title,
        loser: currentRightSong.title
    });

    comparisonResolve(currentLeftSong);
    comparisonResolve = null;

});

// 右を選択
rightCard.addEventListener("click", function () {

    if (comparisonResolve === null) {
        return;
    }

    comparisonResults.push({
        winner: currentRightSong.title,
        loser: currentLeftSong.title
    });

    comparisonResolve(currentRightSong);
    comparisonResolve = null;

});

restartButton.addEventListener("click", function () {

    comparisonResults.length = 0;
    comparisonResolve = null;

    resultScreen.style.display = "none";

    homeScreen.style.display = "block";

});