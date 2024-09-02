// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { signOut as FBsignOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken } from 'firebase/messaging';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyApK6LCo3WyJB93fUbw1m4Y4HWtfBh_jCI',
    authDomain: 'chat-qpp.firebaseapp.com',
    projectId: 'chat-qpp',
    storageBucket: 'chat-qpp.appspot.com',
    messagingSenderId: '1030012666339',
    appId: '1:1030012666339:web:a3805f08b405fabc80a0d6',
    measurementId: 'G-5XGWKPT9RV'
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);
// export const messaging = getMessaging(app);
// getToken(messaging, { vapidKey: 'BAt11_OsT4FMLDxK07EqrVsha_YmkpzeqaUvyTdxyR6WLVb9qNp-WdCnpDZVlbn8FBGiASLmjim7-Wgw55_77Mk' })
//     .then((currentToken) => {
//         if (currentToken) {
//             console.log(currentToken)
//             // Send the token to your server and update the UI if necessary
//             // ...
//         } else {
//             // Show permission request UI
//             console.log('No registration token available. Request permission to generate one.');
//             // ...
//         }
//     })
//     .catch((err) => {
//         console.log('An error occurred by andar wali file while retrieving token. ', err);
//         // ...
//     });
export const db = getFirestore(app);

export const auth = getAuth();
export function signUp(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
}
export function signIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}
export function signOut() {
    return FBsignOut(auth);
}
