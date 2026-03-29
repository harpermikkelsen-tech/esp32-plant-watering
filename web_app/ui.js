// ui.js
export const messageBox = document.getElementById("messageBox");
export const moistureDisplay = document.getElementById('moistureValue');
export const lastUpdated = document.getElementById('lastUpdated');
export const lastWatered = document.getElementById('lastWatered');
export const thirstDisplay = document.getElementById('thirst');
export const rainContainer = document.getElementById("rain-container");

export function setMessage(text) {
    messageBox.textContent = text;
}

export function updateValue(element, value) {
    element.textContent = value;
}

export function getThirstLevel(moisture) {
    if (moisture > 2000) return "Overwatered 😵‍💫";
    if (moisture > 1300) return "Happy 🌱";
    if (moisture > 600) return "Thirsty 😢";
    return "Dying 🪦";
}

export function updateThirstMessage(thirstLevel) {
    switch (thirstLevel) {
        case "Dying 🪦": setMessage("it's almost too late 😵"); break;
        case "Thirsty 😢": setMessage("please water meeee 🥺"); break;
        case "Overwatered 😵‍💫": setMessage("bruh why u water me so much 😟"); break;
        case "Happy 🌱": setMessage("yay im full 😋"); break;
    }
}

export function updatePlantImage(thirstLevel) {
    const img = document.getElementById("plant-image");
    if (thirstLevel.includes("Dying 🪦")) img.src = "../assets/images/dying.png";
    else if (thirstLevel.includes("Thirsty 😢")) img.src = "../assets/images/thirsty.png";
    else if (thirstLevel.includes("Happy 🌱")) img.src = "../assets/images/happy.png";
    else if (thirstLevel.includes("Overwatered 😵‍💫")) img.src = "../assets/images/overwattered.png";
}

export function rainAnimation(optionText) {
    let drops = 20, dropWidth = 5, dropHeight = 15;
    if (optionText.includes("Short")) { drops = 15; dropWidth = 4; dropHeight = 12; }
    else if (optionText.includes("Medium")) { drops = 30; dropWidth = 6; dropHeight = 18; }
    else if (optionText.includes("Long")) { drops = 50; dropWidth = 8; dropHeight = 24; }

    for (let i = 0; i < drops; i++) {
        const drop = document.createElement("div");
        drop.classList.add("droplet");
        drop.style.left = Math.random() * 100 + "vw";
        const animDuration = 0.5 + Math.random() * 1.5;
        drop.style.animationDuration = animDuration + "s";
        drop.style.animationDelay = Math.random() * 0.5 + "s";
        drop.style.width = dropWidth + "px";
        drop.style.height = dropHeight + "px";
        rainContainer.appendChild(drop);
        setTimeout(() => drop.remove(), (animDuration + 0.5) * 1000);
    }
}
