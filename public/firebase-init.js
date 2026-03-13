import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

const firebaseConfig = {
    apiKey: "AIzaSyDGPFQdTeo_R1nWTFxEo7ioZyIaXElCJXk",
    authDomain: "aflamk-3c9be.firebaseapp.com",
    projectId: "aflamk-3c9be",
    storageBucket: "aflamk-3c9be.firebasestorage.app",
    messagingSenderId: "27227290582",
    appId: "1:27227290582:web:6abbea21c88d4fbc660277",
    databaseURL: "https://aflamk-3c9be-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
