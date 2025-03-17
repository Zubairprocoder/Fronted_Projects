let currentSongs = new Audio();
let songs;
let currFolder;
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  let minutes = Math.floor(seconds / 60);
  let secs = Math.floor(seconds % 60); // Ensure seconds are whole numbers

  let formattedMinutes = String(minutes).padStart(2, "0");
  let formattedSeconds = String(secs).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}
document.querySelector(".svg-img").addEventListener("click", function () {
  let secEnd = document.querySelector(".sec-end");
  secEnd.style.display =
    secEnd.style.display === "none" || secEnd.style.display === ""
      ? "block"
      : "none";
});
async function GetSongs(folder) {
  currFolder = folder;
  let a = await fetch(`${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`${folder}/`)[1]);
    }
  }
  let songsUl = document
    .querySelector(".songslist")
    .getElementsByTagName("ul")[0];
  songsUl.innerHTML = "";
  for (const song of songs) {
    songsUl.innerHTML =
      songsUl.innerHTML +
      `<li>
                <img src="/Assests/SVG/music.svg" alt="music" />
                <div class="info">
                  <div>${song.replaceAll("%20", " ")}</div>
                  <div>Artists</div>
                </div>
                <div class="playnow">
                  <p>Play Now</p>
                  <img src="/Assests/SVG/playcopy.svg" alt="play" />
                </div>
    </li>`;
  }

  // play first songs
  var audio = new Audio(songs[0]);
  audio.play();
  audio.addEventListener("loadeddata", () => {
    console.log(audio.duration, audio.currentSrc, audio.currentTime);
  });
  // Attach an event listoner to each songs
  Array.from(
    document.querySelector(".songslist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs;
}
const playMusic = (track, pause = false) => {
  currentSongs.src = `${currFolder}/` + track;
  if (!pause) {
    currentSongs.play();
    play.src = "/Assests/SVG/pasue.svg";
  }
  document.querySelector(".songsinfo").innerHTML = decodeURI(track);
  document.querySelector(".songstime").innerHTML = "00:00 / 00:00";

  // 🎯 Update Background of Current Playing Song
  let allSongs = document.querySelectorAll(".songslist ul li");
  allSongs.forEach((songItem) => {
    let songName = songItem.querySelector(".info div").innerText.trim();
    if (songName === decodeURI(track)) {
      songItem.style.background = "green"; // ✅ Current Playing Song
      songItem.style.color = "white"; // Optional: Text Color White for Better Visibility
    } else {
      songItem.style.background = ""; // Reset Others
      songItem.style.color = ""; // Reset Text Color
    }
  });
  document.querySelectorAll(".card").forEach((card) => {
    if (card.dataset.folder === currFolder.split("/").pop()) {
      card.style.backgroundColor = "#1E90FF"; // Brighter blue background (Dodger Blue)
      card.style.borderRadius = "10px"; // Smooth edges
      card.style.transition = "0.3s ease-in-out"; // Smooth effect
      card.querySelectorAll("p.p-b").forEach((p) => {
        p.style.color = "white"; // Pure blue text color for p-b
      });
      card.querySelectorAll("p.p-l").forEach((p) => {
        p.style.color = "black"; // Black text color for p-l
      });
    } else {
      card.style.backgroundColor = "transparent"; // Reset background for other folders
    }
  });
};

async function DisplayAlbums() {
  let a = await fetch(`Assests/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardcontainer = document.querySelector(".cardcontainer");
  let searchInput = document.getElementById("search"); // ✅ Search box reference
  let suggestionsBox = document.getElementById("suggestions"); // ✅ Suggestions div
  let array = Array.from(anchors);

  let allFolders = {}; // ✅ Yeh object folder aur uske songs store karega
  let allSongs = []; // ✅ Yeh array sare songs store karega for search

  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/Assests/songs/")) {
      let folder = e.href.split("/").slice(-2)[0];

      // ✅ Folder ke metadata fetch karo
      let metaResponse = await fetch(
        `Assests/songs/${folder}/info.json`
      );
      let metadata = await metaResponse.json();

      // ✅ Us folder ke saare songs fetch karo
      let songs = await GetSongs(`Assests/songs/${folder}`);
      allFolders[folder] = songs;
      allSongs.push(...songs); // ✅ Sare songs ko ek global list me store karo

      cardcontainer.innerHTML += `
        <div data-folder="${folder}" class="card">
          <img src="/Assests/songs/${folder}/cover.jpg" alt="${metadata.title}" />
          <p class="p-a p-f p-b">${metadata.title}</p>
          <p class="p-a p-l">${metadata.descripition}</p>
          <div class="play-button"></div>
        </div>`;
    }
  }
  // ✅ Folder Click hone par Playlist Load Karna
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await GetSongs(
        `Assests/songs/${item.currentTarget.dataset.folder}`
      );
      playMusic(songs[0]);
      document.querySelector(".section-1").style.left = "0"; // Open Playlist
    });
  });
  let currentIndex = -1; // ✅ Current selected suggestion ka index

  // ✅ SEARCH FUNCTIONALITY - Add Suggestions
  searchInput.addEventListener("input", () => {
    let query = searchInput.value.toLowerCase().trim();
    suggestionsBox.innerHTML = ""; // ✅ Pehle suggestions clear karo
    currentIndex = -1; // ✅ Reset selected index
    if (query.length > 0) {
      let filteredSongs = allSongs.filter((song) =>
        song.toLowerCase().includes(query)
      );

      filteredSongs.forEach((song) => {
        let cleanSongName = decodeURIComponent(song) // ✅ Encoded characters fix karo
          .replace(/_/g, " ") // ✅ Underscore ko space me badlo
          .replace(/\(MP3.*?\)/gi, "") // ✅ "(MP3...)" type ka text hatao
          .replace(/\.mp3/gi, ""); // ✅ ".mp3" remove karo
        let suggestionItem = document.createElement("div");
        suggestionItem.classList.add("suggestion-item");
        suggestionItem.innerText = cleanSongName; // ✅ Cleaned name show karo
        suggestionItem.addEventListener("click", () => {
          searchInput.value = decodeURIComponent(song); // ✅ Input box me bhi fix karo
          suggestionsBox.innerHTML = ""; // ✅ Suggestion select hone ke baad clear karo
          playMusic(song); // ✅ Selected song play karo
        });

        suggestionsBox.appendChild(suggestionItem);
      });
      
      // ✅ Agar koi suggestion ho, box show karo
      suggestionsBox.style.display = "block";
    } else {
      suggestionsBox.style.display = "none"; // ✅ Koi suggestion nahi to hide
    }
  });
  // ✅ Enter key press karne par song play ho
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") { // ✅ Jab enter key press ho
      let songName = searchInput.value.trim(); // ✅ Input field se song ka naam lo
      if (songName !== "") {
          let folder = "your-folder-name"; // ✅ Yahan apna folder name replace karo
          let songPath = `/Assests/songs/${folder}/${songName}.mp3`; // ✅ Song ka path generate karo
          playSong(songPath);
      }
    }
    function playSong(songPath) {
      let audio = new Audio(songPath);
      audio.play().catch(error => console.error("Error playing song:", error));
  }

    if (event.key === "ArrowDown") {
      currentIndex = (currentIndex + 1) % suggestions.length; // ✅ Next suggestion
    } else if (event.key === "ArrowUp") {
      currentIndex =
        (currentIndex - 1 + suggestions.length) % suggestions.length; // ✅ Previous suggestion
    } else if (event.key === "Enter" && currentIndex >= 0) {
      event.preventDefault();
      suggestions[currentIndex].click(); // ✅ Select and play song
    }

    // ✅ Highlight selected suggestion
    suggestions.forEach((item, index) => {
      item.classList.toggle("selected", index === currentIndex);
    });
  });

  // ✅ Search Button click hone par bhi song play ho
  document.querySelector(".search-btn").addEventListener("click", () => {
    let songName = searchInput.value.trim();
    let matchedSong = allSongs.find(
      (song) =>
        decodeURIComponent(song)
          .replace(/_/g, " ")
          .replace(/\(MP3.*?\)/gi, "")
          .replace(/\.mp3/gi, "")
          .toLowerCase() === songName.toLowerCase()
    );

    if (matchedSong) {
      playMusic(matchedSong);
    }
  });

  // ✅ Input field ke ilawa kahi aur click karein to suggestions hide ho jayein
  document.addEventListener("click", (event) => {
    if (
      !searchInput.contains(event.target) &&
      !suggestionsBox.contains(event.target)
    ) {
      suggestionsBox.style.display = "none"; // ✅ Hide suggestions
    }
  });

  // ✅ Search input pr click hone par suggestions wapas show ho
  searchInput.addEventListener("click", () => {
    if (suggestionsBox.innerHTML.trim() !== "") {
      suggestionsBox.style.display = "block";
    }
  });
  // ✅ Ctrl + K press karne par input box focus ho
  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "k") {
      event.preventDefault(); // ✅ Default browser shortcut disable karo
      searchInput.focus(); // ✅ Input box me focus
    }
  });
  // ✅ Down arrow (⬇) press karne par suggestion select ho
  document.addEventListener("keydown", (event) => {
    let suggestionItems = document.querySelectorAll(".suggestion-item");

    if (event.key === "ArrowDown" && suggestionItems.length > 0) {
      event.preventDefault();
      if (currentIndex < suggestionItems.length - 1) {
        currentIndex++;
      }
      updateSuggestionSelection(suggestionItems);
    } else if (event.key === "ArrowUp" && suggestionItems.length > 0) {
      event.preventDefault();
      if (currentIndex > 0) {
        currentIndex--;
      }
      updateSuggestionSelection(suggestionItems);
    } else if (event.key === "Enter" && currentIndex >= 0) {
      event.preventDefault();
      let selectedSong = allSongs.find(
        (song) =>
          decodeURIComponent(song)
            .replace(/_/g, " ")
            .replace(/\(MP3.*?\)/gi, "")
            .replace(/\.mp3/gi, "") === suggestionItems[currentIndex].innerText
      );

      if (selectedSong) {
        searchInput.value = suggestionItems[currentIndex].innerText;
        suggestionsBox.innerHTML = ""; // ✅ Suggestion list clear karo
        playMusic(selectedSong); // ✅ Selected song play karo
      }
    }
  });

  // ✅ Function to highlight selected suggestion
  function updateSuggestionSelection(suggestionItems) {
    suggestionItems.forEach((item, index) => {
      if (index === currentIndex) {
        item.classList.add("selected"); // ✅ Selected item highlight karo
        searchInput.value = item.innerText; // ✅ Input box me autofill karo
      } else {
        item.classList.remove("selected");
      }
    });
  }

  // ✅ Search button click hone par song play ho
  document.querySelector(".search-btn").addEventListener("click", () => {
    let query = searchInput.value.toLowerCase();
    let matchedSong = allSongs.find((song) =>
      song.toLowerCase().includes(query)
    );

    if (matchedSong) {
      playMusic(matchedSong); // ✅ First matching song play karo
      suggestionsBox.innerHTML = ""; // ✅ Suggestions clear karo
    }
  });
}

async function main() {
  await GetSongs("Assests/songs/AimaBaig");
  playMusic(songs[0], true);
  // Display all the albums on the page
  DisplayAlbums();
  // Attach an event listener to play , next and previous
  play.addEventListener("click", () => {
    if (currentSongs.paused) {
      currentSongs.play();
      play.src = "/Assests/SVG/pasue.svg";
    } else {
      currentSongs.pause();
      play.src = "/Assests/SVG/play.svg";
    }
  });

  // listen for timeupdate event
  currentSongs.addEventListener("timeupdate", () => {
    document.querySelector(".songstime").innerHTML = `${formatTime(
      currentSongs.currentTime
    )}:${formatTime(currentSongs.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSongs.currentTime / currentSongs.duration) * 100 + "%";
  });
  currentSongs.addEventListener("ended", () => {
    let index = songs.indexOf(currentSongs.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]); // ✅ Auto next song play
    } else {
      playMusic(songs[0]); // ✅ Last song ke baad first song play
    }
  });
  // Add an event listener  to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSongs.currentTime = (currentSongs.duration * percent) / 100;
  });
  // Add  an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".section-1").style.left = "0";
  });
  // Add  an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".section-1").style.left = "-100%";
  });
  // Add an event listener to previous
  previous.addEventListener("click", () => {
    console.log("Previous clicked");
    let index = songs.indexOf(currentSongs.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });
  // Add an event listener to next
  next.addEventListener("click", () => {
    console.log("Next clicked");
    let index = songs.indexOf(currentSongs.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });
  // Add an event   to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Setting Volume to", e.target.value, "/100");
      currentSongs.volume = parseInt(e.target.value) / 100;
      if (currentSongs.volume > 0) {
        document.querySelector(".volume > img").src = document
          .querySelector(".volume > img")
          .src.replace("mute.svg", "volume.svg");
      }
    });
  // Add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    console.log(e.target);
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSongs.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSongs.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}
main();
