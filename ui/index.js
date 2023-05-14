const playInfo = {
    song: "",
    showName: "",
    isPlaying: false,
    duration: 0,
    playControl: {
        repeat: false,
    },
}

const music = document.getElementById("music");
const playIcon = document.getElementById("play-icon");
const timeSlider = document.getElementById("input-timeSlider");

mdui.mutation();
let loop = () => null;

function play() {
    playInfo.duration = music.duration;
    // timeSlider.max = playInfo.duration;


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
        requestAnimationFrame(updateProgress);
    } else {
        playIcon.innerText = "play_arrow";
        playInfo.isPlaying = false;
        cancelAnimationFrame(loop);
    }
});

music.addEventListener("ended", function() {
    music.currentTime = 0;
    updateProgress(false);
    if (playInfo.playControl.repeat) {
        music.play();
    }
});

function updateProgress(isloop=true) {
    var currentTime = music.currentTime;
    timeSlider.value = currentTime/playInfo.duration;
    mdui.updateSliders();
    if (timeSlider.value >= 1) {
        cancelAnimationFrame(loop);
    } else if (isloop) {
        loop = requestAnimationFrame(updateProgress);
    }
}

document.getElementById("input-timeSlider").addEventListener("input", () => {
    music.currentTime = timeSlider.value * playInfo.duration;
});