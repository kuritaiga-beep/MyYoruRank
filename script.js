const startButton = document.getElementById("start-button");

const homeScreen = document.getElementById("home-screen");

const compareScreen = document.getElementById("compare-screen");

startButton.addEventListener("click", function () {

    homeScreen.style.display = "none";

    compareScreen.style.display = "block";

    startRanking();

});

// 曲データ（今は2曲だけ）
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

    }

    while (leftIndex < leftList.length) {
        mergedList.push(leftList[leftIndex]);
        leftIndex++;
    }

    while (rightIndex < rightList.length) {
        mergedList.push(rightList[rightIndex]);
        rightIndex++;
    }

    return mergedList;

}

async function startRanking() {

    const ranking = await mergeSort([...songs]);

    console.log("ランキング完成");

    ranking.forEach(function (song, index) {
        console.log((index + 1) + "位: " + song.title);
    });

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