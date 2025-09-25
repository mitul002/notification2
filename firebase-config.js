// /firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC1Ijko3EMVffxtGy3EJ5IGmoAD7KPhEnY",
  authDomain: "taskerflow-77fac.firebaseapp.com",
  projectId: "taskerflow-77fac",
  storageBucket: "taskerflow-77fac.firebasestorage.app",
  messagingSenderId: "278341339145",
  appId: "1:278341339145:web:56e71b8c06ebf63c2750d8",
  measurementId: "G-F9FMHVG0BY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
enableIndexedDbPersistence(db).catch(console.warn);

// Expose globally
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDb = db;
window.firebaseOnAuthStateChanged = onAuthStateChanged;