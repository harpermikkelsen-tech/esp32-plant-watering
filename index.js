// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getDatabase, ref, set, onValue } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js';


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAMX1YMJ_OWCrfQWafomR_hSBU4z4mzFPI",
  authDomain: "plant-watering-9b54d.firebaseapp.com",
  databaseURL: "https://plant-watering-9b54d-default-rtdb.firebaseio.com",
  projectId: "plant-watering-9b54d",
  storageBucket: "plant-watering-9b54d.firebasestorage.app",
  messagingSenderId: "799920439860",
  appId: "1:799920439860:web:2ec45e4ac9e41abb4d4061",
  measurementId: "G-QRFBK44H7Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();

// Get references to HTML elements
const moistureDisplay = document.getElementById('moistureValue');
const lastUpdated = document.getElementById('lastUpdated');
const last_watered = document.getElementById('lastWatered');
const getReadingBtn = document.getElementById('moisture-btn');
const thirstDisplay = document.getElementById('thirst');
const waterOptions = document.querySelectorAll('.dropdown-option'); // Grab all dropdown options

//global variable
let latestMoisture = null; 

// Function to water the plant
function waterPlant(waterLength) {
    const lengthRef = ref(db, 'water/water_length');
    const waterRef = ref(db, 'water/watering');
    let lengthValue;
    if (waterLength === "short") lengthValue = 2000;   // 2s
    else if (waterLength === "medium") lengthValue = 4000; // 4s
    else if (waterLength === "long") lengthValue = 6000;   // 6s
    set(lengthRef, lengthValue);
    set(waterRef, true);

}

//plant watering logic.
// Loop through drop down options and attach event listeners
waterOptions.forEach(option => {
  option.addEventListener('click', () => {
    // e.g. "Short Water" -> "short"
    const length = option.textContent.toLowerCase().split(' ')[0]; 
    waterPlant(length);
  });
});

// Function to trigger ESP to read moisture immediately
function requestMoistureValue() {
    const triggerRef = ref(db, 'requestMoisture');
    set(triggerRef, true); // Trigger ESP to read now
}

// Function to update the moisture value display
function updateValue(element, value) {
    element.textContent = value;

}

// Update changes to moisture and corresponding thirst attributed 
const moistureRef = ref(db, 'moisture_value');
onValue(moistureRef, (snapshot) => {
  latestMoisture = snapshot.val();
  updateValue(moistureDisplay, ` ${latestMoisture}`);
  thirstDisplay.textContent = `Thirst Level: ${getThirstLevel(latestMoisture)}`;
  updateThirstMessage(getThirstLevel(latestMoisture));
  updatePlantImage(getThirstLevel(latestMoisture));
});


// Button event listeners
getReadingBtn.addEventListener('click', () => {
  setMessage("checking moisture... ⏳");
  requestMoistureValue();
});


// get thirst level based on moisture value
function getThirstLevel(moisture) {
    switch (true) {
        case (moisture > 2000):
            return "Overwatered 😵‍💫";
        case (moisture > 1300):
            return "Happy 🌱";
        case (moisture > 600):
            return "Thirsty 😢";
        default:
            return "Dying 🪦";
    }
}

//deal with the dropdown menu functionality
const waterBtn = document.getElementById('water-btn');
const dropdown = document.getElementById('water-options');

waterBtn.addEventListener('click', () => {
    dropdown.classList.toggle('show');
});

// close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.water-dropdown-container')) {
        dropdown.classList.remove('show');
    }
});

// deal with the text box functionality
const messageBox = document.getElementById("messageBox");
const thirstEl = document.getElementById("thirst");

function setMessage(text) {
  messageBox.textContent = text;
}

// textbox update based on thirst 
function updateThirstMessage(thirstLevel) {
  if (thirstLevel == "Dying 🪦") {
    setMessage("it's almost too late 😵");
  } else if (thirstLevel == "Thirsty 😢") {
    setMessage("please water meeee 🥺");
  } else if (thirstLevel =="Overwatered 😵‍💫") {
    setMessage("bruh why u water me so much 😟");
  } else if (thirstLevel == "Happy 🌱") {
    setMessage("yay im full 😋");
  }
}

//update image based on thirst
function updatePlantImage(thirstLevel) {
  const img = document.getElementById("plant-image");
  if (thirstLevel.includes("Dying 🪦")) {
    img.src = "dying.png";
  } else if (thirstLevel.includes("Thirsty 😢")) {
    img.src = "thirsty.png";
  } else if (thirstLevel.includes("Happy 🌱")) {
    img.src = "happy.png";
  } else if (thirstLevel.includes("Overwatered 😵‍💫")) {
    img.src = "overwattered.png";
  }
}

const watering = ref(db, 'water/watering');
onValue(watering, (snapshot) => {
  const isWatering = snapshot.val();
  if (isWatering) {
    setMessage("watering...");
  }
});


// this is dealing with the ending of watering displaying watering complete message
const wateringDone = ref(db, 'water/watering_complete');
onValue(wateringDone, (snapshot) => {
  const isDone = snapshot.val();
  if (isDone) {
    setMessage("thanks for watering me! 🥰");
    set(watering, false); 
    

    setTimeout(() => {
      if (latestMoisture !== null) {
        updateThirstMessage(getThirstLevel(latestMoisture));
      }
      set(wateringDone, false); // reset flag
    }, 3000);
  }
});


// rain droplets
const rainContainer = document.getElementById("rain-container");

waterOptions.forEach(option => {
  option.addEventListener("click", () => {
    let drops = 20;   
    let duration = 2000;
    let dropWidth = 5;
    let dropHeight = 15;

    if (option.textContent.includes("Short")) {
      drops = 15;
      duration = 1500;
      dropWidth = 4;
      dropHeight = 12;
    } else if (option.textContent.includes("Medium")) {
      drops = 30;
      duration = 3000;
      dropWidth = 6;
      dropHeight = 18;
    } else if (option.textContent.includes("Long")) {
      drops = 50;
      duration = 5000;
      dropWidth = 8;
      dropHeight = 24;
    }


    for (let i = 0; i < drops; i++) {
        const drop = document.createElement("div");
        drop.classList.add("droplet");

        drop.style.left = Math.random() * 100 + "vw"; 

        // random speed per droplet
        const animDuration = 0.5 + Math.random() * 1.5; 
        drop.style.animationDuration = animDuration + "s";
        drop.style.animationDelay = Math.random() * 0.5 + "s";

        // size per option
        drop.style.width = dropWidth + "px";
        drop.style.height = dropHeight + "px";

        rainContainer.appendChild(drop);

        // cleanup after animation finishes
        setTimeout(() => drop.remove(), (animDuration + 0.5) * 1000);
    }

  });
});


// update the last watered and last checked times
const timeRef = ref(db, 'time');  // assuming water node has your data
onValue(timeRef, (snapshot) => {
  const data = snapshot.val();
  if (!data) {
    setLastUpdatedMessage("No readings yet 🌱");
    return;
  }
  const moistureTime = data.last_moisture;   // unix seconds
  const waterTime = data.last_watered;       // unix seconds

  // helper function to format timestamps
  function formatTimeAgo(unixTime) {
    if (!unixTime) return "never";

    const date = new Date(unixTime * 1000);

    // absolute clock time
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // relative "x minutes ago"
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    let agoText;
    if (diffMins < 1) agoText = "just now";
    else if (diffMins === 1) agoText = "1 minute ago";
    else agoText = `${diffMins} minutes ago`;

    return `${agoText} (${formattedTime}))`;
  }

  // build messages
  const moistureMsg = `${formatTimeAgo(moistureTime)}`;
  const wateredMsg  = `${formatTimeAgo(waterTime)}`;

  // update your UI
  updateValue(lastUpdated, moistureMsg);
  updateValue(last_watered, wateredMsg);
});
