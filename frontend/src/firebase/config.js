//conexion con firebase y exporta los servicios que se esten usando en el proyecto
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
//las variables son leidas desde el archivo .env y se guarda en un objeto para inicializar la app de firebase
const credenciales= {
apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
appId: import.meta.env.VITE_FIREBASE_APP_ID,
measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

//se inicializa la app de firebase
const app = initializeApp(credenciales);

//exporta los servicios de firebase
export const auth = getAuth(app); 
export const db = getFirestore(app);
export const storage = getStorage(app);