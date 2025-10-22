import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // ✅ AGREGAR ESTA IMPORT

const firebaseConfig = {
  apiKey: "AIzaSyDF9JD8hX8acLtwlvoPMSY0l0WFKTsP1-s",
  authDomain: "pasteleriamilsabores-f1a02.firebaseapp.com",
  databaseURL: "https://pasteleriamilsabores-f1a02-default-rtdb.firebaseio.com",
  projectId: "pasteleriamilsabores-f1a02",
  storageBucket: "pasteleriamilsabores-f1a02.appspot.com",
  messagingSenderId: "676700241433",
  appId: "1:676700241433:web:e864c4c9c04765f2063488",
  measurementId: "G-HEF65DDB2C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app); // ✅ AGREGAR ESTA EXPORT