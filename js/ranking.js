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

const resultRankingSettingsContent =
    document.getElementById(
        "result-ranking-settings-content"
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
// 5. ランキング対象を更新
// ==============================

function updateRankingTargetSongs() {

    const checkedAlbums =
        Array.from(
            document.querySelectorAll(
                'input[name="ranking-album-filter"]:checked'
            )
        ).map(function (input) {

            return input.value;

        });

    const checkedMusicTypes =
        Array.from(
            document.querySelectorAll(
                'input[name="ranking-music-type"]:checked'
            )
        ).map(function (input) {

            return input.value;

        });

    const checkedCategories =
        Array.from(
            document.querySelectorAll(
                'input[name="ranking-song-category"]:checked'
            )
        ).map(function (input) {

            return input.value;

        });

    const checkedMvStatus =
        Array.from(
            document.querySelectorAll(
                'input[name="ranking-mv-status"]:checked'
            )
        ).map(function (input) {

            return input.value;

        });

    rankingTargetSongs =
        songs.filter(function (song) {

            // Album
            const albumName =

                song.album && song.album.trim() !== ""

                    ? song.album

                    : "シングル";

            if (

                checkedAlbums.length > 0 &&

                !checkedAlbums.includes(albumName)

            ) {

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

                const isSingle =
                    !song.album ||
                    song.album.trim() === "";

                const isTribute =
                    song.album === "トリビュート";

                const isAlbum =
                    !isSingle &&
                    !isTribute;

                const matchesCategory =
                    (
                        checkedCategories.includes("album") &&
                        isAlbum
                    ) ||
                    (
                        checkedCategories.includes("single") &&
                        isSingle
                    ) ||
                    (
                        checkedCategories.includes("tribute") &&
                        isTribute
                    );

                if (!matchesCategory) {

                    return false;

                }

            }

            // MV
            if (checkedMvStatus.length > 0) {

                const hasMv =
                    song.hasMV;

                const matchesMv =
                    (
                        checkedMvStatus.includes("true") &&
                        hasMv
                    ) ||
                    (
                        checkedMvStatus.includes("false") &&
                        !hasMv
                    );

                if (!matchesMv) {

                    return false;

                }

            }

            return true;

        });
    
    currentRankingConditions = {

        songCount:
            rankingTargetSongs.length,

        albums:
            [...checkedAlbums],

        musicTypes:
            [...checkedMusicTypes],

        categories:
            [...checkedCategories],

        mvStatus:
            [...checkedMvStatus]

    };

}


// ランキング条件のアルバムフィルターを生成する
function createRankingAlbumFilterOptions() {

    rankingAlbumFilterOptions.innerHTML = "";

    const groupedSongs =
        groupSongsByAlbum(songs);

    const albumNames =
        getOrderedAlbumNames(groupedSongs);


    albumNames.forEach(function (albumName) {

            const label =
                document.createElement("label");

            label.className =
                "filter-checkbox";


            const input =
                document.createElement("input");

            input.type =
                "checkbox";

            input.name =
                "ranking-album-filter";

            input.value =
                albumName;


            const span =
                document.createElement("span");

            if (
                albumName ===
                "負け犬にアンコールはいらない"
            ) {

                span.innerHTML =
                    "負け犬にアンコールは<br>いらない";

            } else {

                span.textContent =
                    albumName;

            }


            label.appendChild(input);
            label.appendChild(span);

            rankingAlbumFilterOptions.appendChild(
                label
            );

        }
    );

}


// ==============================
// ランキング条件を推奨設定にする
// ==============================

function applyRecommendedRankingFilters() {

    // すべてのチェックを一度外す
    const rankingCheckboxes =
        rankingFilters.querySelectorAll(
            'input[type="checkbox"]'
        );

    rankingCheckboxes.forEach(
        function (checkbox) {

            checkbox.checked = false;

        }
    );


    // Vocalを選択
    const vocalCheckbox =
        rankingFilters.querySelector(
            'input[name="ranking-music-type"][value="vocal"]'
        );

    if (vocalCheckbox) {

        vocalCheckbox.checked = true;

    }


    // トリビュート以外のAlbumをすべて選択
    const albumCheckboxes =
        rankingFilters.querySelectorAll(
            'input[name="ranking-album-filter"]'
        );

    albumCheckboxes.forEach(
        function (checkbox) {

            checkbox.checked =
                checkbox.value !== "トリビュート";

        }
    );

}


// ==============================
// 6. 選択中の楽曲数を更新
// ==============================

function updateRankingSongCount() {

    updateRankingTargetSongs();

    rankingSongCount.textContent =
        `選択中：${rankingTargetSongs.length}曲 / 全${songs.length}曲`;

}


// ==============================
// 6. 楽曲の順番をシャッフル
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
// 7. 新しいランキングを開始
// ==============================

function beginNewRanking() {

    updateRankingTargetSongs();

    startRanking();

}


// ==============================
// 8. ランキングを開始
// ==============================

async function startRanking(isReplay = false) {

    // ----------
    // ランキング処理を開始
    // ----------

    // 新しいランキング処理の番号を発行
    rankingRunId++;

    const currentRunId =
        rankingRunId;


    // ----------
    // 進捗を初期化
    // ----------

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


    // ----------
    // ランキング対象が0曲の場合
    // ----------

    if (rankingTargetSongs.length === 0) {

        rankingList.innerHTML = `
            <p>
                ランキング対象の楽曲がありません。
            </p>
        `;

        showResultScreen();

        return;

    }


    // ----------
    // ランキング対象が1曲の場合
    // ----------

    if (rankingTargetSongs.length === 1) {

        const ranking =
            [...rankingTargetSongs];

        displayRanking(ranking);

        saveRankingResult(ranking);

        // 完了したので途中保存データを削除
        localStorage.removeItem("rankingProgress");

        displayRankingConditions();

        progressPercent = 100;

        progressText.textContent =
            "進捗 100%";

        progressFill.style.width =
            "100%";

        showResultScreen();

        return;

    }


    // ----------
    // ランキングを実行
    // ----------

    // 新しくランキングを開始するときだけシャッフル
    if (!isReplay) {

        currentRankingSongOrder =
            shuffleSongs(
                rankingTargetSongs
            );

    }


    const ranking =
        await mergeSort(
            [...currentRankingSongOrder],
            currentRunId
        );

    // このランキング処理が古くなっていたら終了
    if (currentRunId !== rankingRunId) {
        return;
    }


    // ----------
    // ランキング結果を表示
    // ----------

    progressPercent = 100;

    progressText.textContent =
        "進捗 100%";

    progressFill.style.width =
        "100%";

    displayRanking(ranking);

    // 画像保存・共有用にランキングデータを渡す
    setRankingImageTarget(
        ranking,
        currentRankingConditions
    );

    const resultId =
        saveRankingResult(ranking);

    console.log(
        "saveRankingResultから返ったID:",
        resultId
    );

    // 完了したので途中保存データを削除
    localStorage.removeItem("rankingProgress");

    displayRankingConditions();

    showResultScreen(resultId);

}


// ==============================
// 9. ランキング結果を表示
// ==============================

function displayRanking(ranking) {

    // ----------
    // 結果画面を初期化
    // ----------

    isShowingAllRanking = false;

    toggleRankingButton.textContent =
        "全曲ランキングを表示";

    resultScreen.classList.remove(
        "show-all-ranking"
    );

    rankingList.innerHTML = "";

    // ----------
    // ランキングを表示
    // ----------

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

            //画像タイプに応じたCSSを適用
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
// 10. ランキング結果を保存
// ==============================

function saveRankingResult(ranking) {

    const rankingHistory =
        JSON.parse(
            localStorage.getItem("rankingHistory")
        ) || [];

    const rankingResult = {

        id: Date.now(),

        date: new Date().toISOString(),

        conditions: {
            songCount:
                currentRankingConditions.songCount,

            albums: [
                ...currentRankingConditions.albums
            ],

            musicTypes: [
                ...currentRankingConditions.musicTypes
            ],

            categories: [
                ...currentRankingConditions.categories
            ],

            mvStatus: [
                ...currentRankingConditions.mvStatus
            ]
        },

        ranking:
            ranking.map(function (song) {

                return {
                    title: song.title,
                    image: song.image,
                    imageType: song.imageType
                };

            })

    };

    rankingHistory.unshift(
        rankingResult
    );

    localStorage.setItem(
        "rankingHistory",
        JSON.stringify(rankingHistory)
    );
    
    return rankingResult.id;

}

// ==============================
// ランキング途中状態を保存
// ==============================

function saveRankingProgress() {

    const progressData = {

        savedAt:
            new Date().toISOString(),

        songOrder:
            currentRankingSongOrder.map(
                function (song) {

                    return song.title;

                }
            ),

        comparisonResults:
            [...comparisonResults],

        conditions:
            currentRankingConditions

    };

    localStorage.setItem(
        "rankingProgress",
        JSON.stringify(progressData)
    );

}


// ==============================
// ランキング途中状態を読み込む
// ==============================

function loadRankingProgress() {

    const savedProgress =
        localStorage.getItem(
            "rankingProgress"
        );

    if (!savedProgress) {
        return null;
    }

    try {

        return JSON.parse(
            savedProgress
        );

    } catch (error) {

        console.error(
            "ランキング途中データの読み込みに失敗しました。",
            error
        );

        localStorage.removeItem(
            "rankingProgress"
        );

        return null;

    }

}

// ==============================
// ランキング途中状態を復元
// ==============================

function restoreRankingProgress(
    savedProgress
) {

    // 保存時の曲順を復元
    currentRankingSongOrder =
        savedProgress.songOrder
            .map(
                function (songTitle) {

                    return songs.find(
                        function (song) {

                            return (
                                song.title ===
                                songTitle
                            );

                        }
                    );

                }
            )
            .filter(
                function (song) {

                    return song !== undefined;

                }
            );


    // ランキング対象曲も復元
    rankingTargetSongs =
        [...currentRankingSongOrder];


    // 比較履歴を復元
    comparisonResults.length = 0;

    comparisonResults.push(
        ...savedProgress.comparisonResults
    );


    // ランキング条件を復元
    currentRankingConditions =
        savedProgress.conditions;


    // 保存済みの比較結果を最初から再現
    replayIndex = 0;
    isReplaying = true;

}

// ==============================
// 保存したランキングを再開
// ==============================

function resumeRanking() {

    const savedProgress =
        loadRankingProgress();

    if (!savedProgress) {
        return;
    }

    restoreRankingProgress(
        savedProgress
    );

    hideAllScreens();

    compareScreen.style.display =
        "block";

    startRanking(true);

}

// ==============================
// 10. 今回のランキング条件を表示
// ==============================

function displayRankingConditions(
    conditions = currentRankingConditions
) {

    if (!conditions) {
        return;
    }

    const {
        songCount,
        albums,
        musicTypes,
        categories,
        mvStatus
    } = conditions;


    const musicTypeText =
        musicTypes.length > 0
            ? musicTypes.join(" / ")
            : "すべて";


    const categoryText =
        categories.length > 0
            ? categories.join(" / ")
            : "すべて";


    let mvText = "すべて";

    if (
        mvStatus.length === 1 &&
        mvStatus[0] === "true"
    ) {

        mvText = "MVあり";

    } else if (
        mvStatus.length === 1 &&
        mvStatus[0] === "false"
    ) {

        mvText = "MVなし";

    }


    const albumText =
        albums.length > 0
            ? albums.join(" / ")
            : "すべて";


    resultRankingSettingsContent.innerHTML = `
        <p>対象曲数：${songCount}曲</p>
        <p>Type：${musicTypeText}</p>
        <p>MV：${mvText}</p>
        <p>Category：${categoryText}</p>
        <p>Album：${albumText}</p>
    `;

}


// ==============================
// 11. 順位の表示文字を作成
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
// 12. ランキング表示切り替え
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

