import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDF9JD8hX8acLtwlvoPMSY0l0WFKTsP1-s",
  authDomain: "pasteleriamilsabores-f1a02.firebaseapp.com",
  projectId: "pasteleriamilsabores-f1a02",
  storageBucket: "pasteleriamilsabores-f1a02.firebasestorage.app",
  messagingSenderId: "676700241433",
  appId: "1:676700241433:web:e864c4c9c04765f2063488",
  measurementId: "G-HEF65DDB2C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);