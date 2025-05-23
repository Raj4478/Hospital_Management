// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // ✅ Import Firebase Auth
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCrxMXdUY0hF8wo00NrOhGqY0YQa3KH4N0",
  authDomain: "mail-verify-c994a.firebaseapp.com",
  projectId: "mail-verify-c994a",
  storageBucket: "mail-verify-c994a.appspot.com", // fixed typo: .app ➜ .appspot.com
  messagingSenderId: "929367545762",
  appId: "1:929367545762:web:19939dc43bad38a45444fb",
  measurementId: "G-YT54VFT3HP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // ✅ Correct instance
const analytics = getAnalytics(app); // ✅ Optional, keep if needed

export { auth }; // ✅ Now correctly exported for use
