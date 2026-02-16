// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, set, get, ref, update, remove, push } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
// initializeApp – to initialize your Firebase app.
// getDatabase – to get a reference to the Firebase Realtime Database.
// set – to write data to the database.
// get – to read data from the database.
// ref – to create references (paths) in the database.


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyD3yovWfXvWVhx0nWxwMbUr2lEeyBCnNFI",
    authDomain: "potato-36643.firebaseapp.com",
    databaseURL: "https://potato-36643-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "potato-36643",
    storageBucket: "potato-36643.firebasestorage.app",
    messagingSenderId: "14321173976",
    appId: "1:14321173976:web:b2e7ba285fe86ee8411ead",
    measurementId: "G-74F9HMSBER"
  };

// Initialize Firebase
// initializeApp(firebaseConfig) initializes your Firebase application using the config.
// getDatabase(app) gets the Realtime Database instance connected to your Firebase project.
const app = initializeApp(firebaseConfig);
    const db = getDatabase(app)

console.log(db)


// Function to write user data to Firebase Realtime Database
// Function to write user data with unique ID
function writeUserData(userId, firstName, lastName, email, phoneNumber, age, gender, address, city, country, occupation) {
  // Create a reference to 'users' collection
  const usersRef = ref(db, 'users/' + userId);

  // push() generates a unique key for the new child
  //const newUserRef = push(usersRef);

  // set() stores the data at that unique location
  set(usersRef, {
    firstName: firstName,
    lastName: lastName,
    email: email,
    phoneNumber: phoneNumber,
    age: age,
    gender: gender,
    address: address,
    city: city,
    country: country,
    occupation: occupation
  })
  .then(() => {
    console.log("User added successfully with ID:", userId);
  })
  .catch((error) => {
    console.error("Error adding user:", error);
  });
}

// Expose the function to the global scope so it can be accessed from HTML (e.g., via button click)
window.writeUserData = writeUserData;


// ref(db, 'users') points to the users path.
// get(userRef) gets the data at that path.
// snapshot.forEach(...) loops over each child node (each user).
// childsnapshot.val() gives the actual data (name and email), which is printed.
function readUser() {
  const userRef = ref(db, 'users');
  const usersList = document.getElementById('users-list');
  usersList.innerHTML = "";

  get(userRef).then((snapshot) => {
    snapshot.forEach((childsnapshot) => {
      console.log(childsnapshot.val());
      const user = childsnapshot.val();
      const userId = childsnapshot.key;

      const p = document.createElement("p");
      p.textContent = `
        [${userId}]
        [${user.firstName} ${user.lastName}]
        [${user.email}]
        [${user.phoneNumber}]
        [${user.city}]
      `;

      usersList.appendChild(p);
    });
  });
}

//readUser()
window.readUser = readUser;



function updateUserData(userId, updatedData) {
  const userRef = ref(db, 'users/' + userId);
  update(userRef, updatedData)
    .then(() => {
      console.log("User updated successfully of ID:", userId);
    })
    .catch((error) => {
      console.error("Error updating user:", error);
    }); 
}

// Example usage:
//updateUserData();
window.updateUserData = updateUserData;




function deleteUserData(userId) {
  const userRef = ref(db, 'users/' + userId);
  remove(userRef)
    .then(() => {
      console.log("User deleted successfully");
    })
    .catch((error) => {
      console.error("Error deleting user:", error);
    });
}

// Example usage:
//deleteUserData(2);
window.deleteUserData = deleteUserData;

