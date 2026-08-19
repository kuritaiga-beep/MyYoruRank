// ==============================
// ranking-history.js
// ランキング履歴
// ==============================

// ==============================
// 1. DOM要素の取得
// ==============================

// 履歴一覧
const rankingHistoryButton = document.getElementById("ranking-history-button");

const rankingHistoryHomeButton = document.getElementById(
  "ranking-history-home-button",
);

const rankingHistoryList = document.getElementById("ranking-history-list");

// 履歴詳細
const rankingHistoryDetailSettings = document.getElementById(
  "ranking-history-detail-settings",
);

const rankingHistoryDetailList = document.getElementById(
  "ranking-history-detail-list",
);

const rankingHistoryDetailBackButton = document.getElementById(
  "ranking-history-detail-back-button",
);

// ==============================
// ランキング履歴画面
// ==============================

function displayRankingHistory(rankingHistory) {
  rankingHistoryList.innerHTML = "";

  if (rankingHistory.length === 0) {
    rankingHistoryList.innerHTML = `
                <p>
                    保存されたランキングはありません。
                </p>
            `;

    return;
  }

  rankingHistory.forEach(function (history) {
    const historyItem = document.createElement("div");

    historyItem.classList.add("ranking-history-item");

    historyItem.innerHTML = `
                    <div class="ranking-history-info">

                        <div>
                            ${new Date(history.date).toLocaleString("ja-JP")}
                        </div>

                        <div>
                            対象曲数：${history.conditions.songCount}曲
                        </div>

                        <div class="ranking-history-first">
                            1位：${history.ranking[0].title}
                        </div>

                    </div>

                    <div class="ranking-history-actions">

                        <button
                            type="button"
                            class="ranking-history-view-button"
                            data-ranking-id="${history.id}"
                        >
                            ランキングを見る
                        </button>

                        <button
                            type="button"
                            class="ranking-history-delete-button"
                            data-ranking-id="${history.id}"
                        >
                            削除
                        </button>

                    </div>
                `;

    const viewButton = historyItem.querySelector(
      ".ranking-history-view-button",
    );

    const deleteButton = historyItem.querySelector(
      ".ranking-history-delete-button",
    );

    viewButton.addEventListener("click", function () {
      const rankingId = Number(viewButton.dataset.rankingId);

      showRankingHistoryDetail(rankingHistory, rankingId);
    });

    deleteButton.addEventListener("click", function () {
      const rankingId = Number(deleteButton.dataset.rankingId);

      const shouldDelete = window.confirm("このランキング履歴を削除しますか？");

      if (!shouldDelete) {
        return;
      }

      console.log("削除するランキングID:", rankingId);

      const updatedRankingHistory = rankingHistory.filter(function (history) {
        return history.id !== rankingId;
      });

      localStorage.setItem(
        "rankingHistory",
        JSON.stringify(updatedRankingHistory),
      );

      displayRankingHistory(updatedRankingHistory);
    });

    rankingHistoryList.appendChild(historyItem);
  });
}

let isShowingAllHistoryRanking = false;

// ==============================
// 保存ランキングの詳細を表示
// ==============================

function showRankingHistoryDetail(
  rankingHistory,
  rankingId,
  shouldPushHistory = true,
) {
  const selectedHistory = rankingHistory.find(function (history) {
    return history.id === rankingId;
  });

  const rankingHistoryDetailTitle = document.getElementById(
    "ranking-history-detail-title",
  );

  const savedDate = new Date(selectedHistory.date);

  const formattedDate = savedDate.toLocaleDateString("ja-JP");

  rankingHistoryDetailTitle.textContent = `My Yoru Rank - ${formattedDate}`;

  // ----------
  // 履歴ランキング表示を初期化
  // ----------

  isShowingAllHistoryRanking = false;

  rankingHistoryDetailScreen.classList.remove("show-all-ranking");

  rankingHistoryDetailSettings.innerHTML = `

            <button
                id="ranking-history-conditions-toggle"
                type="button"
                aria-expanded="false"
                aria-controls="ranking-history-conditions"
            >
                <span id="ranking-history-conditions-toggle-text">
                    条件を見る
                </span>

                <span id="ranking-history-conditions-toggle-icon">
                    ▼
                </span>
            </button>

            <div
                id="ranking-history-conditions"
                hidden
            >
                <p>
                    対象曲数：${selectedHistory.conditions.songCount}曲
                </p>

                <p>
                    Type：
                    ${
                      selectedHistory.conditions.musicTypes.length > 0
                        ? selectedHistory.conditions.musicTypes.join(" / ")
                        : "すべて"
                    }
                </p>

                <p>
                    MV：
                    ${
                      selectedHistory.conditions.mvStatus.length > 0
                        ? selectedHistory.conditions.mvStatus.join(" / ")
                        : "すべて"
                    }
                </p>

                <p>
                    Category：
                    ${
                      selectedHistory.conditions.categories.length > 0
                        ? selectedHistory.conditions.categories.join(" / ")
                        : "すべて"
                    }
                </p>

                <p>
                    Album：
                    ${
                      selectedHistory.conditions.albums.length > 0
                        ? selectedHistory.conditions.albums.join(" / ")
                        : "すべて"
                    }
                </p>

            </div>

        `;

  const rankingToggleButton = document.getElementById(
    "ranking-history-toggle-button",
  );

  rankingToggleButton.addEventListener("click", function () {
    isShowingAllHistoryRanking = !isShowingAllHistoryRanking;

    rankingHistoryDetailScreen.classList.toggle(
      "show-all-ranking",
      isShowingAllHistoryRanking,
    );

    rankingToggleButton.textContent = isShowingAllHistoryRanking
      ? "トップ10だけ表示"
      : "全曲ランキングを表示";
  });

  const conditionsToggleButton = document.getElementById(
    "ranking-history-conditions-toggle",
  );

  const conditionsToggleText = document.getElementById(
    "ranking-history-conditions-toggle-text",
  );

  const conditionsToggleIcon = document.getElementById(
    "ranking-history-conditions-toggle-icon",
  );

  const conditionsContent = document.getElementById(
    "ranking-history-conditions",
  );

  conditionsToggleButton.addEventListener("click", function () {
    const isExpanded =
      conditionsToggleButton.getAttribute("aria-expanded") === "true";

    conditionsToggleButton.setAttribute("aria-expanded", String(!isExpanded));

    conditionsContent.hidden = isExpanded;

    conditionsToggleIcon.textContent = isExpanded ? "▼" : "▲";

    conditionsToggleText.textContent = isExpanded
      ? "条件を見る"
      : "条件を閉じる";
  });

  rankingHistoryDetailList.innerHTML = "";

  selectedHistory.ranking.forEach(function (song, index) {
    const rankingItem = document.createElement("div");

    rankingItem.classList.add("ranking-item");

    if (index >= 10) {
      rankingItem.classList.add("ranking-hidden-item");
    }

    const rankingPosition = getRankingPosition(index);

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

    const rankingImage = rankingItem.querySelector(".ranking-image");

    if (rankingImage && song.imageType) {
      rankingImage.classList.add(`${song.imageType}-image`);
    }

    rankingHistoryDetailList.appendChild(rankingItem);
  });

  hideAllScreens();

  rankingHistoryDetailScreen.style.display = "block";

  // 画像保存・共有用に保存ランキングデータを渡す
  setRankingImageTarget(selectedHistory.ranking, selectedHistory.conditions);

  if (shouldPushHistory) {
    pushScreenHistory("ranking-history-detail", { rankingId: rankingId });
  }
}

window.showRankingHistoryDetail = showRankingHistoryDetail;

// ==============================
// 4. ランキング履歴イベント
// ==============================

function setupRankingHistoryEvents() {
    // ホーム → ランキング履歴
    rankingHistoryButton.addEventListener("click", function () {
        hideAllScreens();

        rankingHistoryScreen.style.display = "block";

        const rankingHistory =
            JSON.parse(localStorage.getItem("rankingHistory")) || [];

        displayRankingHistory(rankingHistory);

        pushScreenHistory("ranking-history");
    });

    // ランキング履歴 → ホーム
    rankingHistoryHomeButton.addEventListener("click", function () {
        hideAllScreens();

        homeScreen.style.display = "block";
    });

    // ランキング履歴詳細 → ランキング履歴
    rankingHistoryDetailBackButton.addEventListener("click", function () {
        hideAllScreens();

        rankingHistoryScreen.style.display = "block";
    });
}