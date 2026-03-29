// main.js
import { initFirebase, waterPlant, requestMoisture, onMoistureChange, onWateringChange, onWateringDoneChange, onTimeChange, onAuthStateChangedListener, loginWithEmail, logoutUser } from './firebase.js';
import { setMessage, updateValue, getThirstLevel, updateThirstMessage, updatePlantImage, rainAnimation } from './ui.js';

let latestMoisture = null;
let isAuthenticated = false;

const authStatusEl = document.getElementById('auth-status');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const getReadingBtn = document.getElementById('moisture-btn');
const waterBtn = document.getElementById('water-btn');
const waterOptions = Array.from(document.querySelectorAll('.dropdown-option'));

function setControlState(enabled) {
    [getReadingBtn, waterBtn, ...waterOptions].forEach(btn => {
        btn.disabled = !enabled;
        btn.style.opacity = enabled ? '1' : '0.5';
        btn.style.cursor = enabled ? 'pointer' : 'not-allowed';
    });
}

function enterDemoMode() {
    isAuthenticated = false;
    authStatusEl.textContent = 'Not signed in (demo mode)';
    loginBtn.disabled = false;
    logoutBtn.disabled = true;
    setControlState(false);
    setMessage("⚠️ Demo mode: sign in to enable live controls. You can still watch the demo video.");
}

function enterLiveMode(user) {
    isAuthenticated = true;
    authStatusEl.textContent = `Signed in as ${user.email}`;
    loginBtn.disabled = true;
    logoutBtn.disabled = false;
    setControlState(true);
    setMessage("Welcome back! Controls are active.");
}

function updateMoistureUI(value) {
    latestMoisture = value;
    updateValue(document.getElementById('moistureValue'), ` ${latestMoisture}`);
    const thirstLevel = getThirstLevel(latestMoisture);
    updateValue(document.getElementById('thirst'), `Thirst Level: ${thirstLevel}`);
    updateThirstMessage(thirstLevel);
    updatePlantImage(thirstLevel);
}

function initApp() {
    initFirebase();

    setControlState(false);
    enterDemoMode();

    onAuthStateChangedListener(user => {
        if (user) {
            enterLiveMode(user);
        } else {
            enterDemoMode();
        }
    });

    getReadingBtn.addEventListener('click', () => {
        if (!isAuthenticated) {
            setMessage('Demo: request moisture is not available in demo mode. Sign in for live read.');
            return;
        }
        setMessage('checking moisture... ⏳');
        requestMoisture();
    });

    waterOptions.forEach(option => {
        option.addEventListener('click', () => {
            if (!isAuthenticated) {
                setMessage('Demo: watering is disabled in demo mode. Sign in to water.');
                return;
            }
            const length = option.textContent.toLowerCase().split(' ')[0];
            waterPlant(length === 'short' ? 2000 : length === 'medium' ? 4000 : 6000);
            rainAnimation(option.textContent);
        });
    });

    onMoistureChange(value => {
        if (!value) return;
        updateMoistureUI(value);
    });

    onWateringChange(isWatering => {
        if (!isWatering || !isAuthenticated) return;
        setMessage('watering...');
    });

    onWateringDoneChange(isDone => {
        if (!isDone || !isAuthenticated) return;
        setMessage('thanks for watering me! 🥰');
        setTimeout(() => {
            if (latestMoisture !== null) updateThirstMessage(getThirstLevel(latestMoisture));
        }, 3000);
    });

    onTimeChange(data => {
        if (!data || !isAuthenticated) return;
        const formatTimeAgo = unixTime => {
            if (!unixTime) return 'never';
            const date = new Date(unixTime * 1000);
            const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
            const agoText = diffMins < 1 ? 'just now' : diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`;
            return `${agoText} (${formattedTime})`;
        };
        updateValue(document.getElementById('lastUpdated'), formatTimeAgo(data.last_moisture));
        updateValue(document.getElementById('lastWatered'), formatTimeAgo(data.last_watered));
    });

    const dropdown = document.getElementById('water-options');
    waterBtn.addEventListener('click', () => {
        if (!isAuthenticated) return;
        dropdown.classList.toggle('show');
    });
    document.addEventListener('click', e => {
        if (!e.target.closest('.water-dropdown-container')) dropdown.classList.remove('show');
    });

    loginBtn.addEventListener('click', () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            setMessage('Enter email and password first.');
            return;
        }

        loginWithEmail(email, password)
            .then(userCredential => {
                enterLiveMode(userCredential.user);
            })
            .catch(err => {
                setMessage(`Sign in failed: ${err.message}`);
            });
    });

    logoutBtn.addEventListener('click', () => {
        logoutUser().then(() => {
            enterDemoMode();
        });
    });
}

initApp();
