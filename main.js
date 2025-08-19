// main.js
import { initFirebase, waterPlant, requestMoisture, onMoistureChange, onWateringChange, onWateringDoneChange, onTimeChange } from './firebase.js';
import { setMessage, updateValue, getThirstLevel, updateThirstMessage, updatePlantImage, rainAnimation } from './ui.js';

const demo_mode = true;
let latestMoisture = null;

if (demo_mode) {
    setMessage("⚠️ Demo Mode: All controls disabled, Please 'Watch the Demo Video'.");
    document.querySelectorAll("button").forEach(btn => { btn.disabled = true; btn.style.opacity = "0.5"; btn.style.cursor = "not-allowed"; });
} else {
    const db = initFirebase();

    const getReadingBtn = document.getElementById('moisture-btn');
    const waterOptions = document.querySelectorAll('.dropdown-option');

    // Moisture updates
    onMoistureChange(value => {
        latestMoisture = value;
        updateValue(document.getElementById('moistureValue'), ` ${latestMoisture}`);
        const thirstLevel = getThirstLevel(latestMoisture);
        updateValue(document.getElementById('thirst'), `Thirst Level: ${thirstLevel}`);
        updateThirstMessage(thirstLevel);
        updatePlantImage(thirstLevel);
    });

    getReadingBtn.addEventListener('click', () => { setMessage("checking moisture... ⏳"); requestMoisture(); });

    // Watering
    waterOptions.forEach(option => {
        option.addEventListener('click', () => {
            const length = option.textContent.toLowerCase().split(' ')[0];
            waterPlant(length === 'short' ? 2000 : length === 'medium' ? 4000 : 6000);
            rainAnimation(option.textContent);
        });
    });

    // Watering status
    onWateringChange(isWatering => { if (isWatering) setMessage("watering..."); });
    onWateringDoneChange(isDone => {
        if (isDone) {
            setMessage("thanks for watering me! 🥰");
            setTimeout(() => {
                if (latestMoisture !== null) updateThirstMessage(getThirstLevel(latestMoisture));
        }, 3000);
    }});

    // Time updates
    onTimeChange(data => {
        if (!data) return;
        const formatTimeAgo = unixTime => {
            if (!unixTime) return "never";
            const date = new Date(unixTime * 1000);
            const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
            const agoText = diffMins < 1 ? "just now" : diffMins === 1 ? "1 minute ago" : `${diffMins} minutes ago`;
            return `${agoText} (${formattedTime}))`;
        };
        updateValue(document.getElementById('lastUpdated'), formatTimeAgo(data.last_moisture));
        updateValue(document.getElementById('lastWatered'), formatTimeAgo(data.last_watered));
    });

    // Dropdown toggle
    const waterBtn = document.getElementById('water-btn');
    const dropdown = document.getElementById('water-options');
    waterBtn.addEventListener('click', () => dropdown.classList.toggle('show'));
    document.addEventListener('click', e => { if (!e.target.closest('.water-dropdown-container')) dropdown.classList.remove('show'); });
}
