import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCKPJ4klGTGxdgTxC3Q93YiaTZixlI0vE0",
  authDomain: "kaizenqevents.click",
  projectId: "shaivika-lms-ai",
  storageBucket: "shaivika-lms-ai.firebasestorage.app",
  messagingSenderId: "977716272905",
  appId: "1:977716272905:web:ff7924e20741c02f823dd8",
  measurementId: "G-MPQ6E8M5KB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const snapshot = await getDocs(collection(db, "registrations"));
    console.log("Docs found:", snapshot.size);
    snapshot.forEach(doc => {
      console.log(doc.id, "=>", doc.data());
    });
  } catch (e) {
    console.error("Error reading firestore:", e);
  }
}

test();
