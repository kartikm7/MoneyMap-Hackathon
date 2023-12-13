const express = require('express');
const app = express();
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } = require('firebase/auth');
const admin = require('firebase-admin');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const serviceAccount = require('./serviceAccountKey.json');
// const cors = require('cors');
// app.use(cors());
app.use(express.json());

const firebaseConfig = {
  apiKey: "AIzaSyCS1atk4KDJs1h8wPBOfsPauoufI4k3cwQ",
  authDomain: "money-map-9757a.firebaseapp.com",
  projectId: "money-map-9757a",
  storageBucket: "money-map-9757a.appspot.com",
  messagingSenderId: "558780029988",
  appId: "1:558780029988:web:88b4221f44f3efa2d54cb1",
  measurementId: "G-RMZPL2C674"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(app);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Your other configuration options (if any)
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    const loggedInUser = userCredential.user;
    res.json({ message: 'Login successful!', user: loggedInUser });
  } catch (error) {
    console.error('Login failed', error);
    res.status(400).json({ message: 'Login failed', error: error.message });
  }
});

// Signup route
// app.post('/signup', async (req, res) => {
//   const user = {
//     email: req.body.email,
//     password: req.body.password
//   }
//   try {
//     const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
//     const usersCollectionRef = collection(db, 'users');
//     const { uid, metadata: { creationTime } } = userCredential.user;

//     const newUser = {
//       created_at: new Date(creationTime).toISOString(),
//       email: user.email, // Use user.email instead of just email
//       uid: uid,
//     };

//     const newUserDocRef = await addDoc(usersCollectionRef, newUser);

//     res.json({ message: 'Signup successful!', user: userCredential.user });
//   } catch (error) {
//     console.error('Signup failed', error);
//     res.status(400).json({ message: 'Signup failed', error: error.message });
//   }
// });

app.post('/signup', async (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);

    if (!userCredential || !userCredential.user) {
      // Handle the case where userCredential or user is null
      res.status(400).json({ message: 'Signup failed', error: 'User data not available' });
      return;
    }

    const usersCollectionRef = collection(db, 'users');
    const { uid, metadata: { creationTime } } = userCredential.user;

    const newUser = {
      created_at: new Date(creationTime).toISOString(),
      email: user.email,
      uid: uid,
    };

    const newUserDocRef = await addDoc(usersCollectionRef, newUser);

    res.json({ message: 'Signup successful!', user: userCredential.user });
  } catch (error) {
    console.error('Signup failed', error);
    res.status(400).json({ message: 'Signup failed', error: error.message });
  }
});


// Get logged-in user
app.get('/user', async (req, res) => {
  const user = await onAuthStateChanged(auth, (user) => user);
  if (user) {
    res.json({ message: 'User logged in', user });
  } else {
    res.json({ message: 'No user logged in' });
  }
});

// Logout route
app.post('/logout', async (req, res) => {
  await signOut(auth);
  res.json({ message: 'Logout successful' });
});

app.listen(3000, () => console.log('Server listening on port 3000'));
