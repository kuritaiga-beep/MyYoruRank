// ==============================
// ranking.js
// ランキング処理・進捗表示・結果表示
// ==============================


// ==============================
// 0. 結果画面の要素・状態
// ==============================

const toggleRankingButton =
    document.getElementById(
        "toggle-ranking-button"
    );

let isShowingAllRanking = false;


// ==============================
// 1. 比較処理の総ステップ数を計算
// ==============================

function calculateTotalMergeSteps(length) {

    if (length <= 1) {
        return 0;
    }

    const leftLength =
        Math.floor(length / 2);

    const rightLength =
        length - leftLength;

    return (
        length +
        calculateTotalMergeSteps(leftLength) +
        calculateTotalMergeSteps(rightLength)
    );

}


// ==============================
// 2. 進捗表示を更新
// ==============================

function updateProgress() {

    if (totalMergeSteps === 0) {

        progressPercent = 100;

    } else {

        progressPercent = Math.round(
            (
                completedMergeSteps /
                totalMergeSteps
            ) * 100
        );

    }

    // 計算誤差などで100%を超えないようにする
    progressPercent =
        Math.min(progressPercent, 100);

    progressText.textContent =
        `進捗 ${progressPercent}%`;

    progressFill.style.width =
        `${progressPercent}%`;

}


// ==============================
// 3. マージソート
// ==============================

async function mergeSort(
    songListToSort,
    currentRunId
) {

    // 1曲以下なら並び替える必要がない
    if (songListToSort.length <= 1) {
        return songListToSort;
    }

    const middleIndex =
        Math.floor(songListToSort.length / 2);

    const leftList =
        songListToSort.slice(
            0,
            middleIndex
        );

    const rightList =
        songListToSort.slice(
            middleIndex
        );

    const sortedLeftList =
        await mergeSort(
            leftList,
            currentRunId
        );

    // 再帰処理中に新しいランキングが始まっていたら終了
    if (currentRunId !== rankingRunId) {
        return [];
    }

    const sortedRightList =
        await mergeSort(
            rightList,
            currentRunId
        );

    // 再帰処理中に新しいランキングが始まっていたら終了
    if (currentRunId !== rankingRunId) {
        return [];
    }

    return await merge(
        sortedLeftList,
        sortedRightList,
        currentRunId
    );

}


// ==============================
// 4. 2つの並びを比較して統合
// ==============================

async function merge(
    leftList,
    rightList,
    currentRunId
) {

    const mergedList = [];

    let leftIndex = 0;
    let rightIndex = 0;

    while (
        leftIndex < leftList.length &&
        rightIndex < rightList.length
    ) {

        // 古いランキング処理なら終了
        if (currentRunId !== rankingRunId) {
            return [];
        }

        const winner =
            await compareSongs(
                leftList[leftIndex],
                rightList[rightIndex]
            );

        // 比較待ちの間に新しいランキングが始まった場合
        if (currentRunId !== rankingRunId) {
            return [];
        }

        if (
            winner ===
            leftList[leftIndex]
        ) {

            mergedList.push(
                leftList[leftIndex]
            );

            leftIndex++;

        } else {

            mergedList.push(
                rightList[rightIndex]
            );

            rightIndex++;

        }

        completedMergeSteps++;

        updateProgress();

    }


    // 左側に残った曲を追加
    while (
        leftIndex < leftList.length
    ) {

        if (currentRunId !== rankingRunId) {
            return [];
        }

        mergedList.push(
            leftList[leftIndex]
        );

        leftIndex++;

        completedMergeSteps++;

        updateProgress();

    }


    // 右側に残った曲を追加
    while (
        rightIndex < rightList.length
    ) {

        if (currentRunId !== rankingRunId) {
            return [];
        }

        mergedList.push(
            rightList[rightIndex]
        );

        rightIndex++;

        completedMergeSteps++;

        updateProgress();

    }

    return mergedList;

}

// ==============================
// 6. ランキング対象を更新
// ==============================

function updateRankingTargetSongs() {

    rankingTargetSongs =
        songs.filter(
            function (song) {

                if (
                    !rankingSettings.includeTribute &&
                    song.album === "トリビュート"
                ) {

                    return false;

                }

                if (
                    !rankingSettings.includeInstrumental &&
                    song.musicType === "instrumental"
                ) {

                    return false;

                }

                return true;

            }
        );

}


// ==============================
// 5. 楽曲の順番をシャッフル
// ==============================

function shuffleSongs(
    songListToShuffle
) {

    const shuffledSongs = [
        ...songListToShuffle
    ];

    for (
        let i = shuffledSongs.length - 1;
        i > 0;
        i--
    ) {

        const randomIndex =
            Math.floor(
                Math.random() * (i + 1)
            );

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

// ==============================
// 6. 新しいランキングを開始
// ==============================

function beginNewRanking() {

    updateRankingTargetSongs();

    startRanking();

}


// ==============================
// 6. ランキングを開始
// ==============================

async function startRanking() {

    // 新しいランキング処理の番号を発行
    rankingRunId++;

    const currentRunId =
        rankingRunId;

    completedMergeSteps = 0;
    progressPercent = 0;

    totalMergeSteps =
        calculateTotalMergeSteps(
            rankingTargetSongs.length
        );

    progressText.textContent =
        "進捗 0%";

    progressFill.style.width =
        "0%";

    // 楽曲が存在しない場合
    if (rankingTargetSongs.length === 0) {

        rankingList.innerHTML = `
            <p>
                ランキング対象の楽曲がありません。
            </p>
        `;

        showResultScreen();

        return;

    }

    // 1曲だけの場合
    if (rankingTargetSongs.length === 1) {

        displayRanking(
            [...rankingTargetSongs]
        );

        progressPercent = 100;

        progressText.textContent =
            "進捗 100%";

        progressFill.style.width =
            "100%";

        showResultScreen();

        return;

    }

    const shuffledSongs =
        shuffleSongs(
            rankingTargetSongs
        );

    const ranking =
        await mergeSort(
            shuffledSongs,
            currentRunId
        );

    // このランキング処理が古くなっていたら終了
    if (currentRunId !== rankingRunId) {
        return;
    }

    progressPercent = 100;

    progressText.textContent =
        "進捗 100%";

    progressFill.style.width =
        "100%";

    displayRanking(ranking);

    showResultScreen();

}


// ==============================
// 7. ランキング結果を表示
// ==============================

function displayRanking(ranking) {

    isShowingAllRanking = false;

    toggleRankingButton.textContent =
        "全曲ランキングを表示";

        document
            .getElementById("result-screen")
            .classList.remove(
                "show-all-ranking"
            );

    rankingList.innerHTML = "";

    ranking.forEach(
        function (song, index) {

            const rankingItem =
                document.createElement("div");

            rankingItem.classList.add(
                "ranking-item"
            );

            if (index >= 10) {

                rankingItem.classList.add(
                    "ranking-hidden-item"
                );

            }


            const rankingPosition =
                getRankingPosition(index);

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

            const rankingImage =
                rankingItem.querySelector(
                    ".ranking-image"
                );

            // 楽曲の画像タイプを付与
            if (
                rankingImage &&
                song.imageType
            ) {

                rankingImage.classList.add(
                    `${song.imageType}-image`
                );

            }

            rankingList.appendChild(
                rankingItem
            );

        }
    );

}


// ==============================
// 8. 順位の表示文字を作成
// ==============================

function getRankingPosition(index) {

    if (index === 0) {
        return "🥇";
    }

    if (index === 1) {
        return "🥈";
    }

    if (index === 2) {
        return "🥉";
    }

    return `${index + 1}位`;

}


// ==============================
// 9. ランキング表示切り替え
// ==============================

function toggleRankingDisplay() {

    const resultScreen =
        document.getElementById(
            "result-screen"
        );

    isShowingAllRanking =
        !isShowingAllRanking;

    resultScreen.classList.toggle(
        "show-all-ranking",
        isShowingAllRanking
    );

    toggleRankingButton.textContent =
        isShowingAllRanking
            ? "トップ10だけ表示"
            : "全曲ランキングを表示";

}

toggleRankingButton.addEventListener(
    "click",
    toggleRankingDisplay
);

