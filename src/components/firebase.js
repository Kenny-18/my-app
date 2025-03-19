import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBfp0Ommx4iBpNd0aaCUjXoIkFKxUOVNoU",
  authDomain: "my-app-90924.firebaseapp.com",
  projectId: "my-app-90924",
  storageBucket: "my-app-90924.appspot.com",
  messagingSenderId: "759024549732",
  appId: "1:759024549732:web:e4fa44ff216856bb2c0471",
  measurementId: "G-ZM20NLNBVY",
  databaseURL: "https://my-app-90924-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const database = getDatabase(app);

export { app, auth, provider, database };
