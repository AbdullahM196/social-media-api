import { config } from "dotenv";
import { initializeApp } from "firebase/app";
config();

const firebaseConfig = {
  apiKey: process.env.firebase_apiKey,
  authDomain: process.env.firebase_authDomain,
  projectId: process.env.firebase_projectId,
  storageBucket: process.env.firebase_storageBucket,
  messagingSenderId: process.env.firebase_messagingSenderId,
  appId: process.env.firebase_appId,
};
const firebaseApp = initializeApp(firebaseConfig);
export default firebaseApp;
