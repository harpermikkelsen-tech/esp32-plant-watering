// firebase.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getDatabase, ref, set, onValue } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js';

let db;

export function initFirebase() {
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
    const app = initializeApp(firebaseConfig);
    db = getDatabase();
    return db;
}

export function waterPlant(lengthValue) {
    const lengthRef = ref(db, 'water/water_length');
    const waterRef = ref(db, 'water/watering');
    set(lengthRef, lengthValue);
    set(waterRef, true);
}

export function requestMoisture() {
    const triggerRef = ref(db, 'requestMoisture');
    set(triggerRef, true);
}

export function onMoistureChange(callback) {
    const moistureRef = ref(db, 'moisture_value');
    onValue(moistureRef, snapshot => callback(snapshot.val()));
}

export function onWateringChange(callback) {
    const watering = ref(db, 'water/watering');
    onValue(watering, snapshot => callback(snapshot.val()));
}

export function onWateringDoneChange(callback) {
    const wateringDone = ref(db, 'water/watering_complete');
    onValue(wateringDone, snapshot => callback(snapshot.val()));
}

export function onTimeChange(callback) {
    const timeRef = ref(db, 'time');
    onValue(timeRef, snapshot => callback(snapshot.val()));
}
