import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC_qhU_evnhV5JMWQEe-eeNtYW_fmK1ad0",
    authDomain: "inspections-6c279.firebaseapp.com",
    projectId: "inspections-6c279",
    storageBucket: "inspections-6c279.firebasestorage.app",
    messagingSenderId: "855218338095",
    appId: "1:855218338095:web:1e9cfad822255e0fef09da"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export {
    db,
    collection,
    addDoc,
    getDocs,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
};
