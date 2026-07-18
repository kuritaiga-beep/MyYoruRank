// ==============================
// compare.js
// 比較画面・楽曲選択・試聴・Undo処理
// ==============================


// ==============================
// 1. 比較中の楽曲を画面に表示
// ==============================

function displaySongs() {

    leftTitle.textContent =
        currentLeftSong.title;

    rightTitle.textContent =
        currentRightSong.title;

    leftImage.src =
        currentLeftSong.image;

    rightImage.src =
        currentRightSong.image;

    leftImage.alt =
        currentLeftSong.title;

    rightImage.alt =
        currentRightSong.title;


    // 前回の画像タイプをリセット
    leftImage.classList.remove(
        "mv-image",
        "jacket-image"
    );

    rightImage.classList.remove(
        "mv-image",
        "jacket-image"
    );


    // 現在の画像タイプを付ける
    if (currentLeftSong.imageType) {

        leftImage.classList.add(
            `${currentLeftSong.imageType}-image`
        );

    }

    if (currentRightSong.imageType) {

        rightImage.classList.add(
            `${currentRightSong.imageType}-image`
        );

    }


    // YouTube URLがある場合だけボタンを表示
    leftPreviewButton.style.display =
        currentLeftSong.youtubeUrl
            ? "block"
            : "none";

    rightPreviewButton.style.display =
        currentRightSong.youtubeUrl
            ? "block"
            : "none";

}


// ==============================
// 2. 2曲を比較する
// ==============================

function compareSongs(
    leftSong,
    rightSong
) {

    currentLeftSong = leftSong;
    currentRightSong = rightSong;

    displaySongs();


    // Undo後の再実行中は、
    // 保存済みの選択履歴を自動で再現する
    if (
        isReplaying &&
        replayIndex < comparisonResults.length
    ) {

        const savedResult =
            comparisonResults[replayIndex];

        const isSameComparison =
            savedResult.leftSong ===
                leftSong.title &&
            savedResult.rightSong ===
                rightSong.title;

        if (isSameComparison) {

            replayIndex++;

            if (
                savedResult.selectedSong ===
                leftSong.title
            ) {

                return Promise.resolve(
                    leftSong
                );

            }

            return Promise.resolve(
                rightSong
            );

        }


        // 履歴と現在の比較内容が一致しない場合
        console.error(
            "比較履歴が一致しません。",
            {
                savedResult,
                leftSong: leftSong.title,
                rightSong: rightSong.title
            }
        );

        isReplaying = false;

    }


    // 保存済み履歴をすべて再現したら通常処理へ戻る
    if (isReplaying) {
        isReplaying = false;
    }


    // ユーザーの選択を待つ
    return new Promise(
        function (resolve) {

            comparisonResolve = resolve;

        }
    );

}


// ==============================
// 3. 左側の楽曲を選択
// ==============================

function selectLeftSong() {

    // 比較待ちでない場合は何もしない
    if (comparisonResolve === null) {
        return;
    }

    comparisonResults.push({
        leftSong:
            currentLeftSong.title,

        rightSong:
            currentRightSong.title,

        selectedSong:
            currentLeftSong.title
    });

    undoButton.disabled = false;


    const resolve =
        comparisonResolve;

    comparisonResolve = null;

    resolve(currentLeftSong);

}


// ==============================
// 4. 右側の楽曲を選択
// ==============================

function selectRightSong() {

    // 比較待ちでない場合は何もしない
    if (comparisonResolve === null) {
        return;
    }

    comparisonResults.push({
        leftSong:
            currentLeftSong.title,

        rightSong:
            currentRightSong.title,

        selectedSong:
            currentRightSong.title
    });

    undoButton.disabled = false;


    const resolve =
        comparisonResolve;

    comparisonResolve = null;

    resolve(currentRightSong);

}


// ==============================
// 5. YouTubeで楽曲を確認
// ==============================

function openSongPreview(song) {

    if (!song.youtubeUrl) {

        alert(
            "この曲はまだ試聴できません。"
        );

        return;

    }

    window.open(
        song.youtubeUrl,
        "_blank",
        "noopener,noreferrer"
    );

}


// ==============================
// 6. 一つ前の選択に戻る
// ==============================

function undoLastSelection() {

    if (
        comparisonResults.length === 0
    ) {
        return;
    }


    // 最後の選択履歴を削除
    comparisonResults.pop();


    // 保存済み履歴を最初から再現する
    replayIndex = 0;
    isReplaying = true;


    // 古い比較待ちを解除
    comparisonResolve = null;


    // 再実行中の誤操作を防ぐ
    undoButton.disabled = true;


    // ランキングを最初から再計算
    startRanking();

}