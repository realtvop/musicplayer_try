const fs = require("fs");
const path = require("path");
// import parseFile from 'music-metadata';
const datadir = path.join(process.env.HOME || process.env.USERPROFILE, "Music/mdml");

const playInfo = {
    nowPlaying: 0,
    playingPlaylist: 0,
    showPlaylist: 0,
    isPlaying: false,
    playControl: {
        repeat: 0, // 0:no repeat; 1:repeat; 2:repeat one
        shuffle: false,
        mute: false,
        volume: 1,
    },
};
let playLists = [];

function getSongFile(obj, type) {
    return `file://${path.join(datadir, type, obj)}`
    // return obj
}

const music = document.getElementById("music");
const playIcon = document.getElementById("play-icon");
const timeSlider = document.getElementById("input-timeSlider");


function play() {
    if (!music.src) return;
    if (playInfo.isPlaying=!playInfo.isPlaying) {
        music.play();
    } else {
        music.pause();
    }
}

music.addEventListener("timeupdate", function() {
    if (!music.paused) {
        playIcon.innerText = "pause";
        playInfo.isPlaying = true;
        // music.setAttribute("title", playLists[playInfo.playingPlaylist].songs[playInfo.nowPlaying].showName);
        // music.setAttribute("artist", playLists[playInfo.playingPlaylist].songs[playInfo.nowPlaying].artist);
        // music.setAttribute("album", playLists[playInfo.playingPlaylist].songs[playInfo.nowPlaying].album);
        // music.setAttribute("artwork", playLists[playInfo.playingPlaylist].songs[playInfo.nowPlaying].artwork);
        navigator.mediaSession.playbackState = "playing";
        navigator.mediaSession.metadata = new MediaMetadata({
            title: playLists[playInfo.playingPlaylist].songs[playInfo.nowPlaying].showName,
            artist: playLists[playInfo.playingPlaylist].songs[playInfo.nowPlaying].artist,
            album: playLists[playInfo.playingPlaylist].songs[playInfo.nowPlaying].album,
            // artwork: [
            //   {
            //     src: getSongFile(playLists[playInfo.playingPlaylist].songs[playInfo.nowPlaying].artwork, "artwork"),
            //     // sizes: "96x96",
            //     type: "image/png",
            //   },
            // ],
        });
    } else {
        playIcon.innerText = "play_arrow";
        playInfo.isPlaying = false;
        navigator.mediaSession.playbackState = "paused";
    }
});

music.addEventListener("ended", function() {
    music.currentTime = 0;
    if (playInfo.playControl.repeat == 2) {
        music.play();
    } else if (playInfo.playControl.shuffle) {
        songChange(-1, 
            (function(minNum,maxNum){ 
                switch(arguments.length){ 
                    case 1: 
                        return parseInt(Math.random()*minNum+1,10); 
                    case 2: 
                        return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); 
                    default: 
                        return 0; 
                }
            })(0, playLists[playInfo.playingPlaylist].songs.length-1)
        );
    } else if (playInfo.playControl.repeat == 1) {
        if (playInfo.nowPlaying == playLists[playInfo.playingPlaylist].songs.length - 1) songChange(-1, 0);
        else songChange(1);
    }
});

function updateProgress() {
    var currentTime = music.currentTime;
    timeSlider.value = currentTime/music.duration;
    mdui.updateSliders();
    setTimeout(updateProgress, 250);
}

document.getElementById("input-timeSlider").addEventListener("input", () => {
    music.currentTime = timeSlider.value * music.duration;
});
document.getElementById("input-volumeSlider").addEventListener("input", function() {
    playInfo.playControl.volume = music.volume = +this.value;
});

function repeatChange() {
    if (playInfo.playControl.repeat == 2) playInfo.playControl.repeat = 0;
    else playInfo.playControl.repeat++;
    document.getElementById("icon-repeat").innerText = ["repeat", "repeat", "repeat_one"][playInfo.playControl.repeat];
    if (playInfo.playControl.repeat != 0) document.getElementById("icon-repeat").style.color = "#6cf";
    else document.getElementById("icon-repeat").style.color = "#000";
}
function shuffleChange() {
    playInfo.playControl.shuffle = !playInfo.playControl.shuffle;
    document.getElementById("icon-shuffle").style.color = playInfo.playControl.shuffle ? "#6cf" : "#000";
}
function muteChange() {
    playInfo.playControl.mute = !playInfo.playControl.mute;
    if (playInfo.playControl.mute) music.volume = 0;
    else music.volume = playInfo.playControl.volume;
    document.getElementById("icon-mute").innerText = playInfo.playControl.mute ? "volume_off" : "volume_up";
}

function songChange(forward, to=-1) {
    if (playInfo.playingPlaylist == playInfo.showPlaylist) {
        // if (playInfo.nowPlaying == to && !playInfo.nowPlaying) return music.play();
        // else if (playInfo.nowPlaying == to && playInfo.nowPlaying) return music.pause();
        document.getElementById(`windowPlayList-songs`).querySelectorAll(".mdui-list-item-active").forEach(item => item.classList.remove("mdui-list-item-active"));
        // document.getElementById(`songItem-${playLists[playInfo.playingPlaylist].songs[playInfo.nowPlaying].file}`).classList.add("mdui-list-item-active");
    }
    music.pause();
    if (0 <= to && to <= playLists[playInfo.playingPlaylist].songs.length - 1) playInfo.nowPlaying = to;
    else if (0 <= playInfo.nowPlaying + forward && playInfo.nowPlaying + forward <= playLists[playInfo.playingPlaylist].songs.length - 1) playInfo.nowPlaying = playInfo.nowPlaying + forward;
    else if (playInfo.nowPlaying + forward == playLists[playInfo.playingPlaylist].songs.length) playInfo.nowPlaying = 0;
    music.duration = 0;
    if (playInfo.playingPlaylist == playInfo.showPlaylist) document.getElementById(`songItem-${playLists[playInfo.playingPlaylist].songs[playInfo.nowPlaying].file}`).classList.add("mdui-list-item-active");
    document.getElementById("display-img").src = getSongFile(playLists[playInfo.playingPlaylist].songs[playInfo.nowPlaying].artwork, "artwork");
    document.getElementById("display-songName").innerText = playLists[playInfo.playingPlaylist].songs[playInfo.nowPlaying].showName;
    document.getElementById("display-artists").innerText = playLists[playInfo.playingPlaylist].songs[playInfo.nowPlaying].artist;
    document.getElementById("display-album").innerText = playLists[playInfo.playingPlaylist].songs[playInfo.nowPlaying].album;
    music.src = getSongFile(playLists[playInfo.playingPlaylist].songs[playInfo.nowPlaying].file, "music");
    music.play();
}
navigator.mediaSession.setActionHandler('previoustrack', () => songChange(-1));
navigator.mediaSession.setActionHandler('nexttrack', () => songChange(1));
function playListChange(playlistid) {
    document.getElementById("main-drawer").querySelector(".mdui-list-item-active").classList.remove("mdui-list-item-active");
    playInfo.showPlaylist = playlistid;
    document.getElementById(`playListItem-${playlistid}`).classList.add("mdui-list-item-active");
    loadSongs();
}

function loadSongs() {
    document.getElementById("windowPlayList-songs").innerHTML = "";
    for (let i of playLists[playInfo.showPlaylist].songs) {
        const item = document.createElement("tr");
        item.id = `songItem-${i.file}`;
        item.onclick = () => {
            playInfo.playingPlaylist = playInfo.showPlaylist;
            songChange(-1, playLists[playInfo.playingPlaylist].songs.indexOf(i));
        }
        item.innerHTML = `
            <td style="display: flex; align-items: center;">
                <div class="mdui-list-item-avatar" style="border-radius: 10%;">
                    <img src="${getSongFile(i.artwork, "artwork")}" style="border-radius: 10%;"/>
                </div>
                <div style="margin-left: 1%; text-align: bottom;">
                    ${i.showName}
                </div>
            </td>
            <td>${i.artist}</td>
            <td>${i.album}</td>
        `;
        if (playInfo.playingPlaylist == playInfo.showPlaylist && i.file == playLists[playInfo.playingPlaylist].songs[playInfo.nowPlaying].file) item.classList.add("mdui-list-item-active");
        document.getElementById("windowPlayList-songs").appendChild(item);
    }
}
function loadPlaylists() {
    document.getElementById("playLists").innerHTML = "";
    for (let i of playLists) {
        if (playLists.indexOf(i) == 0) continue;
        const item = document.createElement("a");
        item.classList.add("mdui-list-item");
        item.classList.add("mdui-ripple");
        item.id = `playListItem-${playLists.indexOf(i)}`;
        item.onclick = () => playListChange(playLists.indexOf(i));
        // item.classList.add("mdui-list-item-active");
        item.innerHTML = `
            <i class="mdui-list-item-icon mdui-icon material-icons">queue_music</i>
            <div class="mdui-list-item-content">${i.name}</div>
        `;
        document.getElementById("playLists").appendChild(item);
    }
}

function getPlayLists() {
    playLists[0] = {name: "AllSong",songs: [{showName: "季節の頬とワンダーランド (feat. 初音ミク)",artist: "Kai, 初音ミク",album: "季節の頬とワンダーランド",file: "../example/季節の頬とワンダーランド (feat. 初音ミク)­­.wav",artwork: "../example/季節の頬とワンダーランド.jpg",},{showName: "ポジティブ☆ダンスタイム­­",artist: "kinoshita­",album: "ポジティブ☆ダンスタイム­­",file: "../example/ポジティブ☆ダンスタイム­­.wav",artwork: "../example/ポジティブ☆ダンスタイム­­.jpg",},]};
    playLists[1] = {name: "6",songs: [{showName: "季節の頬とワンダーランド (feat. 初音ミク)",artist: "Kai, 初音ミク",album: "季節の頬とワンダーランド",file: "../example/季節の頬とワンダーランド (feat. 初音ミク)­­.wav",artwork: "../example/季節の頬とワンダーランド.jpg",},]};
    playLists[2] = {name: "9",songs: [{showName: "ポジティブ☆ダンスタイム­­",artist: "kinoshita­",album: "ポジティブ☆ダンスタイム­­",file: "../example/ポジティブ☆ダンスタイム­­.wav",artwork: "../example/ポジティブ☆ダンスタイム­­.jpg",},]};
}

function loadDataFiles() {
    // 没有工作文件夹,node给我们造
    if (!fs.existsSync(datadir)) fs.mkdirSync(datadir);
    if (!fs.existsSync(path.join(datadir, "music"))) fs.mkdirSync(path.join(datadir, "music"));
    if (!fs.existsSync(path.join(datadir, "artwork"))) fs.mkdirSync(path.join(datadir, "artwork"));
    if (fs.existsSync(path.join(datadir, "playLists.json"))) {
        playLists = JSON.parse(fs.readFileSync(path.join(datadir, "playLists.json")).toString());
    } else playLists[0] = {name: "AllSong", songs: []};

}
/* function saveMusicCoverImage(filename) {
    // 由ChatGPT倾情贡献(
    parseFile(path.join(datadir, "songs", filename), { native: true })
        .then(metadata => {
            // 检查是否存在封面图像
            if (metadata.common && metadata.common.picture && metadata.common.picture.length > 0) {
            // 获取第一张封面图像
            const coverImage = metadata.common.picture[0];

            // 输出封面图像格式
            console.log('MIME类型:', coverImage.format);

            // 将封面图像保存到文件
            const outputFilePath = path.join(datadir, "coverimgs", filename); // 替换为你想要保存的输出文件路径
            fs.writeFileSync(outputFilePath, coverImage.data, { encoding: 'binary' });

            console.log('封面图像已保存到:', outputFilePath);
            } else {
            console.log('未找到封面图像');
            }
        })
        .catch(err => {
            console.error('读取音乐文件时出错:', err.message);
        });
} */

function init() {
    loadDataFiles();
    // getPlayLists()
    loadPlaylists();
    loadSongs();
    mdui.mutation();
    updateProgress();
}

init()