// src/services/firebase.service.ts
import * as admin from 'firebase-admin'
import { ServiceAccount } from 'firebase-admin'

// Load your service account key securely from an environment variable.
// Make sure this env var is set in your deployment environment!
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  const serviceAccount: ServiceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string)

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // If you were using the Realtime Database, you'd add:
    // databaseURL: "https://extinction-bingo.firebaseio.com"
  })
} else {
  // For testing, initialize with mock credentials
  admin.initializeApp({
    projectId: 'test-project',
  })
}

const db = admin.firestore() // Get the Firestore instance
const auth = admin.auth() // Get the Authentication instance

export { db, auth, admin } // Export these instances for use in other parts of your app
