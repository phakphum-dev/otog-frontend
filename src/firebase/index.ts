import firebase from 'firebase/app'
import 'firebase/storage'

import { FIREBASE_CONFIG } from '../config'

if (firebase.apps.length === 0) {
  firebase.initializeApp(FIREBASE_CONFIG)
}

const storage = firebase.storage()

export { storage, firebase as default }
