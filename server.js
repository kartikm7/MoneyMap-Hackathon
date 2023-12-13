const express = require('express');
const app = express();
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } = require('firebase/auth');
const admin = require('firebase-admin');
// const { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, FieldValue } = require('firebase/firestore');
const { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, doc } = require('firebase/firestore');
const serviceAccount = require('./serviceAccountKey.json');
const ejs = require('ejs')
const session = require('express-session');
const path = require('path');



// const cors = require('cors');
// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Use the following code to get the __filename and __dirname equivalents in CommonJS
// const __filename = path.resolve();
// const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')))


app.set('view engine','ejs')

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

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

app.get('/', (req,res)=>{
  res.render("index.ejs")
})

app.post('/login', async (req, res) => {
  // const { email, password } = await req.body;
  const email = req.body.email
  const password = req.body.password
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const loggedInUser = userCredential.user;
    console.log(userCredential.user.uid)
    req.session.uid = loggedInUser.uid
    // res.json({ message: 'Login successful!', user: loggedInUser });
    res.redirect(`/expenseTracker`);
  } catch (error) {
    console.error('Login failed', error);
    res.status(400).json({ message: 'Login failed', error: error.message });
  }
});

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
    res.redirect('/login')
    // res.json({ message: 'Signup successful!', user: userCredential.user });
  } catch (error) {
    console.error('Signup failed', error);
    res.status(400).json({ message: 'Signup failed', error: error.message });
  }
});


app.get('/expenseTracker', async (req, res) => {
  try {
    const uid = req.session.uid;

    if (!uid) {
      console.error('User ID is undefined');
      return res.redirect('/');
    }

    const expensesCollectionRef = collection(db, 'expenses');
    
    // Query expenses for the specific user
    const userExpensesQuery = query(expensesCollectionRef, where('user_id', '==', uid));
    
    const querySnapshot = await getDocs(userExpensesQuery);
    
    // Map the query results to an array
    const expenses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.render('expenseTracker.ejs', { uid: uid, expenses: expenses });
  } catch (error) {
    console.error('Failed to fetch expenses', error);
    res.status(500).json({ message: 'Failed to fetch expenses', error: error.message });
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

app.get('/register', (req,res)=>{
  res.render('register.ejs')
})

// Route to add an expense
app.post('/add-expense', async (req, res) => {
  const { amount, category, description, title, date } = req.body;
  const uid = req.session.uid; // Get the uid from the request object after authentication

  try {
    const expensesCollectionRef = collection(db, 'expenses');

    // Add the expense with the associated uid
    const newExpense = {
      amount: Number(amount),
      category,
      description,
      title,
      date: new Date(date),
      user_id: uid, // Connect the uid to the expense
      created_at: serverTimestamp(), // Use serverTimestamp() for the created_at field
    };

    const newExpenseDocRef = await addDoc(expensesCollectionRef, newExpense);

    res.json({ message: 'Expense added successfully!', expenseId: newExpenseDocRef.id });
  } catch (error) {
    console.error('Failed to add expense', error);
    res.status(500).json({ message: 'Failed to add expense', error: error.message });
  }
});

// Add this route to your server.js
app.post('/delete-expense', async (req, res) => {
  const expenseId = req.body.expense_id;

  try {
    const expensesCollectionRef = collection(db, 'expenses');

    // Get the reference to the expense document
    const expenseDocRef = doc(expensesCollectionRef, expenseId);

    // Delete the expense document
    await deleteDoc(expenseDocRef);

    res.json({ message: 'Expense deleted successfully!' });
  } catch (error) {
    console.error('Failed to delete expense', error);
    res.status(500).json({ message: 'Failed to delete expense', error: error.message });
  }
});


// Route to get expenses for a specific user
app.get('/expenses', async (req, res) => {
  const uid = req.session.uid; // Get the uid from the session

  console.log('User ID (UID):', uid); // Add this line for logging

  try {
    if (!uid) {
      // If uid is undefined, handle the situation (redirect, show an error, etc.)
      console.error('User ID is undefined');
      return res.status(400).json({ message: 'User ID is undefined' });
    }

    const expensesCollectionRef = collection(db, 'expenses');
    
    // Query expenses for the specific user
    const userExpensesQuery = query(expensesCollectionRef, where('user_id', '==', uid));
    
    const querySnapshot = await getDocs(userExpensesQuery);
    
    // Map the query results to an array
    const expenses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.render('expenses.ejs', { expenses }); // Render the expenses.ejs view with the expenses data
  } catch (error) {
    console.error('Failed to fetch expenses', error);
    res.status(500).json({ message: 'Failed to fetch expenses', error: error.message });
  }
});


// Logout route
app.post('/logout', async (req, res) => {
  req.session.destroy()
  await signOut(auth);
  res.redirect('/');
});

app.listen(3000, () => console.log('Server listening on port 3000'));
