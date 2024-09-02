// importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js');
// importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging.js');

// // Get registration token. Initially this makes a network call, once retrieved
// // subsequent calls to getToken will return from cache.
// const messaging = getMessaging();
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
//         console.log('An error occurred by rooot file while retrieving token. ', err);
//         // ...
//     });

// importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js');
// importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging.js');

// // Initialize Firebase in the service worker
// const firebaseConfig = {
//     apiKey: 'AIzaSyApK6LCo3WyJB93fUbw1m4Y4HWtfBh_jCI',
//     authDomain: 'chat-qpp.firebaseapp.com',
//     projectId: 'chat-qpp',
//     storageBucket: 'chat-qpp.appspot.com',
//     messagingSenderId: '1030012666339',
//     appId: '1:1030012666339:web:a3805f08b405fabc80a0d6',
//     measurementId: 'G-5XGWKPT9RV'
// };

// firebase.initializeApp(firebaseConfig);

// // Retrieve an instance of Firebase Messaging
// const messaging = firebase.messaging();

// // Handle background messages
// messaging.onBackgroundMessage(function(payload) {
//   console.log('Received background message ', payload);

//   // Customize notification here
//   const notificationTitle = 'Background Message Title';
//   const notificationOptions = {
//     body: 'Background Message body.',
//     icon: '/firebase-logo.png'
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });