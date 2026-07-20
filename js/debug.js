// ==============================
// debug.js
// MyYoruRank 開発者用デバッグ機能
// ==============================

(function () {

    // ==============================
    // 1. デバッグ状態
    // ==============================

    // 読み込みに失敗した画像を記録
    const imageErrors = new Map();


    // ==============================
    // 2. Debugショートカット
    // ==============================

    function setupDebugShortcut() {

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.ctrlKey &&
                    event.altKey &&
                    event.key.toLowerCase() === "d"
                ) {

                    event.preventDefault();

                    openDebugMenu();

                }

            }
        );

    }


    // ==============================
    // 3. Debug Menu
    // ==============================

    function openDebugMenu() {

        const shouldShowResult =
            confirm(
                "結果画面を表示しますか？"
            );

        if (!shouldShowResult) {
            return;
        }

        showDebugResultScreen();

    }

    // ------------------------------
    // 3-1. 結果画面を表示
    // ------------------------------

    function showDebugResultScreen() {

        if (
            typeof songs === "undefined" ||
            !Array.isArray(songs)
        ) {

            alert(
                "songsが読み込まれていません。"
            );

            return;

        }

        if (
            typeof displayRanking !== "function" ||
            typeof showResultScreen !== "function"
        ) {

            alert(
                "結果画面の表示処理が読み込まれていません。"
            );

            return;

        }

    const debugRanking =
        [...songs];

    displayRanking(
        debugRanking
    );

    showResultScreen();

}

    // ==============================
    // 4. 画像デバッグ
    // ==============================


    // ------------------------------
    // 4-1. 画像エラー件数を更新
    // ------------------------------

    window.updateImageErrorCount =
        function updateImageErrorCount() {

            const imageErrorCount =
                document.getElementById(
                    "image-error-count"
                );

            if (!imageErrorCount) {
                return;
            }

            imageErrorCount.textContent =
                imageErrors.size;

        };


    // ------------------------------
    // 4-2. 楽曲画像かどうかを判定
    // ------------------------------

    function isSongImage(imageElement) {

        return (
            imageElement.id === "left-image" ||
            imageElement.id === "right-image" ||
            imageElement.classList.contains(
                "ranking-image"
            ) ||
            imageElement.classList.contains(
                "song-list-image"
            )
        );

    }


    // ------------------------------
    // 4-3. 画像エラーを記録
    // ------------------------------

    function recordImageError(imageElement) {

        if (!isSongImage(imageElement)) {
            return;
        }

        const originalImagePath =
            imageElement.dataset.originalSrc ||
            imageElement.getAttribute("src") ||
            "不明";

        const songTitle =
            imageElement.alt ||
            "曲名不明";

        const errorKey =
            `${songTitle}::${originalImagePath}`;


        // 同じ画像エラーを重複して数えない
        if (!imageErrors.has(errorKey)) {

            imageErrors.set(
                errorKey,
                {
                    title: songTitle,
                    image: originalImagePath
                }
            );

            console.error(
                `[画像エラー] ${songTitle}`,
                originalImagePath
            );

        }

        imageElement.classList.add(
            "image-load-error"
        );

        updateImageErrorCount();

    }


    // ------------------------------
    // 4-4. 画像エラーを監視
    // ------------------------------

    function setupImageErrorListener() {

        document.addEventListener(
            "error",
            function (event) {

                const target =
                    event.target;

                if (
                    !(target instanceof HTMLImageElement)
                ) {
                    return;
                }

                if (!isSongImage(target)) {
                    return;
                }


                // 最初に指定されていた画像パスを保存
                if (!target.dataset.originalSrc) {

                    target.dataset.originalSrc =
                        target.getAttribute("src") || "";

                }

                recordImageError(target);


                // 代替画像への変更は1回だけ
                if (
                    target.dataset.fallbackApplied !==
                    "true"
                ) {

                    target.dataset.fallbackApplied =
                        "true";

                    target.src =
                        "assets/icon.jpg";

                }

            },
            true
        );

    }


    // ==============================
    // 5. 楽曲データ検証
    // ==============================


    // ------------------------------
    // 5-1. 楽曲データを検証
    // ------------------------------

    function validateSongs() {

        const validationErrors = [];
        const validationWarnings = [];

        const titleCount = new Map();


        // songs自体が存在するか確認
        if (typeof songs === "undefined") {

            validationErrors.push(
                "songsが定義されていません。"
            );

            return {
                errors: validationErrors,
                warnings: validationWarnings
            };

        }


        // songsが配列か確認
        if (!Array.isArray(songs)) {

            validationErrors.push(
                "songsが配列ではありません。"
            );

            return {
                errors: validationErrors,
                warnings: validationWarnings
            };

        }


        songs.forEach(
            function (song, index) {

                const location =
                    `songs[${index}]`;


                // 楽曲データ自体の確認
                if (
                    !song ||
                    typeof song !== "object"
                ) {

                    validationErrors.push(
                        `${location}が正しいオブジェクトではありません。`
                    );

                    return;

                }


                // title
                if (
                    typeof song.title !== "string" ||
                    song.title.trim() === ""
                ) {

                    validationErrors.push(
                        `${location}: titleがありません。`
                    );

                } else {

                    const currentCount =
                        titleCount.get(song.title) || 0;

                    titleCount.set(
                        song.title,
                        currentCount + 1
                    );

                }


                // image
                if (
                    typeof song.image !== "string" ||
                    song.image.trim() === ""
                ) {

                    validationErrors.push(
                        `${location}「${
                            song.title || "曲名不明"
                        }」: imageがありません。`
                    );

                }


                // imageType
                if (
                    song.imageType !== "mv" &&
                    song.imageType !== "jacket"
                ) {

                    validationErrors.push(
                        `${location}「${
                            song.title || "曲名不明"
                        }」: imageTypeは「mv」または「jacket」にしてください。`
                    );

                }


                // musicType
                if (
                    song.musicType !== "vocal" &&
                    song.musicType !==
                        "instrumental"
                ) {

                    validationErrors.push(
                        `${location}「${
                            song.title || "曲名不明"
                        }」: musicTypeは「vocal」または「instrumental」にしてください。`
                    );

                }


                // album
                if (
                    typeof song.album !== "string"
                ) {

                    validationErrors.push(
                        `${location}「${
                            song.title || "曲名不明"
                        }」: albumは文字列にしてください。`
                    );

                }


                // hasMV
                if (
                    typeof song.hasMV !== "boolean"
                ) {

                    validationErrors.push(
                        `${location}「${
                            song.title || "曲名不明"
                        }」: hasMVはtrueまたはfalseにしてください。`
                    );

                }


                // youtubeUrl
                if (
                    typeof song.youtubeUrl !== "string"
                ) {

                    validationErrors.push(
                        `${location}「${
                            song.title || "曲名不明"
                        }」: youtubeUrlは文字列にしてください。`
                    );

                } else if (
                    song.youtubeUrl !== "" &&
                    !isYouTubeUrl(song.youtubeUrl)
                ) {

                    validationWarnings.push(
                        `${location}「${
                            song.title || "曲名不明"
                        }」: YouTube URLの形式を確認してください。`
                    );

                }


                // hasMVとyoutubeUrlの不一致
                if (
                    song.hasMV === true &&
                    song.youtubeUrl === ""
                ) {

                    validationWarnings.push(
                        `${location}「${
                            song.title || "曲名不明"
                        }」: hasMVがtrueですが、youtubeUrlが空です。`
                    );

                }


                // imageTypeとhasMVの不一致
                if (
                    song.imageType === "mv" &&
                    song.hasMV !== true
                ) {

                    validationWarnings.push(
                        `${location}「${
                            song.title || "曲名不明"
                        }」: imageTypeがmvですが、hasMVがtrueではありません。`
                    );

                }

            }
        );


        // 曲名の重複確認
        titleCount.forEach(
            function (count, title) {

                if (count > 1) {

                    validationWarnings.push(
                        `曲名「${title}」が${count}件登録されています。`
                    );

                }

            }
        );


        return {
            errors: validationErrors,
            warnings: validationWarnings
        };

    }


    // ------------------------------
    // 5-2. YouTube URLを確認
    // ------------------------------

    function isYouTubeUrl(url) {

        try {

            const parsedUrl =
                new URL(url);

            return (
                parsedUrl.hostname ===
                    "www.youtube.com" ||
                parsedUrl.hostname ===
                    "youtube.com" ||
                parsedUrl.hostname ===
                    "youtu.be" ||
                parsedUrl.hostname ===
                    "m.youtube.com"
            );

        } catch (error) {

            return false;

        }

    }


    // ------------------------------
    // 5-3. 検証結果をコンソール表示
    // ------------------------------

    function displayValidationResult() {

        const result =
            validateSongs();

        console.group(
            "MyYoruRank デバッグ情報"
        );


        // songsが存在しない場合
        if (
            typeof songs === "undefined" ||
            !Array.isArray(songs)
        ) {

            result.errors.forEach(
                function (message) {

                    console.error(message);

                }
            );

            console.groupEnd();

            return;

        }


        console.log(
            `登録曲数：${songs.length}曲`
        );

        console.log(
            `MVあり：${
                songs.filter(
                    function (song) {

                        return (
                            song &&
                            song.hasMV === true
                        );

                    }
                ).length
            }曲`
        );

        console.log(
            `ボーカル：${
                songs.filter(
                    function (song) {

                        return (
                            song &&
                            song.musicType ===
                                "vocal"
                        );

                    }
                ).length
            }曲`
        );

        console.log(
            `インスト：${
                songs.filter(
                    function (song) {

                        return (
                            song &&
                            song.musicType ===
                                "instrumental"
                        );

                    }
                ).length
            }曲`
        );


        // データエラー
        if (result.errors.length === 0) {

            console.log(
                "データエラー：なし"
            );

        } else {

            console.group(
                `データエラー：${result.errors.length}件`
            );

            result.errors.forEach(
                function (message) {

                    console.error(message);

                }
            );

            console.groupEnd();

        }


        // 警告
        if (result.warnings.length === 0) {

            console.log(
                "警告：なし"
            );

        } else {

            console.group(
                `警告：${result.warnings.length}件`
            );

            result.warnings.forEach(
                function (message) {

                    console.warn(message);

                }
            );

            console.groupEnd();

        }

        console.groupEnd();

    }


    // ==============================
    // 6. デバッグ機能を初期化
    // ==============================

    function initializeDebugMode() {

        // Debug Menuのショートカットは
        // 通常モードでも使用できるようにする
        setupDebugShortcut();


        // isDebugModeが存在しない、
        // またはfalseの場合はここで終了
        if (
            typeof isDebugMode === "undefined" ||
            !isDebugMode
        ) {
            return;
        }


        console.log(
            "MyYoruRank：デバッグモードが有効です。"
        );

        setupImageErrorListener();

        displayValidationResult();

        updateImageErrorCount();

    }


    // ==============================
    // 7. 起動
    // ==============================

    document.addEventListener(
        "DOMContentLoaded",
        initializeDebugMode
    );

})();