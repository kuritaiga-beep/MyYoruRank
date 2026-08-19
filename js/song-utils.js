// ==============================
// song-utils.js
// 楽曲データの共通処理
// ==============================

// ==============================
// 1. アルバム表示順
// ==============================

const albumOrder = [
  "夏草が邪魔をする",
  "負け犬にアンコールはいらない",
  "だから僕は音楽を辞めた",
  "エルマ",
  "盗作",
  "創作",
  "幻燈",
  "二人称",
  "シングル",
  "トリビュート",
];

// ==============================
// 2. 一覧で表示するアルバム名を取得
// ==============================

function getDisplayAlbumName(song) {
  // albumが空文字の曲はシングルとしてまとめる
  if (typeof song.album !== "string" || song.album.trim() === "") {
    return "シングル";
  }

  return song.album.trim();
}

// ==============================
// 3. 楽曲をアルバムごとに分類
// ==============================

function groupSongsByAlbum(songData) {
  const groupedSongs = new Map();

  songData.forEach(function (song) {
    const albumName = getDisplayAlbumName(song);

    if (!groupedSongs.has(albumName)) {
      groupedSongs.set(albumName, []);
    }

    groupedSongs.get(albumName).push(song);
  });

  return groupedSongs;
}

// ==============================
// 4. アルバムの表示順を作る
// ==============================

function getOrderedAlbumNames(groupedSongs) {
  const orderedAlbumNames = [];

  // 指定済みのアルバム順で追加
  albumOrder.forEach(function (albumName) {
    if (groupedSongs.has(albumName)) {
      orderedAlbumNames.push(albumName);
    }
  });

  // albumOrderにない新しいアルバムも
  // 一覧から消えないよう最後に追加
  groupedSongs.forEach(function (_, albumName) {
    if (!orderedAlbumNames.includes(albumName)) {
      orderedAlbumNames.push(albumName);
    }
  });

  return orderedAlbumNames;
}
