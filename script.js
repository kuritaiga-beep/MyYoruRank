const startButton = document.getElementById("start-button");

const homeScreen = document.getElementById("home-screen");

const compareScreen = document.getElementById("compare-screen");

startButton.addEventListener("click", function () {

    homeScreen.style.display = "none";

    compareScreen.style.display = "block";

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

let currentLeftIndex = 0;
let currentRightIndex = 1;

const comparisonResults = [];

// HTMLの要素を取得
const leftTitle = document.getElementById("left-title");
const rightTitle = document.getElementById("right-title");

const leftImage = document.getElementById("left-image");
const rightImage = document.getElementById("right-image");

// 曲を画面に表示
function displaySongs() {

leftTitle.textContent = songs[currentLeftIndex].title;
rightTitle.textContent = songs[currentRightIndex].title;

leftImage.src = songs[currentLeftIndex].image;
rightImage.src = songs[currentRightIndex].image;

}

// 最初に表示
displaySongs();

function nextComparison() {

    currentLeftIndex = Math.floor(Math.random() * songs.length);

    do {
        currentRightIndex = Math.floor(Math.random() * songs.length);
    } while (currentLeftIndex === currentRightIndex);

    displaySongs();

}

// 左右のカード
const leftCard = document.getElementById("left-card");
const rightCard = document.getElementById("right-card");

// 左を選択
leftCard.addEventListener("click", function () {

    comparisonResults.push({
        winner: songs[currentLeftIndex].title,
        loser: songs[currentRightIndex].title
    });

    console.log(comparisonResults);

    nextComparison();

});

// 右を選択
rightCard.addEventListener("click", function () {

    comparisonResults.push({
        winner: songs[currentRightIndex].title,
        loser: songs[currentLeftIndex].title
    });

    console.log(comparisonResults);

    nextComparison();

});