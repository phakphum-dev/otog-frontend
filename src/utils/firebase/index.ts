import firebase from 'firebase/app'
import 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyA595UmDskuDQUgzAiSKMizBCR1IyFf0Cc',
  authDomain: 'otog-8240d.firebaseapp.com',
  projectId: 'otog-8240d',
  storageBucket: 'otog-8240d.appspot.com',
  messagingSenderId: '133266075224',
  appId: '1:133266075224:web:74301227cd432d8439e42d',
  measurementId: 'G-SYNTM07HWX',
}

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig)
}

const storage = firebase.storage()

export { storage, firebase as default }
