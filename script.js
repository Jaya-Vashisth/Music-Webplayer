// song to play
let currentSong = new Audio();
let playlist;
let currFolder;

///////////////// fetching song from the playlist////////////////////////////
async function getPlaylist(folder) {
  currFolder = folder;
  let songs = await fetch(`http://127.0.0.1:3000/${folder}`);
  let response = await songs.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let atags = div.getElementsByTagName("a");

  playlist = [];
  for (let index = 0; index < atags.length; index++) {
    const element = atags[index];
    if (element.href.endsWith(".mp3")) {
      playlist.push(element.href.split(folder + "/")[1]);
    }
  }

  let songul = document
    .querySelector(".myLibrary")
    .getElementsByTagName("ul")[0];

  songul.innerHTML = "";
  //parse to the my library
  for (const song of playlist) {
    songul.innerHTML =
      songul.innerHTML +
      `<li>
                     <div class="songCard"> 
                            <img src="images/music.svg" class="invert">
                            <div class="info">
                             <div>${song.split("%20").join(" ")}</div>
                            
                            </div> 
                          </div>
                          <div class="playNow">
                           <span>Play Now</span>
                           <img src="images/playsong.svg" class="invert" alt="">
                          </div>
                       </li>`;
  }

  //attach an evnetlistener to each song
  Array.from(
    document.querySelector(".myLibrary").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
}

// display albums on the page
async function displayAlbums() {
  let a = await fetch(`playlists/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let atags = div.querySelectorAll("a");
  // let cardContainer = document.querySelector(".cardContainer");

  let array = Array.from(atags);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("playlists")) {
      let folders = e.href.split("/").slice(-2)[0];
      console.log(folders);

      //get the metadata of the folder
      let a = await fetch(`playlists/${folders}/info.json`);

      let response = await a.json();
      // console.log(response.title);
      let cardContainer = document.querySelector(".cardContainer");
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div class="playCard" data-folder = ${folders}>
      <div class="play" >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
              color="#000000" fill="rgb(0, 0, 0)">
              <path
                  d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                  stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
          </svg>
      </div>
      <img src="playlists/${folders}/cover.jpg" alt="">
      <h2>${response.title}</h2>
      <p>${response.description}</p>
  </div>`;
    }
  }

  //add the album selected to library and play first song
  Array.from(document.getElementsByClassName("playCard")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      // console.log(item.currentTarget);
      await getPlaylist(`playlists/${item.currentTarget.dataset.folder}`);
      currentSong.src = playlist[0];
      playMusic(playlist[0]);
    });
  });
}

//convert seconds to minute
function secondsToMinuteSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

// function play the music
const playMusic = (track, pause = false) => {
  currentSong.src = `${currFolder}/` + track;

  track = track.split("%20").join(" ");
  if (!pause) {
    currentSong.play();
    // currentSong.volume = 0;
    //change the play icon
    play.src = "images/pause.svg";
  }

  //set name of the song
  document.querySelector(".songInfo").innerHTML = track;
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

async function main() {
  //get the whole playlist
  await getPlaylist("playlists/Bright_(mood)");
  //set the 1st song by default in play bar
  playMusic(playlist[0]);

  //display all albums
  displayAlbums();

  // attach an event listener to play , next and previous buttons
  play.addEventListener("click", (e) => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "images/pause.svg";
    } else {
      currentSong.pause();
      play.src = "images/playsong.svg";
    }
  });

  //play the previous song
  previous.addEventListener("click", (e) => {
    let curr = currentSong.src.split("/")[5];
    let index = playlist.indexOf(curr);
    console.log("previous clicked");

    if (index - 1 >= 0) {
      currentSong.src = playlist[index - 1];
      playMusic(playlist[index - 1]);
    }
  });

  //play the next song
  next.addEventListener("click", (e) => {
    console.log("next clicked");

    let curr = currentSong.src.split("/")[5];
    let index = playlist.indexOf(curr);

    if (index + 1 < playlist.length) {
      currentSong.src = playlist[index + 1];
      playMusic(playlist[index + 1]);
    }
  });

  //listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songTime").innerHTML = `${secondsToMinuteSeconds(
      currentSong.currentTime
    )} / ${secondsToMinuteSeconds(currentSong.duration)}`;

    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";

    if (currentSong.currentTime == currentSong.duration) {
      // let x = document.getElementById("play");
      // x.src = "images/playsong.svg";
      // console.log(x);

      //autoplay next
      next.click();
    }
  });

  //add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  //add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", (e) => {
    document.querySelector(".left").style.left = 0;
  });

  document.querySelector(".close").addEventListener("click", (e) => {
    document.querySelector(".left").style.left = "-110%";
  });

  //add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  //add event listener to mute
  document.querySelector(".volume img").addEventListener("click", (e) => {
    if (e.target.src.includes("images/volume.svg")) {
      e.target.src = e.target.src.replace(
        "images/volume.svg",
        "images/mute.svg"
      );
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace(
        "images/mute.svg",
        "images/volume.svg"
      );
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}
main();
