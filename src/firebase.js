import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { firebaseConfig } from './config.js'

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Contra el emulador cuando corre en localhost con ?emu (o vite dev + emulador)
if (location.hostname === 'localhost' && new URLSearchParams(location.search).has('emu')) {
  connectFirestoreEmulator(db, 'localhost', 8080)
}
