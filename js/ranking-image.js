// ========================================
// 整理済み ranking-image.js
// ========================================


// ========================================
// 1. DOM取得
// ========================================


// ----------
// モーダルを開くボタン
// ----------

const rankingImageOpenButtons =
    document.querySelectorAll(
        ".ranking-image-open-button"
    );


// ----------
// モーダル本体
// ----------

const rankingImageModal =
    document.getElementById(
        "ranking-image-modal"
    );

const rankingImageModalCloseButton =
    document.getElementById(
        "ranking-image-modal-close-button"
    );


// ----------
// 保存範囲
// ----------

const rankingImageTop10Radio =
    document.querySelector(
        'input[name="ranking-image-range"][value="top10"]'
    );

const rankingImageAllRadio =
    document.querySelector(
        'input[name="ranking-image-range"][value="all"]'
    );


// ----------
// タイトル設定
// ----------

const rankingImageNameInput =
    document.getElementById(
        "ranking-image-name-input"
    );

const rankingImageTitlePreview =
    document.getElementById(
        "ranking-image-title-preview"
    );

const rankingImageTitleTypeRadios =
    document.querySelectorAll(
        'input[name="ranking-image-title-type"]'
    );


// ----------
// プレビュー
// ----------

const rankingImagePreviewButton =
    document.getElementById(
        "ranking-image-preview-button"
    );

const rankingImagePreviewContainer =
    document.getElementById(
        "ranking-image-preview-container"
    );

const rankingImageCanvas =
    document.getElementById(
        "ranking-image-canvas"
    );

// ----------
// 画像保存/共有
// ----------

const rankingImageSaveButton =
    document.getElementById(
        "ranking-image-save-button"
    );

const rankingImageShareButton =
    document.getElementById(
        "ranking-image-share-button"
    );

// ----------
// 全曲版ページ操作
// ----------

const rankingImagePageControls =
    document.getElementById(
        "ranking-image-page-controls"
    );

const rankingImagePrevPageButton =
    document.getElementById(
        "ranking-image-prev-page-button"
    );

const rankingImageNextPageButton =
    document.getElementById(
        "ranking-image-next-page-button"
    );

const rankingImagePageIndicator =
    document.getElementById(
        "ranking-image-page-indicator"
    );


// ========================================
// 2. 状態管理
// ========================================


// ----------
// 画像化するランキングデータ
// ----------

let rankingImageTarget = null;


// ----------
// 全曲版のページデータ
// ----------

let allRankingImagePages = [];


// ----------
// 現在表示しているページ
// ----------

let allRankingImageCurrentPage = 0;


// ========================================
// 2-1. 画像化対象を設定
// ========================================

function setRankingImageTarget(
    ranking,
    conditions
) {

    rankingImageTarget = {
        ranking: ranking,
        conditions: conditions
    };

    console.log(
        "画像化対象:",
        rankingImageTarget
    );

}


// ========================================
// 3. モーダル操作
// ========================================


// ========================================
// 3-1. モーダルを開く
// ========================================

rankingImageOpenButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                if (!rankingImageTarget) {

                    console.log(
                        "画像化対象が設定されていません"
                    );

                    return;
                }

                console.log(
                    "画像保存・共有を開始:",
                    rankingImageTarget
                );


                // ---------- 曲数に応じて保存範囲を設定 ----------

                const rankingCount =
                    rankingImageTarget.ranking.length;

                if (rankingCount <= 10) {

                    // 10曲以下ならTOP10＝実質全曲
                    rankingImageTop10Radio.checked =
                        true;

                    rankingImageAllRadio.checked =
                        false;

                    rankingImageAllRadio.disabled =
                        true;

                } else {

                    // 11曲以上なら両方選択可能
                    rankingImageAllRadio.disabled =
                        false;

                }

                // ----------
                // ページ操作UIを初期化
                // ----------

                rankingImagePageControls.hidden =
                    true;


                // ---------- モーダルを表示 ----------

                rankingImageModal.hidden =
                    false;

            }
        );

    }
);


// ========================================
// 3-2. モーダルを閉じる
// ========================================

rankingImageModalCloseButton.addEventListener(
    "click",
    function () {

        rankingImageModal.hidden =
            true;

    }
);


// ========================================
// 4. タイトル設定
// ========================================

// ========================================
// 4-0. ランキング条件の表示用テキストを取得
// ========================================

function getRankingImageConditionTexts() {

    const conditions =
        rankingImageTarget.conditions;

    const musicTypeText =
        conditions.musicTypes.length > 0
            ? conditions.musicTypes.join(" / ")
            : "すべて";

    const categoryText =
        conditions.categories.length > 0
            ? conditions.categories.join(" / ")
            : "すべて";

    let mvText =
        "すべて";

    if (
        conditions.mvStatus.length === 1 &&
        conditions.mvStatus[0] === "true"
    ) {

        mvText =
            "MVあり";

    } else if (
        conditions.mvStatus.length === 1 &&
        conditions.mvStatus[0] === "false"
    ) {

        mvText =
            "MVなし";

    }

    const albumText =
        conditions.albums.length > 0
            ? conditions.albums.join(" / ")
            : "すべて";

    return {
        conditions,
        musicTypeText,
        categoryText,
        mvText,
        albumText
    };

}


// ========================================
// 4-1. 保存画像のタイトルを取得
// ========================================

function getRankingImageTitle() {

    const selectedTitleType =
        document.querySelector(
            'input[name="ranking-image-title-type"]:checked'
        );

    if (
        selectedTitleType &&
        selectedTitleType.value === "custom"
    ) {

        const name =
            rankingImageNameInput.value.trim();

        if (name !== "") {

            return `${name}'s Yoru Rank`;

        }

    }

    return "My Yoru Rank";

}


// ========================================
// 4-2. タイトルプレビューを更新
// ========================================

function updateRankingImageTitlePreview() {

    rankingImageTitlePreview.textContent =
        getRankingImageTitle();

}


// ========================================
// 4-3. タイトル形式の切り替え
// ========================================

rankingImageTitleTypeRadios.forEach(
    function (radio) {

        radio.addEventListener(
            "change",
            function () {

                if (this.value === "custom") {

                    rankingImageNameInput.disabled =
                        false;

                    rankingImageNameInput.focus();

                } else {

                    rankingImageNameInput.disabled =
                        true;

                }

                updateRankingImageTitlePreview();

            }
        );

    }
);


// ========================================
// 4-4. 名前入力をタイトルへ反映
// ========================================

rankingImageNameInput.addEventListener(
    "input",
    function () {

        updateRankingImageTitlePreview();

    }
);


// ========================================
// 5. 共通描画関数
// ========================================

// ========================================
// 5-0. Canvasを初期化
// ========================================

function initializeRankingImageCanvas() {

    const context =
        rankingImageCanvas.getContext("2d");

    rankingImageCanvas.width =
        1080;

    rankingImageCanvas.height =
        1920;

    context.clearRect(
        0,
        0,
        rankingImageCanvas.width,
        rankingImageCanvas.height
    );

    const siteBackgroundColor =
        getComputedStyle(
            document.body
        ).backgroundColor;

    context.fillStyle =
        siteBackgroundColor;

    context.fillRect(
        0,
        0,
        rankingImageCanvas.width,
        rankingImageCanvas.height
    );

    return context;

}


// ========================================
// 5-1. 画像をトリミングせず枠内に収めて描画
// ========================================

function drawImageContain(
    context,
    image,
    x,
    y,
    width,
    height
) {

    // 画像全体が枠内に入る倍率を計算
    const scale =
        Math.min(
            width / image.width,
            height / image.height
        );

    const drawWidth =
        image.width * scale;

    const drawHeight =
        image.height * scale;


    // 枠の中央に配置
    const drawX =
        x + (width - drawWidth) / 2;

    const drawY =
        y + (height - drawHeight) / 2;


    context.drawImage(
        image,
        drawX,
        drawY,
        drawWidth,
        drawHeight
    );

}


// ========================================
// 5-2. 角丸長方形を描画
// ========================================

function fillRoundedRect(
    context,
    x,
    y,
    width,
    height,
    radius,
    color
) {

    context.beginPath();

    context.roundRect(
        x,
        y,
        width,
        height,
        radius
    );

    context.fillStyle =
        color;

    context.fill();

}

// ========================================
// 6. 全曲版画像
// ========================================


// ========================================
// 6-1. 全曲版のページデータを作成
// ========================================

function createAllRankingImagePages() {

    const songsPerPage =
        15;

    const totalSongs =
        rankingImageTarget.ranking.length;

    const totalPages =
        Math.ceil(
            totalSongs / songsPerPage
        );


    allRankingImagePages = [];


    for (
        let pageIndex = 0;
        pageIndex < totalPages;
        pageIndex++
    ) {

        const startIndex =
            pageIndex * songsPerPage;

        const endIndex =
            startIndex + songsPerPage;

        const pageSongs =
            rankingImageTarget.ranking.slice(
                startIndex,
                endIndex
            );

        allRankingImagePages.push(
            pageSongs
        );

    }


    console.log(
        "全曲版ページ数:",
        allRankingImagePages.length
    );

    console.log(
        "全曲版ページデータ:",
        allRankingImagePages
    );

}


// ========================================
// 6-2. 現在の全曲ページを描画
// ========================================

function drawAllRankingImagePage() {

    if (
        allRankingImagePages.length === 0
    ) {

        return;

    }


    const context =
        initializeRankingImageCanvas();

    const currentPageSongs =
        allRankingImagePages[
            allRankingImageCurrentPage
        ];

    const songsPerPage =
        15;

    const pageStartRank =
        allRankingImageCurrentPage *
        songsPerPage;


    // ---------- タイトル ----------

    context.fillStyle =
        "#ffffff";

    context.font =
        "700 64px sans-serif";

    context.textAlign =
        "center";

    context.textBaseline =
        "middle";

    context.fillText(
        getRankingImageTitle(),
        rankingImageCanvas.width / 2,
        110
    );


    // ---------- 一覧設定 ----------

    const listStartY =
        190;

    const rowHeight =
        98;

    const rowGap =
        6;


    // ---------- 各順位を描画 ----------

    currentPageSongs.forEach(
        function (song, index) {

            const rank =
                pageStartRank +
                index +
                1;

            const y =
                listStartY +
                index *
                (
                    rowHeight +
                    rowGap
                );


            // 白いカード

            fillRoundedRect(
                context,
                100,
                y,
                880,
                rowHeight,
                18,
                "#ffffff"
            );


            // 順位

            context.fillStyle =
                "#222222";

            context.font =
                "700 30px sans-serif";

            context.textAlign =
                "center";

            context.textBaseline =
                "middle";

            context.fillText(
                `${rank}位`,
                160,
                y + rowHeight / 2
            );


            // 楽曲画像

            const image =
                new Image();

            image.onload =
                function () {

                    drawImageContain(
                        context,
                        image,
                        225,
                        y + 7,
                        90,
                        90
                    );

                };

            image.onerror =
                function () {

                    console.log(
                        "全曲版画像の読み込みに失敗:",
                        image.src
                    );

                };

            image.src =
                song.image;


            // 曲名

            context.fillStyle =
                "#222222";

            context.font =
                "700 32px sans-serif";

            context.textAlign =
                "left";

            context.textBaseline =
                "middle";

            context.fillText(
                song.title,
                350,
                y + rowHeight / 2
            );

        }
    );

    // ---------- ランキング条件 ----------

    const {
        conditions,
        musicTypeText,
        categoryText,
        mvText,
        albumText
    } =
        getRankingImageConditionTexts();


    // ---------- 条件見出し ----------

    context.fillStyle =
        "#ffffff";

    context.font =
        "700 24px sans-serif";

    context.textAlign =
        "left";

    context.textBaseline =
        "middle";

    context.fillText(
        "ランキング条件",
        100,
        1770
    );


    // ---------- 条件内容 ----------

    context.font =
        "500 20px sans-serif";

    context.fillText(
        `対象：${conditions.songCount}曲　 Type：${musicTypeText}　 MV：${mvText}`,
        100,
        1810
    );

    context.fillText(
        `Category：${categoryText}　 Album：${albumText}`,
        100,
        1845
    );


    // ---------- 最下部 ----------

    // 署名

    context.fillStyle =
        "#ffffff";

    context.font =
        "500 15px sans-serif";

    context.textAlign =
        "left";

    context.textBaseline =
        "middle";

    context.fillText(
        "Created by MyYoruRank",
        100,
        1890
    );


    // ページ番号

    context.font =
        "500 22px sans-serif";

    context.textAlign =
        "right";

    context.fillText(
        `${allRankingImageCurrentPage + 1} / ${allRankingImagePages.length}`,
        980,
        1890
    );


    // ---------- モーダル側のページ表示 ----------

    updateAllRankingImagePageControls();

}


// ========================================
// 6-3. 全曲版ページ操作UIを更新
// ========================================

function updateAllRankingImagePageControls() {

    rankingImagePageIndicator.textContent =
        `${allRankingImageCurrentPage + 1} / ${allRankingImagePages.length}`;

    rankingImagePrevPageButton.disabled =
        allRankingImageCurrentPage === 0;

    rankingImageNextPageButton.disabled =
        allRankingImageCurrentPage ===
        allRankingImagePages.length - 1;

}


// ========================================
// 6-4. 前のページへ
// ========================================

function showPreviousAllRankingImagePage() {

    if (
        allRankingImageCurrentPage <= 0
    ) {

        return;

    }

    allRankingImageCurrentPage--;

    drawAllRankingImagePage();

}


// ========================================
// 6-5. 次のページへ
// ========================================

function showNextAllRankingImagePage() {

    if (
        allRankingImageCurrentPage >=
        allRankingImagePages.length - 1
    ) {

        return;

    }

    allRankingImageCurrentPage++;

    drawAllRankingImagePage();

}


// ========================================
// 6-6. ページ操作ボタン
// ========================================

rankingImagePrevPageButton.addEventListener(
    "click",
    function () {

        showPreviousAllRankingImagePage();

    }
);

rankingImageNextPageButton.addEventListener(
    "click",
    function () {

        showNextAllRankingImagePage();

    }
);


// ========================================
// 6-7. キーボードでページ切り替え
// ========================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            allRankingImagePages.length === 0
        ) {

            return;

        }


        if (
            event.key === "ArrowLeft"
        ) {

            showPreviousAllRankingImagePage();

        }


        if (
            event.key === "ArrowRight"
        ) {

            showNextAllRankingImagePage();

        }

    }
);


// ========================================
// 7. TOP10版画像
// ========================================


// ========================================
// 7-1. TOP10画像を描画
// ========================================

function drawTop10RankingImage() {

    const context =
    initializeRankingImageCanvas();

    // ---------- タイトル ----------

    context.fillStyle =
        "#ffffff";

    context.font =
        "700 64px sans-serif";

    context.textAlign =
        "center";

    context.textBaseline =
        "alphabetic";

    context.fillText(
        getRankingImageTitle(),
        rankingImageCanvas.width / 2,
        120
    );


    // ========================================
    // 7-2. TOP3
    // ========================================

    const topThree =
        rankingImageTarget.ranking.slice(
            0,
            3
        );

    const topThreeXPositions = [
        215,
        540,
        865
    ];


    topThree.forEach(
        function (song, index) {

            const x =
                topThreeXPositions[index];


            // ---------- 白いカード ----------

            fillRoundedRect(
                context,
                x - 145,
                200,
                290,
                430,
                24,
                "#ffffff"
            );


            // ---------- 順位 ----------

            context.fillStyle =
                "#222222";

            context.font =
                "700 34px sans-serif";

            context.textAlign =
                "center";

            context.textBaseline =
                "middle";

            context.fillText(
                `${index + 1}位`,
                x,
                230
            );


            // ---------- 楽曲画像 ----------

            const image =
                new Image();

            image.onload =
                function () {

                    drawImageContain(
                        context,
                        image,
                        x - 105,
                        265,
                        210,
                        210
                    );

                };

            image.onerror =
                function () {

                    console.log(
                        "TOP3画像の読み込みに失敗:",
                        image.src
                    );

                };

            image.src =
                song.image;


            // ---------- 曲名 ----------

            context.fillStyle =
                "#222222";

            context.textAlign =
                "center";

            let titleFontSize =
                30;

            const maxTitleWidth =
                250;

            const titleAreaCenterY =
                555;

            context.font =
                `700 ${titleFontSize}px sans-serif`;


            // 1行で入る場合
            if (
                context.measureText(
                    song.title
                ).width <= maxTitleWidth
            ) {

                context.textBaseline =
                    "middle";

                context.fillText(
                    song.title,
                    x,
                    titleAreaCenterY
                );

            } else {

                // 2行に分ける位置を探す
                let bestSplitIndex =
                    1;

                let smallestDifference =
                    Infinity;


                for (
                    let i = 1;
                    i < song.title.length;
                    i++
                ) {

                    const firstLine =
                        song.title.slice(
                            0,
                            i
                        );

                    const secondLine =
                        song.title.slice(
                            i
                        );

                    const difference =
                        Math.abs(
                            context.measureText(
                                firstLine
                            ).width -
                            context.measureText(
                                secondLine
                            ).width
                        );


                    if (
                        difference <
                        smallestDifference
                    ) {

                        smallestDifference =
                            difference;

                        bestSplitIndex =
                            i;

                    }

                }


                const firstLine =
                    song.title.slice(
                        0,
                        bestSplitIndex
                    );

                const secondLine =
                    song.title.slice(
                        bestSplitIndex
                    );


                // 2行でも長い場合だけ縮小
                while (
                    (
                        context.measureText(
                            firstLine
                        ).width > maxTitleWidth ||

                        context.measureText(
                            secondLine
                        ).width > maxTitleWidth
                    ) &&
                    titleFontSize > 24
                ) {

                    titleFontSize -=
                        2;

                    context.font =
                        `700 ${titleFontSize}px sans-serif`;

                }


                // 2行全体を中央配置
                const lineGap =
                    titleFontSize + 4;

                context.textBaseline =
                    "middle";

                context.fillText(
                    firstLine,
                    x,
                    titleAreaCenterY -
                    lineGap / 2
                );

                context.fillText(
                    secondLine,
                    x,
                    titleAreaCenterY +
                    lineGap / 2
                );

            }

        }
    );


    // ========================================
    // 7-3. 4位〜10位
    // ========================================

    const remainingTopTen =
        rankingImageTarget.ranking.slice(
            3,
            10
        );


    remainingTopTen.forEach(
        function (song, index) {

            const rank =
                index + 4;

            const y =
                675 +
                (
                    index *
                    145
                );


            // ---------- 白いカード ----------

            fillRoundedRect(
                context,
                100,
                y,
                880,
                120,
                20,
                "#ffffff"
            );


            // ---------- 順位 ----------

            context.fillStyle =
                "#222222";

            context.font =
                "700 30px sans-serif";

            context.textAlign =
                "center";

            context.textBaseline =
                "middle";

            context.fillText(
                `${rank}位`,
                160,
                y + 60
            );


            // ---------- 楽曲画像 ----------

            const image =
                new Image();

            image.onload =
                function () {

                    drawImageContain(
                        context,
                        image,
                        220,
                        y + 10,
                        100,
                        100
                    );

                };

            image.onerror =
                function () {

                    console.log(
                        "4〜10位画像の読み込みに失敗:",
                        image.src
                    );

                };

            image.src =
                song.image;


            // ---------- 曲名 ----------

            context.fillStyle =
                "#222222";

            context.font =
                "700 30px sans-serif";

            context.textAlign =
                "left";

            context.textBaseline =
                "middle";

            context.fillText(
                song.title,
                360,
                y + 60
            );

        }
    );


    // ========================================
    // 7-4. ランキング条件
    // ========================================

    const {
        conditions,
        musicTypeText,
        categoryText,
        mvText,
        albumText
    } =
        getRankingImageConditionTexts();


    // ---------- 条件見出し ----------

    context.fillStyle =
        "#ffffff";

    context.font =
        "700 26px sans-serif";

    context.textAlign =
        "left";

    context.textBaseline =
        "alphabetic";

    context.fillText(
        "ランキング条件",
        100,
        1745
    );


    // ---------- 条件内容 ----------

    context.font =
        "500 20px sans-serif";

    context.fillText(
        `対象：${conditions.songCount}曲　 Type：${musicTypeText}　 MV：${mvText}`,
        100,
        1785
    );

    context.fillText(
        `Category：${categoryText}`,
        100,
        1820
    );

    context.fillText(
        `Album：${albumText}`,
        100,
        1855
    );


    // ========================================
    // 7-5. ブランド署名
    // ========================================

    context.font =
        "500 14px sans-serif";

    context.textAlign =
        "right";

    context.fillText(
        "Created by MyYoruRank",
        980,
        1890
    );

}


// ========================================
// 8. プレビュー生成
// ========================================


// ========================================
// 8-1. プレビューを更新
// ========================================

function updateRankingImagePreview() {

    if (!rankingImageTarget) {

        return;

    }


    const selectedRange =
        document.querySelector(
            'input[name="ranking-image-range"]:checked'
        ).value;


    console.log(
        "画像生成範囲:",
        selectedRange
    );


    // ========================================
    // 全曲版
    // ========================================

    if (selectedRange === "all") {

        createAllRankingImagePages();

        allRankingImageCurrentPage =
            0;

        drawAllRankingImagePage();

        rankingImagePageControls.hidden =
            false;

        rankingImageShareButton.hidden =
            true;

        rankingImagePreviewContainer.hidden =
            false;

        return;

    }


    // ========================================
    // TOP10版
    // ========================================

    drawTop10RankingImage();

    rankingImagePageControls.hidden =
        true;

    rankingImageShareButton.hidden =
        false;

    rankingImagePreviewContainer.hidden =
        false;

}


// ========================================
// 8-2. プレビューボタン
// ========================================

rankingImagePreviewButton.addEventListener(
    "click",
    function () {

        updateRankingImagePreview();

    }
);

// ========================================
// 8-3. 保存範囲変更時に自動更新
// ========================================

rankingImageTop10Radio.addEventListener(
    "change",
    function () {

        if (this.checked) {

            updateRankingImagePreview();

        }

    }
);

rankingImageAllRadio.addEventListener(
    "change",
    function () {

        if (this.checked) {

            updateRankingImagePreview();

        }

    }
);

// ========================================
// 8-4. タイトル形式変更時に自動更新
// ========================================

rankingImageTitleTypeRadios.forEach(
    function (radio) {

        radio.addEventListener(
            "change",
            function () {

                updateRankingImagePreview();

            }
        );

    }
);

// ========================================
// 8-5. 名前入力時に自動更新
// ========================================

let rankingImagePreviewUpdateTimer =
    null;

rankingImageNameInput.addEventListener(
    "input",
    function () {

        clearTimeout(
            rankingImagePreviewUpdateTimer
        );

        rankingImagePreviewUpdateTimer =
            setTimeout(
                function () {

                    updateRankingImagePreview();

                },
                200
            );

    }
);


// ========================================
// 9. 画像保存
// ========================================

// ========================================
// 9-0. モバイル端末かどうか判定
// ========================================

function isMobileDevice() {

    return (
        /Android|iPhone|iPad|iPod/i.test(
            navigator.userAgent
        )
    );

}

// ========================================
// 9-0-2. ファイル共有が可能か判定
// ========================================

function canShareImageFiles(files) {

    return (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
            files: files
        })
    );

}

// ========================================
// 9-1-1. CanvasをPNG Blobに変換
// ========================================

function convertRankingCanvasToBlob() {

    return new Promise(
        function (resolve, reject) {

            rankingImageCanvas.toBlob(
                function (blob) {

                    if (!blob) {

                        reject(
                            new Error(
                                "画像のPNG変換に失敗しました。"
                            )
                        );

                        return;

                    }

                    resolve(blob);

                },
                "image/png"
            );

        }
    );

}

// ========================================
// 9-1-2. 保存ファイル名を生成
// ========================================

function getRankingImageFileName(
    type,
    pageNumber = null
) {

    // 現在設定されている画像タイトル
    const title =
        getRankingImageTitle();


    // ファイル名に使いにくい文字を置換
    const safeTitle =
        title.replace(
            /[\\/:*?"<>|]/g,
            "_"
        );


    // ========================================
    // TOP10
    // ========================================

    if (type === "top10") {

        return `${safeTitle}_TOP10.png`;

    }


    // ========================================
    // 全曲版
    // ========================================

    if (
        type === "all" &&
        pageNumber !== null
    ) {

        const formattedPageNumber =
            String(
                pageNumber
            ).padStart(
                2,
                "0"
            );

        return `${safeTitle}_ALL_${formattedPageNumber}.png`;

    }


    // 想定外の場合
    return `${safeTitle}.png`;

}

// ========================================
// 9-1-3. 画像ファイルを通常ダウンロード
// ========================================

function downloadRankingImage(
    blob,
    fileName
) {

    const imageUrl =
        URL.createObjectURL(
            blob
        );

    const downloadLink =
        document.createElement(
            "a"
        );

    downloadLink.href =
        imageUrl;

    downloadLink.download =
        fileName;


    document.body.appendChild(
        downloadLink
    );

    downloadLink.click();

    downloadLink.remove();


    URL.revokeObjectURL(
        imageUrl
    );

}

// ========================================
// 9-2. TOP10画像をPNGとして保存
// ========================================

async function saveTop10RankingImage() {

    try {

        // CanvasをPNG Blobへ変換
        const blob =
            await convertRankingCanvasToBlob();


        // 端末に応じて保存方法を自動選択
        await saveRankingImage(
            blob,
            getRankingImageFileName(
                "top10"
            )
        );


        console.log(
            "TOP10画像の保存処理が完了しました"
        );

    } catch (error) {

        console.error(
            "TOP10画像の保存に失敗しました:",
            error
        );

    }

}

// ========================================
// 9-3. 保存ボタン
// ========================================

rankingImageSaveButton.addEventListener(
    "click",
    function () {

        const selectedRange =
            document.querySelector(
                'input[name="ranking-image-range"]:checked'
            ).value;


        if (selectedRange === "top10") {

            saveTop10RankingImage();

            return;

        }


        if (selectedRange === "all") {

            saveAllRankingImages();

            return;

        }

    }
);

// ========================================
// 9-4. 全曲版を複数枚PNGとして保存
// ========================================

async function saveAllRankingImages() {

    if (
        allRankingImagePages.length === 0
    ) {

        console.error(
            "全曲版のページデータがありません。"
        );

        return;

    }


    try {

        // 保存開始前のページを記憶
        const originalPage =
            allRankingImageCurrentPage;


        // ========================================
        // 全ページ分のBlobを作成
        // ========================================

        const imageFiles = [];


        for (
            let pageIndex = 0;
            pageIndex < allRankingImagePages.length;
            pageIndex++
        ) {

            // 保存対象ページへ移動
            allRankingImageCurrentPage =
                pageIndex;


            // Canvasへ描画
            drawAllRankingImagePage();


            // 画像読み込み完了を少し待つ
            await new Promise(
                function (resolve) {

                    setTimeout(
                        resolve,
                        300
                    );

                }
            );


            // Canvas → PNG Blob
            const blob =
                await convertRankingCanvasToBlob();


            // Fileへ変換
            const file =
                new File(
                    [blob],
                    getRankingImageFileName(
                        "all",
                        pageIndex + 1
                    ),
                    {
                        type: "image/png"
                    }
                );


            imageFiles.push(
                file
            );

        }


        // ========================================
        // 保存前のページへ戻す
        // ========================================

        allRankingImageCurrentPage =
            originalPage;

        drawAllRankingImagePage();


        // ========================================
        // モバイル端末かどうか判定
        // ========================================

        const mobileDevice =
            isMobileDevice();

            
        // ========================================
        // スマホ：複数画像をまとめて共有
        // ========================================

        if (
            mobileDevice &&
            canShareImageFiles(imageFiles)
        ) {

            try {

                await navigator.share({
                    files: imageFiles
                });


                console.log(
                    "全曲版の複数画像を共有しました"
                );

                return;

            } catch (error) {

                if (
                    error.name === "AbortError"
                ) {

                    console.log(
                        "全曲版画像の共有がキャンセルされました"
                    );

                    return;

                }


                console.error(
                    "全曲版の複数画像共有に失敗しました:",
                    error
                );

            }

        }


        // ========================================
        // PCまたは複数共有非対応：
        // 1枚ずつ通常ダウンロード
        // ========================================

        for (
            const file of imageFiles
        ) {

            downloadRankingImage(
                file,
                file.name
            );

        }

        console.log(
            "全曲版の画像保存が完了しました"
        );

    } catch (error) {

        console.error(
            "全曲版画像の保存に失敗しました:",
            error
        );

    }

}

// ========================================
// 9-5. スマホ用画像保存
// ========================================

async function saveRankingImageOnMobile(
    blob,
    fileName
) {

    try {

        // BlobからFileを作成
        const file =
            new File(
                [blob],
                fileName,
                {
                    type: "image/png"
                }
            );


        // 画像ファイルを共有できない場合
        if (
            !canShareImageFiles([file])
        ) {

            return false;

        }

        // OSの共有シートを開く
        await navigator.share({
            files: [file]
        });


        return true;

    } catch (error) {

        // ユーザーが共有画面を閉じただけなら
        // エラーとして扱わない
        if (
            error.name === "AbortError"
        ) {

            console.log(
                "画像保存・共有がキャンセルされました"
            );

            return true;

        }


        console.error(
            "スマホ用画像保存に失敗しました:",
            error
        );

        return false;

    }

}

// ========================================
// 9-6. 保存方法を自動で切り替える
// ========================================

async function saveRankingImage(
    blob,
    fileName
) {

    // ========================================
    // モバイル端末かどうか判定
    // ========================================

    const mobileDevice =
        isMobileDevice();


    // Blobから共有判定用のFileを作成
    const file =
        new File(
            [blob],
            fileName,
            {
                type: "image/png"
            }
        );


    // ========================================
    // モバイル端末かつファイル共有可能
    // ========================================

    if (
        mobileDevice &&
        canShareImageFiles([file])
    ) {

        const shared =
            await saveRankingImageOnMobile(
                blob,
                fileName
            );

        if (shared) {

            return;

        }

    }


    // ========================================
    // PCまたは共有非対応なら通常ダウンロード
    // ========================================

    downloadRankingImage(
        blob,
        fileName
    );
}



// ========================================
// 10. 共有
// ========================================

// ========================================
// 10-1. TOP10画像を共有用Fileに変換
// ========================================

async function createTop10ShareFile() {

    const blob =
        await convertRankingCanvasToBlob();

    const fileName =
        getRankingImageFileName(
            "top10"
        );

    return new File(
        [blob],
        fileName,
        {
            type: "image/png"
        }
    );

}

// ========================================
// 10-1-2. 共有非対応時のフォールバック
// ========================================

async function fallbackTop10Share() {

    await saveTop10RankingImage();

    alert(
        "このブラウザでは直接共有できないため、TOP10画像を保存しました。\n保存した画像をXなどに添付して共有してください。"
    );

}

// ========================================
// 10-2. TOP10画像を共有
// ========================================

async function shareTop10RankingImage() {

    try {

        const file =
            await createTop10ShareFile();


        // ファイル共有に非対応
        if (
            !canShareImageFiles([file])
        ) {

            await fallbackTop10Share();

            return;

        }

        // OSの共有画面を開く
        await navigator.share({
            files: [file]
        });


        console.log(
            "TOP10画像を共有しました"
        );

    } catch (error) {

        // ユーザーが共有画面を閉じた場合
        if (
            error.name === "AbortError"
        ) {

            console.log(
                "共有がキャンセルされました"
            );

            return;

        }


        console.error(
            "TOP10画像の共有に失敗しました:",
            error
        );

    }

}

// ========================================
// 10-3. 共有ボタン
// ========================================

rankingImageShareButton.addEventListener(
    "click",
    function () {

        shareTop10RankingImage();

    }
);

// ========================================
// 整理済み ranking-image.js ここまで
// ========================================