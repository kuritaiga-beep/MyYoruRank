// ==============================
// ranking-result.js
// ランキング結果の表示
// ==============================

// ==============================
// 0. 結果画面の要素・状態
// ==============================

const toggleRankingButton = document.getElementById("toggle-ranking-button");

const resultRankingSettingsContent = document.getElementById(
  "result-ranking-settings-content",
);

let isShowingAllRanking = false;

// ==============================
// 9. ランキング結果を表示
// ==============================

function displayRanking(ranking) {
  // ----------
  // 結果画面を初期化
  // ----------

  isShowingAllRanking = false;

  toggleRankingButton.textContent = "全曲ランキングを表示";

  resultScreen.classList.remove("show-all-ranking");

  rankingList.innerHTML = "";

  // ----------
  // ランキングを表示
  // ----------

  ranking.forEach(function (song, index) {
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

    //画像タイプに応じたCSSを適用
    if (rankingImage && song.imageType) {
      rankingImage.classList.add(`${song.imageType}-image`);
    }

    rankingList.appendChild(rankingItem);
  });
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
// 10. 今回のランキング条件を表示
// ==============================

function displayRankingConditions(conditions = currentRankingConditions) {
  if (!conditions) {
    return;
  }

  const { songCount, albums, musicTypes, categories, mvStatus } = conditions;

  const musicTypeText =
    musicTypes.length > 0 ? musicTypes.join(" / ") : "すべて";

  const categoryText =
    categories.length > 0 ? categories.join(" / ") : "すべて";

  let mvText = "すべて";

  if (mvStatus.length === 1 && mvStatus[0] === "true") {
    mvText = "MVあり";
  } else if (mvStatus.length === 1 && mvStatus[0] === "false") {
    mvText = "MVなし";
  }

  const albumText = albums.length > 0 ? albums.join(" / ") : "すべて";

  resultRankingSettingsContent.innerHTML = `
        <p>対象曲数：${songCount}曲</p>
        <p>Type：${musicTypeText}</p>
        <p>MV：${mvText}</p>
        <p>Category：${categoryText}</p>
        <p>Album：${albumText}</p>
    `;
}

// ==============================
// 12. ランキング表示切り替え
// ==============================

function toggleRankingDisplay() {
  const resultScreen = document.getElementById("result-screen");

  isShowingAllRanking = !isShowingAllRanking;

  resultScreen.classList.toggle("show-all-ranking", isShowingAllRanking);

  toggleRankingButton.textContent = isShowingAllRanking
    ? "トップ10だけ表示"
    : "全曲ランキングを表示";
}

toggleRankingButton.addEventListener("click", toggleRankingDisplay);

// ==============================
// 7-4. 結果画面
// ==============================

function setupResultEvents() {
  // ランキング条件の開閉
  resultConditionsToggleButton.addEventListener("click", function () {
    const isExpanded =
      resultConditionsToggleButton.getAttribute("aria-expanded") === "true";

    resultConditionsToggleButton.setAttribute(
      "aria-expanded",
      String(!isExpanded),
    );

    resultConditionsContent.hidden = isExpanded;

    resultConditionsToggleIcon.textContent = isExpanded ? "▼" : "▲";

    resultConditionsToggleText.textContent = isExpanded
      ? "条件を見る"
      : "条件を閉じる";
  });

  // ホーム画面へ戻る
  restartButton.addEventListener("click", function () {
    resetRankingState();

    showHomeScreen();
  });
}
